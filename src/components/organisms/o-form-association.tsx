import { IconButton, MenuItem, Modal, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography, useMediaQuery } from "@mui/material"
import { useState } from "react"
import theme from "../../theme"
import { faTrash, faGear, faPlus, faXmark, faArrowRotateRight, faGripVertical, faFloppyDisk } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import AButton from "../atoms/a-button"
import { FieldErrors } from "react-hook-form"
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd"

const OFormAssociation = (props: {
    parentLabel: string
    childLabel: string
    buttonHidden: boolean
    parent: string
    childs: string[]
    roles?: { parent: string, childs: string[] }[]
    associations: { parent: string, childs: string[] }[]
    errors: FieldErrors<{ childs?: string[] | undefined; parent: string }>
    setIsRestore: (value: boolean) => void
    setAssociations: (associations: { parent: string; childs: string[] }[]) => void
    addChilds: () => void
    removeChilds: (indexToRemove: number) => void
    handleParentChange: (value: string) => void
    handleChildsChange: (index: number, value: string) => void
    editAssociations: (index: number) => void
    removeAssociations: (index: number) => void
    backUp: () => void
    addRow: () => void
    handleSubmit: () => void
    validate: () => void
}) => {

    const { parentLabel, childLabel, buttonHidden, parent, childs, roles, associations, errors, setIsRestore, setAssociations, addChilds, removeChilds, handleParentChange, handleChildsChange, editAssociations, removeAssociations, backUp, addRow, handleSubmit, validate } = props

    const isDesktop = useMediaQuery('(min-width:1000px)')

    const [hovered, setHovered] = useState<number>()
    const [indexToRemove, setIndexToRemove] = useState<number>()
    const [open, setOpen] = useState('')

    const remove = (index: number) => {
        setOpen('Delete')
        setIndexToRemove(index)
    }

    const handleClose = () => {
        setOpen('')
    }

    const valid = () => {
        if (open === 'Delete' && indexToRemove !== undefined) {
            removeAssociations(indexToRemove)
        } else if (open === 'Save') {
            handleSubmit()
            validate()
        } else {
            console.log("Une erreur est survenu dans la validation d'une action")
        }

        handleClose()
    }

    const handleDragEnd = (result: any) => {
        if (!result.destination) return

        const items = Array.from(associations)
        const [reorderedAssociations] = items.splice(result.source.index, 1)
        items.splice(result.destination.index, 0, reorderedAssociations)

        setAssociations(items)
    }

    return (
        <Stack spacing={8} alignItems="center" width="100%">
            <Stack spacing={4} direction={isDesktop ? "row" : "column"} width="100%">
                {!buttonHidden ? <Stack spacing={4} justifyContent="flex-end">
                    <AButton variant="outlined" color="error" onClick={() => setIsRestore(true)}>
                        Restaurer
                    </AButton>
                    <AButton variant="contained" onClick={() => setOpen('Save')}>
                        Sauvegarder
                    </AButton>
                </Stack> : null}

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
                        {parentLabel === "Persona" ? <TextField
                            select
                            label={parentLabel}
                            value={parent}
                            onChange={(e) => handleParentChange(e.target.value)}
                            helperText={errors.parent?.message}
                            sx={{
                                borderColor: errors.parent ? theme.palette.error.main : '#E0E0E0',
                                '& .MuiFormHelperText-root': {
                                    color: errors.parent ? theme.palette.error.main : 'inherit'
                                },
                                width: '100%'
                            }}
                        >
                            {associations?.map((association) => <MenuItem key={association.parent} value={association.parent}>
                                {association.parent}
                            </MenuItem>
                            )}
                        </TextField> : <TextField
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
                        />}

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
                            <FontAwesomeIcon icon={faFloppyDisk} color={theme.palette.text.primary} size="xs" />
                        </IconButton>

                        <IconButton
                            onClick={backUp}
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
                                onChange={(e) => handleChildsChange(index, e.target.value)}
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
                                {roles?.map((role) => <MenuItem key={role.parent} value={role.parent}>
                                    {role.parent}
                                </MenuItem>
                                )}
                            </TextField> : <TextField
                                id={`child-input-${index}`}
                                placeholder={childLabel}
                                value={value}
                                onChange={(e) => handleChildsChange(index, e.target.value)}
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
                                onClick={() => removeChilds(index)}
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
                                onClick={addChilds}
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
                                onClick={() => removeChilds(childs.length - 1)}
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

            <Stack width="100%">
                {associations.length > 0 && !(
                    associations[0].parent === "" &&
                    associations[0].childs[0] === ""
                ) && <DragDropContext onDragEnd={handleDragEnd}>
                        <Droppable droppableId="associations">
                            {provided =>
                                <Table
                                    component={Paper}
                                    sx={{ background: theme.palette.background.default }}
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                >
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
                                            <Draggable key={association.parent} draggableId={association.parent} index={index}>
                                                {provided =>
                                                    <TableRow
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        ref={provided.innerRef}
                                                    >
                                                        <TableCell>
                                                            <Stack spacing={2} direction="row" alignItems="center">
                                                                <FontAwesomeIcon icon={faGripVertical} />
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
                                                            </Stack>
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            <Stack
                                                                spacing={1}
                                                                direction={isDesktop ? "row" : "column"}
                                                                justifyContent="center"
                                                                alignItems="center"
                                                                width="100%"
                                                            >
                                                                {association.childs.map((keyWord, innerIndex) => <Stack key={innerIndex} spacing={1} direction="row">
                                                                    <Typography>
                                                                        {keyWord}
                                                                    </Typography>
                                                                    {isDesktop ? <Typography>
                                                                        {association.childs.length < 2 || association.childs.length - 1 === innerIndex ? null : "-"}
                                                                    </Typography> : null}
                                                                </Stack>)}
                                                            </Stack>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Stack direction="row" justifyContent="flex-end" alignItems="flex-end">
                                                                <IconButton
                                                                    onClick={() => editAssociations(index)}
                                                                    sx={{
                                                                        width: '50px',
                                                                        height: '50px'
                                                                    }}
                                                                >
                                                                    <FontAwesomeIcon icon={faGear} color={theme.palette.text.primary} />
                                                                </IconButton>

                                                                {parentLabel !== "Persona" ? <IconButton
                                                                    onClick={() => remove(index)}
                                                                    sx={{
                                                                        width: '50px',
                                                                        height: '50px'
                                                                    }}
                                                                >
                                                                    <FontAwesomeIcon icon={faTrash} color={theme.palette.error.main} />
                                                                </IconButton> : null}
                                                            </Stack>
                                                        </TableCell>
                                                    </TableRow>}
                                            </Draggable>
                                        )}
                                        {provided.placeholder}
                                    </TableBody>
                                </Table>
                            }
                        </Droppable>
                    </DragDropContext>
                }
            </Stack >

            <Modal open={open !== '' ? true : false} onClose={handleClose}>
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
                        onClick={handleClose}
                    >
                        <FontAwesomeIcon icon={faXmark} color={theme.palette.text.primary} />
                    </IconButton>
                    <Typography variant="h4">
                        Êtes vous sûr de vouloir réaliser cette action ? <br />
                        {open === 'Save' ? "Cela entraînera un chargement en fond" : null}
                    </Typography>

                    <Stack spacing={4} direction="row">
                        <AButton variant="outlined" color="error" onClick={handleClose}>
                            Annuler
                        </AButton>

                        <AButton variant="contained" onClick={valid}>
                            Confirmer
                        </AButton>
                    </Stack>
                </Stack>
            </Modal>
        </Stack >
    )
}

export default OFormAssociation