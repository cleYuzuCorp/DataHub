import { faFileExcel } from "@fortawesome/free-solid-svg-icons"
import { faFolderOpen } from "@fortawesome/free-regular-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Button, Divider, LinearProgress, Stack, Typography } from "@mui/material"
import theme from "../../theme"
import AButton from "../atoms/a-button"
import { useEffect, useState } from "react"
import { IconProp } from "@fortawesome/fontawesome-svg-core"

const MFileUpload = (props: { file: File | undefined, setFile: (value: File | undefined) => void, request: () => void }) => {

    const { file, setFile, request } = props

    const [hovered, setHovered] = useState(false)
    const [dragging, setDragging] = useState(false)
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        setProgress(0)

        const timer = setInterval(() => {
            setProgress((oldProgress) => {
                const diff = Math.random() * 10
                return Math.min(oldProgress + diff, 100)
            })
        }, 100)

        return () => {
            clearInterval(timer)
        }
    }, [file])

    const handleDragOver = (event: any) => {
        event.preventDefault()
        setDragging(true)
    }

    const handleDragLeave = (event: any) => {
        event.preventDefault()
        setDragging(false)
    }

    const handleDrop = (event: any) => {
        event.preventDefault()

        const droppedFile = event.dataTransfer.files[0]

        if (droppedFile) {
            const formData = new FormData()
            formData.append('file', droppedFile)
            setFile(droppedFile)
        }

        setDragging(false)
    }

    const handleFileChange = async (event: any) => {
        const selectedFile = event.target.files ? event.target.files[0] : null
        setFile(selectedFile)
    }

    return (
        <Stack spacing={2} alignItems="center" onDragLeave={handleDragLeave}>
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
                    transform: dragging ? 'scale(1.1) rotateX(30deg)' : 'scale(1) rotateX(0)',
                    transition: 'transform 0.5s ease-in-out',
                }}
            >
                <Stack>
                    <FontAwesomeIcon icon={faFolderOpen as IconProp} size='4x' color={theme.palette.text.primary} style={{ zIndex: 2 }} />
                    <FontAwesomeIcon
                        icon={faFileExcel}
                        size='2x'
                        color="#1C6C40"
                        style={{
                            position: 'absolute',
                            left: '50%',
                            top: '22%',
                            opacity: file || dragging ? 1 : 0,
                            transform: dragging ? 'translate(-50%, -250%)' : file ? 'translate(-50%, -85%)' : 'translate(-50%, -250%)',
                            transition: 'opacity 0.5s ease-in-out, transform 0.5s ease-in-out'
                        }}
                    />
                </Stack>

                <Typography>
                    Glisser et déposer votre document excel ici <br />
                    ou cliquez sur ce bouton pour l’upload
                </Typography>

                <Stack spacing={2} direction="row" alignItems="center">
                    <Divider orientation="vertical" sx={{ border: '1px solid', borderColor: '#C1C1C1', width: '75px' }} />

                    <Typography color="#C1C1C1">
                        OU
                    </Typography>

                    <Divider orientation="vertical" sx={{ border: '1px solid', borderColor: '#C1C1C1', width: '75px' }} />
                </Stack>

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

                        <AButton variant='contained' size='small' onClick={request}>
                            Confirmer
                        </AButton>
                    </Stack>}
            </Stack> : null}
        </Stack>
    )
}

export default MFileUpload