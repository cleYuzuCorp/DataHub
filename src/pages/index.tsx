import { faGear, faTrash, faXmark } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { CircularProgress, Container, IconButton, Modal, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from "@mui/material"
import theme from "../theme"
import AButton from "../components/atoms/a-button"
import { useState } from "react"
import { acquireToken } from "../App"
import { Customer } from "../interfaces/customer"

const CustomersAccounts = (props: { instance: any, customers: Customer[], setCustomers: (value: Customer[]) => void, loading: boolean }) => {

    const { instance, customers, setCustomers, loading } = props

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
        const accessToken = await acquireToken(instance)

        const payloadName = {
            NomClient: selectedCustomer?.NomClient
        }

        await fetch(`${process.env.REACT_APP_API}/tenant/${selectedCustomer?.IdTenant}`, {
            method: "PATCH",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payloadName)
        })

        setCustomers(customers.map((customer) =>
            customer.IdTenant === selectedCustomer?.IdTenant ? { ...customer, ...payloadName } : customer
        ) as Customer[])

        setOpen(false)
    }

    const addCustomers = () => {
        window.location.replace(process.env.REACT_APP_INSTALL_URL_HUBSPOT as string)
    }

    const deleteCustomer = async (id: number) => {
        const accessToken = await acquireToken(instance)

        const isConfirmed = window.confirm("Êtes-vous sûr de vouloir supprimer ce client ?")
        if (isConfirmed) {
            await fetch(`${process.env.REACT_APP_API}/tenant/delete`, {
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

                {loading ? <CircularProgress /> : <Stack spacing={8} width="100%">
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

                {selectedCustomer ? <Modal open={open} onClose={handleClose}>
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
                                boxShadow: '0px 4px 4px 0px rgba(0, 0, 0, 0.25)'
                            }}
                        />

                        <AButton variant="contained" onClick={editCustomer}>
                            Sauvegarder
                        </AButton>
                    </Stack>
                </Modal> : null}
            </Stack>
        </Container>
    )
}

export default CustomersAccounts