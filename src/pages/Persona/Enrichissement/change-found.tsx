import { CircularProgress, Container, Stack, Typography } from "@mui/material"
import OTableEnrichment from "../../../components/organisms/o-table-enrichment"
import { useLocation } from "react-router-dom"
import { Contact } from "../../../interfaces/contact"

const ChangeFound = (props: {
    instance: any
    loading: boolean
    dbPersona: { description: string, value: string }[]
    changeFound: Contact[]
}) => {

    const { instance, loading, dbPersona, changeFound } = props

    const idTenant = new URLSearchParams(useLocation().search).get('id')

    return (
        <Container maxWidth="lg">
            <Stack spacing={8} alignItems="center" marginTop="100px" marginBottom="100px">
                <Typography variant="h3">
                    DataHub
                </Typography>

                {loading ? <CircularProgress /> : <OTableEnrichment instance={instance} id={idTenant} contacts={changeFound} dbPersona={dbPersona} />}
            </Stack>
        </Container>
    )
}

export default ChangeFound