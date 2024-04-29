import { useEffect, useState } from 'react'
import { Container, Button, Stack, Typography, RadioGroup, Radio, FormControlLabel, TextField, MenuItem, LinearProgress, Divider } from "@mui/material"
import { useLocation } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFolderOpen, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import theme from '../theme'
import * as yup from "yup"
import { yupResolver } from "@hookform/resolvers/yup"
import { useForm } from 'react-hook-form'
import AButton from '../components/atoms/a-button'
import MFileUpload from '../components/molecules/m-file-upload'

const ImportAssistance = () => {
    const idTenant = new URLSearchParams(useLocation().search).get('id')

    const [proposition, setProposition] = useState("choice")
    const [compagnies, setCompagnies] = useState([])
    const [filteredCompagnies, setFilteredCompagnies] = useState([])
    const [selectedCompagnies, setSelectedCompagnies] = useState("")
    const [searchTerm, setSearchTerm] = useState("")
    const [file, setFile] = useState<File>()

    const schema = yup.object().shape({
        compagnies: yup.string().required('Vous devez séléctionner au moins une entreprise')
    })

    const { clearErrors, setError, formState: { errors } } = useForm({
        resolver: yupResolver(schema),
    })

    const loadData = async () => {
        try {
            if (!idTenant || !file) {
                console.error("No file selected")
                return
            }


            const formData = new FormData()
            formData.append("file", file)
            formData.append("IdTenant", idTenant)

            const url = "http://localhost:3001/import/check"

            const response = await fetch(url, {
                method: "POST",
                body: formData,
            })

            const data = await response.json()
            console.log(data)

        } catch (error) {
            console.error("Error uploading file:", error)
        }
    }

    const handlePropositionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setProposition((event.target as HTMLInputElement).value)
    }

    const handlecompagniesChange = (value: string) => {
        setSelectedCompagnies(value)
        clearErrors('compagnies')
    }

    const handleFilteredChange = (value: string) => {
        setSearchTerm(value)
    }

    useEffect(() => {
        const filtered = compagnies.filter(compagny =>
            compagny
        )

        setFilteredCompagnies(filtered)
    }, [searchTerm, compagnies])

    return (
        <Container maxWidth="lg">
            <Stack spacing={8} alignItems="center" marginTop="100px" marginBottom="100px">
                <Typography variant="h3">
                    DataHub - Aide à l'import
                </Typography>

                <MFileUpload file={file} setFile={setFile} request={loadData} />

                <Stack
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
                                onChange={(e) => handlecompagniesChange(e.target.value)}
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
                </Stack>

                <Stack spacing={2} width="100%">
                    <TextField
                        placeholder="Recherche par ID, Date, Nom ou Domaine"
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
            </Stack>
        </Container>
    )
}

export default ImportAssistance