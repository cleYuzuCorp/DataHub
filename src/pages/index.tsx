import { Stack, Container, Typography } from "@mui/material"

const Home = () => {

    return (
        <Container maxWidth="md">
            <Stack alignItems="center" marginTop="100px" marginBottom="100px">
                <Typography variant="h3">
                    Bienvenue sur Datahub !
                </Typography>
            </Stack>
        </Container>
    )
}

export default Home