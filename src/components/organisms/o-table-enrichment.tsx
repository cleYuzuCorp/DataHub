import { faChevronUp, faChevronDown, faArrowDown, faArrowUp, faXmark } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Checkbox, CircularProgress, Collapse, IconButton, Modal, Paper, Stack, Table, TableBody, TableCell, TableHead, TablePagination, TableRow, Typography, useMediaQuery } from "@mui/material"
import React, { useState } from "react"
import theme from "../../hooks/theme"
import AButton from "../atoms/a-button"
import { Contact } from "../../interfaces/contact"
import { acquireToken } from "../../App"
import useNotification from "../../hooks/use-notification"
import ANotification from "../atoms/a-notifications"
import { fetchData } from "../api"
import endpoints from "../../hooks/endpoints"
import MFilter from "../molecules/m-filter"

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

    const { notification, showNotification, closeNotification } = useNotification()

    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)
    const [filteredContacts, setFilteredContacts] = useState<Contact[]>(contacts)

    const [hovered, setHovered] = useState<number | undefined>()
    const [openRow, setOpenRow] = useState<Array<boolean>>([])
    const [selectedContacts, setSelectedContacts] = useState<Array<Contact>>([])
    const [ignoredContacts, setIgnoredContacts] = useState<Array<Contact>>([])
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

    const [page, setPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(10)

    const filterContacts = (contact: Contact, searchTerm: string) => {
        return !ignoredContacts.includes(contact) && contact.intituledePoste.toLowerCase().includes(searchTerm.toLowerCase())
    }

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
        showNotification(`Requête en cours d'exécution`, 'warning')

        try {
            if (id) {
                const body = {
                    tableOfValues: dbPersona,
                    propositions: selectedContacts,
                }

                await instance.initialize()
                const accessToken = await acquireToken(instance)

                const { data, error } = await fetchData(endpoints.hubspot.patch(parseInt(id)), {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json"
                    },
                    data: JSON.stringify(body)
                })

                if (error) {
                    showNotification(`Une erreur s'est produite lors de la requête : ${error}`, 'error')
                } else if (data) {
                    showNotification("Enrichissement effectué avec succès !", 'success')
                    handleIgnoreProposal()
                    validate()
                }
            }
        } catch (error) {
            showNotification(`Une erreur s'est produite lors de la requête : ${error}`, 'error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Stack width="100%" alignItems="center">
            {loading ? <CircularProgress /> : <Stack spacing={4} width="100%">

                <ANotification
                    open={notification.open}
                    message={notification.message}
                    severity={notification.severity}
                    onClose={closeNotification}
                />

                <Stack spacing={4} direction={isDesktop ? "row" : "column"} alignItems="center" width="100%">
                    <MFilter
                        placeholder="Recherche par Intitulé de poste"
                        filterConfig={[{
                            data: contacts,
                            filterFunction: filterContacts,
                            setFilteredData: setFilteredContacts
                        }]}
                    />

                    {!nothing && <Stack spacing={2} width="100%">
                        <AButton variant="contained" onClick={() => setOpen(true)}>
                            Valider la proposition
                        </AButton>

                        <AButton variant="outlined" color="error" onClick={handleIgnoreProposal}>
                            Ignorer la proposition
                        </AButton>

                        <AButton variant="outlined" onClick={handleSelectAllChange}>
                            Tout séléctionner
                        </AButton>
                    </Stack>}
                </Stack>

                <Table component={Paper} sx={{ background: theme.palette.background.default }}>
                    <TableHead sx={{ background: theme.palette.text.primary }}>
                        <TableRow>
                            <TableCell>
                                <Typography variant="body2" color={theme.palette.background.default}>
                                    Intitulé de poste
                                </Typography>
                            </TableCell>
                            {!nothing && <TableCell>
                                <Typography variant="body2" color={theme.palette.background.default}>
                                    Persona proposé
                                </Typography>
                            </TableCell>}
                            <TableCell>
                                <Stack
                                    spacing={1}
                                    direction="row"
                                    alignItems="center"
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
                            {!nothing && <TableCell>
                                <Checkbox
                                    checked={selectedContacts.length === filteredContacts.slice(startIndex, endIndex).length || selectedContacts.length === filteredContacts.length}
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
                                    {!nothing && <TableCell>
                                        <Typography>
                                            {contact.personaProposed}
                                        </Typography>
                                    </TableCell>}
                                    <TableCell>
                                        <Typography>
                                            {contact.occurence}
                                        </Typography>
                                    </TableCell>
                                    {!nothing && <TableCell>
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
                                                        <TableCell>
                                                            <Typography>
                                                                hs_object_id
                                                            </Typography>
                                                        </TableCell>
                                                        {find && <TableCell>
                                                            <Typography>
                                                                Persona actuel
                                                            </Typography>
                                                        </TableCell>}
                                                        <TableCell>
                                                            <Typography>
                                                                Prénom
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography>
                                                                Nom
                                                            </Typography>
                                                        </TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {contact.contacts.map((c) => <TableRow key={c.hs_object_id}>
                                                        <TableCell>
                                                            <Typography>
                                                                {c.hs_object_id}
                                                            </Typography>
                                                        </TableCell>
                                                        {find && <TableCell>
                                                            <Typography>
                                                                {c.persona}
                                                            </Typography>
                                                        </TableCell>}
                                                        <TableCell>
                                                            <Typography>
                                                                {c.firsname}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell>
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