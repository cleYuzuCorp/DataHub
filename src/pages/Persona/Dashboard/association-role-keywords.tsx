import { Container, Stack } from "@mui/material"
import OFormAssociation from "../../../components/organisms/o-form-association"
import OData from "../../../components/organisms/o-data"

const AssociationRoleKeywords = () => {

    return (
        <Container maxWidth="lg">
            <Stack spacing={8} alignItems="center" marginTop="100px" marginBottom="100px">
                <OData />
                <OFormAssociation parentLabel="Rôle" childLabel="Mot clé" />
            </Stack>
        </Container>
    )
}

export default AssociationRoleKeywords