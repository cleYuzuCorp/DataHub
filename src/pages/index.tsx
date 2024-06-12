import { faGear, faTrash, faXmark } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { CircularProgress, Container, IconButton, Modal, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from "@mui/material"
import theme from "../hooks/theme"
import AButton from "../components/atoms/a-button"
import { useState } from "react"
import { acquireToken } from "../App"
import { Customer } from "../interfaces/customer"
import useNotification from "../hooks/use-notification"
import ANotification from "../components/atoms/a-notifications"
import { fetchData } from "../components/api"
import endpoints from "../hooks/endpoints"

const CustomersAccounts = (props: { instance: any, account: any, customers: Customer[], setCustomers: (value: Customer[]) => void, loading: boolean }) => {

    const { instance, account, customers, setCustomers, loading } = props

    const { notification, showNotification, closeNotification } = useNotification()

    const [open, setOpen] = useState(false)
    const [selectedCustomer, setSelectedCustomer] = useState<Customer>()

    const handleOpen = (customer: Customer) => {
        setSelectedCustomer(customer)
        setOpen(true)
    }

    const handleClose = () => {
        setOpen(false)
    }

    const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target

        setSelectedCustomer((prevCustomer: Customer | undefined) => {
            if (prevCustomer) {
                return {
                    ...prevCustomer,
                    [name]: value,
                }
            }
            return prevCustomer
        })
    }

    const editCustomer = async () => {
        try {
            if (selectedCustomer) {
                const accessToken = await acquireToken(instance)

                const payloadName = {
                    NomClient: selectedCustomer.NomClient
                }

                const { data, error } = await fetchData(endpoints.tenant.patch(selectedCustomer.IdTenant), {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json"
                    },
                    data: JSON.stringify(payloadName)
                })

                if (error) {
                    showNotification(`Une erreur s'est produite lors de la requête : ${error}`, 'error')
                } else if (data) {
                    showNotification("Client modifié avec succès !", 'success')
                    setCustomers(customers.map((customer) =>
                        customer.IdTenant === selectedCustomer.IdTenant ? { ...customer, ...payloadName } : customer
                    ) as Customer[])

                    setOpen(false)
                }
            }
        } catch (error) {
            showNotification(`Une erreur s'est produite lors de la requête : ${error}`, 'error')
        }
    }

    const addCustomers = () => {
        window.location.replace(process.env.REACT_APP_INSTALL_URL_HUBSPOT as string)
    }

    const deleteCustomer = async (id: number) => {
        try {
            const accessToken = await acquireToken(instance)

            const isConfirmed = window.confirm("Êtes-vous sûr de vouloir supprimer ce client ?")

            if (isConfirmed) {
                const { data, error } = await fetchData(endpoints.tenant.delete(id), {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                    }
                })

                if (error) {
                    showNotification(`Une erreur s'est produite lors de la requête : ${error}`, 'error')
                } else if (data) {
                    showNotification("Client supprimé avec succès !", 'success')
                    const newClients = customers.filter((customer) => customer.IdTenant !== id)
                    setCustomers(newClients)
                }
            }
        } catch (error) {
            showNotification(`Une erreur s'est produite lors de la requête : ${error}`, 'error')
        }
    }

    return (
        <Container maxWidth="lg">
            <Stack spacing={8} alignItems="center" width="100%" marginTop="100px" marginBottom="100px">
                <Typography variant="h3">
                    DataHub
                </Typography>

                <ANotification
                    open={notification.open}
                    message={notification.message}
                    severity={notification.severity}
                    onClose={closeNotification}
                />

                {!account ? <Typography textAlign="center">
                    Veuillez vous connectez pour accéder aux services de l'application.
                </Typography> : loading ? <Stack spacing={2} alignItems="center">
                    <CircularProgress />
                    <Typography textAlign="center">
                        Réveil de tous les services <br />
                        Merci de patienter...
                    </Typography>
                </Stack> : <Stack spacing={8} width="100%">
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
                                                    width: `${customer.IdTenant ? customer.IdTenant.toString().length : 0}ch`,
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
                </Stack>}

                {selectedCustomer && <Modal open={open} onClose={handleClose}>
                    <Stack
                        spacing={4}
                        alignItems="center"
                        sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            borderRadius: '15px',
                            background: theme.palette.background.default,
                            padding: '30px 50px 30px 50px'
                        }}
                    >
                        <IconButton
                            sx={{
                                position: 'absolute',
                                top: '10px',
                                right: '10px',
                                width: '40px',
                                height: '40px'
                            }}
                            onClick={handleClose}
                        >
                            <FontAwesomeIcon icon={faXmark} color={theme.palette.text.primary} />
                        </IconButton>
                        <Typography variant="h4">
                            Informations du client
                        </Typography>

                        <TextField
                            required
                            placeholder="Nom"
                            name="NomClient"
                            value={selectedCustomer.NomClient}
                            onChange={handleNameChange}
                            sx={{
                                borderColor: '#E0E0E0',
                                background: theme.palette.background.default,
                                boxShadow: '0px 4px 4px 0px rgba(0, 0, 0, 0.25)'
                            }}
                        />

                        <AButton variant="contained" onClick={editCustomer}>
                            Sauvegarder
                        </AButton>
                    </Stack>
                </Modal>}
            </Stack>
        </Container>
    )
}

export default CustomersAccounts