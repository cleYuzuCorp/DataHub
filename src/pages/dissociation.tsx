import { Alert, Container, Snackbar, Stack, Typography } from "@mui/material"
import { useLocation } from 'react-router-dom'
import MFileUpload from "../components/molecules/m-file-upload"
import { useEffect, useState } from "react"
import * as yup from "yup"
import { yupResolver } from "@hookform/resolvers/yup"
import * as XLSX from 'xlsx'
import { useForm } from "react-hook-form"
import theme from "../theme"

const Dissociation = () => {
    const idTenant = new URLSearchParams(useLocation().search).get('id')

    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)
    const [progress, setProgress] = useState(0)
    const [file, setFile] = useState<File>()

    const schema = yup.object().shape({
        data: yup.mixed().default('Une erreur est survenu')
    })

    const { clearErrors, setError, formState: { errors } } = useForm({
        resolver: yupResolver(schema),
    })

    const loadData = async () => {
        try {
            clearErrors('data')
            setLoading(true)

            if (file && idTenant) {
                const formData = new FormData()
                formData.append("file", file)
                formData.append("IdTenant", idTenant)

                let temp = 0
                const interval = 100
                const totalTime = 8000

                const progressIncrement = (interval / totalTime) * 100

                const timer = setInterval(() => {
                    if (temp < 90) {
                        temp += progressIncrement;
                        setProgress(Math.min(temp, 100))
                    } else {
                        clearInterval(timer)
                    }
                }, interval)

                const response = await fetch(`${process.env.REACT_APP_API}/dissociation`, {
                    method: "POST",
                    body: formData,
                })

                if (!response.ok) {
                    clearInterval(timer)
                    setProgress(100)
                    const errorData = await response.json()
                    setError('data', { message: errorData.message })
                    setLoading(false)
                    setOpen(true)

                    return
                }

                clearInterval(timer)
                setProgress(100)

                const data = await response.json()
                console.log(data)

                setLoading(false)
                setOpen(true)
            }
        } catch (error) {
            console.error("Error uploading file:", error)
        }
    }

    useEffect(() => {
        if (file) {
            loadData()
        }
    }, [file])

    return (
        <Container maxWidth="lg">
            <Stack spacing={8} alignItems="center" marginTop="100px" marginBottom="100px">
                <Typography variant="h3">
                    DataHub - Dissociation
                </Typography>

                <MFileUpload progress={progress} file={file} setFile={setFile} />

                {errors.data?.message ? <Snackbar
                    open={open}
                    onClose={() => setOpen(false)}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                >
                    <Alert
                        onClose={() => setOpen(false)}
                        severity="error"
                        variant="filled"
                    >
                        {errors.data.message}
                    </Alert>
                </Snackbar> : <Snackbar
                    open={open}
                    onClose={() => setOpen(false)}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                >
                    <Alert
                        onClose={() => setOpen(false)}
                        severity="success"
                        variant="filled"
                    >
                        Fichier traité avec succès !
                    </Alert>
                </Snackbar>}
            </Stack>
        </Container>
    )
}

export default Dissociation