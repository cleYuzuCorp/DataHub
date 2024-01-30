import { Container, Stack, Typography } from "@mui/material"
import OFormAssociation from "../../../components/organisms/o-form-association"

const AssociationPersonaRole = (props: { instance: any }) => {

    const { instance } = props

    return (
        <Container maxWidth="lg">
            <Stack spacing={8} alignItems="center" marginTop="100px" marginBottom="100px">
                <Typography variant="h3">
                    DataHub
                </Typography>
                <OFormAssociation instance={instance} parentLabel="Persona" childLabel="Role" />
            </Stack>
        </Container>
    )
}

export default AssociationPersonaRole