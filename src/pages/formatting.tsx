import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { CircularProgress, Container, Paper, Stack, Switch, Table, TableBody, TableCell, TableHead, TablePagination, TableRow, TextField, Typography, useMediaQuery } from "@mui/material"
import { useEffect, useState } from "react"
import theme from "../hooks/theme"
import { useLocation } from "react-router-dom"
import { acquireToken } from "../App"
import { HistoryFormatting } from "../interfaces/history-formatting"
import { format } from 'date-fns'
import { DataFormatting } from "../interfaces/data-formatting"
import Chart from "react-apexcharts"
import useNotification from "../hooks/use-notification"
import ANotification from "../components/atoms/a-notifications"
import { fetchData } from "../components/api"

const Formatting = (props: { instance: any }) => {

    const { instance } = props

    const idTenant = new URLSearchParams(useLocation().search).get('id')

    const isDesktop = useMediaQuery('(min-width:1000px)')

    const { notification, showNotification, closeNotification } = useNotification()

    const [loading, setLoading] = useState(false)
    const [fetchDataInit, setFetchDataInit] = useState(false)
    const [checked, setChecked] = useState(false)

    const [data, setData] = useState<DataFormatting[]>()

    const [searchTerm, setSearchTerm] = useState("")
    const [histories, setHistories] = useState<Array<HistoryFormatting>>([])
    const [filteredHistories, setFilteredHistories] = useState<HistoryFormatting[]>([])

    const [page, setPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(10)

    useEffect(() => {
        setFetchDataInit(true)
    }, [])

    useEffect(() => {
        setLoading(true)
        showNotification(`Requête en cours d'exécution`, 'warning')

        const fetchDataFromApi = async () => {
            try {
                await instance.initialize()
                const accessToken = await acquireToken(instance)

                const { data, error } = await fetchData(`/settings-formatage/${idTenant}`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json"
                    }
                })

                if (error) {
                    showNotification(`Une erreur s'est produite lors de la requête : ${error}`, 'error')
                } else if (data) {
                    setChecked(data)
                }
            } catch (error) {
                showNotification(`Une erreur s'est produite lors de la requête : ${error}`, 'error')
            } finally {
                setLoading(false)
            }

            try {
                await instance.initialize()
                const accessToken = await acquireToken(instance)

                const { data, error } = await fetchData(`/dataformatage/${idTenant}`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json"
                    }
                })

                if (error) {
                    showNotification(`Une erreur s'est produite lors de la requête : ${error}`, 'error')
                } else if (data) {
                    setData(data)
                }
            } catch (error) {
                showNotification(`Une erreur s'est produite lors de la requête : ${error}`, 'error')
            } finally {
                setLoading(false)
            }

            try {
                await instance.initialize()
                const accessToken = await acquireToken(instance)

                const { data, error } = await fetchData(`/historique-formatage/${idTenant}`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json"
                    }
                })

                if (error) {
                    showNotification(`Une erreur s'est produite lors de la requête : ${error}`, 'error')
                } else if (data) {
                    const sortedHistories = data.sort((a: { Date: string }, b: { Date: string }) => {
                        return new Date(b.Date as string).getTime() - new Date(a.Date as string).getTime()
                    })

                    setHistories(sortedHistories)
                }
            } catch (error) {
                showNotification(`Une erreur s'est produite lors de la requête : ${error}`, 'error')
            } finally {
                setLoading(false)
            }
        }

        fetchDataFromApi()
    }, [fetchDataInit])

    const handleFilteredChange = (value: string) => {
        setSearchTerm(value)
    }

    useEffect(() => {
        const filtered = histories.filter(history =>
            history.Hs_object_id.toString().includes(searchTerm) ||
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
        setLoading(true)
        showNotification(`Requête en cours d'exécution`, 'warning')
        setChecked(event.target.checked)

        const fetchDataFromApi = async () => {
            try {
                await instance.initialize()
                const accessToken = await acquireToken(instance)

                const body = {
                    actif: event.target.checked
                }

                const { data, error } = await fetchData(`/settings-formatage/${idTenant}`, {
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
                    showNotification(event.target.checked === true ? "Formatage activé avec succès !" : "Formatage désactivé avec succès !", 'success')
                }

            } catch (error) {
                showNotification(`Une erreur s'est produite lors de la requête : ${error}`, 'error')
            } finally {
                setLoading(false)
            }
        }

        fetchDataFromApi()
    }

    return (
        <Container maxWidth="lg">
            <Stack spacing={8} alignItems="center" marginTop="100px" marginBottom="100px">
                <Typography variant="h3">
                    DataHub - Formatage
                </Typography>

                <ANotification
                    open={notification.open}
                    message={notification.message}
                    severity={notification.severity}
                    onClose={closeNotification}
                />

                {loading ? <CircularProgress /> : <Stack spacing={8} width="100%">
                    <Stack spacing={4} width="100%">
                        <Typography variant="h4">
                            Settings
                        </Typography>

                        <Typography>
                            En activant ce paramètre, un formatage de vos données s'effectuera chaque jour à minuit.
                        </Typography>

                        <Stack spacing={1} direction="row" alignItems="center">
                            <Typography>Activation du formatage :</Typography>
                            <Switch checked={checked} onChange={handleCheckChange} />
                        </Stack>
                    </Stack>

                    <Stack spacing={4} width="100%">
                        <Typography variant="h4">
                            Historique
                        </Typography>

                        {data && <Stack spacing={2}>
                            <Stack spacing={1} width="100%">
                                <Typography>
                                    Évolution du nombre de contacts et d'entreprises Hubspot au fil du temps
                                </Typography>

                                <Chart
                                    type="line"
                                    width="100%"
                                    height="550px"
                                    series={[
                                        {
                                            name: data.find(d => d.Type === 'TOTAL CONTACT')?.Type,
                                            data: data.filter(d => d.Type === 'TOTAL CONTACT').map(item => ({
                                                x: new Date(item.Date).getTime(),
                                                y: parseFloat(item.Data)
                                            }))
                                        },
                                        {
                                            name: data.find(d => d.Type === 'TOTAL COMPANIES')?.Type,
                                            data: data.filter(d => d.Type === 'TOTAL COMPANIES').map(item => ({
                                                x: new Date(item.Date).getTime(),
                                                y: parseFloat(item.Data)
                                            }))
                                        }
                                    ]}
                                    options={{
                                        xaxis: {
                                            type: 'datetime',
                                            labels: {
                                                formatter: function (value) {
                                                    return format(new Date(value), 'yyyy-MM-dd HH:mm:ss')
                                                }
                                            }
                                        },
                                        markers: {
                                            size: 7,
                                            hover: {
                                                size: 10,
                                            }
                                        },
                                        colors: [theme.palette.text.primary,
                                        theme.palette.info.main,
                                        theme.palette.primary.main,
                                        theme.palette.text.disabled,
                                        theme.palette.info.light,
                                        theme.palette.secondary.main]
                                    }}
                                />
                            </Stack>

                            <Stack spacing={1} width="100%">
                                <Typography>
                                    Taille des listes au fil du temps
                                </Typography>

                                <Chart
                                    type="line"
                                    width="100%"
                                    height="550px"
                                    series={(() => {
                                        const groupedData: { [key: string]: { x: number; y: number }[] } = {}
                                        data.forEach(d => {
                                            if (d.Type !== 'TOTAL CONTACT' && d.Type !== 'TOTAL COMPANIES') {
                                                if (!groupedData[d.Type]) {
                                                    groupedData[d.Type] = []
                                                }
                                                groupedData[d.Type].push({
                                                    x: new Date(d.Date).getTime(),
                                                    y: parseFloat(d.Data)
                                                })
                                            }
                                        })

                                        return Object.keys(groupedData).map(type => ({
                                            name: type,
                                            data: groupedData[type]
                                        }))
                                    })()}
                                    options={{
                                        xaxis: {
                                            type: 'datetime',
                                            labels: {
                                                formatter: function (value) {
                                                    return format(new Date(value), 'yyyy-MM-dd HH:mm:ss')
                                                }
                                            }
                                        },
                                        markers: {
                                            size: 7,
                                            hover: {
                                                size: 10,
                                            }
                                        },
                                        colors: [theme.palette.text.primary,
                                        theme.palette.info.main,
                                        theme.palette.primary.main,
                                        theme.palette.text.disabled,
                                        theme.palette.secondary.main]
                                    }}
                                />
                            </Stack>
                        </Stack>}

                        <Stack spacing={4} direction="row" alignItems="center" width="100%">
                            <TextField
                                placeholder="Recherche par ID, Date ou type de formatage"
                                value={searchTerm}
                                onChange={(e) => handleFilteredChange(e.target.value)}
                                sx={{
                                    width: "100%",
                                    borderColor: '#E0E0E0',
                                    background: theme.palette.background.default,
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
                                        <TableCell>
                                            <Typography variant="body2" color={theme.palette.background.default}>
                                                Id objet
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color={theme.palette.background.default}>
                                                Type de l'objet
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color={theme.palette.background.default}>
                                                Objet modifié
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color={theme.palette.background.default}>
                                                Nouvel objet
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color={theme.palette.background.default}>
                                                Date/Heure
                                            </Typography>
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
                                                        width: `${history.Hs_object_id ? history.Hs_object_id.toString().length : 0}ch`,
                                                        background: theme.palette.secondary.light
                                                    }}
                                                >
                                                    {history.Hs_object_id}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography>
                                                    {history.Type}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography>
                                                    {history.Before}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography>
                                                    {history.After}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
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
                                            <TableCell>
                                                <Typography variant="body2" color={theme.palette.background.default}>
                                                    Id
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" color={theme.palette.background.default}>
                                                    Intitulé
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" color={theme.palette.background.default}>
                                                    Persona
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {filteredHistories.slice(startIndex, endIndex).map((history, index) =>
                                            <TableRow key={index}>
                                                <TableCell>
                                                    <Stack
                                                        textAlign="center"
                                                        padding="5px"
                                                        borderRadius="15px"
                                                        sx={{
                                                            width: `${history.Hs_object_id ? history.Hs_object_id.toString().length : 0}ch`,
                                                            background: theme.palette.secondary.light
                                                        }}
                                                    >
                                                        <Typography fontSize="11px">
                                                            {history.Hs_object_id}
                                                        </Typography>
                                                    </Stack>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography>
                                                        {history.Type}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
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
        </Container>
    )
}

export default Formatting