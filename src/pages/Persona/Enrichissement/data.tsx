import { CircularProgress, Container, Stack, TextField, Typography, useMediaQuery } from "@mui/material"
import { JobTitle } from "../../../interfaces/job-title"
import { Customer } from "../../../interfaces/customer"
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"
import * as XLSX from 'xlsx'
import Chart from "react-apexcharts"
import { useState, useEffect } from "react"
import AButton from "../../../components/atoms/a-button"
import MCardData from "../../../components/molecules/m-card-data"
import theme from "../../../theme"

const Data = (props: {
    instance: any
    selectedCustomer: Customer
    loading: boolean
    numberContacts: number
    numberRoles: number
    numberPersonas: number
    roles: JobTitle[]
    personas: JobTitle[]
    links: JobTitle[]
}) => {

    const { selectedCustomer, loading, numberContacts, numberRoles, numberPersonas, roles, personas, links } = props

    const isDesktop = useMediaQuery('(min-width:1000px)')

    const [pdfGenerate, setPdfGenerate] = useState(false)

    const [searchTerm, setSearchTerm] = useState("")
    const [contactsJobTitles, setContactsJobTitles] = useState([""])
    const [contactsOccurences, setContactsOccurences] = useState([0])

    const [filteredRoles, setFilteredRoles] = useState<JobTitle[]>()
    const [filteredPersonas, setFilteredPersonas] = useState<JobTitle[]>()
    const [filteredLinks, setFilteredLinks] = useState<JobTitle[]>()

    useEffect(() => {
        const jobTitles: string[] = []
        const occurences: number[] = []

        if (filteredPersonas) {
            filteredPersonas.map((persona) => {
                return (
                    jobTitles.push(persona.jobTitle),
                    occurences.push(persona.occurences)
                )
            })
        } else {
            personas.map((persona) => {
                return (
                    jobTitles.push(persona.jobTitle),
                    occurences.push(persona.occurences)
                )
            })
        }

        setContactsJobTitles(jobTitles)
        setContactsOccurences(occurences)
    }, [filteredPersonas])

    const handleFilteredChange = (value: string) => {
        setSearchTerm(value)
    }

    useEffect(() => {
        const filteredRole = roles.filter(role =>
            role.jobTitle.toLowerCase().includes(searchTerm.toLowerCase())
        )

        const filteredPersona = personas.filter(persona =>
            persona.jobTitle.toLowerCase().includes(searchTerm.toLowerCase())
        )

        const filteredLink = links.filter(link =>
            link.jobTitle.toLowerCase().includes(searchTerm.toLowerCase())
        )

        setFilteredRoles(filteredRole)
        setFilteredPersonas(filteredPersona)
        setFilteredLinks(filteredLink)
    }, [searchTerm, roles, personas, links])

    const generateExcel = () => {
        const currentDate = new Date()
        const formattedDate = currentDate.toLocaleDateString().split('/').join('-')
        const formattedTime = currentDate.toLocaleTimeString().split(':').join('-')

        const fileName = `${selectedCustomer.NomClient}_${formattedDate}_${formattedTime}.xlsx`

        const sortedRoles = roles.sort((a, b) => b.occurences - a.occurences)
        const sortedPersonas = personas.sort((a, b) => b.occurences - a.occurences)
        const sortedLiaisons = links.sort((a, b) => b.occurences - a.occurences)

        const rolesData = sortedRoles.map(role => ({ Role: role.jobTitle, Occurences: role.occurences }))
        const personasData = sortedPersonas.map(persona => ({ Persona: persona.jobTitle, Occurences: persona.occurences }))
        const liaisonsData = sortedLiaisons.map(link => ({ Liaisons: link.jobTitle, Occurences: link.occurences }))

        const rolesSheet = XLSX.utils.json_to_sheet(rolesData)
        const personasSheet = XLSX.utils.json_to_sheet(personasData)
        const liaisonsSheet = XLSX.utils.json_to_sheet(liaisonsData)

        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, rolesSheet, 'Roles')
        XLSX.utils.book_append_sheet(wb, personasSheet, 'Personas')
        XLSX.utils.book_append_sheet(wb, liaisonsSheet, 'Liaisons')

        XLSX.writeFile(wb, fileName)
    }

    const generatePDF = () => {
        setSearchTerm("")

        setTimeout(() => {
            setPdfGenerate(true)
        }, 2000)
    }

    useEffect(() => {
        const generate = async () => {
            if (pdfGenerate) {
                const pdf = new jsPDF()

                const currentDate = new Date()
                const formattedDate = currentDate.toLocaleDateString().split('/').join('-')
                const formattedTime = currentDate.toLocaleTimeString().split(':').join('-')

                const fileName = `${selectedCustomer.NomClient}_${formattedDate}_${formattedTime}.pdf`

                const maxWidth = 150
                const lineHeight = 10

                const splitOptions = { maxWidth, lineHeight }

                const addTextWithWrap = (text: string, x: number, y: number, width: number) => {
                    const splitText = pdf.splitTextToSize(text, width, splitOptions)
                    pdf.text(splitText, x, y)
                }

                pdf.addImage('/images/logo/logo_yuzu.png', 'PNG', 30, 20, 150, 75)

                pdf.setFont('BD Supper, sans serif', 'bold')
                pdf.setFontSize(40)
                addTextWithWrap('Bilan Datahub Persona', 30, 100, 175)

                pdf.setFont('BD Supper, sans serif', 'normal')
                pdf.setFontSize(16)
                addTextWithWrap(`Au total, ${numberContacts} contacts sont présents sur HubSpot. Parmis eux, ${numberRoles} intitulés de postes distincts`, 20, 130, 175)

                pdf.setFont('BD Supper, sans serif', 'bold')
                pdf.setFontSize(19)
                addTextWithWrap(`Répartition entre les ${numberPersonas} personas présents sur Hubspot`, 20, 150, 175)

                const chartImage = await convertChartToImage()
                if (chartImage) {
                    pdf.addImage(chartImage, 'PNG', 30, 180, 160, 80)
                }

                pdf.addPage()

                const tableHeaders = ['Nom', 'Poste', 'Pourcentage']
                const sortedPersonas = personas.sort((a, b) => b.occurences - a.occurences)
                const tableData = sortedPersonas.map(persona => [persona.jobTitle, persona.occurences, 0])

                const totalOccurrences = roles.reduce((sum, role) => sum + role.occurences, 0)

                tableData.forEach((rowData) => {
                    const percentage = (rowData[1] as number / totalOccurrences) * 100
                    rowData[2] = `${percentage.toFixed(2)}%`
                })

                const startY = 20
                const margin = 10
                const cellWidth = (pdf.internal.pageSize.width - 2 * margin - 20) / tableHeaders.length
                const cellHeight = lineHeight + 20

                pdf.rect(margin, startY, pdf.internal.pageSize.width - 2 * margin, (tableData.length + 2) * cellHeight)

                pdf.setFont('BD Supper, sans serif', 'bold')
                tableHeaders.forEach((header, i) => {
                    if (i === 0) {
                        pdf.text(header, margin + i * cellWidth + 10, startY + cellHeight)
                    } else if (i === 1) {
                        pdf.text(header, margin + i * cellWidth + 40, startY + cellHeight)
                    } else {
                        pdf.text(header, margin + i * cellWidth + 30, startY + cellHeight)
                    }
                })

                pdf.line(margin, startY + cellHeight + 5, pdf.internal.pageSize.width - margin, startY + cellHeight + 5)

                pdf.setFont('BD Supper, sans serif', 'normal')
                tableData.forEach((rowData, rowIndex) => {
                    rowData.forEach((cellData, colIndex) => {
                        const textHeight = lineHeight * (pdf.splitTextToSize(String(cellData), cellWidth, { maxWidth: cellWidth, lineHeight: lineHeight }).length - 1)
                        const cellY = startY + (rowIndex + 1) * cellHeight + (cellHeight - textHeight) / 2 + 7

                        if (colIndex === 0) {
                            addTextWithWrap(String(cellData), margin + colIndex * cellWidth + 10, cellY, cellWidth - 10)
                        } else if (colIndex === 1) {
                            addTextWithWrap(String(cellData), margin + colIndex * cellWidth + 40, cellY, cellWidth - 10)
                        } else {
                            addTextWithWrap(String(cellData), margin + colIndex * cellWidth + 30, cellY, cellWidth - 10)
                        }
                    })

                    pdf.line(margin, startY + (rowIndex + 2) * cellHeight + 5, pdf.internal.pageSize.width - margin, startY + (rowIndex + 2) * cellHeight + 5)

                    pdf.line(margin + cellWidth + 30, startY, margin + cellWidth + 30, startY + (tableData.length + 2) * cellHeight)
                })

                const totalOccurences = roles.reduce((sum, role) => sum + role.occurences, 0)

                tableData.forEach((rowData, rowIndex) => {
                    const percentage = (rowData[1] as number / totalOccurences) * 100
                    rowData[2] = `${percentage.toFixed(2)}%`
                })

                pdf.line(margin + cellWidth + 80, startY, margin + cellWidth + 80, startY + (tableData.length + 2) * cellHeight)

                pdf.save(fileName)

                setPdfGenerate(false)
            }
        }

        generate()
    }, [pdfGenerate])

    const convertChartToImage = async () => {
        const chartContainer = document.getElementById('chart-container')
        if (chartContainer) {
            const canvas = await html2canvas(chartContainer)
            return canvas.toDataURL('image/png')
        }
        return null
    }

    return (
        <Container maxWidth="lg">
            <Stack spacing={8} alignItems="center" marginTop="100px" marginBottom="100px">
                <Typography variant="h3">
                    DataHub - Persona
                </Typography>

                <Stack>
                    {loading ? <CircularProgress /> : <Stack spacing={8} width="100%">
                        <Stack spacing={2} direction={isDesktop ? "row" : "column"} alignItems="center" width="100%">
                            <Stack spacing={2} justifyContent="flex-end" alignItems="center" maxWidth="350px" width="100%">
                                <Stack
                                    spacing={2}
                                    alignItems="center"
                                    justifyContent="center"
                                    maxWidth="350px"
                                    width="100%"
                                    height="200px"
                                    sx={{
                                        borderRadius: '15px',
                                        background: theme.palette.text.primary
                                    }}
                                >
                                    <Typography variant="h3" color={theme.palette.background.default}>
                                        {numberContacts}
                                    </Typography>

                                    <Typography color={theme.palette.background.default}>
                                        Contacts
                                    </Typography>
                                </Stack>

                                <Stack spacing={2} direction="row">
                                    <AButton variant="contained" color="white" onClick={generatePDF}>
                                        Télécharger le PDF
                                    </AButton>

                                    <AButton variant="contained" onClick={generateExcel}>
                                        Télécharger l'Excel
                                    </AButton>
                                </Stack>

                                <TextField
                                    placeholder="Recherche par Intitulé de poste"
                                    value={searchTerm}
                                    onChange={(e) => handleFilteredChange(e.target.value)}
                                    sx={{
                                        width: "100%",
                                        borderColor: '#E0E0E0',
                                        boxShadow: '0px 4px 4px 0px rgba(0, 0, 0, 0.25)'
                                    }}
                                    InputProps={{
                                        endAdornment: <FontAwesomeIcon
                                            icon={faMagnifyingGlass}
                                            color={theme.palette.text.primary}
                                            opacity={0.5}
                                        />
                                    }}
                                />
                            </Stack>

                            <Stack width="100%" height="100%">
                                <Chart
                                    id="chart-container"
                                    type="bar"
                                    width="100%"
                                    height="350px"
                                    series={[{
                                        name: 'Occurences',
                                        data: contactsOccurences
                                    }]}
                                    options={{
                                        chart: {
                                            toolbar: {
                                                show: false
                                            }
                                        },
                                        xaxis: {
                                            categories: contactsJobTitles,
                                            labels: {
                                                style: {
                                                    fontFamily: theme.typography.body1.fontFamily,
                                                    fontWeight: theme.typography.body1.fontWeight,
                                                    colors: theme.typography.body1.color
                                                }
                                            }
                                        },
                                        yaxis: {
                                            labels: {
                                                style: {
                                                    fontFamily: theme.typography.body1.fontFamily,
                                                    fontWeight: theme.typography.body1.fontWeight,
                                                    colors: theme.typography.body1.color
                                                }
                                            }
                                        },
                                        colors: [theme.palette.info.main]
                                    }}
                                />
                            </Stack>
                        </Stack>

                        <Stack spacing={2}>
                            <Stack spacing={4} direction={isDesktop ? "row" : "column"} justifyContent="space-between" width="100%">
                                <MCardData
                                    title="Intitulé de poste"
                                    number={filteredRoles ? filteredRoles.length : roles.length}
                                    label="Nombre d'intitulé de poste différents"
                                    jobTitles={filteredRoles ? filteredRoles : roles}
                                />

                                <MCardData
                                    title="Persona"
                                    number={filteredPersonas ? filteredPersonas.length : personas.length}
                                    label="Nombre de persona différents"
                                    jobTitles={filteredPersonas ? filteredPersonas : personas}
                                />

                                <MCardData
                                    title="Intitulé de poste - Persona"
                                    number={filteredLinks ? filteredLinks.length : links.length}
                                    label="Nombre de liaisons différentes"
                                    jobTitles={filteredLinks ? filteredLinks : links}
                                />
                            </Stack>
                        </Stack>
                    </Stack>}
                </Stack>
            </Stack>
        </Container>
    )
}

export default Data