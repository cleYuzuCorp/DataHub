import { faGear, faTrash, faXmark } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Container, IconButton, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from "@mui/material"
import theme from "../theme"
import AButton from "../components/atoms/a-button"
import { useEffect, useState } from "react"
import { acquireToken } from "../App"
import { Customer } from "../interfaces/customer"
import { Modal } from "@mui/base"

const CustomersAccounts = (props: { instance: any }) => {

    const { instance } = props

    const [open, setOpen] = useState(false)
    const [customers, setCustomers] = useState<Customer[]>([])
    const [selectedCustomer, setSelectedCustomer] = useState<Customer>()

    useEffect(() => {
        const fetchData = async () => {
            try {
                await instance.initialize()
                const accessToken = await acquireToken(instance)

                const response = await fetch(`${process.env.REACT_APP_API_URL}/tenant/getAll`, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                    },
                })

                const responseData = await response.json()
                if (responseData.statusCode !== 401) {
                    setCustomers(responseData)
                }
            } catch (error) {
                console.log("Erreur:", error)
            }
        }

        fetchData()
    }, [instance])

    const handleOpen = (customer: Customer) => {
        setSelectedCustomer(customer)
        setOpen(true)
    }

    const handleClose = () => {
        setOpen(false)
    }

    const addCustomers = () => {
        window.location.replace(process.env.REACT_APP_INSTALL_URL_HUBSPOT as string)
    }

    const deleteCustomer = async (id: number) => {
        const accessToken = await acquireToken(instance)

        const isConfirmed = window.confirm("Êtes-vous sûr de vouloir supprimer ce client ?")
        if (isConfirmed) {
            await fetch(`${process.env.react_app_api_url}/tenant/delete`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ IdTenant: id }),
            })
            const newClients = customers.filter((customer) => customer.IdTenant !== id)
            setCustomers(newClients)
        }
    }

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
                            {customers.map((customer) =>
                                <TableRow key={customer.IdTenant}>
                                    <TableCell>
                                        <Typography
                                            fontSize="11px"
                                            textAlign="center"
                                            padding="10px"
                                            borderRadius="15px"
                                            sx={{
                                                width: `${customer.IdTenant.toString().length}ch`,
                                                background: theme.palette.secondary.light
                                            }}
                                        >
                                            {customer.IdTenant}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Typography>
                                            {customer.NomClient}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Stack spacing={1} direction="row" justifyContent="flex-end">
                                            <IconButton
                                                onClick={() => handleOpen(customer)}
                                                sx={{
                                                    width: '50px',
                                                    height: '50px'
                                                }}
                                            >
                                                <FontAwesomeIcon icon={faGear} color={theme.palette.text.primary} />
                                            </IconButton>

                                            <IconButton
                                                onClick={() => deleteCustomer(customer.IdTenant)}
                                                sx={{
                                                    width: '50px',
                                                    height: '50px'
                                                }}
                                            >
                                                <FontAwesomeIcon icon={faTrash} color={theme.palette.error.main} />
                                            </IconButton>
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    <AButton variant="outlined" size="large" onClick={addCustomers}>
                        +
                    </AButton>
                </Stack>

                <Modal open={open} onClose={handleClose}>
                    <Stack
                        spacing={2}
                        sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            border: 'none',
                            background: theme.palette.background.default,
                            padding: '20px'
                        }}
                    >
                        <FontAwesomeIcon
                            icon={faXmark}
                            size="lg"
                            style={{
                                position: 'absolute',
                                top: '10px',
                                right: '10px',
                                cursor: 'pointer',
                                color: theme.palette.text.primary
                            }}
                            onClick={handleClose}
                        />
                        <Typography variant="h4">
                            Informations du client
                        </Typography>

                        <TextField
                            required
                            placeholder="Nom"
                            value={selectedCustomer?.IdTenant}
                            sx={{
                                borderColor: '#E0E0E0',
                                boxShadow: '0px 4px 4px 0px rgba(0, 0, 0, 0.25)'
                            }}
                        />

                        <TextField
                            required
                            placeholder="Intitulé de poste interne"
                            value={selectedCustomer?.IntitulePoste_NomInterne}
                            sx={{
                                borderColor: '#E0E0E0',
                                boxShadow: '0px 4px 4px 0px rgba(0, 0, 0, 0.25)'
                            }}
                        />

                        <TextField
                            required
                            placeholder="Nom du persona interne"
                            value={selectedCustomer?.Persona_NomInterne}
                            sx={{
                                borderColor: '#E0E0E0',
                                boxShadow: '0px 4px 4px 0px rgba(0, 0, 0, 0.25)'
                            }}
                        />

                        <AButton variant="contained">
                            Sauvegarder
                        </AButton>
                    </Stack>
                </Modal>
            </Stack>
        </Container>
    )
}

export default CustomersAccounts