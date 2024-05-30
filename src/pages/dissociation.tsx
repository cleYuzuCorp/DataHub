import { CircularProgress, Container, Paper, Stack, Table, TableBody, TableCell, TableHead, TablePagination, TableRow, TextField, Typography, useMediaQuery } from "@mui/material"
import { useLocation } from 'react-router-dom'
import MFileUpload from "../components/molecules/m-file-upload"
import { useEffect, useState } from "react"
import theme from "../hooks/theme"
import { acquireToken } from "../App"
import { format } from "date-fns"
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { HistoryDissociation } from "../interfaces/history-dissociation"
import ANotification from "../components/atoms/a-notifications"
import useNotification from "../hooks/use-notification"
import { fetchData } from "../components/api"

const Dissociation = (props: { instance: any }) => {

    const { instance } = props

    const idTenant = new URLSearchParams(useLocation().search).get('id')

    const isDesktop = useMediaQuery('(min-width:1000px)')

    const { notification, showNotification, closeNotification } = useNotification()

    const [loading, setLoading] = useState(false)
    const [progress, setProgress] = useState(0)
    const [file, setFile] = useState<File>()

    const [searchTerm, setSearchTerm] = useState("")
    const [histories, setHistories] = useState<Array<HistoryDissociation>>([])
    const [filteredHistories, setFilteredHistories] = useState<HistoryDissociation[]>([])

    const [page, setPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(10)

    useEffect(() => {
        const fetchDataFromApi = async () => {
            setLoading(true)
            showNotification(`Requête en cours d'exécution`, 'warning')

            try {
                await instance.initialize()
                const accessToken = await acquireToken(instance)

                const { data, error } = await fetchData(`/historique-dissociation/${idTenant}`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                    }
                })

                if (error) {
                    showNotification(`Une erreur s'est produite lors de la requête : ${error}`, 'error')
                } else if (data) {
                    const sortedHistories = data.sort((a: { Date: string }, b: { Date: string }) => {
                        return new Date(b.Date).getTime() - new Date(a.Date).getTime()
                    })
                    setHistories(sortedHistories)
                }
            } catch (error) {
                showNotification(`Une erreur s'est produite lors de la requête : ${error}`, 'error')
            } finally {
                setLoading(false)
                closeNotification()
            }
        }

        fetchDataFromApi()
    }, [])

    useEffect(() => {
        const loadData = async () => {
            setLoading(true)
            showNotification(`Requête en cours d'exécution`, 'warning')

            try {
                if (file && idTenant) {
                    const formData = new FormData()
                    formData.append("file", file)

                    let temp = 0
                    const interval = 100
                    const totalTime = 8000

                    const progressIncrement = (interval / totalTime) * 100

                    const timer = setInterval(() => {
                        if (temp < 90) {
                            temp += progressIncrement
                            setProgress(Math.min(temp, 100))
                        } else {
                            clearInterval(timer)
                        }
                    }, interval)

                    await instance.initialize()
                    const accessToken = await acquireToken(instance)

                    const { data, error } = await fetchData(`/dissociation/${idTenant}`, {
                        method: "POST",
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                            'Content-Type': 'multipart/form-data'
                        },
                        data: formData,
                    })

                    if (error) {
                        clearInterval(timer)
                        setProgress(100)
                        showNotification(`Une erreur s'est produite lors de la requête : ${error}`, 'error')
                    } else if (data) {
                        clearInterval(timer)
                        setProgress(100)
                        showNotification("Fichier traité avec succès !", 'success')
                    }
                }
            } catch (error) {
                showNotification(`Une erreur s'est produite lors de la requête : ${error}`, 'error')
            } finally {
                setLoading(false)
            }
        }

        if (file) {
            loadData()
        }
    }, [file])

    const handleFilteredChange = (value: string) => {
        setSearchTerm(value)
    }

    useEffect(() => {
        const filtered = histories.filter(history =>
            history.FromObjectID.includes(searchTerm) ||
            history.ToObjectsID.includes(searchTerm) ||
            history.Emailmodified?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            history.Date?.includes(searchTerm) ||
            history.FromObject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            history.ToObject?.toLowerCase().includes(searchTerm.toLowerCase())
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

    return (
        <Container maxWidth="lg">
            <Stack spacing={8} alignItems="center" marginTop="100px" marginBottom="100px">
                <Typography variant="h3">
                    DataHub - Dissociation
                </Typography>

                <ANotification
                    open={notification.open}
                    message={notification.message}
                    severity={notification.severity}
                    onClose={closeNotification}
                />

                <MFileUpload progress={progress} file={file} setFile={setFile} />

                {loading ? <CircularProgress /> : <Stack spacing={2} width="100%">
                    <TextField
                        placeholder="Recherche par ID, Date, Email ou Objet"
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

                    {isDesktop ? <Table component={Paper} sx={{ background: theme.palette.background.default }}>
                        <TableHead sx={{ background: theme.palette.text.primary }}>
                            <TableRow>
                                <TableCell>
                                    <Typography variant="body2" color={theme.palette.background.default}>
                                        À partir de l'ID
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2" color={theme.palette.background.default}>
                                        Vers l'ID
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2" color={theme.palette.background.default}>
                                        Email modifié
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2" color={theme.palette.background.default}>
                                        À partir de l'objet
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2" color={theme.palette.background.default}>
                                        Vers l'objet
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
                                                width: `${history.FromObjectID.length}ch`,
                                                background: theme.palette.secondary.light
                                            }}
                                        >
                                            {history.FromObjectID}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography
                                            fontSize="11px"
                                            textAlign="center"
                                            padding="10px"
                                            borderRadius="15px"
                                            sx={{
                                                width: `${history.ToObjectsID.length}ch`,
                                                background: theme.palette.info.light
                                            }}
                                        >
                                            {history.ToObjectsID}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography>
                                            {history.Emailmodified}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography>
                                            {history.FromObject}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography>
                                            {history.ToObject}
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
                                            Email modifié
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" color={theme.palette.background.default}>
                                            Objet
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
                                                    width: `${history.ToObjectsID.toString().length}ch`,
                                                    background: theme.palette.secondary.light
                                                }}
                                            >
                                                <Typography fontSize="11px">
                                                    {history.FromObjectID}
                                                </Typography>

                                                <Typography fontSize="11px">
                                                    {history.ToObjectsID}
                                                </Typography>
                                            </Stack>
                                        </TableCell>
                                        <TableCell>
                                            <Typography>
                                                {history.Emailmodified}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography>
                                                {history.FromObject}
                                            </Typography>

                                            <Typography>
                                                {history.ToObject}
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
                </Stack>}
            </Stack>
        </Container>
    )
}

export default Dissociation