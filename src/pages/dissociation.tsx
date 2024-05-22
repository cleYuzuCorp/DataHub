import { Alert, CircularProgress, Container, Paper, Snackbar, Stack, Table, TableBody, TableCell, TableHead, TablePagination, TableRow, TextField, Typography, useMediaQuery } from "@mui/material"
import { useLocation } from 'react-router-dom'
import MFileUpload from "../components/molecules/m-file-upload"
import { useEffect, useState } from "react"
import * as yup from "yup"
import { yupResolver } from "@hookform/resolvers/yup"
import { useForm } from "react-hook-form"
import theme from "../theme"
import { acquireToken } from "../App"
import { format } from "date-fns"
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { HistoryDissociation } from "../interfaces/history-dissociation"

const Dissociation = (props: { instance: any }) => {

    const { instance } = props

    const idTenant = new URLSearchParams(useLocation().search).get('id')

    const isDesktop = useMediaQuery('(min-width:1000px)')

    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)
    const [progress, setProgress] = useState(0)
    const [file, setFile] = useState<File>()

    const [searchTerm, setSearchTerm] = useState("")
    const [histories, setHistories] = useState<Array<HistoryDissociation>>([])
    const [filteredHistories, setFilteredHistories] = useState<HistoryDissociation[]>([])

    const [page, setPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(10)

    const schema = yup.object().shape({
        data: yup.mixed().default('Une erreur est survenu')
    })

    const { clearErrors, setError, formState: { errors } } = useForm({
        resolver: yupResolver(schema),
    })

    useEffect(() => {
        setLoading(true)

        const fetchData = async () => {
            try {
                await instance.initialize()
                const accessToken = await acquireToken(instance)

                const response = await fetch(`${process.env.REACT_APP_API}/historique-dissociation/${idTenant}`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                    }
                })

                const data = await response.json()

                const sortedHistories = data.sort((a: { Date: string }, b: { Date: string }) => {
                    return new Date(b.Date as string).getTime() - new Date(a.Date as string).getTime()
                })

                setHistories(sortedHistories)
                setLoading(false)
            } catch (error) {
                console.error("Une erreur s'est produite lors de la requête :", error)
            }
        }

        fetchData()
    }, [])

    const loadData = async () => {
        try {
            clearErrors('data')
            setLoading(true)

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

                const response = await fetch(`${process.env.REACT_APP_API}/dissociation/${idTenant}`, {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    },
                    body: formData,
                })

                if (!response.ok) {
                    clearInterval(timer)
                    setProgress(100)
                    const errorData = await response.json()
                    setError('data', { message: errorData.message })
                    setLoading(false)
                    setOpen(true)

                    return
                }

                clearInterval(timer)
                setProgress(100)

                setLoading(false)
                setOpen(true)
            }
        } catch (error) {
            console.error("Error uploading file:", error)
        }
    }

    useEffect(() => {
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

                <MFileUpload progress={progress} file={file} setFile={setFile} />

                {errors.data?.message ? <Snackbar
                    open={open}
                    onClose={() => setOpen(false)}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                >
                    <Alert
                        onClose={() => setOpen(false)}
                        severity="error"
                        variant="filled"
                    >
                        {errors.data.message}
                    </Alert>
                </Snackbar> : <Snackbar
                    open={open}
                    onClose={() => setOpen(false)}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                >
                    <Alert
                        onClose={() => setOpen(false)}
                        severity="success"
                        variant="filled"
                    >
                        Fichier traité avec succès !
                    </Alert>
                </Snackbar>}

                {loading ? <CircularProgress /> : <Stack spacing={2} width="100%">
                    <TextField
                        placeholder="Recherche par ID, Date, Email ou Objet"
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

                    {isDesktop ? <Table component={Paper} sx={{ background: theme.palette.background.default }}>
                        <TableHead sx={{ background: theme.palette.text.primary }}>
                            <TableRow>
                                <TableCell align="left">
                                    <Typography variant="body2" color={theme.palette.background.default}>
                                        À partir de l'ID
                                    </Typography>
                                </TableCell>
                                <TableCell align="center">
                                    <Typography variant="body2" color={theme.palette.background.default}>
                                        Vers l'ID
                                    </Typography>
                                </TableCell>
                                <TableCell align="center">
                                    <Typography variant="body2" color={theme.palette.background.default}>
                                        Email modifié
                                    </Typography>
                                </TableCell>
                                <TableCell align="center">
                                    <Typography variant="body2" color={theme.palette.background.default}>
                                        À partir de l'objet
                                    </Typography>
                                </TableCell>
                                <TableCell align="center">
                                    <Typography variant="body2" color={theme.palette.background.default}>
                                        Vers l'objet
                                    </Typography>
                                </TableCell>
                                <TableCell align="right">
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
                                    <TableCell align="center">
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
                                    <TableCell align="center">
                                        <Typography>
                                            {history.Emailmodified}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Typography>
                                            {history.FromObject}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Typography>
                                            {history.ToObject}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="right">
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
                                            Email modifié
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="right">
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
                                        <TableCell align="center">
                                            <Typography>
                                                {history.Emailmodified}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="right">
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