import { useEffect, useState } from 'react'
import { Container, Button, Stack, Typography, RadioGroup, Radio, FormControlLabel, TextField, MenuItem, LinearProgress } from "@mui/material"
import { useLocation } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFolderOpen, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import theme from '../theme'
import * as yup from "yup"
import { yupResolver } from "@hookform/resolvers/yup"
import { useForm } from 'react-hook-form'
import AButton from '../components/atoms/a-button'

const Form = () => {
    const idTenant = new URLSearchParams(useLocation().search).get('id')

    const [hovered, setHovered] = useState(false)
    const [file, setFile] = useState<File>()
    const [proposition, setProposition] = useState("choice")
    const [compagnies, setCompagnies] = useState([])
    const [filteredCompagnies, setFilteredCompagnies] = useState([])
    const [selectedCompagnies, setSelectedCompagnies] = useState("")
    const [searchTerm, setSearchTerm] = useState("")
    const [progress, setProgress] = useState(0)

    const schema = yup.object().shape({
        compagnies: yup.string().required('Vous devez séléctionner au moins une entreprise')
    })

    const { clearErrors, setError, formState: { errors } } = useForm({
        resolver: yupResolver(schema),
    })

    useEffect(() => {
        setProgress(0)

        const timer = setInterval(() => {
            setProgress((oldProgress) => {
                const diff = Math.random() * 10
                return Math.min(oldProgress + diff, 100)
            })
        }, 200)

        return () => {
            clearInterval(timer)
        }
    }, [file])

    const handleDragOver = (event: any) => {
        event.preventDefault()
    }

    const handleDrop = (event: any) => {
        event.preventDefault()
        const droppedFile = event.dataTransfer.files[0]
        if (droppedFile) {
            const formData = new FormData()
            formData.append('file', droppedFile)
            setFile(droppedFile)
        }
    }

    const handleFileChange = async (event: any) => {
        const selectedFile = event.target.files ? event.target.files[0] : null
        setFile(selectedFile)
    }

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
            <Stack spacing={6} alignItems="center" marginTop="100px" marginBottom="100px">
                <Stack spacing={2} alignItems="center">
                    <Stack
                        spacing={2}
                        alignItems="center"
                        textAlign="center"
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        sx={{
                            maxWidth: '500px',
                            width: '100%',
                            background: theme.palette.background.default,
                            border: '1px dashed',
                            borderColor: theme.palette.text.primary,
                            borderRadius: '30px',
                            borderWidth: '5px',
                            padding: '20px',
                        }}
                    >
                        <FontAwesomeIcon icon={faFolderOpen} size='4x' color={theme.palette.text.primary} />

                        <Typography>
                            Glisser et déposer votre document excel ici <br />
                            ou cliquez sur ce bouton pour l’upload
                        </Typography>

                        <Typography color="#C1C1C1">
                            OU
                        </Typography>

                        <Button
                            variant="contained"
                            component="label"
                            sx={{
                                fontWeight: 700,
                                color: theme.palette.background.default,
                                background: theme.palette.text.primary,
                                border: '1px solid',
                                borderColor: theme.palette.text.primary,
                                borderRadius: '15px',
                                transition: "all 0.5s ease 0s",
                                position: 'relative',
                                overflow: 'hidden',
                                '&:hover': {
                                    color: theme.palette.text.primary,
                                    borderColor: theme.palette.text.primary,
                                    background: theme.palette.primary.main,
                                    '&::before': {
                                        content: '""',
                                        position: 'absolute',
                                        top: 0,
                                        left: hovered ? '100%' : 0,
                                        width: '100%',
                                        height: '100%',
                                        background: theme.palette.text.primary,
                                        transition: 'left 0.5s ease',
                                    },
                                },
                            }}
                            onMouseEnter={() => setHovered(true)}
                            onMouseLeave={() => setHovered(false)}
                        >
                            Parcourir
                            <input type="file" hidden onChange={handleFileChange} accept=".xlsx,.xls" />
                        </Button>
                    </Stack>
                    {file ? <Stack alignItems="center" width="100%">
                        {progress !== 100 ? <LinearProgress
                            variant='determinate'
                            value={progress}
                            sx={{
                                width: '100%',
                                background: theme.palette.text.secondary,
                                '& .MuiLinearProgress-bar': {
                                    background: theme.palette.text.primary
                                }
                            }}
                        /> :
                            <Stack spacing={2} direction="row" alignItems="center">
                                <Typography>
                                    {file.name}
                                </Typography>

                                <AButton variant='contained' size='small' onClick={loadData}>
                                    Confirmer
                                </AButton>
                            </Stack>}
                    </Stack> : null}
                </Stack>

                <Stack width="100%">
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

                    <Stack
                        spacing={4}
                        padding="32px"
                        sx={{
                            background: theme.palette.background.default,
                            boxShadow: '0px 4px 4px 0px rgba(0, 0, 0, 0.25)',
                            borderRadius: '0px 0px 15px 15px',
                        }}
                    >
                        <Stack spacing={4} direction="row">
                            <RadioGroup value={proposition} onChange={handlePropositionChange}>
                                <FormControlLabel value="choice" control={<Radio />} label="Choisir une entreprise existante" />
                                <FormControlLabel value="replace" control={<Radio />} label="Remplacer par une entreprise de mon import" />
                                <FormControlLabel value="create" control={<Radio />} label="Créer une nouvelle entreprise" />
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

export default Form