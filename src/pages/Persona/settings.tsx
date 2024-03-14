import { CircularProgress, Container, IconButton, Modal, Stack, TextField, Typography } from "@mui/material"
import OFormAssociation from "../../components/organisms/o-form-association"
import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { useLocation } from "react-router-dom"
import { acquireToken } from "../../App"
import * as yup from "yup"
import { yupResolver } from "@hookform/resolvers/yup"
import AButton from "../../components/atoms/a-button"
import { faXmark } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import theme from "../../theme"

const Settings = (props: { instance: any, validate: () => void }) => {

    const { instance, validate } = props

    const location = useLocation()
    const [IdTenant, setIdTenant] = useState<string | null>()

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search)
        const id = searchParams.get('id')
        if (id) {
            setIdTenant(id)
        }
    }, [location.search])

    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)
    const [settingsEdit, setSettingsEdit] = useState(false)
    const [isRestore, setIsRestore] = useState(false)
    const [isEditing, setIsEditing] = useState<number>()

    const [posteNomInterne, setPosteNomInterne] = useState<string>("")
    const [personaNomInterne, setPersonaNomInterne] = useState<string>("")

    const [role, setRole] = useState<string>("")
    const [keywords, setKeywords] = useState<Array<string>>([""])
    const [persona, setPersona] = useState<string>("")
    const [roles, setRoles] = useState<Array<string>>([""])

    const [associationsRoleKeywords, setAssociationsRoleKeywords] = useState([{ parent: "", childs: [""] }])
    const [associationsPersonaRoles, setAssociationsPersonaRoles] = useState([{ parent: "", childs: [""] }])
    const [backupAssociationsRoleKeywords, setBackupAssociationsRoleKeywords] = useState<{ parent: string; childs: string[] }[][]>([])
    const [backupAssociationsPersonaRoles, setBackupAssociationsPersonaRoles] = useState<{ parent: string; childs: string[] }[][]>([])

    const schema = yup.object().shape({
        parent: yup.string().required('Le champ rôle est requis'),
        childs: yup.array().of(
            yup.string().required('Le champs ne peut pas être vide')
        )
    })

    const { clearErrors, setError, formState: { errors } } = useForm({
        resolver: yupResolver(schema),
    })

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (IdTenant) {
                    setLoading(true)

                    await instance.initialize()
                    const accessToken = await acquireToken(instance)

                    const responseSettings = await fetch(`${process.env.REACT_APP_API}/hubspot-settings?IdTenant=${IdTenant}`, {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                            "Content-Type": "application/json"
                        }
                    })

                    const dataSettings = await responseSettings.json()

                    const SettingsData = {
                        IntitulePoste_NomInterne: dataSettings.IntitulePoste_NomInterne,
                        Persona_NomInterne: dataSettings.Persona_NomInterne
                    }

                    setPosteNomInterne(SettingsData.IntitulePoste_NomInterne)
                    setPersonaNomInterne(SettingsData.Persona_NomInterne)

                    const response = await fetch(`${process.env.REACT_APP_API}/proposition-persona/associations-settings?IdTenant=${IdTenant}`, {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                            "Content-Type": "application/json"
                        }
                    })

                    const data = await response.json()

                    if (data.statusCode === 404) {
                        setLoading(false)
                        setOpen(true)
                    }

                    if (data.personasRoles || data.rolesMotsClefs) {
                        const associationsPersonaRolesData = Object.keys(data.personasRoles).map((personaKey) => {
                            return {
                                parent: personaKey,
                                childs: data.personasRoles[personaKey].Roles.length !== 0 ? data.personasRoles[personaKey].Roles : [""]
                            }
                        })

                        setAssociationsPersonaRoles(associationsPersonaRolesData)
                        setBackupAssociationsPersonaRoles([...backupAssociationsPersonaRoles, associationsPersonaRolesData])

                        const associationsRoleKeywordsData = Object.keys(data.rolesMotsClefs).map((roleKey) => {
                            return {
                                parent: roleKey,
                                childs: data.rolesMotsClefs[roleKey].MotsClefs.length !== 0 ? data.rolesMotsClefs[roleKey].MotsClefs : [""]
                            }
                        })

                        setAssociationsRoleKeywords(associationsRoleKeywordsData)
                        setBackupAssociationsRoleKeywords([...backupAssociationsRoleKeywords, associationsRoleKeywordsData])

                        setLoading(false)
                    }
                }
            } catch (error) {
                console.error("Une erreur s'est produite lors de la requête :", error)
            }
        }

        setIsRestore(false)
        fetchData()
    }, [isRestore, IdTenant, settingsEdit])

    const addKeywords = () => {
        setKeywords((prevchilds) => [...prevchilds, ""])
        setTimeout(() => {
            const lastIndex = keywords.length
            const lastInput = document.getElementById(`child-input-${lastIndex}`)
            lastInput && lastInput.focus()
        }, 0)
    }

    const addRoles = () => {
        setRoles((prevchilds) => [...prevchilds, ""])
        setTimeout(() => {
            const lastIndex = roles.length
            const lastInput = document.getElementById(`child-input-${lastIndex}`)
            lastInput && lastInput.focus()
        }, 0)
    }

    const removeKeywords = (indexToRemove: number) => {
        if (keywords.length > 1) {
            const newchilds = keywords.filter((_, index) => index !== indexToRemove)
            setKeywords(newchilds)

            const focusedIndex = indexToRemove === 0 ? 0 : indexToRemove - 1
            const focusedInput = document.getElementById(`child-input-${focusedIndex}`)
            focusedInput && focusedInput.focus()
        } else {
            setKeywords([""])
            const focusedInput = document.getElementById(`child-input-0`)
            focusedInput && focusedInput.focus()
        }
    }

    const removeRoles = (indexToRemove: number) => {
        if (roles.length > 1) {
            const newchilds = roles.filter((_, index) => index !== indexToRemove)
            setRoles(newchilds)

            const focusedIndex = indexToRemove === 0 ? 0 : indexToRemove - 1
            const focusedInput = document.getElementById(`child-input-${focusedIndex}`)
            focusedInput && focusedInput.focus()
        } else {
            setRoles([""])
            const focusedInput = document.getElementById(`child-input-0`)
            focusedInput && focusedInput.focus()
        }
    }

    const handleRoleChange = (value: string) => {
        setRole(value)
        clearErrors('parent')
    }

    const handlePersonaChange = (value: string) => {
        setPersona(value)

        const personaIndex = associationsPersonaRoles.findIndex((association) => association.parent === value)
        setIsEditing(personaIndex)

        if (personaIndex !== -1) {
            const personaAssociations = associationsPersonaRoles[personaIndex]
            setRoles(personaAssociations.childs)
            clearErrors('childs')
        } else {
            setRoles([])
        }

        clearErrors('parent')
    }

    const handleKeywordsChange = (index: number, value: string) => {
        const newchilds = [...keywords]
        newchilds[index] = value
        setKeywords(newchilds)
        clearErrors(`childs[${index}` as keyof typeof errors)
    }

    const handleRolesChange = (index: number, value: string) => {
        const newchilds = [...roles]
        newchilds[index] = value
        setRoles(newchilds)
        clearErrors(`childs[${index}` as keyof typeof errors)
    }

    const editAssociationRoleKeywords = (index: number) => {
        setBackupAssociationsRoleKeywords([...backupAssociationsRoleKeywords, [...associationsRoleKeywords]])
        setIsEditing(index)
        setRole(associationsRoleKeywords[index].parent)
        setKeywords(associationsRoleKeywords[index].childs)
    }

    const editAssociationPersonaRoles = (index: number) => {
        setBackupAssociationsPersonaRoles([...backupAssociationsPersonaRoles, [...associationsPersonaRoles]])
        setIsEditing(index)
        setPersona(associationsPersonaRoles[index].parent)
        setRoles(associationsPersonaRoles[index].childs)
    }

    const removeAssociationRoleKeywords = (index: number) => {
        setBackupAssociationsRoleKeywords([...backupAssociationsRoleKeywords, [...associationsRoleKeywords]])
        const newAssociations = [...associationsRoleKeywords]
        newAssociations.splice(index, 1)
        setAssociationsRoleKeywords(newAssociations)
    }

    const removeAssociationPersonaRoles = (index: number) => {
        setBackupAssociationsPersonaRoles([...backupAssociationsPersonaRoles, [...associationsPersonaRoles]])
        const newAssociations = [...associationsPersonaRoles]
        newAssociations.splice(index, 1)
        setAssociationsPersonaRoles(newAssociations)
    }

    const restoreAssociationRoleKeywords = () => {
        if (backupAssociationsRoleKeywords.length > 1) {
            const previousBackups = [...backupAssociationsRoleKeywords]
            previousBackups.pop()
            setAssociationsRoleKeywords(previousBackups[previousBackups.length - 1])
            setBackupAssociationsRoleKeywords(previousBackups)
        }
    }

    const restoreAssociationPersonaRoles = () => {
        if (backupAssociationsPersonaRoles.length > 1) {
            const previousBackups = [...backupAssociationsPersonaRoles]
            previousBackups.pop()
            setAssociationsPersonaRoles(previousBackups[previousBackups.length - 1])
            setBackupAssociationsPersonaRoles(previousBackups)
        }
    }

    const addRowRoleKeywords = async () => {
        try {
            clearErrors()

            const isValid = await schema.validate({
                parent: role,
                childs: keywords,
            }, { abortEarly: false })

            if (isValid) {
                if (isEditing !== undefined) {
                    const updatedAssociations = [...associationsRoleKeywords]
                    updatedAssociations[isEditing] = { parent: role, childs: keywords }
                    setAssociationsRoleKeywords(updatedAssociations)
                    setRole("")
                    setKeywords([""])
                    setIsEditing(undefined)
                    setBackupAssociationsRoleKeywords([...backupAssociationsRoleKeywords, [...associationsRoleKeywords]])
                } else {
                    setAssociationsRoleKeywords((prevAssociations) => {
                        const newAssociations = [...prevAssociations, { parent: role, childs: keywords }]
                        setBackupAssociationsRoleKeywords([...backupAssociationsRoleKeywords, [...newAssociations]])
                        return newAssociations
                    })
                    setRole("")
                    setKeywords([""])
                }
            }
        } catch (validationError: any) {
            validationError.inner.forEach((error: { path: any; message: string }) => {
                setError(error.path, { type: 'manual', message: error.message })
            })
        }
    }

    const addRowPersonaRoles = async () => {
        try {
            clearErrors()

            const isValid = await schema.validate({
                parent: persona,
                childs: roles,
            }, { abortEarly: false })

            if (isValid) {
                if (isEditing !== undefined) {
                    const updatedAssociations = [...associationsPersonaRoles]
                    updatedAssociations[isEditing] = { parent: persona, childs: roles }
                    setAssociationsPersonaRoles(updatedAssociations)
                    setPersona("")
                    setRoles([""])
                    setIsEditing(undefined)
                    setBackupAssociationsPersonaRoles([...backupAssociationsPersonaRoles, [...associationsPersonaRoles]])
                } else {
                    setAssociationsPersonaRoles((prevAssociations) => {
                        const newAssociations = [...prevAssociations, { parent: persona, childs: roles }]
                        setBackupAssociationsPersonaRoles([...backupAssociationsPersonaRoles, [...newAssociations]])
                        return newAssociations
                    })
                    setPersona("")
                    setRoles([""])
                }
            }
        } catch (validationError: any) {
            validationError.inner.forEach((error: { path: any; message: string }) => {
                setError(error.path, { type: 'manual', message: error.message })
            })
        }
    }

    const handleSubmit = async () => {
        setLoading(true)

        const fetchData = async () => {
            if (IdTenant) {
                const parsedId = parseInt(IdTenant, 10)

                const body = {
                    IdTenant: parsedId,
                    associationsRoleMotClef: associationsRoleKeywords.map((association) => {
                        return {
                            NomRole: association.parent,
                            NomMotClef: association.childs,
                        }
                    }),
                    associationsPersonaRole: associationsPersonaRoles.map((persona) => {
                        return {
                            NomPersona: persona.parent,
                            NomRole: persona.childs,
                        }
                    })
                }

                const accessToken = await acquireToken(instance)

                await fetch(`${process.env.REACT_APP_API}/proposition-persona/associations-settings`, {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(body)
                })
            }

            setLoading(false)
        }

        fetchData()
    }

    const handlePosteNomInterneChange = (event: { target: { value: string } }) => {
        const value = event.target.value
        setPosteNomInterne(value)
    }

    const handlePersonaNomInterneChange = (event: { target: { value: string } }) => {
        const value = event.target.value
        setPersonaNomInterne(value)
    }

    const editSettings = async () => {
        const accessToken = await acquireToken(instance)

        const payloadSettings = {
            IdTenant: IdTenant,
            IntitulePoste_NomInterne: posteNomInterne,
            Persona_NomInterne: personaNomInterne
        }

        await fetch(`${process.env.REACT_APP_API}/hubspot-settings`, {
            method: "PATCH",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payloadSettings)
        })

        setOpen(false)
        setSettingsEdit(!settingsEdit)
    }

    return (
        <Container maxWidth="lg">
            <Stack spacing={8} alignItems="center" marginTop="100px" marginBottom="100px">
                <Typography variant="h3">
                    DataHub
                </Typography>

                {loading ? <CircularProgress /> : <Stack spacing={8} alignItems="center" width="100%">
                    <Stack spacing={2} alignItems="flex-end" width="100%">
                        <AButton variant="outlined" onClick={() => setOpen(true)}>
                            Modifier les propriétés
                        </AButton>

                        <OFormAssociation
                            parentLabel="Rôle"
                            childLabel="Mot clé"
                            buttonHidden={false}
                            parent={role}
                            childs={keywords}
                            associations={associationsRoleKeywords}
                            errors={errors}
                            setIsRestore={setIsRestore}
                            setAssociations={setAssociationsRoleKeywords}
                            addChilds={addKeywords}
                            removeChilds={removeKeywords}
                            handleParentChange={handleRoleChange}
                            handleChildsChange={handleKeywordsChange}
                            editAssociations={editAssociationRoleKeywords}
                            removeAssociations={removeAssociationRoleKeywords}
                            backUp={restoreAssociationRoleKeywords}
                            addRow={addRowRoleKeywords}
                            handleSubmit={handleSubmit}
                            validate={validate}
                        />
                    </Stack>

                    <OFormAssociation
                        parentLabel="Persona"
                        childLabel="Rôle"
                        buttonHidden={true}
                        parent={persona}
                        childs={roles}
                        roles={associationsRoleKeywords}
                        associations={associationsPersonaRoles}
                        errors={errors}
                        setIsRestore={setIsRestore}
                        setAssociations={setAssociationsPersonaRoles}
                        addChilds={addRoles}
                        removeChilds={removeRoles}
                        handleParentChange={handlePersonaChange}
                        handleChildsChange={handleRolesChange}
                        editAssociations={editAssociationPersonaRoles}
                        removeAssociations={removeAssociationPersonaRoles}
                        backUp={restoreAssociationPersonaRoles}
                        addRow={addRowPersonaRoles}
                        handleSubmit={handleSubmit}
                        validate={validate}
                    />
                </Stack>}

                <Modal open={open} onClose={() => setOpen(false)}>
                    <Stack
                        spacing={4}
                        alignItems="center"
                        sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            borderRadius: '15px',
                            background: theme.palette.background.default,
                            padding: '30px 50px 30px 50px'
                        }}
                    >
                        <IconButton
                            sx={{
                                position: 'absolute',
                                top: '10px',
                                right: '10px',
                                width: '40px',
                                height: '40px'
                            }}
                            onClick={() => setOpen(false)}
                        >
                            <FontAwesomeIcon icon={faXmark} color={theme.palette.text.primary} />
                        </IconButton>
                        <Typography variant="h4">
                            Les propriétés du client
                        </Typography>

                        <TextField
                            required
                            placeholder="Intitulé de poste interne"
                            name="IntitulePoste_NomInterne"
                            value={posteNomInterne}
                            onChange={handlePosteNomInterneChange}
                            sx={{
                                borderColor: '#E0E0E0',
                                boxShadow: '0px 4px 4px 0px rgba(0, 0, 0, 0.25)'
                            }}
                        />

                        <TextField
                            required
                            placeholder="Nom du persona interne"
                            name="Persona_NomInterne"
                            value={personaNomInterne}
                            onChange={handlePersonaNomInterneChange}
                            sx={{
                                borderColor: '#E0E0E0',
                                boxShadow: '0px 4px 4px 0px rgba(0, 0, 0, 0.25)'
                            }}
                        />

                        <AButton variant="contained" onClick={editSettings}>
                            Sauvegarder
                        </AButton>
                    </Stack>
                </Modal>
            </Stack>
        </Container>
    )
}

export default Settings