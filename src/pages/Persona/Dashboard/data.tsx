import { Container, Stack, Typography } from "@mui/material"
import OData from "../../../components/organisms/o-data"

const Data = (props: { instance: any }) => {

    const { instance } = props

    return (
        <Container maxWidth="lg">
            <Stack spacing={8} alignItems="center" marginTop="100px" marginBottom="100px">
                <Typography variant="h3">
                    DataHub
                </Typography>
                <OData instance={instance} />
            </Stack>
        </Container>
    )
}

export default Data