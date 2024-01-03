import { Stack, Typography, ThemeProvider, Container } from "@mui/material"
import theme from "../theme"

const Home = () => {

    return (
        <ThemeProvider theme={theme}>
            <Container maxWidth="xl">
                <Stack alignItems="center" marginTop="150px" marginBottom="150px">
                    <Typography variant="h1" sx={{ color: theme.palette.text.primary }}>
                        Bienvenue sur la DataHub !
                    </Typography>
                </Stack>
            </Container>
        </ThemeProvider>
    )
}

export default Home