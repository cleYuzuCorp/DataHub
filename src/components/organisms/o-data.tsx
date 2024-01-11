import { Stack, TextField, Typography, useMediaQuery } from "@mui/material"
import { useEffect, useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons"
import Chart from "react-apexcharts"
import { Contact } from "../../interfaces/contact"
import theme from "../../theme"
import MCardData from "../molecules/m-card-data"
import AButton from "../atoms/a-button"
import jsPDF from "jspdf"

const OData = () => {

    const isDesktop = useMediaQuery('(min-width:1000px)')

    const [searchTerm, setSearchTerm] = useState("")
    const [filteredContacts, setFilteredContacts] = useState<Contact[]>()
    const [contactsJobTitles, setContactsJobTitles] = useState([""])
    const [contactsOccurences, setContactsOccurences] = useState([0])

    useEffect(() => {
        const jobTitles: string[] = []
        const occurences: number[] = []

        if (filteredContacts) {
            filteredContacts.map((contact) => {
                jobTitles.push(contact.jobTitle)
                occurences.push(contact.occurences)
            })
        } else {
            contacts.map((contact) => {
                jobTitles.push(contact.jobTitle)
                occurences.push(contact.occurences)
            })
        }

        setContactsJobTitles(jobTitles)
        setContactsOccurences(occurences)
    }, [filteredContacts])

    const contacts = [
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

        const filtered = contacts.filter(contact =>
            contact.jobTitle.toLowerCase().includes(value.toLowerCase())
        )

        setFilteredContacts(filtered)
    }

    const generatePDF = () => {
        const pdf = new jsPDF()

        const maxWidth = 150
        const lineHeight = 10

        const splitOptions = { maxWidth, lineHeight }

        const addTextWithWrap = (text: string, x: number, y: number) => {
            const splitText = pdf.splitTextToSize(text, maxWidth, splitOptions)
            pdf.text(splitText, x, y)
        }

        pdf.addImage('/images/logo/logo_yuzu.png', 'PNG', 20, 20, 150, 75)

        pdf.setFont('BD Supper, sans serif', 'bold')
        pdf.setFontSize(40)
        addTextWithWrap('Bilan Datahub Persona', 50, 100)

        pdf.setFont('BD Supper, sans serif', 'normal')
        pdf.setFontSize(16)
        addTextWithWrap(`Au total, 974 contacts sont présents sur HubSpot. Parmis eux, ${contacts.length} intitulés de postes distincts`, 20, 130)

        pdf.setFont('BD Supper, sans serif', 'bold')
        pdf.setFontSize(19)
        addTextWithWrap(`Répartition entre les ${contacts.length} personas présents sur Hubspot`, 20, 150)

        const tableHeaders = ['Nom', 'Poste'];
        const tableData = contacts.map(contact => [contact.jobTitle, contact.occurences]);

        const startY = 170
        const margin = 10
        const cellWidth = (pdf.internal.pageSize.width - 2 * margin - 20) / tableHeaders.length
        const cellHeight = lineHeight + 5; // Adjust the height as needed

        // Rectangle around the table
        pdf.rect(margin, startY, pdf.internal.pageSize.width - 2 * margin, (tableData.length + 2) * cellHeight);

        pdf.setFont('BD Supper, sans serif', 'bold')
        tableHeaders.forEach((header, i) => {
            if (i === 1) {
                // Décalage du header "Poste" sur la droite
                pdf.text(header, margin + i * cellWidth + 40, startY + cellHeight);
            } else {
                pdf.text(header, margin + i * cellWidth + 10, startY + cellHeight);
            }
        })

        // Line separating header and values
        pdf.line(margin, startY + cellHeight + 5, pdf.internal.pageSize.width - margin, startY + cellHeight + 5);

        pdf.setFont('BD Supper, sans serif', 'normal')
        tableData.forEach((rowData, rowIndex) => {
            rowData.forEach((cellData, colIndex) => {
                if (colIndex === 1) {
                    // Adjusting the position of the text for the 'Poste' column
                    pdf.text(String(cellData), margin + colIndex * cellWidth + 40, startY + (rowIndex + 2) * cellHeight);
                } else {
                    pdf.text(String(cellData), margin + colIndex * cellWidth + 10, startY + (rowIndex + 2) * cellHeight);
                }
            })

            // Line separating rows
            pdf.line(margin, startY + (rowIndex + 2) * cellHeight + 5, pdf.internal.pageSize.width - margin, startY + (rowIndex + 2) * cellHeight + 5);

            // Vertical line between names and positions
            pdf.line(margin + cellWidth + 30, startY, margin + cellWidth + 30, startY + (tableData.length + 2) * cellHeight);
        })

        pdf.save()
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
                        number={filteredContacts ? filteredContacts.length : contacts.length}
                        label="Nombre d'intitulé de poste différents"
                        contacts={filteredContacts ? filteredContacts : contacts}
                    />

                    <MCardData
                        number={filteredContacts ? filteredContacts.length : contacts.length}
                        label="Nombre de persona différents"
                        contacts={filteredContacts ? filteredContacts : contacts}
                    />

                    <MCardData
                        number={filteredContacts ? filteredContacts.length : contacts.length}
                        label="Nombre de liaisons différentes"
                        contacts={filteredContacts ? filteredContacts : contacts}
                    />
                </Stack>

                <Stack spacing={2} direction="row" justifyContent="flex-end">
                    <AButton variant="contained" color="white" onClick={generatePDF}>
                        Télécharger le PDF
                    </AButton>

                    <AButton variant="contained">
                        Télécharger l'Excel
                    </AButton>
                </Stack>
            </Stack>
        </Stack>
    )
}

export default OData