import { Container, Stack } from "@mui/material"
import OFormAssociation from "../../../components/organisms/o-form-association"

const AssociationPersonaRole = () => {

    return (
        <Container maxWidth="lg">
            <Stack spacing={8} marginTop="100px" marginBottom="100px">
                <OFormAssociation parentLabel="Persona" childLabel="Role" />
            </Stack>
        </Container>
    )
}

export default AssociationPersonaRole