import { Stack, Typography, ThemeProvider, Container } from "@mui/material"
import theme from "../theme"
import THeader from "../components/templates/t-header"

const Home = () => {

    return (
        <ThemeProvider theme={theme}>
            <Stack direction="row">
                <THeader />

                <Container maxWidth="lg">
                    <Stack alignItems="center" marginTop="150px" marginBottom="150px">
                        <Typography variant="h1" sx={{ color: theme.palette.text.primary }}>
                            Bienvenue sur DataHub !
                        </Typography>
                    </Stack>
                </Container>
            </Stack>
        </ThemeProvider>
    )
}

export default Home