import { faGear, faTrash } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Container, IconButton, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material"
import theme from "../theme"
import AButton from "../components/atoms/a-button"
import { useEffect, useState } from "react"
import { useMsal } from "@azure/msal-react"
import { acquireToken } from "../App"

const CustomersAccounts = (props: { instance: any }) => {

    const { instance } = props

    const [customers, setCustomers] = useState([])

    // useEffect(() => {
    //     const fetchData = async () => {
    //         try {
    //             await instance.initialize()
    //             const accessToken = await acquireToken(instance)

    //             const response = await fetch(`${process.env.REACT_APP_API_URL}/tenant/getAll`, {
    //                 headers: {
    //                     Authorization: `Bearer ${accessToken}`,
    //                     "Content-Type": "application/json",
    //                 },
    //             });

    //             const responseData = await response.json()
    //             if (responseData.statusCode !== 401) {
    //                 setCustomers(responseData)
    //             }
    //         } catch (error) {
    //             console.log("Erreur:", error)
    //         }
    //     };

    //     fetchData()
    // }, [instance])

    console.log(customers, 'c')

    const rows = [
        {
            id: "6950252",
            name: "YuzuCorp"
        },
        {
            id: "143179667",
            name: "Compte de Thomas"
        },
        {
            id: "143266797",
            name: "DataHub test"
        }
    ]

    return (
        <Container maxWidth="lg">
            <Stack spacing={8} alignItems="center" width="100%" marginTop="100px" marginBottom="100px">
                <Typography variant="h3">
                    DataHub
                </Typography>

                <Stack spacing={2} width="100%">
                    <Table component={Paper} sx={{ background: theme.palette.background.default }}>
                        <TableHead sx={{ background: theme.palette.text.primary }}>
                            <TableRow>
                                <TableCell align="left">
                                    <Typography variant="body2" color={theme.palette.background.default}>
                                        Id du tenant
                                    </Typography>
                                </TableCell>
                                <TableCell align="center">
                                    <Typography variant="body2" color={theme.palette.background.default}>
                                        Nom
                                    </Typography>
                                </TableCell>
                                <TableCell align="right">
                                    <Typography variant="body2" color={theme.palette.background.default}>
                                        Actions
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rows.map((row) =>
                                <TableRow key={row.id}>
                                    <TableCell>
                                        <Typography
                                            fontSize="11px"
                                            textAlign="center"
                                            padding="10px"
                                            borderRadius="15px"
                                            sx={{
                                                width: `${row.id.length}ch`,
                                                background: theme.palette.secondary.light
                                            }}
                                        >
                                            {row.id}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Typography>
                                            {row.name}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Stack spacing={1} direction="row" justifyContent="flex-end">
                                            <IconButton sx={{ width: '50px', height: '50px' }}>
                                                <FontAwesomeIcon icon={faGear} color={theme.palette.text.primary} />
                                            </IconButton>

                                            <IconButton sx={{ width: '50px', height: '50px' }}>
                                                <FontAwesomeIcon icon={faTrash} color={theme.palette.error.main} />
                                            </IconButton>
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    <AButton variant="outlined" size="large">
                        +
                    </AButton>
                </Stack>
            </Stack>
        </Container>
    )
}

export default CustomersAccounts