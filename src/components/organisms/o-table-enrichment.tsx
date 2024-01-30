import { faMagnifyingGlass, faChevronUp, faChevronDown, faArrowDown, faArrowUp } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Checkbox, Collapse, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography, useMediaQuery } from "@mui/material"
import React, { useState } from "react"
import theme from "../../theme"
import AButton from "../atoms/a-button"
import { Contact } from "../../interfaces/contact"

const OTableEnrichment = (props: { contacts: Contact[], nothing?: boolean }) => {

    const { contacts, nothing } = props

    const isDesktop = useMediaQuery('(min-width:1000px)')

    const [searchTerm, setSearchTerm] = useState("")
    const [filteredContacts, setFilteredContacts] = useState<Contact[]>(contacts)

    const [hovered, setHovered] = useState<number | undefined>()
    const [open, setOpen] = useState<Array<boolean>>([])
    const [selectedRows, setSelectedRows] = useState<Array<number>>([])
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

    const toggleSortOrder = () => {
        setSortOrder((prevOrder) => (prevOrder === 'asc' ? 'desc' : 'asc'))
    }

    const sortedContacts = filteredContacts.sort((a, b) => {
        if (sortOrder === 'asc') {
            return a.appearances - b.appearances
        } else {
            return b.appearances - a.appearances
        }
    })

    const handleFilteredChange = (value: string) => {
        setSearchTerm(value)

        const filtered = contacts.filter(contact =>
            contact.jobTitle.toLowerCase().includes(value.toLowerCase())
        )

        setFilteredContacts(filtered)
    }

    const toggleRow = (index: number) => {
        setOpen((prevOpenRows) => ({
            ...prevOpenRows,
            [index]: !prevOpenRows[index],
        }))
    }

    const handleSelectAllChange = () => {
        if (selectedRows.length === filteredContacts.length) {
            setSelectedRows([])
        } else {
            setSelectedRows(Array.from({ length: filteredContacts.length }, (_, i) => i))
        }
    }

    const handleSelectChange = (index: number) => {
        if (selectedRows.includes(index)) {
            setSelectedRows(selectedRows.filter((row) => row !== index))
        } else {
            if (!selectedRows) {
                setSelectedRows([index])
            } else {
                setSelectedRows([...selectedRows, index])
            }
        }
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
                    <AButton variant="outlined" color="error">
                        Ignorer la séléction
                    </AButton>

                    <AButton variant="contained">
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
                                checked={selectedRows?.length === filteredContacts.length}
                                onChange={handleSelectAllChange}
                                indeterminate={selectedRows.length > 0 && selectedRows.length < filteredContacts.length}
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
                                <TableCell>
                                    <Stack spacing={2} direction="row" alignItems="center">
                                        {open[index] ?
                                            <FontAwesomeIcon icon={faChevronUp} /> :
                                            <FontAwesomeIcon icon={faChevronDown} />
                                        }

                                        <Typography>
                                            {contact.jobTitle}
                                        </Typography>
                                    </Stack>
                                </TableCell>
                                {!nothing && <TableCell align="center">
                                    <Typography>
                                        {contact.proposedPersona}
                                    </Typography>
                                </TableCell>}
                                <TableCell align="center" width="50%">
                                    <Typography>
                                        {contact.appearances}
                                    </Typography>
                                </TableCell>
                                <TableCell align="right">
                                    <Checkbox
                                        checked={selectedRows.includes(index)}
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
                                                <TableRow key={contact.hsObjectId}>
                                                    <TableCell align="left">
                                                        <Typography>
                                                            {contact.hsObjectId}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Typography>
                                                            {contact.firstName}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Typography>
                                                            {contact.lastName}
                                                        </Typography>
                                                    </TableCell>
                                                </TableRow>
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