import { Container, IconButton, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from "@mui/material"
import { useRef, useState } from "react"
import theme from "../../theme"
import AButton from "../../components/atoms/a-button"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faGear, faPlus, faTrash, faXmark } from "@fortawesome/free-solid-svg-icons"

const AHeaderSelect = () => {

    const [hovered, setHovered] = useState<number>()
    const [role, setRole] = useState("")
    const [keyWords, setKeyWords] = useState([""])
    const [associations, setAssociations] = useState([{ role: "", keyWords: [""] }])

    const keywordInputRef = useRef<HTMLInputElement>(null);

    const addTextField = () => {
        setKeyWords([...keyWords, ""])
        keywordInputRef?.current?.focus()
    }

    const removeTextField = (indexToRemove: number) => {
        if (keyWords.length > 1) {
            const newKeywords = keyWords.filter((_, index) => index !== indexToRemove)
            setKeyWords(newKeywords)
        } else {
            setKeyWords([""])
        }
    }

    const handleKeywordChange = (index: number, value: string) => {
        const newKeywords = [...keyWords]
        newKeywords[index] = value
        setKeyWords(newKeywords)
    }

    const handleSubmit = () => {
        if (associations.length === 1 && associations[0].role === "" && associations[0].keyWords[0] === "") {
            setAssociations([{ role: role, keyWords: keyWords }, ...associations.slice(1)])
            setRole("")
            setKeyWords([""])
        } else {
            setAssociations([...associations, { role: role, keyWords: keyWords }])
            setRole("")
            setKeyWords([""])
        }
    }


    return (
        <Container maxWidth="lg">
            <Stack spacing={8} alignItems="center" width="100%" marginTop="100px" marginBottom="100px">
                <Stack spacing={4} direction="row" width="100%">
                    <Stack spacing={4}>
                        <AButton variant="outlined">
                            Charger les données
                        </AButton>
                        <AButton variant="outlined" color="error">
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
                                placeholder="Rôle"
                                inputRef={keywordInputRef}
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                            />

                            <IconButton
                                onClick={addTextField}
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
                                onClick={() => removeTextField(keyWords.length - 1)}
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
                            {keyWords.map((value, index) => <Stack
                                position='relative'
                                onMouseEnter={() => setHovered(index)}
                                onMouseLeave={() => setHovered(undefined)}
                                sx={{
                                    transition: 'all ease-in-out 0.4s'
                                }}
                            >
                                <TextField
                                    key={index}
                                    placeholder="mot clé"
                                    value={value}
                                    onChange={(e) => handleKeywordChange(index, e.target.value)}
                                    sx={{
                                        maxWidth: '120px',
                                        margin: '10px 10px 10px 10px',
                                        border: '1px solid #E0E0E0',
                                        transition: 'all ease-in-out 0.4s',
                                        boxShadow: '0px 4px 4px 0px rgba(0, 0, 0, 0.25)',
                                        background: hovered === index ? theme.palette.secondary.light : null
                                    }}
                                />
                                <Stack
                                    onMouseEnter={() => setHovered(index)}
                                    onMouseLeave={() => setHovered(undefined)}
                                    onClick={() => removeTextField(index)}
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
                </Stack>

                {associations.length > 0 && !(
                    associations[0].role === "" &&
                    associations[0].keyWords[0] === ""
                ) && <Table component={Paper} sx={{ background: theme.palette.background.default }}>
                        <TableHead sx={{ background: theme.palette.text.primary }}>
                            <TableRow>
                                <TableCell align="left">
                                    <Typography variant="body2" color={theme.palette.background.default}>
                                        Rôles
                                    </Typography>
                                </TableCell>
                                <TableCell align="center">
                                    <Typography variant="body2" color={theme.palette.background.default}>
                                        Mots clés
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
                            {associations.map((association) =>
                                <TableRow key={association.role}>
                                    <TableCell>
                                        <Typography
                                            fontSize="11px"
                                            textAlign="center"
                                            padding="10px"
                                            borderRadius="15px"
                                            sx={{
                                                width: `${association.role.length}ch`,
                                                background: theme.palette.secondary.light
                                            }}
                                        >
                                            {association.role}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Stack spacing={1} direction="row" justifyContent="center">
                                            {association.keyWords.map((keyWord, index) => <Stack spacing={1} direction="row">
                                                <Typography>
                                                    {keyWord}
                                                </Typography>

                                                <Typography>
                                                    {association.keyWords.length < 2 || association.keyWords.length - 1 === index ? null : "-"}
                                                </Typography>
                                            </Stack>)}
                                        </Stack>
                                    </TableCell>
                                    <TableCell>
                                        <Stack spacing={1} direction="row" justifyContent="flex-end">
                                            <IconButton sx={{ width: '50px', height: '50px' }}>
                                                <FontAwesomeIcon icon={faGear} color={theme.palette.text.primary} />
                                            </IconButton>

                                            <IconButton sx={{ width: '50px', height: '50px' }}>
                                                <FontAwesomeIcon icon={faTrash} color={theme.palette.error.main} />
                                            </IconButton>
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>}
            </Stack>
        </Container >
    )
}

export default AHeaderSelect