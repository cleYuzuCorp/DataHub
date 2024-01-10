import { Container, Stack, TextField, Typography, useMediaQuery } from "@mui/material"
import OFormAssociation from "../../../components/organisms/o-form-association"
import theme from "../../../theme"
import MCardData from "../../../components/molecules/m-card-data"
import { useEffect, useState } from "react"
import { Contact } from "../../../interfaces/contact"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons"
import Chart from "react-apexcharts"

const AssociationRoleKeywords = () => {

    const isDesktop = useMediaQuery(theme.breakpoints.up('sm'))

    const [searchTerm, setSearchTerm] = useState("")
    const [filteredContacts, setFilteredContacts] = useState<Contact[]>()
    const [contactsJobTitles, setContactsJobTitles] = useState([""])
    const [contactsOccurences, setContactsOccurences] = useState([0])

    useEffect(() => {
        const jobTitles: string[] = []
        const occurences: number[] = []

        contacts.map((contact) => {
            jobTitles.push(contact.jobTitle)
            occurences.push(contact.occurences)
        })

        setContactsJobTitles(jobTitles)
        setContactsOccurences(occurences)
    })

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

    return (
        <Container maxWidth="lg">
            <Stack spacing={8} alignItems="center" marginTop="100px" marginBottom="100px">
                <Stack spacing={2} direction={isDesktop ? "row" : "column"}>
                    <Stack spacing={2} justifyContent="flex-end">
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
                                maxWidth: '350px',
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

                    <Stack width="100%">
                        <Chart
                            type="pie"
                            width="100%"
                            series={contactsOccurences}
                            options={{
                                labels: contactsJobTitles,
                                legend: {
                                    position: 'bottom'
                                },
                                dataLabels: {
                                    enabled: true,
                                    formatter: function (val, opts) {
                                        return opts.w.globals.series[opts.seriesIndex];
                                    }
                                }
                            }}
                        />
                    </Stack>
                </Stack>

                <Stack spacing={2} direction={isDesktop ? "row" : "column"} justifyContent="space-between">
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

                <OFormAssociation parentLabel="Rôle" childLabel="Mot clé" />
            </Stack>
        </Container>
    )
}

export default AssociationRoleKeywords