import { Container, Stack, Typography } from "@mui/material"
import OTableEnrichment from "../../../components/organisms/o-table-enrichment"

const InitiallyNull = () => {

    const contacts = [
        {
            jobTitle: "SalesPerson",
            proposedPersona: "manager",
            appearances: 1,
            hsObjectId: 1,
            firstName: "Maria",
            lastName: "Jonhson"
        },
        {
            jobTitle: "Directeur commericial",
            proposedPersona: "directeur",
            appearances: 1,
            hsObjectId: 1,
            firstName: "Maria",
            lastName: "Jonhson"
        },
        {
            jobTitle: "Sales & Marketing Director",
            proposedPersona: "manager",
            appearances: 1,
            hsObjectId: 1,
            firstName: "Maria",
            lastName: "Jonhson"
        },
        {
            jobTitle: "svp sales & strategy",
            proposedPersona: "manager",
            appearances: 1,
            hsObjectId: 1,
            firstName: "Maria",
            lastName: "Jonhson"
        },
        {
            jobTitle: "pdg",
            proposedPersona: "pdg",
            appearances: 1,
            hsObjectId: 1,
            firstName: "Maria",
            lastName: "Jonhson"
        },
    ]

    return (
        <Container maxWidth="lg">
            <Stack spacing={8} alignItems="center" marginTop="100px" marginBottom="100px">
                <Typography variant="h3">
                    DataHub
                </Typography>

                <OTableEnrichment contacts={contacts} />
            </Stack>
        </Container>
    )
}

export default InitiallyNull