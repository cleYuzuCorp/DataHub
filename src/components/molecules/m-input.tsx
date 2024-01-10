import { IconButton, Stack, TextField } from "@mui/material"
import { useState } from "react"
import theme from "../../theme"
import { faPlus, faTrash, faXmark } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { UseFormClearErrors, FieldErrors } from "react-hook-form"

const MInput = (props: {
    parent: string,
    childs: string[],
    parentLabel: string,
    childLabel: string,
    setParent: (item: string) => void,
    setChilds: React.Dispatch<React.SetStateAction<string[]>>,
    errors: FieldErrors<{ childs?: string[] | undefined; parent: string }>,
    clearErrors: UseFormClearErrors<{ childs?: string[] | undefined; parent: string }>
}) => {

    const { parent, childs, parentLabel, childLabel, setParent, setChilds, errors, clearErrors } = props

    const [hovered, setHovered] = useState<number>()

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

    return (
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
                    <TextField
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
                    />
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
            </Stack>
        </Stack>
    )
}

export default MInput