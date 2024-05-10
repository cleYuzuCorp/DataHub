import { ReactNode, useEffect, useState } from 'react'
import { Container, Stack, Typography, CircularProgress, TextField, MenuItem, TableHead, Paper, Table, TableBody, TableCell, TableRow, TablePagination, Alert, Snackbar } from "@mui/material"
import { useLocation } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowDown, faArrowUp, faCircle, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import theme from '../theme'
import * as yup from "yup"
import { yupResolver } from "@hookform/resolvers/yup"
import { useForm } from 'react-hook-form'
import AButton from '../components/atoms/a-button'
import MFileUpload from '../components/molecules/m-file-upload'
import { DataFile } from '../interfaces/data-file'
import * as XLSX from 'xlsx'
import { acquireToken } from '../App'

const ImportAssistance = (props: { instance: any }) => {

    const { instance } = props

    const idTenant = new URLSearchParams(useLocation().search).get('id')

    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)
    const [progress, setProgress] = useState(0)
    const [proposition, setProposition] = useState<{ [key: string]: string }>({})
    const [companie, setCompanie] = useState<{ [key: string]: string }>({})

    const [file, setFile] = useState<File>()
    const [dataMatched, setDataMatched] = useState<DataFile[]>([])
    const [dataCantMatched, setDataCantMatched] = useState<DataFile[]>([])
    const [filteredDataMatched, setFilteredDataMatched] = useState<DataFile[]>([])
    const [filteredDataCantMatched, setFilteredDataCantMatched] = useState<DataFile[]>([])
    const [searchTerm, setSearchTerm] = useState("")

    const [pageMatched, setPageMatched] = useState(0)
    const [rowsPerPageMatched, setRowsPerPageMatched] = useState(10)
    const [pageCantMatched, setPageCantMatched] = useState(0)
    const [rowsPerPageCantMatched, setRowsPerPageCantMatched] = useState(10)
    const [sortOrderExist, setSortOrderExist] = useState<'asc' | 'desc'>('asc')
    const [sortOrderStatus, setSortOrderStatus] = useState<'asc' | 'desc'>('asc')

    const schema = yup.object().shape({
        data: yup.mixed().default('Une erreur est survenu'),
        status: yup.mixed().required('Toutes les données doivent être terminées avant de pouvoir les importer'),
    })

    const { clearErrors, setError, formState: { errors } } = useForm({
        resolver: yupResolver(schema),
    })

    const loadData = async () => {
        try {
            clearErrors('data')
            setProgress(0)

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

                const response = await fetch(`${process.env.REACT_APP_API}/import/check/${idTenant}`, {
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

                const data = await response.json()

                data.matched.map((d: DataFile) => {
                    if (d.Status === "Terminé") {
                        setProposition(prevSelections => ({
                            ...prevSelections,
                            [d.Domain]: "create"
                        }))
                    }
                })

                setDataMatched(data.matched)
                setDataCantMatched(data.cantMatched)
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

    const handlePropositionChange = (value: string, domain: string) => {
        setProposition(prevSelections => ({
            ...prevSelections,
            [domain]: value
        }))
    }

    const handleSelectedCompanieChange = (value: string, domain: string) => {
        setCompanie(prevSelections => ({
            ...prevSelections,
            [domain]: value
        }))
    }

    const handleFilteredChange = (value: string) => {
        setSearchTerm(value)
    }

    useEffect(() => {
        const filteredMatched = dataMatched.filter(d =>
            dataMatched[0].Domain ? d.Domain.toLowerCase().includes(searchTerm.toLowerCase()) :
                d.Email.toLowerCase().includes(searchTerm.toLowerCase())
        )

        const filteredCantMatched = dataCantMatched.filter(d =>
            dataCantMatched[0].Domain ? d.Domain.toLowerCase().includes(searchTerm.toLowerCase()) :
                d.Email.toLowerCase().includes(searchTerm.toLowerCase())
        )

        setFilteredDataMatched(filteredMatched)
        setFilteredDataCantMatched(filteredCantMatched)
    }, [searchTerm, dataMatched, dataCantMatched])

    const toggleSortDataExist = () => {
        filteredDataMatched.sort((a, b) => {
            if (sortOrderExist === 'asc') {
                if (a.Exist.length === 0 && b.Exist.length > 0) {
                    return -1
                } else if (a.Exist.length > 0 && b.Exist.length === 0) {
                    return 1
                } else {
                    return 0
                }
            } else {
                if (a.Exist.length === 0 && b.Exist.length > 0) {
                    return 1
                } else if (a.Exist.length > 0 && b.Exist.length === 0) {
                    return -1
                } else {
                    return 0
                }
            }
        })

        setSortOrderExist(sortOrderExist === 'asc' ? 'desc' : 'asc')
    }

    const toggleSortDataStatus = () => {
        filteredDataMatched.sort((a, b) => {
            if (sortOrderStatus === 'asc') {
                if (a.Status === 'En cours' && b.Status !== 'En cours') {
                    return -1
                } else if (a.Status !== 'En cours' && b.Status === 'En cours') {
                    return 1
                } else {
                    return 0
                }
            } else {
                if (a.Status === 'Terminé' && b.Status !== 'Terminé') {
                    return -1
                } else if (a.Status !== 'Terminé' && b.Status === 'Terminé') {
                    return 1
                } else {
                    return 0
                }
            }
        })

        setSortOrderStatus(sortOrderStatus === 'asc' ? 'desc' : 'asc')
    }

    const startIndexMatched = pageMatched * rowsPerPageMatched
    const endIndexMatched = startIndexMatched + rowsPerPageMatched

    const startIndexCantMatched = pageCantMatched * rowsPerPageCantMatched
    const endIndexCantMatched = startIndexCantMatched + rowsPerPageCantMatched

    const importData = async () => {
        try {
            clearErrors('status')
            setLoading(true)

            if (file && idTenant) {

                const allCompleted = dataMatched.every((item) => item.Status === 'Terminé')

                if (!allCompleted) {
                    setError('status', { message: 'Toutes les données doivent être terminées avant de pouvoir les importer' })
                    setLoading(false)
                    setOpen(true)
                    return
                }

                const wb = XLSX.utils.book_new()
                const ws = XLSX.utils.json_to_sheet(dataMatched)
                XLSX.utils.book_append_sheet(wb, ws, 'Data Matched')
                const excelBuffer = XLSX.write(wb, { type: 'array', bookType: 'xlsx' })
                const excelBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
                const excelBlobUrl = URL.createObjectURL(excelBlob)
                const link = document.createElement('a')
                link.href = excelBlobUrl
                link.setAttribute('download', 'data_matched.xlsx')
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)

                setLoading(false)
                setOpen(true)
            }
        } catch (error) {
            console.error("Error uploading file:", error)
        }
    }

    return (
        <Container maxWidth="lg">
            <Stack spacing={8} alignItems="center" marginTop="100px" marginBottom="100px">
                <Typography variant="h3">
                    DataHub - Aide à l'import
                </Typography>

                {loading ? <CircularProgress /> : <Stack spacing={6} alignItems="center" width="100%">
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
                            {errors?.data?.message}
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

                    {filteredDataMatched.length > 0 && !errors.data?.message && <Stack spacing={4} width="100%">
                        <Stack spacing={4} direction="row">
                            <TextField
                                placeholder="Recherche par Domaine ou Email"
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

                            <Stack spacing={1}>
                                <AButton
                                    variant={!errors.status?.message ? "contained" : "outlined"}
                                    color={!errors.status?.message ? "white" : "error"}
                                    onClick={importData}
                                >
                                    Importer les données
                                </AButton>

                                {errors.status?.message && <Typography color={theme.palette.error.main}>
                                    {errors.status.message}
                                </Typography>}
                            </Stack>
                        </Stack>

                        <Stack spacing={2}>
                            <Typography variant="h4">
                                Données traitées
                            </Typography>

                            <Table component={Paper} sx={{ background: theme.palette.background.default }} style={{ overflowX: 'auto' }}>
                                <TableHead sx={{ background: theme.palette.text.primary }}>
                                    <TableRow>
                                        {Object.keys(filteredDataMatched[0]).map((key, index) => (
                                            <TableCell key={index} align={index === 0 ? "left" : "center"}>
                                                {key === "Exist" ? <Stack
                                                    spacing={1}
                                                    direction="row"
                                                    alignItems="center"
                                                    justifyContent="center"
                                                    onClick={toggleSortDataExist}
                                                    sx={{
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    <Typography variant="body2" color={theme.palette.background.default}>
                                                        {key}
                                                    </Typography>
                                                    {sortOrderExist === 'asc' ?
                                                        <FontAwesomeIcon icon={faArrowUp} color={theme.palette.background.default} /> :
                                                        <FontAwesomeIcon icon={faArrowDown} color={theme.palette.background.default} />
                                                    }
                                                </Stack> : key === "Status" ? <Stack
                                                    spacing={1}
                                                    direction="row"
                                                    justifyContent="flex-end"
                                                    alignItems="center"
                                                    onClick={toggleSortDataStatus}
                                                    sx={{
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    <Typography variant="body2" color={theme.palette.background.default}>
                                                        {key}
                                                    </Typography>
                                                    {sortOrderStatus === 'asc' ?
                                                        <FontAwesomeIcon icon={faArrowUp} color={theme.palette.background.default} /> :
                                                        <FontAwesomeIcon icon={faArrowDown} color={theme.palette.background.default} />
                                                    }
                                                </Stack> :
                                                    <Typography variant="body2" color={theme.palette.background.default}>
                                                        {key}
                                                    </Typography>}
                                            </TableCell>
                                        ))}
                                        <TableCell align="center">
                                            <Typography variant="body2" color={theme.palette.background.default}>
                                                Propostion
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Typography variant="body2" color={theme.palette.background.default}>
                                                Entreprise
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredDataMatched.length > 0 && filteredDataMatched.slice(startIndexMatched, endIndexMatched).map((d, index) =>
                                        <TableRow key={index}>
                                            {Object.keys(d).map((key, index) => (
                                                <TableCell key={index} align={index === 0 ? "left" : "center"}>
                                                    {key === "Exist" ? d.Exist.length > 0 ? <Typography>
                                                        Déjà présent
                                                    </Typography> : <Typography>
                                                        Nouveau
                                                    </Typography> : key === "Status" ? <Stack alignItems="flex-end">
                                                        <Stack
                                                            spacing={1}
                                                            direction="row"
                                                            alignItems="center"
                                                            padding="5px 10px 5px 10px"
                                                            sx={{
                                                                width: 'fit-content',
                                                                borderRadius: '15px',
                                                                background: d.Status === "Terminé" ? 'rgba(25, 153, 109, 0.20)' : d.Status === "En cours" ? 'rgba(254, 167, 34, 0.20)' : theme.palette.error.light
                                                            }}
                                                        >
                                                            <FontAwesomeIcon
                                                                icon={faCircle}
                                                                size="xs"
                                                                color={d.Status === "Terminé" ? "#19996D" : d.Status === "En cours" ? "#FEA722" : theme.palette.error.main}
                                                            />
                                                            <Typography
                                                                sx={{
                                                                    color: d.Status === "Terminé" ? "#19996D" : d.Status === "En cours" ? "#FEA722" : theme.palette.error.main
                                                                }}
                                                            >
                                                                {(d[key as keyof typeof d] as ReactNode)}
                                                            </Typography>
                                                        </Stack>
                                                    </Stack> : <Typography>
                                                        {(d[key as keyof typeof d] as ReactNode)}
                                                    </Typography>}
                                                </TableCell>
                                            ))}
                                            <TableCell>
                                                <TextField
                                                    select
                                                    value={proposition[d.Domain]}
                                                    onChange={(e) => handlePropositionChange(e.target.value, d.Domain)}
                                                    sx={{
                                                        border: 'none',
                                                        width: '100%',
                                                        height: '50px'
                                                    }}
                                                >
                                                    <MenuItem value="choice">
                                                        Choisir une entreprise existante
                                                    </MenuItem>
                                                    <MenuItem value="replace">
                                                        Remplacer par une entreprise de mon import
                                                    </MenuItem>
                                                    <MenuItem value="create">
                                                        Créer une nouvelle entreprise
                                                    </MenuItem>
                                                </TextField>
                                            </TableCell>
                                            <TableCell>
                                                <TextField
                                                    select
                                                    value={companie[d.Domain]}
                                                    onChange={(e) => handleSelectedCompanieChange(e.target.value, d.Domain)}
                                                    sx={{
                                                        border: 'none',
                                                        width: '100%',
                                                        height: '50px'
                                                    }}
                                                >
                                                    {d.Exist.map((e) => <MenuItem value={e.id}>
                                                        {e.name}
                                                    </MenuItem>)}
                                                </TextField>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>

                            <TablePagination
                                rowsPerPageOptions={[10, 25, 50, 100]}
                                component="div"
                                count={filteredDataMatched.length}
                                rowsPerPage={rowsPerPageMatched}
                                page={pageMatched}
                                onPageChange={(event, newPage) => setPageMatched(newPage)}
                                onRowsPerPageChange={(event) => {
                                    setRowsPerPageMatched(parseInt(event.target.value, 10))
                                    setPageMatched(0)
                                }}
                            />
                        </Stack>

                        <Stack spacing={2}>
                            <Typography variant="h4">
                                Données non traitées
                            </Typography>

                            <Table component={Paper} sx={{ background: theme.palette.background.default }} style={{ overflowX: 'auto' }}>
                                <TableHead sx={{ background: theme.palette.text.primary }}>
                                    <TableRow>
                                        {Object.keys(filteredDataCantMatched[0]).map((key, index) => (
                                            <TableCell key={index} align={index !== 3 ? "left" : "right"}>
                                                <Typography variant="body2" color={theme.palette.background.default}>
                                                    {key}
                                                </Typography>
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredDataCantMatched.length > 0 && filteredDataCantMatched.slice(startIndexCantMatched, endIndexCantMatched).map((d, index) =>
                                        <TableRow key={index}>
                                            {Object.keys(d).map((key, index) => (
                                                <TableCell key={index} align={index !== 3 ? "left" : "right"}>
                                                    <Typography>
                                                        {(d[key as keyof typeof d] as ReactNode)}
                                                    </Typography>
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>

                            <TablePagination
                                rowsPerPageOptions={[10, 25, 50, 100]}
                                component="div"
                                count={filteredDataCantMatched.length}
                                rowsPerPage={rowsPerPageCantMatched}
                                page={pageMatched}
                                onPageChange={(event, newPage) => setPageCantMatched(newPage)}
                                onRowsPerPageChange={(event) => {
                                    setRowsPerPageCantMatched(parseInt(event.target.value, 10))
                                    setPageCantMatched(0)
                                }}
                            />
                        </Stack>
                    </Stack>}
                </Stack>}
            </Stack>
        </Container>
    )
}

export default ImportAssistance