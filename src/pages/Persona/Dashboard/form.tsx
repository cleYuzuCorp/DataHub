import { CircularProgress, Container, Stack, Typography } from "@mui/material"
import OFormAssociation from "../../../components/organisms/o-form-association"
import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { useLocation } from "react-router-dom"
import { acquireToken } from "../../../App"
import * as yup from "yup"
import { yupResolver } from "@hookform/resolvers/yup"

const Form = (props: { instance: any }) => {

    const { instance } = props

    const idTenant = new URLSearchParams(useLocation().search).get('id')

    const [loading, setLoading] = useState(false)
    const [isRestore, setIsRestore] = useState(false)
    const [isEditing, setIsEditing] = useState<number>()

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
        setLoading(true)

        const fetchData = async () => {
            try {
                await instance.initialize()
                const accessToken = await acquireToken(instance)

                const response = await fetch(`${process.env.REACT_APP_API}/enrichment?IdTenant=${idTenant}`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json"
                    }
                })

                const data = await response.json()

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
            } catch (error) {
                console.error("Une erreur s'est produite lors de la requête :", error)
            }
        }

        setIsRestore(false)
        fetchData()
    }, [isRestore])

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
            clearErrors();

            const isValid = await schema.validate({
                parent: role,
                childs: keywords,
            }, { abortEarly: false });

            if (isValid) {
                if (isEditing !== undefined) {
                    const updatedAssociations = [...associationsRoleKeywords];
                    updatedAssociations[isEditing] = { parent: role, childs: keywords };
                    setAssociationsRoleKeywords(updatedAssociations);
                    setRole("");
                    setKeywords([""]);
                    setIsEditing(undefined);
                    setBackupAssociationsRoleKeywords([...backupAssociationsRoleKeywords, [...associationsRoleKeywords]]);
                } else {
                    setAssociationsRoleKeywords((prevAssociations) => {
                        const newAssociations = [...prevAssociations, { parent: role, childs: keywords }];
                        setBackupAssociationsRoleKeywords([...backupAssociationsRoleKeywords, [...newAssociations]]);
                        return newAssociations;
                    });
                    setRole("");
                    setKeywords([""]);
                }
            }
        } catch (validationError: any) {
            validationError.inner.forEach((error: { path: any; message: string }) => {
                setError(error.path, { type: 'manual', message: error.message });
            });
        }
    };

    const addRowPersonaRoles = async () => {
        try {
            clearErrors();

            const isValid = await schema.validate({
                parent: persona,
                childs: roles,
            }, { abortEarly: false });

            if (isValid) {
                if (isEditing !== undefined) {
                    const updatedAssociations = [...associationsPersonaRoles];
                    updatedAssociations[isEditing] = { parent: persona, childs: roles };
                    setAssociationsPersonaRoles(updatedAssociations);
                    setPersona("");
                    setRoles([""]);
                    setIsEditing(undefined);
                    setBackupAssociationsPersonaRoles([...backupAssociationsPersonaRoles, [...associationsPersonaRoles]]);
                } else {
                    setAssociationsPersonaRoles((prevAssociations) => {
                        const newAssociations = [...prevAssociations, { parent: persona, childs: roles }];
                        setBackupAssociationsPersonaRoles([...backupAssociationsPersonaRoles, [...newAssociations]]);
                        return newAssociations;
                    });
                    setPersona("");
                    setRoles([""]);
                }
            }
        } catch (validationError: any) {
            validationError.inner.forEach((error: { path: any; message: string }) => {
                setError(error.path, { type: 'manual', message: error.message });
            });
        }
    };

    const handleSubmit = async () => {
        setLoading(true)

        const fetchData = async () => {
            if (idTenant) {
                const parsedId = parseInt(idTenant, 10)

                const body = {
                    idTenant: parsedId,
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

                const response = await fetch(`${process.env.REACT_APP_API}/persona/save`, {
                    method: "POST",
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

    return (
        <Container maxWidth="lg">
            <Stack spacing={8} alignItems="center" marginTop="100px" marginBottom="100px">
                <Typography variant="h3">
                    DataHub
                </Typography>

                {loading ? <CircularProgress /> : <Stack spacing={8} alignItems="center" width="100%">
                    <OFormAssociation
                        parentLabel="Rôle"
                        childLabel="Mot clé"
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
                    />

                    <OFormAssociation
                        parentLabel="Persona"
                        childLabel="Rôle"
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
                    />
                </Stack>}
            </Stack>
        </Container>
    )
}

export default Form