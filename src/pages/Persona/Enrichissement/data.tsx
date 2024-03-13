import { Container, Stack, Typography } from "@mui/material"
import OData from "../../../components/organisms/o-data"
import { JobTitle } from "../../../interfaces/job-title"

const Data = (props: {
    instance: any
    loading: boolean
    numberContacts: number
    numberRoles: number
    numberPersonas: number
    roles: JobTitle[]
    personas: JobTitle[]
    links: JobTitle[]
}) => {

    const { instance, loading, numberContacts, numberRoles, numberPersonas, roles, personas, links } = props

    return (
        <Container maxWidth="lg">
            <Stack spacing={8} alignItems="center" marginTop="100px" marginBottom="100px">
                <Typography variant="h3">
                    DataHub
                </Typography>
                <OData
                    instance={instance}
                    loading={loading}
                    numberContacts={numberContacts}
                    numberRoles={numberRoles}
                    numberPersonas={numberPersonas}
                    roles={roles}
                    personas={personas}
                    links={links}
                />
            </Stack>
        </Container>
    )
}

export default Data