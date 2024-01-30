import { Container, Stack, Typography } from "@mui/material"
import OFormAssociation from "../../../components/organisms/o-form-association"
import OData from "../../../components/organisms/o-data"

const AssociationRoleKeywords = (props: { instance: any }) => {

    const { instance } = props

    return (
        <Container maxWidth="lg">
            <Stack spacing={8} alignItems="center" marginTop="100px" marginBottom="100px">
                <Typography variant="h3">
                    DataHub
                </Typography>
                <OData />
                <OFormAssociation instance={instance} parentLabel="Rôle" childLabel="Mot clé" />
            </Stack>
        </Container>
    )
}

export default AssociationRoleKeywords