import { Stack, TextField, Typography, useMediaQuery } from "@mui/material"
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

const OData = () => {

    const isDesktop = useMediaQuery('(min-width:1000px)')

    const [searchTerm, setSearchTerm] = useState("")
    const [filteredJobTitle, setFilteredJobTitle] = useState<JobTitle[]>()
    const [contactsJobTitles, setContactsJobTitles] = useState([""])
    const [contactsOccurences, setContactsOccurences] = useState([0])

    useEffect(() => {
        const jT: string[] = []
        const occurences: number[] = []

        if (filteredJobTitle) {
            filteredJobTitle.map((jobTitle) => {
                jT.push(jobTitle.jobTitle)
                occurences.push(jobTitle.occurences)
            })
        } else {
            jobTitles.map((jobTitle) => {
                jT.push(jobTitle.jobTitle)
                occurences.push(jobTitle.occurences)
            })
        }

        setContactsJobTitles(jT)
        setContactsOccurences(occurences)
    }, [filteredJobTitle])

    const jobTitles = [
        {
            jobTitle: "SalesPerson",
            occurences: 1
        },
        {
            jobTitle: "Directeur commericial",
            occurences: 1
        },
        {
            jobTitle: "Sales & Marketing Director",
            occurences: 1
        },
        {
            jobTitle: "svp sales & strategy",
            occurences: 1
        },
        {
            jobTitle: "pdg",
            occurences: 1
        },
    ]

    const handleFilteredChange = (value: string) => {
        setSearchTerm(value)

        const filtered = jobTitles.filter(jobTitle =>
            jobTitle.jobTitle.toLowerCase().includes(value.toLowerCase())
        )

        setFilteredJobTitle(filtered)
    }

    const generateExcel = () => {
        const rolesData = jobTitles.map(jobTitle => ({ Role: jobTitle.jobTitle, Occurences: jobTitle.occurences }))
        const personasData = jobTitles.map(jobTitle => ({ Persona: jobTitle.jobTitle, Occurences: jobTitle.occurences }))
        const liaisonsData = jobTitles.map(jobTitle => ({ Liaisons: jobTitle.jobTitle, Occurences: jobTitle.occurences }))

        const rolesSheet = XLSX.utils.json_to_sheet(rolesData)
        const personasSheet = XLSX.utils.json_to_sheet(personasData)
        const liaisonsSheet = XLSX.utils.json_to_sheet(liaisonsData)

        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, rolesSheet, 'Roles')
        XLSX.utils.book_append_sheet(wb, personasSheet, 'Personas')
        XLSX.utils.book_append_sheet(wb, liaisonsSheet, 'Liaisons')

        XLSX.writeFile(wb, 'contacts_data.xlsx')
    }


    const generatePDF = async () => {
        const pdf = new jsPDF()

        const maxWidth = 150
        const lineHeight = 10

        const splitOptions = { maxWidth, lineHeight }

        const addTextWithWrap = (text: string, x: number, y: number) => {
            const splitText = pdf.splitTextToSize(text, maxWidth, splitOptions)
            pdf.text(splitText, x, y)
        }

        pdf.addImage('/images/logo/logo_yuzu.png', 'PNG', 30, 20, 150, 75)

        pdf.setFont('BD Supper, sans serif', 'bold')
        pdf.setFontSize(40)
        addTextWithWrap('Bilan Datahub Persona', 30, 100)

        pdf.setFont('BD Supper, sans serif', 'normal')
        pdf.setFontSize(16)
        addTextWithWrap(`Au total, 974 jobTitles sont présents sur HubSpot. Parmis eux, ${jobTitles.length} intitulés de postes distincts`, 20, 130)

        pdf.setFont('BD Supper, sans serif', 'bold')
        pdf.setFontSize(19)
        addTextWithWrap(`Répartition entre les ${jobTitles.length} personas présents sur Hubspot`, 20, 150)

        const chartImage = await convertChartToImage()
        if (chartImage) {
            pdf.addImage(chartImage, 'PNG', 30, 180, 160, 80)
        }

        pdf.addPage()

        const tableHeaders = ['Nom', 'Poste', 'Pourcentage']
        const tableData = jobTitles.map(jobTitle => [jobTitle.jobTitle, jobTitle.occurences, 0])

        const startY = 20
        const margin = 10
        const cellWidth = (pdf.internal.pageSize.width - 2 * margin - 20) / tableHeaders.length
        const cellHeight = lineHeight + 5

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
                if (colIndex === 0) {
                    pdf.text(String(cellData), margin + colIndex * cellWidth + 10, startY + (rowIndex + 2) * cellHeight)
                } else if (colIndex === 1) {
                    pdf.text(String(cellData), margin + colIndex * cellWidth + 40, startY + (rowIndex + 2) * cellHeight)
                } else {
                    pdf.text(String(cellData), margin + colIndex * cellWidth + 30, startY + (rowIndex + 2) * cellHeight)
                }
            })

            pdf.line(margin, startY + (rowIndex + 2) * cellHeight + 5, pdf.internal.pageSize.width - margin, startY + (rowIndex + 2) * cellHeight + 5)

            pdf.line(margin + cellWidth + 30, startY, margin + cellWidth + 30, startY + (tableData.length + 2) * cellHeight)
        })

        const totalOccurences = jobTitles.reduce((sum, jobTitle) => sum + jobTitle.occurences, 0)

        tableData.forEach((rowData, rowIndex) => {
            const percentage = (rowData[1] as number / totalOccurences) * 100
            rowData[2] = `${percentage.toFixed(2)}%`
        })

        pdf.line(margin + cellWidth + 80, startY, margin + cellWidth + 80, startY + (tableData.length + 2) * cellHeight)

        pdf.save()
    }

    const convertChartToImage = async () => {
        const chartContainer = document.getElementById('chart-container')
        if (chartContainer) {
            const canvas = await html2canvas(chartContainer)
            return canvas.toDataURL('image/png')
        }
        return null
    }

    return (
        <Stack spacing={8} width="100%">
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
                            974
                        </Typography>

                        <Typography color={theme.palette.background.default}>
                            Contacts
                        </Typography>
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
                        number={filteredJobTitle ? filteredJobTitle.length : jobTitles.length}
                        label="Nombre d'intitulé de poste différents"
                        jobTitles={filteredJobTitle ? filteredJobTitle : jobTitles}
                    />

                    <MCardData
                        number={filteredJobTitle ? filteredJobTitle.length : jobTitles.length}
                        label="Nombre de persona différents"
                        jobTitles={filteredJobTitle ? filteredJobTitle : jobTitles}
                    />

                    <MCardData
                        number={filteredJobTitle ? filteredJobTitle.length : jobTitles.length}
                        label="Nombre de liaisons différentes"
                        jobTitles={filteredJobTitle ? filteredJobTitle : jobTitles}
                    />
                </Stack>

                <Stack spacing={2} direction="row" justifyContent="flex-end">
                    <AButton variant="contained" color="white" onClick={generatePDF}>
                        Télécharger le PDF
                    </AButton>

                    <AButton variant="contained" onClick={generateExcel}>
                        Télécharger l'Excel
                    </AButton>
                </Stack>
            </Stack>
        </Stack>
    )
}

export default OData