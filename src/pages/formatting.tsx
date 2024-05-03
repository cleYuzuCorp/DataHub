import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { CircularProgress, Container, Paper, Stack, Switch, Table, TableBody, TableCell, TableHead, TablePagination, TableRow, TextField, Typography, useMediaQuery } from "@mui/material"
import { useEffect, useState } from "react"
import theme from "../theme"
import { useLocation } from "react-router-dom"
import { acquireToken } from "../App"
import { HistoryFormatting } from "../interfaces/history-formatting"
import { format } from 'date-fns'
import { DataFormatting } from "../interfaces/data-formatting"
import Chart from "react-apexcharts"

const Formatting = (props: { instance: any }) => {

    const { instance } = props

    const idTenant = new URLSearchParams(useLocation().search).get('id')

    const isDesktop = useMediaQuery('(min-width:1000px)')

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

                const responseData = await fetch(`${process.env.REACT_APP_API}/dataformatage/${idTenant}`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json"
                    }
                })

                const data = await responseData.json()

                setData(data)

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
    }, [fetchDataInit])

    const handleFilteredChange = (value: string) => {
        setSearchTerm(value)
    }

    useEffect(() => {
        const filtered = histories.filter(history =>
            history.hs_object_id.toString().includes(searchTerm) ||
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

        const fetchData = async () => {
            try {
                await instance.initialize()
                const accessToken = await acquireToken(instance)

                const body = {
                    actif: event.target.checked
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
    }

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

                        <Stack spacing={1} direction="row" alignItems="center">
                            <Typography>Activation du formatage :</Typography>
                            <Switch checked={checked} onChange={handleCheckChange} />
                        </Stack>
                    </Stack>

                    <Stack spacing={4} width="100%">
                        <Typography variant="h4">
                            Historique
                        </Typography>

                        {data && <Stack>
                            <Chart
                                id="chart-container"
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
                                    }
                                }}

                            />

                            <Chart
                                id="remaining-chart-container"
                                type="bar"
                                width="100%"
                                height="550px"
                                series={data.filter(d => d.Type !== 'TOTAL CONTACT' && d.Type !== 'TOTAL COMPANIES')
                                    .map(d => d.Type).map(type => ({
                                        name: type,
                                        data: data
                                            .filter(d => d.Type === type)
                                            .map(item => ({
                                                x: new Date(item.Date).getTime(),
                                                y: parseFloat(item.Data)
                                            }))
                                    }))}
                                options={{
                                    xaxis: {
                                        type: 'datetime',
                                        labels: {
                                            formatter: function (value) {
                                                return format(new Date(value), 'yyyy-MM-dd HH:mm:ss')
                                            }
                                        }
                                    }
                                }}
                            />
                        </Stack>}

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
                                                        width: `${history.hs_object_id ? history.hs_object_id.toString().length : 0}ch`,
                                                        background: theme.palette.secondary.light
                                                    }}
                                                >
                                                    {history.hs_object_id}
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
                                                            width: `${history.hs_object_id ? history.hs_object_id.toString().length : 0}ch`,
                                                            background: theme.palette.secondary.light
                                                        }}
                                                    >
                                                        <Typography fontSize="11px">
                                                            {history.hs_object_id}
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
        </Container>
    )
}

export default Formatting