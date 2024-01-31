import { IconButton, MenuItem, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography, useMediaQuery } from "@mui/material"
import { useEffect, useState } from "react"
import theme from "../../theme"
import { faTrash, faGear, faPlus, faXmark, faArrowRotateRight } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import AButton from "../atoms/a-button"
import * as yup from "yup"
import { yupResolver } from "@hookform/resolvers/yup"
import { useForm } from "react-hook-form"
import { acquireToken } from "../../App"
import { useLocation } from "react-router-dom"

const OFormAssociation = (props: { instance: any, parentLabel: string, childLabel: string }) => {

    const { instance, parentLabel, childLabel } = props

    const idTenant = new URLSearchParams(useLocation().search).get('id')

    const isDesktop = useMediaQuery('(min-width:1000px)')

    const [hovered, setHovered] = useState<number>()
    const [parent, setParent] = useState<string>("")
    const [childs, setChilds] = useState<Array<string>>([""])
    const [associations, setAssociations] = useState([{ parent: "", childs: [""] }])
    const [associationsBackUp, setAssociationsBackUp] = useState([[{ parent: "", childs: [""] }]])
    const [associationsRoleKeywords, setAssociationsRoleKeywords] = useState([{ parent: "", childs: [""] }])
    const [associationsPersonaRoles, setAssociationsPersonaRoles] = useState([{ parent: "", childs: [""] }])
    const [isEditing, setIsEditing] = useState<number>()

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
                await instance.initialize()
                const accessToken = await acquireToken(instance)

                const response = await fetch(`${process.env.REACT_APP_API_PERSONA}/persona/findAllAssociationsForTenant?IdTenant=${idTenant}`, {
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

                    const associationsRoleKeywordsData = Object.keys(data.rolesMotsClefs).map((roleKey) => {
                        return {
                            parent: roleKey,
                            childs: data.rolesMotsClefs[roleKey].MotsClefs.length !== 0 ? data.rolesMotsClefs[roleKey].MotsClefs : [""]
                        }
                    })

                    setAssociationsRoleKeywords(associationsRoleKeywordsData)

                    console.log(associationsRoleKeywordsData, 'a')
                }
            } catch (error) {
                console.error("Une erreur s'est produite lors de la requête :", error)
            }
        }

        fetchData()
    }, [])

    useEffect(() => {
        if (parentLabel === "Persona") {
            setAssociations(associationsPersonaRoles)
        } else {
            setAssociations(associationsRoleKeywords)
        }
    }, [associationsPersonaRoles, associationsRoleKeywords])

    const addChild = () => {
        setChilds((prevchilds) => [...prevchilds, ""])
        setTimeout(() => {
            const lastIndex = childs.length
            const lastInput = document.getElementById(`child-input-${lastIndex}`)
            lastInput && lastInput.focus()
        }, 0)
    }

    const removeChild = (indexToRemove: number) => {
        if (childs.length > 1) {
            const newchilds = childs.filter((_, index) => index !== indexToRemove)
            setChilds(newchilds)

            const focusedIndex = indexToRemove === 0 ? 0 : indexToRemove - 1
            const focusedInput = document.getElementById(`child-input-${focusedIndex}`)
            focusedInput && focusedInput.focus()
        } else {
            setChilds([""])
            const focusedInput = document.getElementById(`child-input-0`)
            focusedInput && focusedInput.focus()
        }
    }

    const handleParentChange = (value: string) => {
        if (parentLabel !== "Persona") {
            setParent(value)
            clearErrors('parent')
        }
    }

    const handleChildChange = (index: number, value: string) => {
        const newchilds = [...childs]
        newchilds[index] = value
        setChilds(newchilds)
        clearErrors(`childs[${index}` as keyof typeof errors)
    }

    const editAssociation = (index: number) => {
        setIsEditing(index)
        setParent(associations[index].parent)
        setChilds(associations[index].childs)
    }

    const removeAssociation = (index: number) => {
        const newAssociations = [...associations]
        newAssociations.splice(index, 1)
        setAssociations(newAssociations)
    }

    const backUpAssociations = () => {
        if (associations.length > 0) {
            const lastBackup = associationsBackUp[associationsBackUp.length - 1]
            setAssociations([...lastBackup])
            setAssociationsBackUp(associationsBackUp.slice(0, -1))
            setParent("")
            setChilds([""])
            setIsEditing(undefined)
        } else {
            setAssociations([{ parent: "", childs: [""] }])
        }
    }

    const addRow = async () => {
        try {
            clearErrors()

            const isValid = await schema.validate({
                parent: parent,
                childs: childs
            }, { abortEarly: false })

            if (isValid) {
                if (isEditing !== undefined) {
                    const updatedAssociations = [...associations]
                    updatedAssociations[isEditing] = { parent, childs }
                    setAssociationsBackUp([...associationsBackUp, [...associations]])
                    setAssociations(updatedAssociations)
                    setParent("")
                    setChilds([""])
                    setIsEditing(undefined)
                } else {
                    if (associations.length === 1 && associations[0].parent === "" && associations[0].childs[0] === "") {
                        setAssociations([{ parent: parent, childs: childs }, ...associations.slice(1)])
                        setParent("")
                        setChilds([""])
                    } else {
                        setAssociations([...associations, { parent: parent, childs: childs }])
                        setParent("")
                        setChilds([""])
                    }
                    setAssociationsBackUp([...associationsBackUp, JSON.parse(JSON.stringify(associations))])
                }
            }
        } catch (validationError: any) {
            validationError.inner.forEach((error: { path: any; message: string }) => {
                setError(error.path, { type: 'manual', message: error.message })
            })
        }
    }

    const handleSubmit = async () => {

        if (parentLabel === "Persona") {
            setAssociationsPersonaRoles(associations)
        } else {
            setAssociationsRoleKeywords(associations)
        }

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
                    }),
                }

                const accessToken = await acquireToken(instance)

                const response = await fetch(`${process.env.REACT_APP_API_PERSONA}/persona/save`, {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(body)
                })
            }
        }

        fetchData()
    }

    return (
        <Stack spacing={8} alignItems="center" width="100%">
            <Stack spacing={4} direction={isDesktop ? "row" : "column"} width="100%">
                <Stack spacing={4} justifyContent="flex-end">
                    <AButton variant="outlined" color="error" onClick={backUpAssociations}>
                        Restaurer
                    </AButton>
                    <AButton variant="contained" onClick={handleSubmit}>
                        Sauvegarder
                    </AButton>
                </Stack>

                <Stack width="100%" borderRadius="15px" sx={{ boxShadow: '0px 4px 4px 0px rgba(0, 0, 0, 0.25)' }}>
                    <Stack
                        spacing={2}
                        direction="row"
                        padding="16px"
                        borderRadius="15px"
                        sx={{
                            background: theme.palette.text.primary
                        }}
                    >
                        <TextField
                            fullWidth
                            placeholder={parentLabel}
                            value={parent}
                            onChange={(e) => handleParentChange(e.target.value)}
                            helperText={errors.parent?.message}
                            sx={{
                                borderColor: errors.parent ? theme.palette.error.main : '#E0E0E0',
                                '& .MuiFormHelperText-root': {
                                    color: errors.parent ? theme.palette.error.main : 'inherit'
                                }
                            }}
                        />

                        <IconButton
                            onClick={addRow}
                            sx={{
                                width: '50px',
                                height: '50px',
                                borderRadius: '10px',
                                background: theme.palette.primary.main,
                                transition: 'transform ease-in-out 0.2s',
                                ':hover': {
                                    background: theme.palette.primary.main,
                                    transform: 'scale(1.2)'
                                }
                            }}
                        >
                            <FontAwesomeIcon icon={faPlus} color={theme.palette.text.primary} size="xs" />
                        </IconButton>

                        <IconButton
                            onClick={backUpAssociations}
                            sx={{
                                width: '50px',
                                height: '50px',
                                borderRadius: '10px',
                                background: theme.palette.error.main,
                                transition: 'transform ease-in-out 0.4s',
                                ':hover': {
                                    background: theme.palette.error.main,
                                    transform: 'scale(1.2)'
                                }
                            }}
                        >
                            <FontAwesomeIcon icon={faArrowRotateRight} color={theme.palette.text.primary} size="xs" />
                        </IconButton>
                    </Stack>

                    <Stack direction="row" flexWrap="wrap" padding="5px">
                        {childs.map((value, index) => <Stack
                            key={index}
                            position='relative'
                            onMouseEnter={() => setHovered(index)}
                            onMouseLeave={() => setHovered(undefined)}
                            sx={{
                                transition: 'all ease-in-out 0.4s'
                            }}
                        >
                            {parentLabel === "Persona" ? <TextField
                                id={`child-input-${index}`}
                                select
                                label={childLabel}
                                value={value}
                                onChange={(e) => handleChildChange(index, e.target.value)}
                                helperText={errors.childs?.[index]?.message}
                                InputLabelProps={{
                                    style: { color: '#A8ACC0' }
                                }}
                                sx={{
                                    maxWidth: '120px',
                                    margin: '10px 10px 10px 10px',
                                    borderColor: errors.childs?.[index] ? theme.palette.error.main : '#E0E0E0',
                                    transition: 'all ease-in-out 0.4s',
                                    boxShadow: '0px 4px 4px 0px rgba(0, 0, 0, 0.25)',
                                    background: hovered === index ? theme.palette.secondary.light : null,
                                    '& .MuiFormHelperText-root': {
                                        color: errors.parent ? theme.palette.error.main : 'inherit'
                                    }
                                }}
                            >
                                <MenuItem value="test">test</MenuItem>
                            </TextField> : <TextField
                                id={`child-input-${index}`}
                                placeholder={childLabel}
                                value={value}
                                onChange={(e) => handleChildChange(index, e.target.value)}
                                helperText={errors.childs?.[index]?.message}
                                sx={{
                                    maxWidth: '120px',
                                    margin: '10px 10px 10px 10px',
                                    borderColor: errors.childs?.[index] ? theme.palette.error.main : '#E0E0E0',
                                    transition: 'all ease-in-out 0.4s',
                                    boxShadow: '0px 4px 4px 0px rgba(0, 0, 0, 0.25)',
                                    background: hovered === index ? theme.palette.secondary.light : null,
                                    '& .MuiFormHelperText-root': {
                                        color: errors.parent ? theme.palette.error.main : 'inherit'
                                    }
                                }}
                            />}

                            <Stack
                                onMouseEnter={() => setHovered(index)}
                                onMouseLeave={() => setHovered(undefined)}
                                onClick={() => removeChild(index)}
                                sx={{
                                    position: 'absolute',
                                    top: '5px',
                                    right: '5px',
                                    padding: '5px',
                                    borderRadius: '30px',
                                    transition: 'all ease-in-out 0.4s',
                                    background: theme.palette.background.default,
                                    boxShadow: '0px 4px 4px 0px rgba(0, 0, 0, 0.25)',
                                    cursor: 'pointer',
                                    opacity: hovered === index ? 1 : 0,
                                }}
                            >
                                <FontAwesomeIcon icon={faXmark} size="xs" />
                            </Stack>
                        </Stack>
                        )}

                        <Stack spacing={2} direction="row" padding="16px">
                            <IconButton
                                onClick={addChild}
                                sx={{
                                    width: '50px',
                                    height: '50px',
                                    borderRadius: '10px',
                                    background: theme.palette.primary.main,
                                    transition: 'transform ease-in-out 0.2s',
                                    ':hover': {
                                        background: theme.palette.primary.main,
                                        transform: 'scale(1.2)'
                                    }
                                }}
                            >
                                <FontAwesomeIcon icon={faPlus} color={theme.palette.text.primary} size="xs" />
                            </IconButton>

                            <IconButton
                                onClick={() => removeChild(childs.length - 1)}
                                sx={{
                                    width: '50px',
                                    height: '50px',
                                    borderRadius: '10px',
                                    background: theme.palette.error.main,
                                    transition: 'transform ease-in-out 0.4s',
                                    ':hover': {
                                        background: theme.palette.error.main,
                                        transform: 'scale(1.2)'
                                    }
                                }}
                            >
                                <FontAwesomeIcon icon={faTrash} color={theme.palette.text.primary} size="xs" />
                            </IconButton>
                        </Stack>
                    </Stack>
                </Stack>
            </Stack>

            {associations.length > 0 && !(
                associations[0].parent === "" &&
                associations[0].childs[0] === ""
            ) && <Table component={Paper} sx={{ background: theme.palette.background.default }}>
                    <TableHead sx={{ background: theme.palette.text.primary }}>
                        <TableRow>
                            <TableCell align="left">
                                <Typography variant="body2" color={theme.palette.background.default}>
                                    {parentLabel}
                                </Typography>
                            </TableCell>
                            <TableCell align="center">
                                <Typography variant="body2" color={theme.palette.background.default}>
                                    {childLabel}
                                </Typography>
                            </TableCell>
                            <TableCell align="right">
                                <Typography variant="body2" color={theme.palette.background.default}>
                                    Actions
                                </Typography>
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {associations.map((association, index) =>
                            <TableRow key={association.parent}>
                                <TableCell>
                                    <Typography
                                        fontSize="11px"
                                        textAlign="center"
                                        padding="10px"
                                        borderRadius="15px"
                                        sx={{
                                            width: isDesktop ? `${association.parent.length}ch` : "100%",
                                            background: theme.palette.secondary.light,
                                        }}
                                    >
                                        {association.parent}
                                    </Typography>
                                </TableCell>
                                <TableCell align="center">
                                    <Stack
                                        spacing={1}
                                        direction={isDesktop ? "row" : "column"}
                                        justifyContent="center"
                                        alignItems="center"
                                        width="100%"
                                    >
                                        {association.childs.map((keyWord, index) => <Stack spacing={1} direction="row">
                                            <Typography>
                                                {keyWord}
                                            </Typography>
                                            {isDesktop ? <Typography>
                                                {association.childs.length < 2 || association.childs.length - 1 === index ? null : "-"}
                                            </Typography> : null}
                                        </Stack>)}
                                    </Stack>
                                </TableCell>
                                <TableCell>
                                    <Stack direction="row" justifyContent="flex-end" alignItems="flex-end">
                                        <IconButton
                                            onClick={() => editAssociation(index)}
                                            sx={{
                                                width: '50px',
                                                height: '50px'
                                            }}
                                        >
                                            <FontAwesomeIcon icon={faGear} color={theme.palette.text.primary} />
                                        </IconButton>

                                        {parentLabel !== "Persona" ? <IconButton
                                            onClick={() => removeAssociation(index)}
                                            sx={{
                                                width: '50px',
                                                height: '50px'
                                            }}
                                        >
                                            <FontAwesomeIcon icon={faTrash} color={theme.palette.error.main} />
                                        </IconButton> : null}
                                    </Stack>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>}
        </Stack>
    )
}

export default OFormAssociation