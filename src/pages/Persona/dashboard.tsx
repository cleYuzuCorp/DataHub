import { Container, Stack } from "@mui/material"
import OFormAssociation from "../../components/organisms/o-form-association"

const AHeaderSelect = () => {

    return (
        <Container maxWidth="lg">
            <Stack spacing={8} marginTop="100px" marginBottom="100px">
                <OFormAssociation parentLabel="Rôle" childLabel="Mot clé" />
            </Stack>
        </Container >
    )
}

export default AHeaderSelect