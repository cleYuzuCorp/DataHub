import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Checkbox, CircularProgress, Container, FormControlLabel, Paper, Stack, Switch, Table, TableBody, TableCell, TableHead, TablePagination, TableRow, TextField, Typography, useMediaQuery } from "@mui/material"
import { useEffect, useState } from "react"
import AButton from "../components/atoms/a-button"
import theme from "../theme"
import { useLocation } from "react-router-dom"
import { acquireToken } from "../App"
import { HistoryFormatting } from "../interfaces/history-formatting"
import { format } from 'date-fns'

const Formatting = (props: { instance: any }) => {

    const { instance } = props

    const idTenant = new URLSearchParams(useLocation().search).get('id')

    const isDesktop = useMediaQuery('(min-width:1000px)')

    const [loading, setLoading] = useState(false)
    const [fetchDataInit, setFetchDataInit] = useState(false)
    const [isRestored, setIsRestored] = useState(false)
    const [checked, setChecked] = useState(false)

    const [searchTerm, setSearchTerm] = useState("")
    const [histories, setHistories] = useState<Array<HistoryFormatting>>([])
    const [filteredHistories, setFilteredHistories] = useState<HistoryFormatting[]>([])
    const [selectedRows, setSelectedRows] = useState<HistoryFormatting[]>([])

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

                    const response = await fetch(`${process.env.REACT_APP_API}/proposition-persona/associations-settings?IdTenant=${idTenant}`, {
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

                const responseStatus = await fetch(`${process.env.REACT_APP_API}/settings-formatage/${idTenant}`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json"
                    }
                })

                const dataStatus = await responseStatus.json()

                setChecked(dataStatus)

                const responseHistories = await fetch(`${process.env.REACT_APP_API}/historique-formatage/${idTenant}`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json"
                    }
                })

                const dataHistories = await responseHistories.json()

                const sortedHistories = dataHistories.sort((a: { Date: string }, b: { Date: string }) => {
                    return new Date(b.Date as string).getTime() - new Date(a.Date as string).getTime()
                })

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
            history.IdHistoryFormatage.toString().includes(searchTerm) ||
            history.Date.includes(searchTerm) ||
            history.Type.toLowerCase().includes(searchTerm.toLowerCase())
        )

        setFilteredHistories(filtered)
    }, [searchTerm, histories])

    const startIndex = page * rowsPerPage
    const endIndex = startIndex + rowsPerPage

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)

        const formattedDate = format(date, 'yyyy-MM-dd HH:mm:ss')

        return formattedDate
    }

    const handleCheckChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setChecked(event.target.checked)
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                await instance.initialize()
                const accessToken = await acquireToken(instance)

                const body = {
                    actif: checked
                }

                await fetch(`${process.env.REACT_APP_API}/settings-formatage/${idTenant}`, {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(body)
                })

            } catch (error) {
                console.error("Une erreur s'est produite lors de la requête :", error)
            }
        }

        fetchData()
    }, [checked])

    return (
        <Container maxWidth="lg">
            <Stack spacing={8} alignItems="center" marginTop="100px" marginBottom="100px">
                <Typography variant="h3">
                    DataHub - Formatage
                </Typography>

                {loading ? <CircularProgress /> : <Stack spacing={8} width="100%">
                    <Stack spacing={4} width="100%">
                        <Typography variant="h4">
                            Settings
                        </Typography>

                        <Typography>
                            En activant ce paramètre, un formatage de vos données s'effectuera chaque lundi à minuit.
                        </Typography>

                        <FormControlLabel
                            control={<Switch checked={checked} onChange={handleCheckChange} />}
                            label="Activation du formatage :"
                            labelPlacement="start"
                            sx={{
                                justifyContent: 'flex-end'
                            }}
                        />
                    </Stack>
                    <Stack spacing={4} width="100%">
                        <Typography variant="h4">
                            Historique
                        </Typography>

                        <Stack spacing={4} direction="row" alignItems="center" width="100%">
                            <TextField
                                placeholder="Recherche par ID, Date ou type de formatage"
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

                        <Stack>
                            {isDesktop ? <Table component={Paper} sx={{ background: theme.palette.background.default }}>
                                <TableHead sx={{ background: theme.palette.text.primary }}>
                                    <TableRow>
                                        <TableCell align="center">
                                            <Typography variant="body2" color={theme.palette.background.default}>
                                                Id objet
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Typography variant="body2" color={theme.palette.background.default}>
                                                Type de l'objet
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Typography variant="body2" color={theme.palette.background.default}>
                                                Objet modifié
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Typography variant="body2" color={theme.palette.background.default}>
                                                Nouvel objet
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Typography variant="body2" color={theme.palette.background.default}>
                                                Date/Heure
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredHistories.slice(startIndex, endIndex).map((history, index) =>
                                        <TableRow key={index}>
                                            <TableCell align="center">
                                                <Typography
                                                    fontSize="11px"
                                                    textAlign="center"
                                                    padding="10px"
                                                    borderRadius="15px"
                                                    sx={{
                                                        width: `${history.IdObject.toString().length}ch`,
                                                        background: theme.palette.info.light
                                                    }}
                                                >
                                                    {history.IdObject}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Typography>
                                                    {history.Type}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Typography>
                                                    {history.Before}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Typography>
                                                    {history.After}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Stack>
                                                    <Typography>
                                                        {formatDate(history.Date)}
                                                    </Typography>
                                                </Stack>
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
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {filteredHistories.slice(startIndex, endIndex).map((history, index) =>
                                            <TableRow key={index}>
                                                <TableCell align="center">
                                                    <Stack
                                                        textAlign="center"
                                                        padding="5px"
                                                        borderRadius="15px"
                                                        sx={{
                                                            width: `${history.IdObject.toString().length}ch`,
                                                            background: theme.palette.secondary.light
                                                        }}
                                                    >
                                                        <Typography fontSize="11px">
                                                            {history.IdObject}
                                                        </Typography>
                                                    </Stack>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Typography>
                                                        {history.Type}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Typography>
                                                        {history.Before}
                                                    </Typography>

                                                    <Typography>
                                                        {history.After}
                                                    </Typography>
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
                    </Stack>
                </Stack>}
            </Stack>
        </Container >
    )
}

export default Formatting