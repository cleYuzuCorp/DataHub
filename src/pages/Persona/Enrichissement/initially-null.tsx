import { faChevronDown, faChevronUp, faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Checkbox, Collapse, Container, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from "@mui/material"
import theme from "../../../theme"
import React, { useState } from "react"
import { Contact } from "../../../interfaces/contact"

const AHeaderSelect = () => {

    const [searchTerm, setSearchTerm] = useState("")
    const [filteredContacts, setFilteredContacts] = useState<Contact[]>()

    const [hovered, setHovered] = useState<number | undefined>()
    const [open, setOpen] = useState<Array<boolean>>([])
    const [selectedRows, setSelectedRows] = useState<Array<number>>([])

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
        if (selectedRows.length === contacts.length) {
            setSelectedRows([])
        } else {
            setSelectedRows(Array.from({ length: contacts.length }, (_, i) => i))
        }
    }

    const handleSelectChange = (index: number) => {
        if (selectedRows.includes(index)) {
            setSelectedRows(selectedRows.filter(row => row !== index))
        } else {
            if (!selectedRows) {
                setSelectedRows([index])
            } else {
                setSelectedRows([...selectedRows, index])
            }
        }
    }

    const contacts = [
        {
            jobTitle: "SalesPerson",
            proposedPersona: "manager",
            hsObjectId: 1,
            firstName: "Maria",
            lastName: "Jonhson"
        },
        {
            jobTitle: "Directeur commericial",
            proposedPersona: "directeur",
            hsObjectId: 1,
            firstName: "Maria",
            lastName: "Jonhson"
        },
        {
            jobTitle: "Sales & Marketing Director",
            proposedPersona: "manager",
            hsObjectId: 1,
            firstName: "Maria",
            lastName: "Jonhson"
        },
        {
            jobTitle: "svp sales & strategy",
            proposedPersona: "manager",
            hsObjectId: 1,
            firstName: "Maria",
            lastName: "Jonhson"
        },
        {
            jobTitle: "pdg",
            proposedPersona: "pdg",
            hsObjectId: 1,
            firstName: "Maria",
            lastName: "Jonhson"
        },
    ]

    return (
        <Container maxWidth="lg">
            <Stack spacing={8} alignItems="center" marginTop="100px" marginBottom="100px">
                <Typography variant="h3">
                    DataHub
                </Typography>

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

                <Table component={Paper} sx={{ background: theme.palette.background.default }}>
                    <TableHead sx={{ background: theme.palette.text.primary }}>
                        <TableRow>
                            <TableCell align="left">
                                <Typography variant="body2" color={theme.palette.background.default}>
                                    Intitulé de poste
                                </Typography>
                            </TableCell>
                            <TableCell align="center">
                                <Typography variant="body2" color={theme.palette.background.default}>
                                    Persona proposé
                                </Typography>
                            </TableCell>
                            <TableCell align="right">
                                <Checkbox
                                    checked={selectedRows?.length === contacts.length}
                                    onChange={handleSelectAllChange}
                                    indeterminate={selectedRows.length > 0 && selectedRows.length < contacts.length}
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
                        {contacts.map((contact, index) =>
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
                                    <TableCell align="center">
                                        <Typography>
                                            {contact.proposedPersona}
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
                                    <TableCell colSpan={3} padding="none">
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
        </Container>
    )
}

export default AHeaderSelect