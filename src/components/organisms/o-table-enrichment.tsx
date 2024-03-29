import { faMagnifyingGlass, faChevronUp, faChevronDown, faArrowDown, faArrowUp, faXmark } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Checkbox, CircularProgress, Collapse, IconButton, Modal, Paper, Stack, Table, TableBody, TableCell, TableHead, TablePagination, TableRow, TextField, Typography, useMediaQuery } from "@mui/material"
import React, { useEffect, useState } from "react"
import theme from "../../theme"
import AButton from "../atoms/a-button"
import { Contact } from "../../interfaces/contact"
import { acquireToken } from "../../App"

const OTableEnrichment = (props: {
    instance: any
    id: string | null
    contacts: Contact[]
    dbPersona: { description: string, value: string }[]
    nothing?: boolean
    find?: boolean
    validate: () => void
}) => {

    const { instance, id, contacts, dbPersona, nothing, find, validate } = props

    const isDesktop = useMediaQuery('(min-width:1000px)')

    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [filteredContacts, setFilteredContacts] = useState<Contact[]>(contacts)

    const [hovered, setHovered] = useState<number | undefined>()
    const [openRow, setOpenRow] = useState<Array<boolean>>([])
    const [selectedContacts, setSelectedContacts] = useState<Array<Contact>>([])
    const [ignoredContacts, setIgnoredContacts] = useState<Array<Contact>>([])
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

    const [page, setPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(10)

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
        setOpenRow((prevOpenRows) => ({
            ...prevOpenRows,
            [index]: !prevOpenRows[index]
        }))
    }

    const startIndex = page * rowsPerPage
    const endIndex = startIndex + rowsPerPage

    const handleSelectAllChange = () => {
        if (selectedContacts.length === filteredContacts.length) {
            setSelectedContacts([])
        } else {
            setSelectedContacts(filteredContacts)
        }
    }

    const handleSelectAllPageChange = () => {
        const pageItems = filteredContacts.slice(startIndex, endIndex)

        if (selectedContacts.length === pageItems.length) {
            setSelectedContacts([])
        } else {
            setSelectedContacts(pageItems)
        }
    }

    const handleSelectChange = (index: number) => {
        const pageItems = filteredContacts.slice(startIndex, endIndex)

        if (selectedContacts.includes(pageItems[index])) {
            setSelectedContacts(selectedContacts.filter((contact) => contact !== pageItems[index]))
        } else {
            setSelectedContacts([...selectedContacts, pageItems[index]])
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
        setLoading(true)
        const account = instance.getActiveAccount()

        const body = {
            idTenant: id,
            emailModified: account.username,
            tableOfValues: dbPersona,
            propositions: selectedContacts,
        }

        await instance.initialize()
        const accessToken = await acquireToken(instance)

        await fetch(`${process.env.REACT_APP_API}/hubspot/contacts/persona`, {
            method: "PATCH",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        })

        handleIgnoreProposal()
        validate()
        setLoading(false)
    }

    return (
        <Stack width="100%" alignItems="center">
            {loading ? <CircularProgress /> : <Stack spacing={4} width="100%">
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

                    {!nothing ? <Stack spacing={2} width="100%">
                        <AButton variant="contained" onClick={() => setOpen(true)}>
                            Valider la proposition
                        </AButton>

                        <AButton variant="outlined" color="error" onClick={handleIgnoreProposal}>
                            Ignorer la proposition
                        </AButton>

                        <AButton variant="outlined" onClick={handleSelectAllChange}>
                            Tout séléctionner
                        </AButton>
                    </Stack> : null}
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
                            <TableCell align={nothing ? "right" : "center"}>
                                <Stack
                                    spacing={1}
                                    direction="row"
                                    alignItems="center"
                                    justifyContent={nothing ? "right" : "center"}
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
                            {!nothing && <TableCell align="right">
                                <Checkbox
                                    checked={selectedContacts?.length === filteredContacts.slice(startIndex, endIndex).length || selectedContacts?.length === filteredContacts.length}
                                    onChange={handleSelectAllPageChange}
                                    indeterminate={selectedContacts.length > 0 && selectedContacts.length < filteredContacts.slice(startIndex, endIndex).length}
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
                            </TableCell>}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sortedContacts.slice(startIndex, endIndex).map((contact, index) =>
                            <React.Fragment key={index}>
                                <TableRow
                                    onMouseEnter={() => setHovered(index)}
                                    onMouseLeave={() => setHovered(undefined)}
                                    onClick={() => toggleRow(index)}
                                    sx={{
                                        background: openRow[index] || hovered === index ? theme.palette.secondary.light : 'none'
                                    }}
                                >
                                    <TableCell>
                                        <Stack spacing={2} direction="row" alignItems="center">
                                            {openRow[index] ?
                                                <FontAwesomeIcon icon={faChevronUp} /> :
                                                <FontAwesomeIcon icon={faChevronDown} />
                                            }

                                            <Typography>
                                                {contact.intituledePoste}
                                            </Typography>
                                        </Stack>
                                    </TableCell>
                                    {!nothing && <TableCell align="center">
                                        <Typography>
                                            {contact.personaProposed}
                                        </Typography>
                                    </TableCell>}
                                    <TableCell align={nothing ? "right" : "center"} width="50%">
                                        <Typography>
                                            {contact.occurence}
                                        </Typography>
                                    </TableCell>
                                    {!nothing && <TableCell align="right">
                                        <Checkbox
                                            checked={selectedContacts.includes(contact)}
                                            onChange={() => handleSelectChange(index)}
                                        />
                                    </TableCell>}
                                </TableRow>
                                <TableRow>
                                    <TableCell colSpan={nothing ? 3 : 4} padding="none">
                                        <Collapse in={openRow[index]} timeout="auto" unmountOnExit>
                                            <Table component={Paper} sx={{ background: theme.palette.background.default }}>
                                                <TableHead>
                                                    <TableRow sx={{ background: theme.palette.info.light }}>
                                                        <TableCell align="left">
                                                            <Typography>
                                                                hs_object_id
                                                            </Typography>
                                                        </TableCell>
                                                        {find && <TableCell align="center">
                                                            <Typography>
                                                                Persona actuel
                                                            </Typography>
                                                        </TableCell>}
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
                                                        {find && <TableCell align="center">
                                                            <Typography>
                                                                {c.persona}
                                                            </Typography>
                                                        </TableCell>}
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

                <TablePagination
                    rowsPerPageOptions={[10, 25, 50, 100]}
                    component="div"
                    count={filteredContacts.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={(event, newPage) => setPage(newPage)}
                    onRowsPerPageChange={(event) => {
                        setRowsPerPage(parseInt(event.target.value, 10))
                        setPage(0)
                    }}
                />
            </Stack>}

            <Modal open={open} onClose={() => setOpen(false)}>
                <Stack
                    spacing={4}
                    alignItems="center"
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        borderRadius: '15px',
                        background: theme.palette.background.default,
                        padding: '30px 50px 30px 50px'
                    }}
                >
                    <IconButton
                        sx={{
                            position: 'absolute',
                            top: '10px',
                            right: '10px',
                            width: '40px',
                            height: '40px'
                        }}
                        onClick={() => setOpen(false)}
                    >
                        <FontAwesomeIcon icon={faXmark} color={theme.palette.text.primary} />
                    </IconButton>
                    <Typography variant="h4">
                        Êtes vous sûr de vouloir réaliser cette action ? <br />
                        Cela entraînera un chargement en fond
                    </Typography>

                    <Stack spacing={4} direction="row">
                        <AButton variant="outlined" color="error" onClick={() => setOpen(false)}>
                            Annuler
                        </AButton>

                        <AButton variant="contained" onClick={handleSubmit}>
                            Confirmer
                        </AButton>
                    </Stack>
                </Stack>
            </Modal>
        </Stack>
    )
}

export default OTableEnrichment