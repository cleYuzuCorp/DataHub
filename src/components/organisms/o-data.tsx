import { CircularProgress, Stack, TextField, Typography, useMediaQuery } from "@mui/material"
import { useEffect, useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons"
import Chart from "react-apexcharts"
import { JobTitle } from "../../interfaces/job-title"
import theme from "../../theme"
import MCardData from "../molecules/m-card-data"
import AButton from "../atoms/a-button"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import * as XLSX from 'xlsx'
import { acquireToken } from "../../App"
import { useLocation } from "react-router-dom"

const OData = (props: { instance: any }) => {

    const { instance } = props

    const idTenant = new URLSearchParams(useLocation().search).get('id')

    const isDesktop = useMediaQuery('(min-width:1000px)')

    const [loading, setLoading] = useState(false)
    const [dataInit, setDataInit] = useState(false)
    const [pdfGenerate, setPdfGenerate] = useState(false)

    const [fetchDataInit, setFetchDataInit] = useState(false)
    const [dbPersona, setDbPersona] = useState([{ description: "", value: "" }])
    const [associationsRoleKeywords, setAssociationsRoleKeywords] = useState([{ parent: "", childs: [""] }])
    const [associationsPersonaRoles, setAssociationsPersonaRoles] = useState([{ parent: "", childs: [{ id: 0, value: "" }] }])

    const [numberContacts, setNumberContacts] = useState()
    const [numberRoles, setNumberRoles] = useState()
    const [numberPersonas, setNumberPersonas] = useState()

    const [roles, setRoles] = useState<JobTitle[]>([])
    const [personas, setPersonas] = useState<JobTitle[]>([])
    const [links, setLinks] = useState<JobTitle[]>([])

    const [searchTerm, setSearchTerm] = useState("")
    const [contactsJobTitles, setContactsJobTitles] = useState([""])
    const [contactsOccurences, setContactsOccurences] = useState([0])

    const [filteredRoles, setFilteredRoles] = useState<JobTitle[]>()
    const [filteredPersonas, setFilteredPersonas] = useState<JobTitle[]>()
    const [filteredLinks, setFilteredLinks] = useState<JobTitle[]>()

    useEffect(() => {
        setFetchDataInit(true)
    }, [])

    useEffect(() => {
        setLoading(true)

        const fetchData = async () => {
            if (fetchDataInit) {
                try {
                    await instance.initialize()
                    const accessToken = await acquireToken(instance)

                    const response = await fetch(`${process.env.REACT_APP_API_PERSONA}/persona/findAllAssociationsForTenant?IdTenant=${idTenant}`, {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                            "Content-Type": "application/json"
                        }
                    })

                    const data = await response.json()

                    if (data.personasRoles || data.rolesMotsClefs || data.dbPersona) {
                        const associationsPersonaRolesData = Object.keys(data.personasRoles).map((personaKey) => {
                            return {
                                parent: personaKey,
                                childs: data.personasRoles[personaKey].Roles.map((role: any, rolesIndex: number) => ({
                                    id: rolesIndex + 1,
                                    value: role,
                                }))
                            }
                        })

                        setAssociationsPersonaRoles(associationsPersonaRolesData)

                        const associationsRoleKeywordsData = Object.keys(data.rolesMotsClefs).map((roleKey) => {
                            return {
                                parent: roleKey,
                                childs: data.rolesMotsClefs[roleKey].MotsClefs.length !== 0 ? data.rolesMotsClefs[roleKey].MotsClefs : [""]
                            }
                        })

                        setAssociationsRoleKeywords(associationsRoleKeywordsData)

                        const personas = data.dbPersona.map((persona: { description: string, value: string }) => {
                            return {
                                description: persona.description,
                                value: persona.value
                            }
                        })

                        setDbPersona(personas)

                        setDataInit(true)
                        setLoading(false)
                    }

                } catch (error) {
                    console.error("Une erreur s'est produite lors de la requête :", error)
                }
            }
        }

        fetchData()
    }, [fetchDataInit])

    useEffect(() => {
        setLoading(true)

        const fetchData = async () => {
            if (idTenant && dataInit) {
                const parsedId = parseInt(idTenant, 10)

                const body = {
                    idTenant: parsedId,
                    dbPersona: dbPersona,
                    associationsRoleMotClef: associationsRoleKeywords.map((roleKeywords) => {
                        if (roleKeywords.parent !== "" && roleKeywords.childs.every((child) => child !== "")) {
                            return {
                                NomRole: roleKeywords.parent,
                                NomMotClef: roleKeywords.childs,
                            }
                        } else {
                            return undefined
                        }
                    }).filter((association) => association !== undefined),
                    associationsPersonaRole: associationsPersonaRoles.map((personaRoles) => {
                        if (personaRoles.parent !== "" && personaRoles.childs.every((child) => child.value !== "")) {
                            return {
                                NomPersona: personaRoles.parent,
                                NomRole: personaRoles.childs,
                            }
                        } else {
                            return undefined
                        }
                    }).filter((association) => association !== undefined)
                }

                const accessToken = await acquireToken(instance)

                const response = await fetch(`${process.env.REACT_APP_API_PERSONA}/hubspot/processPersona`, {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(body)
                })

                const data = await response.json()

                setNumberContacts(data.dashboard.totalOfDifferentContacts)
                setNumberRoles(data.dashboard.totalOfDifferentRoles)
                setNumberPersonas(data.dashboard.totalOfDifferentPersonas)

                const rolesData = Object.entries(data.dashboard.occurencesByRoles).map(([jobTitle, occurences]) => ({
                    jobTitle: jobTitle as string,
                    occurences: occurences as number
                }))

                setRoles(rolesData)

                const personasData = Object.entries(data.dashboard.occurencesByPersonas).map(([jobTitle, occurences]) => ({
                    jobTitle: jobTitle as string,
                    occurences: occurences as number
                }))

                setPersonas(personasData)

                const linksData = Object.entries(data.dashboard.occurencesByLiaisons).map(([jobTitle, occurences]) => ({
                    jobTitle: jobTitle as string,
                    occurences: occurences as number
                }))

                setLinks(linksData)
                setLoading(false)
            }
        }

        fetchData()
    }, [dataInit])

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

        const fileName = `Bilan_Datahub_Persona_${idTenant}_${formattedDate}_${formattedTime}.xlsx`

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

                const fileName = `Bilan_Datahub_Persona_${idTenant}_${formattedDate}_${formattedTime}.pdf`

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
                addTextWithWrap(`Au total, 974 contacts sont présents sur HubSpot. Parmis eux, ${numberRoles} intitulés de postes distincts`, 20, 130, 175)

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
                        const cellY = startY + (rowIndex + 2) * cellHeight + (cellHeight - textHeight) / 2

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
                            number={filteredRoles ? filteredRoles.length : roles.length}
                            label="Nombre d'intitulé de poste différents"
                            jobTitles={filteredRoles ? filteredRoles : roles}
                        />

                        <MCardData
                            number={filteredPersonas ? filteredPersonas.length : personas.length}
                            label="Nombre de persona différents"
                            jobTitles={filteredPersonas ? filteredPersonas : personas}
                        />

                        <MCardData
                            number={filteredLinks ? filteredLinks.length : links.length}
                            label="Nombre de liaisons différentes"
                            jobTitles={filteredLinks ? filteredLinks : links}
                        />
                    </Stack>
                </Stack>
            </Stack>}
        </Stack>
    )
}

export default OData