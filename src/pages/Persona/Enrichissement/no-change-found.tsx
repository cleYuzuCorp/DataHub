import { CircularProgress, Container, Stack, Typography } from "@mui/material"
import OTableEnrichment from "../../../components/organisms/o-table-enrichment"
import { useLocation } from "react-router-dom"
import { Contact } from "../../../interfaces/contact"

const NoChangeFound = (props: {
    instance: any
    loading: boolean
    dbPersona: { description: string, value: string }[]
    noChangeFound: Contact[]
}) => {

    const { instance, loading, dbPersona, noChangeFound } = props

    const idTenant = new URLSearchParams(useLocation().search).get('id')

    return (
        <Container maxWidth="lg">
            <Stack spacing={8} alignItems="center" marginTop="100px" marginBottom="100px">
                <Typography variant="h3">
                    DataHub
                </Typography>

                {loading ? <CircularProgress /> : <OTableEnrichment instance={instance} id={idTenant} contacts={noChangeFound} dbPersona={dbPersona} nothing={true} />}
            </Stack>
        </Container>
    )
}

export default NoChangeFound