import { faMagnifyingGlass, faChevronUp, faChevronDown, faArrowDown, faArrowUp } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Checkbox, Collapse, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography, useMediaQuery } from "@mui/material"
import React, { useEffect, useState } from "react"
import theme from "../../theme"
import AButton from "../atoms/a-button"
import { Contact } from "../../interfaces/contact"
import { acquireToken } from "../../App"

const OTableEnrichment = (props: {
    instance: any, id: string | null, contacts: Contact[], nothing?: boolean, dbPersona: {
        description: string;
        value: string;
    }[]
}) => {

    const { instance, id, contacts, nothing, dbPersona } = props

    const isDesktop = useMediaQuery('(min-width:1000px)')

    const [searchTerm, setSearchTerm] = useState("")
    const [filteredContacts, setFilteredContacts] = useState<Contact[]>(contacts)

    const [hovered, setHovered] = useState<number | undefined>()
    const [open, setOpen] = useState<Array<boolean>>([])
    const [selectedContacts, setSelectedContacts] = useState<Array<Contact>>([])
    const [ignoredContacts, setIgnoredContacts] = useState<Array<Contact>>([])
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

    const toggleSortOrder = () => {
        setSortOrder((prevOrder) => (prevOrder === 'asc' ? 'desc' : 'asc'))
    }

    const sortedContacts = filteredContacts.sort((a, b) => {
        if (sortOrder === 'asc') {
            return a.occurence - b.occurence
        } else {
            return b.occurence - a.occurence
        }
    })

    const handleFilteredChange = (value: string) => {
        setSearchTerm(value)
    }

    useEffect(() => {
        const filtered = contacts.filter(contact =>
            (!ignoredContacts.includes(contact)) &&
            (contact.intituledePoste.toLowerCase().includes(searchTerm.toLowerCase()))
        )
        setFilteredContacts(filtered)
    }, [searchTerm, ignoredContacts, contacts])

    const toggleRow = (index: number) => {
        setOpen((prevOpenRows) => ({
            ...prevOpenRows,
            [index]: !prevOpenRows[index]
        }))
    }

    const handleSelectAllChange = () => {
        if (selectedContacts.length === filteredContacts.length) {
            setSelectedContacts([])
        } else {
            setSelectedContacts(filteredContacts)
        }
    }

    const handleSelectChange = (index: number) => {
        if (selectedContacts.includes(filteredContacts[index])) {
            setSelectedContacts(selectedContacts.filter((contact) => contact !== filteredContacts[index]))
        } else {
            setSelectedContacts([...selectedContacts, filteredContacts[index]])
        }
    }

    const handleIgnoreProposal = () => {
        setIgnoredContacts((prevIgnoredContacts) => [
            ...prevIgnoredContacts,
            ...selectedContacts
        ])
        setSelectedContacts([])
    }

    const handleSubmit = async () => {
        const account = instance.getActiveAccount()

        const body = {
            idTenant: id,
            emailModified: account.username,
            tableOfValues: dbPersona,
            propositions: selectedContacts,
        }

        await instance.initialize()
        const accessToken = await acquireToken(instance)

        const response = await fetch(`${process.env.REACT_APP_API_PERSONA}/hubspot/enrich`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        })

        handleIgnoreProposal()

        console.log(response)
    }

    return (
        <Stack spacing={4} width="100%">
            <Stack spacing={4} direction={isDesktop ? "row" : "column"} alignItems="center" width="100%">
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

                <Stack spacing={2} direction="row" alignItems="center" justifyContent={isDesktop ? "flex-end" : "space-between"} width="100%">
                    <AButton variant="outlined" color="error" onClick={handleIgnoreProposal}>
                        Ignorer la proposition
                    </AButton>

                    <AButton variant="contained" onClick={handleSubmit}>
                        Valider la proposition
                    </AButton>
                </Stack>
            </Stack>

            <Table component={Paper} sx={{ background: theme.palette.background.default }}>
                <TableHead sx={{ background: theme.palette.text.primary }}>
                    <TableRow>
                        <TableCell align="left">
                            <Typography variant="body2" color={theme.palette.background.default}>
                                Intitulé de poste
                            </Typography>
                        </TableCell>
                        {!nothing && <TableCell align="center">
                            <Typography variant="body2" color={theme.palette.background.default}>
                                Persona proposé
                            </Typography>
                        </TableCell>}
                        <TableCell align="center">
                            <Stack
                                spacing={1}
                                direction="row"
                                alignItems="center"
                                justifyContent="center"
                                onClick={toggleSortOrder}
                                sx={{
                                    cursor: 'pointer'
                                }}
                            >
                                <Typography variant="body2" color={theme.palette.background.default}>
                                    Apparitions
                                </Typography>
                                {sortOrder === 'asc' ?
                                    <FontAwesomeIcon icon={faArrowUp} color={theme.palette.background.default} /> :
                                    <FontAwesomeIcon icon={faArrowDown} color={theme.palette.background.default} />
                                }
                            </Stack>
                        </TableCell>
                        <TableCell align="right">
                            <Checkbox
                                checked={selectedContacts?.length === filteredContacts.length}
                                onChange={handleSelectAllChange}
                                indeterminate={selectedContacts.length > 0 && selectedContacts.length < filteredContacts.length}
                                sx={{
                                    color: theme.palette.background.default,
                                    '&.Mui-checked': {
                                        color: theme.palette.background.default
                                    },
                                    '&.MuiCheckbox-indeterminate': {
                                        color: theme.palette.background.default
                                    }
                                }}
                            />
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {sortedContacts.map((contact, index) =>
                        <React.Fragment key={index}>
                            <TableRow
                                onMouseEnter={() => setHovered(index)}
                                onMouseLeave={() => setHovered(undefined)}
                                onClick={() => toggleRow(index)}
                                sx={{
                                    background: open[index] || hovered === index ? theme.palette.secondary.light : 'none'
                                }}
                            >
                                {contact.contacts.map((c) => <TableCell key={c.hs_object_id}>
                                    <Stack spacing={2} direction="row" alignItems="center">
                                        {open[index] ?
                                            <FontAwesomeIcon icon={faChevronUp} /> :
                                            <FontAwesomeIcon icon={faChevronDown} />
                                        }

                                        <Typography>
                                            {c.role}
                                        </Typography>
                                    </Stack>
                                </TableCell>)}
                                {!nothing && contact.contacts.map((c) => <TableCell key={c.hs_object_id} align="center">
                                    <Typography>
                                        {c.persona}
                                    </Typography>
                                </TableCell>)}
                                <TableCell align="center" width="50%">
                                    <Typography>
                                        {contact.occurence}
                                    </Typography>
                                </TableCell>
                                <TableCell align="right">
                                    <Checkbox
                                        checked={selectedContacts.includes(contact)}
                                        onChange={() => handleSelectChange(index)}
                                    />
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell colSpan={nothing ? 3 : 4} padding="none">
                                    <Collapse in={open[index]} timeout="auto" unmountOnExit>
                                        <Table component={Paper} sx={{ background: theme.palette.background.default }}>
                                            <TableHead>
                                                <TableRow sx={{ background: theme.palette.info.light }}>
                                                    <TableCell align="left">
                                                        <Typography>
                                                            hs_object_id
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Typography>
                                                            Prénom
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Typography>
                                                            Nom
                                                        </Typography>
                                                    </TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {contact.contacts.map((c) => <TableRow key={c.hs_object_id}>
                                                    <TableCell align="left">
                                                        <Typography>
                                                            {c.hs_object_id}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Typography>
                                                            {c.firsname}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Typography>
                                                            {c.lastname}
                                                        </Typography>
                                                    </TableCell>
                                                </TableRow>)}
                                            </TableBody>
                                        </Table>
                                    </Collapse>
                                </TableCell>
                            </TableRow>
                        </React.Fragment>
                    )}
                </TableBody>
            </Table>
        </Stack>
    )
}

export default OTableEnrichment