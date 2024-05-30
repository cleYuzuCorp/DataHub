import { CircularProgress, Container, Modal, Stack, TextField, Typography, useMediaQuery } from "@mui/material"
import OFormAssociation from "../../components/organisms/o-form-association"
import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { useLocation } from "react-router-dom"
import { acquireToken } from "../../App"
import * as yup from "yup"
import { yupResolver } from "@hookform/resolvers/yup"
import AButton from "../../components/atoms/a-button"
import theme from "../../hooks/theme"
import useNotification from "../../hooks/use-notification"
import ANotification from "../../components/atoms/a-notifications"
import { fetchData } from "../../components/api"

const Settings = (props: { instance: any, validate: () => void }) => {

    const { instance, validate } = props

    const isDesktop = useMediaQuery('(min-width:1000px)')

    const { notification, showNotification, closeNotification } = useNotification()

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
        const fetchDataFromApi = async () => {
            try {
                if (IdTenant) {
                    setLoading(true)
                    showNotification(`Requête en cours d'exécution`, 'warning')

                    await instance.initialize()
                    const accessToken = await acquireToken(instance)

                    const { data, error } = await fetchData(`/hubspot-settings/${IdTenant}`, {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                            "Content-Type": "application/json"
                        }
                    })

                    if (error) {
                        showNotification(`Une erreur s'est produite lors de la requête : ${error}`, 'error')
                    } else if (data) {
                        const SettingsData = {
                            IntitulePoste_NomInterne: data.IntitulePoste_NomInterne,
                            Persona_NomInterne: data.Persona_NomInterne
                        }

                        setPosteNomInterne(SettingsData.IntitulePoste_NomInterne)
                        setPersonaNomInterne(SettingsData.Persona_NomInterne)
                    }
                }
            } catch (error) {
                showNotification(`Une erreur s'est produite lors de la requête : ${error}`, 'error')
            } finally {
                setLoading(false)
                closeNotification()
            }

            try {
                if (IdTenant) {
                    setLoading(true)
                    showNotification(`Requête en cours d'exécution`, 'warning')

                    await instance.initialize()
                    const accessToken = await acquireToken(instance)

                    const { data, error } = await fetchData(`/proposition-persona/associations-settings/${IdTenant}`, {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                            "Content-Type": "application/json"
                        }
                    })

                    if (error) {
                        showNotification(`Une erreur s'est produite lors de la requête : ${error}`, 'error')
                        setOpen(true)
                    } else if (data) {
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
                        }
                    }
                }
            } catch (error) {
                showNotification(`Une erreur s'est produite lors de la requête : ${error}`, 'error')
            } finally {
                setLoading(false)
                closeNotification()
            }
        }

        setIsRestore(false)
        fetchDataFromApi()
    }, [isRestore, IdTenant, settingsEdit]) // eslint-disable-line react-hooks/exhaustive-deps

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
        showNotification(`Requête en cours d'exécution`, 'warning')

        const fetchDataFromApi = async () => {
            try {
                if (IdTenant) {
                    const parsedId = parseInt(IdTenant, 10)

                    const body = {
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

                    const { data, error } = await fetchData(`/proposition-persona/associations-settings/${parsedId}`, {
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
                        showNotification("Sauvegarde effectué avec succès !", 'success')
                    }
                }
            } catch (error) {
                showNotification(`Une erreur s'est produite lors de la requête : ${error}`, 'error')
            } finally {
                setLoading(false)
            }
        }

        fetchDataFromApi()
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
        try {
            const accessToken = await acquireToken(instance)

            const payloadSettings = {
                IntitulePoste_NomInterne: posteNomInterne,
                Persona_NomInterne: personaNomInterne
            }

            const { data, error } = await fetchData(`/hubspot-settings/${IdTenant}`, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json"
                },
                data: JSON.stringify(payloadSettings)
            })

            if (error) {
                showNotification(`Une erreur s'est produite lors de la requête : ${error}`, 'error')
            } else if (data) {
                showNotification("Paramètres modifiés avec succès !", 'success')
                setOpen(false)
                setSettingsEdit(!settingsEdit)
            }
        } catch (error) {
            showNotification(`Une erreur s'est produite lors de la requête : ${error}`, 'error')
        }
    }

    return (
        <Container maxWidth="lg">
            <Stack spacing={8} alignItems="center" marginTop="100px" marginBottom="100px">
                <Typography variant="h3">
                    DataHub - Persona
                </Typography>

                <ANotification
                    open={notification.open}
                    message={notification.message}
                    severity={notification.severity}
                    onClose={closeNotification}
                />

                {loading ? <CircularProgress /> : <Stack spacing={8} alignItems="center" width="100%">
                    <Stack spacing={2} alignItems={isDesktop ? "flex-end" : "normal"} width="100%">
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

                <Modal open={open}>
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
                                background: theme.palette.background.default,
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
                                background: theme.palette.background.default,
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