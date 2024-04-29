import { Container, Stack, Typography } from "@mui/material"
import { useLocation } from 'react-router-dom'
import MFileUpload from "../components/molecules/m-file-upload"
import { useState } from "react"

const Dissociation = () => {
    const idTenant = new URLSearchParams(useLocation().search).get('id')

    const [file, setFile] = useState<File>()

    const loadData = async () => {
        try {
            if (!idTenant || !file) {
                console.error("No file selected")
                return
            }


            const formData = new FormData()
            formData.append("file", file)
            formData.append("IdTenant", idTenant)

            const url = "http://localhost:3001/dissociation"

            const response = await fetch(url, {
                method: "POST",
                body: formData,
            })

            const data = await response.json()
            console.log(data)

        } catch (error) {
            console.error("Error uploading file:", error)
        }
    }

    return (
        <Container maxWidth="lg">
            <Stack spacing={8} alignItems="center" marginTop="100px" marginBottom="100px">
                <Typography variant="h3">
                    DataHub - Dissociation
                </Typography>

                <MFileUpload file={file} setFile={setFile} request={loadData} />
            </Stack>
        </Container>
    )
}

export default Dissociation