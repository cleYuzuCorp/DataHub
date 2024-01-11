import { IconButton, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography, useMediaQuery } from "@mui/material"
import { useState } from "react"
import theme from "../../theme"
import { faTrash, faGear } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import AButton from "../atoms/a-button"
import MInput from "../molecules/m-input"
import * as yup from "yup"
import { yupResolver } from "@hookform/resolvers/yup"
import { useForm } from "react-hook-form"

const OFormAssociation = (props: { parentLabel: string, childLabel: string }) => {

    const { parentLabel, childLabel } = props

    const isDesktop = useMediaQuery('(min-width:1000px)')

    const [parent, setParent] = useState<string>("")
    const [childs, setChilds] = useState<Array<string>>([""])
    const [associations, setAssociations] = useState([{ parent: "", childs: [""] }])
    const [associationsBackUp, setAssociationsBackUp] = useState([[{ parent: "", childs: [""] }]])
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

    const restoreAssociations = () => {
        if (associationsBackUp.length > 0) {
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

    const handleSubmit = async () => {
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

    return (
        <Stack spacing={8} alignItems="center" width="100%">
            <Stack spacing={4} direction={isDesktop ? "row" : "column"} width="100%">
                <Stack spacing={4}>
                    <AButton variant="outlined">
                        Charger les données
                    </AButton>
                    <AButton variant="outlined" color="error" onClick={restoreAssociations}>
                        Restaurer
                    </AButton>
                    <AButton variant="contained" onClick={handleSubmit}>
                        Sauvegarder
                    </AButton>
                </Stack>

                <MInput
                    parent={parent}
                    childs={childs}
                    parentLabel={parentLabel}
                    childLabel={childLabel}
                    setParent={setParent}
                    setChilds={setChilds}
                    errors={errors}
                    clearErrors={clearErrors}
                />
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
                                    <Stack direction={isDesktop ? "row" : "column"} justifyContent="flex-end" alignItems="flex-end">
                                        <IconButton
                                            onClick={() => editAssociation(index)}
                                            sx={{
                                                width: '50px',
                                                height: '50px'
                                            }}
                                        >
                                            <FontAwesomeIcon icon={faGear} color={theme.palette.text.primary} />
                                        </IconButton>

                                        <IconButton
                                            onClick={() => removeAssociation(index)}
                                            sx={{
                                                width: '50px',
                                                height: '50px'
                                            }}
                                        >
                                            <FontAwesomeIcon icon={faTrash} color={theme.palette.error.main} />
                                        </IconButton>
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