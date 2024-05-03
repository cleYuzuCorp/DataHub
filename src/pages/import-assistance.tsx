import { ReactNode, useEffect, useState } from 'react'
import { Container, Stack, Typography, CircularProgress, RadioGroup, Radio, FormControlLabel, TextField, MenuItem, TableHead, Paper, Table, TableBody, TableCell, TableRow, TablePagination, Alert, Snackbar } from "@mui/material"
import { useLocation } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowDown, faArrowUp, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import theme from '../theme'
import * as yup from "yup"
import { yupResolver } from "@hookform/resolvers/yup"
import { useForm } from 'react-hook-form'
import AButton from '../components/atoms/a-button'
import MFileUpload from '../components/molecules/m-file-upload'
import { DataFile } from '../interfaces/data-file'
import * as XLSX from 'xlsx'
import { Exist } from '../interfaces/exist'

const ImportAssistance = () => {
    const idTenant = new URLSearchParams(useLocation().search).get('id')

    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)
    const [progress, setProgress] = useState(0)
    const [proposition, setProposition] = useState("choice")

    const [file, setFile] = useState<File>()
    const [dataMatched, setDataMatched] = useState<DataFile[]>([])
    const [dataCantMatched, setDataCantMatched] = useState<DataFile[]>([])
    const [filteredDataMatched, setFilteredDataMatched] = useState<DataFile[]>([])
    const [filteredDataCantMatched, setFilteredDataCantMatched] = useState<DataFile[]>([])
    const [selectedData, setSelectedData] = useState<DataFile>()
    const [searchTerm, setSearchTerm] = useState("")

    const [companies, setCompanies] = useState([])
    const [selectedCompagnies, setSelectedCompagnies] = useState("")

    const [pageMatched, setPageMatched] = useState(0)
    const [rowsPerPageMatched, setRowsPerPageMatched] = useState(10)
    const [pageCantMatched, setPageCantMatched] = useState(0)
    const [rowsPerPageCantMatched, setRowsPerPageCantMatched] = useState(10)
    const [hovered, setHovered] = useState<number | undefined>()
    const [sortOrderExist, setSortOrderExist] = useState<'asc' | 'desc'>('asc')
    const [sortOrderStatus, setSortOrderStatus] = useState<'asc' | 'desc'>('asc')

    const schema = yup.object().shape({
        data: yup.mixed().default('Une erreur est survenu'),
        companies: yup.string().required('Vous devez séléctionner au moins une entreprise')
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

                const response = await fetch(`${process.env.REACT_APP_API}/import/check/${idTenant}`, {
                    method: "POST",
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

                const domains = data.matched.map((d: DataFile) => {
                    if (d.Exist && d.Exist.length > 0) {
                        return d.Exist.map((e: Exist) => e.domain)
                    }
                    return []
                }).flat()

                setCompanies(domains)
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

    const handlePropositionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setProposition((event.target as HTMLInputElement).value)
    }

    const handleCompagniesChange = (value: string) => {
        setSelectedCompagnies(value)
        clearErrors('companies')
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
            clearErrors('data')
            setLoading(true)

            if (file && idTenant) {
                const wb = XLSX.utils.book_new()
                const ws = XLSX.utils.json_to_sheet(dataMatched)
                XLSX.utils.book_append_sheet(wb, ws, "Sheet1")
                const excelBuffer = XLSX.write(wb, { type: 'array', bookType: 'xlsx' })

                const excelFile = new File([new Uint8Array(excelBuffer)], "data.xlsx", { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })

                const formData = new FormData()
                formData.append("file", excelFile)

                const response = await fetch(`${process.env.REACT_APP_API}/import/${idTenant}`, {
                    method: "POST",
                    body: formData,
                })

                if (!response.ok) {
                    const errorData = await response.json()
                    setError('data', { message: errorData.message })
                    setLoading(false)
                    setOpen(true)
                    return
                }

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

                    {selectedData && <Stack
                        width="100%"
                        sx={{
                            background: theme.palette.background.default,
                            boxShadow: '0px 4px 4px 0px rgba(0, 0, 0, 0.25)',
                            borderRadius: '15px',
                        }}
                    >
                        <Stack
                            padding="16px"
                            borderRadius="15px"
                            sx={{
                                background: theme.palette.text.primary
                            }}
                        >
                            <Typography variant="h4" color={theme.palette.background.default}>
                                Propositions
                            </Typography>
                        </Stack>

                        <Stack spacing={1} padding="16px">
                            <Stack spacing={4} direction="row">
                                <RadioGroup value={proposition} onChange={handlePropositionChange}>
                                    <FormControlLabel
                                        value="choice"
                                        control={<Radio />}
                                        label="Choisir une entreprise existante"
                                        sx={{
                                            margin: '10px 0px 10px 0px'
                                        }}
                                    />
                                    <FormControlLabel
                                        value="replace"
                                        control={<Radio />}
                                        label="Remplacer par une entreprise de mon import"
                                        sx={{
                                            margin: '10px 0px 10px 0px'
                                        }}
                                    />
                                    <FormControlLabel
                                        value="create"
                                        control={<Radio />}
                                        label="Créer une nouvelle entreprise"
                                        sx={{
                                            margin: '10px 0px 10px 0px'
                                        }}
                                    />
                                </RadioGroup>

                                {proposition !== "create" ? <TextField
                                    select
                                    label="Entreprise"
                                    value={selectedCompagnies}
                                    onChange={(e) => handleCompagniesChange(e.target.value)}
                                    helperText={errors.companies?.message}
                                    sx={{
                                        borderColor: errors.companies ? theme.palette.error.main : '#E0E0E0',
                                        '& .MuiFormHelperText-root': {
                                            color: errors.companies ? theme.palette.error.main : 'inherit'
                                        },
                                        width: '100%',
                                        height: '50px'
                                    }}
                                >
                                    {companies?.map((companies) => <MenuItem key={companies} value={companies}>
                                        {companies}
                                    </MenuItem>
                                    )}
                                </TextField> : null}
                            </Stack>

                            <Stack alignItems="center">
                                <Stack width="350px">
                                    <AButton variant="contained">
                                        Valider
                                    </AButton>
                                </Stack>
                            </Stack>
                        </Stack>
                    </Stack>}

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

                            <AButton variant="contained" onClick={importData}>
                                Importer les données
                            </AButton>
                        </Stack>

                        <Stack spacing={2}>
                            <Typography variant="h4">
                                Données traitées
                            </Typography>

                            <Table component={Paper} sx={{ background: theme.palette.background.default }} style={{ overflowX: 'auto' }}>
                                <TableHead sx={{ background: theme.palette.text.primary }}>
                                    <TableRow>
                                        {Object.keys(filteredDataMatched[0]).map((key, index) => (
                                            <TableCell key={index} align={key !== "Status" ? "left" : "right"}>
                                                {key === "Exist" ? <Stack
                                                    spacing={1}
                                                    direction="row"
                                                    alignItems="center"
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
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredDataMatched.length > 0 && filteredDataMatched.slice(startIndexMatched, endIndexMatched).map((d, index) =>
                                        <TableRow
                                            key={index}
                                            onMouseEnter={() => setHovered(index)}
                                            onMouseLeave={() => setHovered(undefined)}
                                            onClick={() => setSelectedData(d)}
                                            sx={{
                                                background: selectedData === d || hovered === index ? theme.palette.secondary.light : 'none'
                                            }}
                                        >
                                            {Object.keys(d).map((key, index) => (
                                                <TableCell key={index} align={index !== 3 ? "left" : "right"}>
                                                    {key === "Exist" ? d.Exist.length > 0 ? <Typography>
                                                        Déjà présent
                                                    </Typography> : <Typography>
                                                        Nouveau
                                                    </Typography> : key !== "Exist" && <Typography>
                                                        {(d[key as keyof typeof d] as ReactNode)}
                                                    </Typography>}
                                                </TableCell>
                                            ))}
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