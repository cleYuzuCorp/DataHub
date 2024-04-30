import { useEffect, useState } from 'react'
import { Container, Stack, Typography, CircularProgress, RadioGroup, Radio, FormControlLabel, TextField, MenuItem, TableHead, Paper, Table, TableBody, TableCell, TableRow, TablePagination } from "@mui/material"
import { useLocation } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowDown, faArrowUp, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import theme from '../theme'
import * as yup from "yup"
import { yupResolver } from "@hookform/resolvers/yup"
import { useForm } from 'react-hook-form'
import AButton from '../components/atoms/a-button'
import MFileUpload from '../components/molecules/m-file-upload'
import { Data } from '../interfaces/data'
import * as XLSX from 'xlsx'

const ImportAssistance = () => {
    const idTenant = new URLSearchParams(useLocation().search).get('id')

    const [loading, setLoading] = useState(false)
    const [proposition, setProposition] = useState("choice")
    const [file, setFile] = useState<File>()
    const [data, setData] = useState<Data[]>([])
    const [filteredData, setFilteredData] = useState<Data[]>([])
    const [selectedData, setSelectedData] = useState<Data>()
    const [searchTerm, setSearchTerm] = useState("")

    const [compagnies, setCompagnies] = useState([])
    const [selectedCompagnies, setSelectedCompagnies] = useState("")

    const [page, setPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(10)
    const [hovered, setHovered] = useState<number | undefined>()
    const [sortOrderExist, setSortOrderExist] = useState<'asc' | 'desc'>('asc')

    const schema = yup.object().shape({
        compagnies: yup.string().required('Vous devez séléctionner au moins une entreprise')
    })

    const { clearErrors, setError, formState: { errors } } = useForm({
        resolver: yupResolver(schema),
    })

    const loadData = async () => {
        try {
            setLoading(true)

            if (!idTenant || !file) {
                console.error("No file selected")
                setLoading(false)
                return
            }

            if (!file.name.endsWith('.xlsx')) {
                console.error("Invalid file format. Please select a .xlsx file.")
                setLoading(false)
                return
            }

            const reader = new FileReader()
            reader.onload = async (e) => {
                const celulle = new Uint8Array(e?.target?.result as ArrayBuffer)
                const workbook = XLSX.read(celulle, { type: 'array' })

                const sheetName = workbook.SheetNames[0]
                const worksheet = workbook.Sheets[sheetName]

                const firstCell = worksheet[XLSX.utils.encode_cell({ r: 0, c: 0 })]?.v
                if (firstCell !== "Domain" && firstCell !== "Email") {
                    console.error("Invalid Excel format. The first cell should be 'Domain' or 'Email'.")
                    setLoading(false)
                    return
                }

                const formData = new FormData()
                formData.append("file", file)
                formData.append("IdTenant", idTenant)

                const response = await fetch(`${process.env.REACT_APP_API}/import/check`, {
                    method: "POST",
                    body: formData,
                })

                const data = await response.json()

                setData(data)
                setLoading(false)
            }

            reader.readAsArrayBuffer(file)
        } catch (error) {
            console.error("Error uploading file:", error)
        }
    }

    const handlePropositionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setProposition((event.target as HTMLInputElement).value)
    }

    const handleCompagniesChange = (value: string) => {
        setSelectedCompagnies(value)
        clearErrors('compagnies')
    }

    const handleFilteredChange = (value: string) => {
        setSearchTerm(value)
    }

    useEffect(() => {
        const filtered = data.filter(d =>
            data[0].Domain ? d.Domain.toLowerCase().includes(searchTerm.toLowerCase()) :
                d.Email.toLowerCase().includes(searchTerm.toLowerCase())
        )

        setFilteredData(filtered)
    }, [searchTerm, data])

    const toggleSortDataExist = () => {
        setSortOrderExist(sortOrderExist === 'asc' ? 'desc' : 'asc')

        const sortedData = [...filteredData].sort((a, b) => {
            if (a.Exist.length === b.Exist.length) return 0
            return sortOrderExist === 'asc' ? (a.Exist.length > b.Exist.length ? 1 : -1) : (a.Exist.length < b.Exist.length ? 1 : -1)
        })
        return sortedData
    }

    const startIndex = page * rowsPerPage
    const endIndex = startIndex + rowsPerPage

    const importData = async () => {
        try {
            setLoading(true)

            if (!idTenant || !file) {
                console.error("No file selected")
                setLoading(false)
                return
            }

            const wb = XLSX.utils.book_new()
            const ws = XLSX.utils.json_to_sheet(data)
            XLSX.utils.book_append_sheet(wb, ws, "Sheet1")
            const excelBuffer = XLSX.write(wb, { type: 'array', bookType: 'xlsx' })

            const formData = new FormData()
            formData.append("file", new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }))
            formData.append("IdTenant", idTenant)

            const response = await fetch(`${process.env.REACT_APP_API}/import`, {
                method: "POST",
                body: formData,
            })

            console.log(response)

            setLoading(false)

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
                    <MFileUpload file={file} setFile={setFile} request={loadData} />

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
                                    helperText={errors.compagnies?.message}
                                    sx={{
                                        borderColor: errors.compagnies ? theme.palette.error.main : '#E0E0E0',
                                        '& .MuiFormHelperText-root': {
                                            color: errors.compagnies ? theme.palette.error.main : 'inherit'
                                        },
                                        width: '100%',
                                        height: '50px'
                                    }}
                                >
                                    {compagnies?.map((compagnies) => <MenuItem key={compagnies} value={compagnies}>
                                        {compagnies}
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

                    {filteredData.length > 0 && <Stack spacing={2} width="100%">
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

                        <Table component={Paper} sx={{ background: theme.palette.background.default }} style={{ overflowX: 'auto' }}>
                            <TableHead sx={{ background: theme.palette.text.primary }}>
                                <TableRow>
                                    {Object.keys(filteredData[0]).map((key, index) => (
                                        <TableCell key={index} align="left">
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
                                            </Stack> :
                                                <Typography variant="body2" color={theme.palette.background.default}>
                                                    {key}
                                                </Typography>}
                                        </TableCell>
                                    ))}
                                    <TableCell align="right">
                                        <Typography variant="body2" color={theme.palette.background.default}>
                                            Status
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredData.length > 0 && filteredData.slice(startIndex, endIndex).map((d, index) =>
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
                                            <TableCell key={index} align="left">
                                                {index === 2 ? d.Exist.length > 0 ? <Typography>
                                                    Déjà présent
                                                </Typography> : <Typography>
                                                    Nouveau
                                                </Typography> : <Typography>
                                                    {d[key as keyof typeof d]}
                                                </Typography>}
                                            </TableCell>
                                        ))}
                                        <TableCell align="right">
                                            <Typography>
                                                {d.Exist.length > 0 ? <Typography>
                                                    En cours
                                                </Typography> : <Typography>
                                                    Terminé
                                                </Typography>}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>

                        <TablePagination
                            rowsPerPageOptions={[10, 25, 50, 100]}
                            component="div"
                            count={filteredData.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={(event, newPage) => setPage(newPage)}
                            onRowsPerPageChange={(event) => {
                                setRowsPerPage(parseInt(event.target.value, 10))
                                setPage(0)
                            }}
                        />
                    </Stack>}
                </Stack>}
            </Stack>
        </Container>
    )
}

export default ImportAssistance