import { Container, Stack, Typography } from "@mui/material"
import OFormAssociation from "../../../components/organisms/o-form-association"

const AssociationPersonaRole = () => {

    return (
        <Container maxWidth="lg">
            <Stack spacing={8} alignItems="center" marginTop="100px" marginBottom="100px">
                <Typography variant="h3">
                    DataHub
                </Typography>
                <OFormAssociation parentLabel="Persona" childLabel="Role" />
            </Stack>
        </Container>
    )
}

export default AssociationPersonaRole