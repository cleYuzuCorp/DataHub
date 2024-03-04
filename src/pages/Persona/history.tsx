import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Checkbox, CircularProgress, Container, Paper, Stack, Table, TableBody, TableCell, TableHead, TablePagination, TableRow, TextField, Typography, useMediaQuery } from "@mui/material"
import { useEffect, useState } from "react"
import AButton from "../../components/atoms/a-button"
import theme from "../../theme"
import { useLocation } from "react-router-dom"
import { acquireToken } from "../../App"
import { HistoryRow } from "../../interfaces/history"
import { format } from 'date-fns'

const History = (props: { instance: any }) => {

    const { instance } = props

    const idTenant = new URLSearchParams(useLocation().search).get('id')

    const isDesktop = useMediaQuery('(min-width:1000px)')

    const [loading, setLoading] = useState(false)
    const [fetchDataInit, setFetchDataInit] = useState(false)
    const [isRestored, setIsRestored] = useState(false)

    const [searchTerm, setSearchTerm] = useState("")
    const [histories, setHistories] = useState<Array<HistoryRow>>([])
    const [filteredHistories, setFilteredHistories] = useState<HistoryRow[]>([])
    const [selectedRows, setSelectedRows] = useState<HistoryRow[]>([])

    const [page, setPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(10)

    const [dbPersona, setDbPersona] = useState([{ description: "", value: "" }])

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

                    const personas = data.dbPersona.map((persona: { description: string, value: string }) => {
                        return {
                            description: persona.description,
                            value: persona.value
                        }
                    })

                    setDbPersona(personas)
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
            try {
                await instance.initialize()
                const accessToken = await acquireToken(instance)

                const response = await fetch(`${process.env.REACT_APP_API_PERSONA}/persona/history?idTenant=${idTenant}`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json"
                    }
                })

                const data = await response.json()

                const sortedHistories = data.sort((a: { Date: string }, b: { Date: string }) => {
                    return new Date(b.Date as string).getTime() - new Date(a.Date as string).getTime()
                })

                console.log(sortedHistories, 'sh')

                setHistories(sortedHistories)
                setLoading(false)
            } catch (error) {
                console.error("Une erreur s'est produite lors de la requête :", error)
            }
        }

        fetchData()
    }, [isRestored])

    const handleFilteredChange = (value: string) => {
        setSearchTerm(value)
    }

    useEffect(() => {
        const filtered = histories.filter(history =>
            history.IdObjectAsk.toString().includes(searchTerm) ||
            history.IdObjectModifiedReal.toString().includes(searchTerm) ||
            history.EmailModified.toLowerCase().includes(searchTerm.toLowerCase()) ||
            history.Date.includes(searchTerm) ||
            history.IntitulePoste.toLowerCase().includes(searchTerm.toLowerCase())
        )

        setFilteredHistories(filtered)
    }, [searchTerm, histories])

    const startIndex = page * rowsPerPage
    const endIndex = startIndex + rowsPerPage

    const handleSelectAllChange = () => {
        if (selectedRows.length === filteredHistories.length) {
            setSelectedRows([])
        } else {
            setSelectedRows(filteredHistories)
        }
    }

    const handleSelectAllPageChange = () => {
        const pageItems = filteredHistories.slice(startIndex, endIndex)

        if (selectedRows.length === pageItems.length) {
            setSelectedRows([])
        } else {
            setSelectedRows(pageItems)
        }
    }

    const handleSelectChange = (index: number) => {
        const pageItems = filteredHistories.slice(startIndex, endIndex)

        if (selectedRows.includes(pageItems[index])) {
            setSelectedRows(selectedRows.filter((contact) => contact !== pageItems[index]))
        } else {
            setSelectedRows([...selectedRows, pageItems[index]])
        }
    }

    const handleRestore = async () => {
        setLoading(true)

        const data = selectedRows.map((row) => ({
            hs_object_id: row.IdObjectModifiedReal,
            role: row.IntitulePoste,
            persona: "restaured",
            proposedPersona: row.PersonaBefore
        }))

        const account = instance.getActiveAccount()

        const body = {
            idTenant: idTenant,
            emailModified: account.username,
            tableOfValues: dbPersona,
            propositions: [{ contacts: data }]
        }

        const accessToken = await acquireToken(instance)

        const response = fetch(`${process.env.REACT_APP_API_PERSONA}/hubspot/enrich`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        })

        if ((await response).status) {
            setIsRestored(!isRestored)
        }
        setLoading(false)
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)

        const formattedDate = format(date, 'yyyy-MM-dd HH:mm:ss')

        return formattedDate
    }

    return (
        <Container maxWidth="lg">
            <Stack spacing={8} alignItems="center" marginTop="100px" marginBottom="100px">
                <Typography variant="h3">
                    DataHub
                </Typography>

                {loading ? <CircularProgress /> : <Stack spacing={4} width="100%">
                    <Stack spacing={4} direction="row" alignItems="center" width="100%">
                        <TextField
                            placeholder="Recherche par ID, Date, Utilisateur ou Intitulé de poste"
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

                        <Stack spacing={2} width="100%">
                            <AButton variant="contained" onClick={handleRestore}>
                                Restaurer la séléction
                            </AButton>

                            <AButton variant="outlined" onClick={handleSelectAllChange}>
                                Tout séléctionner
                            </AButton>
                        </Stack>
                    </Stack>

                    <Stack>
                        {isDesktop ? <Table component={Paper} sx={{ background: theme.palette.background.default }}>
                            <TableHead sx={{ background: theme.palette.text.primary }}>
                                <TableRow>
                                    <TableCell align="left">
                                        <Typography variant="body2" color={theme.palette.background.default}>
                                            Id demandé
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Typography variant="body2" color={theme.palette.background.default}>
                                            Id modifié
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Typography variant="body2" color={theme.palette.background.default}>
                                            Email modifié
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Typography variant="body2" color={theme.palette.background.default}>
                                            Intitulé de poste
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Typography variant="body2" color={theme.palette.background.default}>
                                            Persona
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Typography variant="body2" color={theme.palette.background.default}>
                                            Persona demandé
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Typography variant="body2" color={theme.palette.background.default}>
                                            Persona modifié
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Typography variant="body2" color={theme.palette.background.default}>
                                            Date/Heure
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Checkbox
                                            checked={selectedRows?.length === filteredHistories.slice(startIndex, endIndex).length || selectedRows?.length === filteredHistories.length}
                                            onChange={handleSelectAllPageChange}
                                            indeterminate={selectedRows.length > 0 && selectedRows.length < filteredHistories.slice(startIndex, endIndex).length}
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
                                {filteredHistories.slice(startIndex, endIndex).map((history, index) =>
                                    <TableRow key={index}>
                                        <TableCell>
                                            <Typography
                                                fontSize="11px"
                                                textAlign="center"
                                                padding="10px"
                                                borderRadius="15px"
                                                sx={{
                                                    width: `${history.IdObjectAsk.toString().length}ch`,
                                                    background: theme.palette.secondary.light
                                                }}
                                            >
                                                {history.IdObjectAsk}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Typography
                                                fontSize="11px"
                                                textAlign="center"
                                                padding="10px"
                                                borderRadius="15px"
                                                sx={{
                                                    width: `${history.IdObjectModifiedReal.toString().length}ch`,
                                                    background: theme.palette.info.light
                                                }}
                                            >
                                                {history.IdObjectModifiedReal}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Typography>
                                                {history.EmailModified}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Typography>
                                                {history.IntitulePoste}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Typography>
                                                {history.PersonaAfter}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Typography>
                                                {history.PersonaAsk}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Typography>
                                                {history.PersonaBefore}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Stack>
                                                <Typography>
                                                    {formatDate(history.Date)}
                                                </Typography>
                                            </Stack>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Checkbox
                                                checked={selectedRows.includes(history)}
                                                onChange={() => handleSelectChange(index)}
                                            />
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table> :
                            <Table component={Paper} sx={{ background: theme.palette.background.default }}>
                                <TableHead sx={{ background: theme.palette.text.primary }}>
                                    <TableRow>
                                        <TableCell align="left">
                                            <Typography variant="body2" color={theme.palette.background.default}>
                                                Id
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Typography variant="body2" color={theme.palette.background.default}>
                                                Intitulé
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Typography variant="body2" color={theme.palette.background.default}>
                                                Persona
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Checkbox
                                                checked={selectedRows?.length === filteredHistories.slice(startIndex, endIndex).length || selectedRows?.length === filteredHistories.length}
                                                onChange={handleSelectAllPageChange}
                                                indeterminate={selectedRows.length > 0 && selectedRows.length < filteredHistories.slice(startIndex, endIndex).length}
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
                                    {filteredHistories.map((history, index) =>
                                        <TableRow>
                                            <TableCell align="center">
                                                <Stack
                                                    textAlign="center"
                                                    padding="5px"
                                                    borderRadius="15px"
                                                    sx={{
                                                        width: `${history.IdObjectModifiedReal.toString().length}ch`,
                                                        background: theme.palette.secondary.light
                                                    }}
                                                >
                                                    <Typography fontSize="11px">
                                                        {history.IdObjectModifiedReal}
                                                    </Typography>

                                                    <Typography fontSize="11px">
                                                        {history.IdObjectAsk}
                                                    </Typography>
                                                </Stack>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Typography>
                                                    {history.IntitulePoste}
                                                </Typography>
                                                <Typography>
                                                    {history.EmailModified}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Typography>
                                                    {history.PersonaBefore}
                                                </Typography>

                                                <Typography>
                                                    {history.PersonaAsk}
                                                </Typography>

                                                <Typography>
                                                    {history.PersonaAfter}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="right">
                                                <Checkbox
                                                    checked={selectedRows.includes(history)}
                                                    onChange={() => handleSelectChange(index)}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>}

                        <TablePagination
                            rowsPerPageOptions={[10, 25, 50, 100]}
                            component="div"
                            count={filteredHistories.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={(event, newPage) => setPage(newPage)}
                            onRowsPerPageChange={(event) => {
                                setRowsPerPage(parseInt(event.target.value, 10))
                                setPage(0)
                            }}
                        />
                    </Stack>
                </Stack>}
            </Stack>
        </Container >
    )
}

export default History