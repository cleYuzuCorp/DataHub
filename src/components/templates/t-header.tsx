import { faRightFromBracket, faRightToBracket, faUser, faXmark } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { IconButton, Modal, Stack, Typography } from "@mui/material"
import AAccordion from "../atoms/a-accordion"
import AHeaderSelect from "../atoms/a-header-select"
import { useEffect, useState } from "react"
import theme from "../../theme"
import { useNavigate } from "react-router-dom"
import { Customer } from "../../interfaces/customer"
import { acquireToken } from "../../App"
import AButton from "../atoms/a-button"

const THeader = (props: {
    instance?: any
    account: any
    setAccount: (value: any) => void
    customers: Customer[]
    setCustomers: (value: Customer[]) => void
    open: boolean
    setOpen: (value: boolean) => void
    active: string[]
    setActive: (value: string[]) => void
    dataLoading: { customerName: string; isLoading: boolean }[]
    setDataLoading: (value: { customerName: string; isLoading: boolean }[]) => void
    selectedCustomer: Customer | undefined
    setSelectedCustomer: (value: Customer | undefined) => void
    setLoading: (value: boolean) => void
    validate: () => void
}) => {

    const { instance, account, setAccount, customers, setCustomers, open, setOpen, active, setActive, dataLoading, setDataLoading, selectedCustomer, setSelectedCustomer, setLoading, validate } = props

    const navigate = useNavigate()

    const [hovered, setHovered] = useState("")
    const [interactionInProgress, setInteractionInProgress] = useState(false)
    const [graphData, setGraphData] = useState<string>()
    const [customersNames, setCustomersNames] = useState<Array<string>>()

    const handleOpen = () => {
        const loadingCustomer = dataLoading.find(item => item.customerName === selectedCustomer?.NomClient)
        if (!loadingCustomer || !loadingCustomer.isLoading) {
            setOpen(true)
        }
    }

    const handleClose = () => {
        setActive(active.map(value => value === "Enrichissement" ? "Settings" : value))
        setOpen(false)
    }

    const handleSignIn = async () => {
        const loginRequest = {
            scopes: ["openid", "user.read"],
        }
        const accounts = instance.getAllAccounts()
        if (accounts.length === 0) {
            await instance.loginRedirect({ ...loginRequest, prompt: "select_account" }).catch((error: any) => console.log(error))
        }

        setAccount(accounts[0].name)
    }

    const handleSignOut = async () => {
        if (interactionInProgress) return
        setInteractionInProgress(true)
        try {
            await instance.logoutRedirect()
        } catch (error) {
            console.error(error)
        } finally {
            setInteractionInProgress(false)
        }
    }

    useEffect(() => {
        const fetchData = async () => {
            const accounts = instance.getAllAccounts()
            if (accounts.length !== 0) {
                setAccount(accounts[0].name)

                // await instance.initialize()
                // const accessToken = await acquireToken(instance)
                // fetch("https://graph.microsoft.com/v1.0/me/photo/$value", {
                //     headers: {
                //         Authorization: `Bearer ${accessToken}`,
                //     },
                //     method: "GET",
                // })
                //     .then((response) => response.arrayBuffer())
                //     .then((data) => {
                //         const blob = new Blob([new Uint8Array(data)], { type: "image/jpeg" })
                //         const reader = new FileReader()
                //         reader.readAsDataURL(blob)
                //         reader.onloadend = function () {
                //             const img = new Image()
                //             if (typeof reader.result === 'string') {
                //                 img.src = reader.result
                //             }
                //             img.onload = () => {
                //                 const canvas = document.createElement("canvas")
                //                 const ctx = canvas.getContext("2d")
                //                 const maxWidth = 100
                //                 const maxHeight = 100
                //                 let width = img.width
                //                 let height = img.height

                //                 if (width > height) {
                //                     if (width > maxWidth) {
                //                         height *= maxWidth / width
                //                         width = maxWidth
                //                     }
                //                 } else {
                //                     if (height > maxHeight) {
                //                         width *= maxHeight / height
                //                         height = maxHeight
                //                     }
                //                 }

                //                 canvas.width = width
                //                 canvas.height = height
                //                 if (ctx) {
                //                     ctx.drawImage(img, 0, 0, width, height)
                //                 }

                //                 const resizedImage = canvas.toDataURL("image/jpeg")
                //                 setGraphData(resizedImage)
                //             }
                //         }
                //     })
                //     .catch((error) => {
                //         console.log(error)
                //     })
            }
        }

        fetchData()
    }, [account])

    useEffect(() => {
        const names = customers.map((customer) => customer.NomClient as string)
        setCustomersNames(names)
    }, [customers])

    useEffect(() => {
        if (customersNames) {
            const data = customersNames.map(name => ({ customerName: name, isLoading: false }))
            setDataLoading(data)
        }
    }, [customersNames])

    useEffect(() => {
        const foundCustomer = customers.find(customer => active.includes(customer.NomClient as string))

        setSelectedCustomer(foundCustomer)
    }, [active, customers])

    useEffect(() => {
        setLoading(true)

        const fetchData = async () => {
            try {
                await instance.initialize()
                const accessToken = await acquireToken(instance)
                const response = await fetch(`${process.env.REACT_APP_API}/tenant`, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                    },
                })

                const responseData = await response.json()

                if (responseData.statusCode !== 401) {
                    setCustomers(responseData)
                }

                setLoading(false)
            } catch (error) {
                setTimeout(() => { fetchData() }, 10000)

            }
        }

        fetchData()
    }, [instance])

    useEffect(() => {
        const fetchNav = async () => {
            if (active.includes("Persona")) {
                if (active.includes("Settings") && selectedCustomer) {
                    navigate(`/persona/settings?id=${selectedCustomer.IdTenant}`)
                } else if (active.includes("Historique") && selectedCustomer) {
                    navigate(`/persona/history?id=${selectedCustomer.IdTenant}`)
                } else if (active.includes("Enrichissement") && (!selectedCustomer || !dataLoading.find(item => item.customerName === selectedCustomer.NomClient)?.isLoading)) {
                    handleOpen()
                } else if (active.includes("Données") && selectedCustomer) {
                    navigate(`/persona/enrichissement/data?id=${selectedCustomer.IdTenant}`)
                } else if (active.includes("Initialement nul") && selectedCustomer) {
                    navigate(`/persona/enrichissement/initially-null?id=${selectedCustomer.IdTenant}`)
                } else if (active.includes("Modification trouvée") && selectedCustomer) {
                    navigate(`/persona/enrichissement/change-found?id=${selectedCustomer.IdTenant}`)
                } else if (active.includes("Aucune modification trouvée") && selectedCustomer) {
                    navigate(`/persona/enrichissement/no-change-found?id=${selectedCustomer.IdTenant}`)
                } else {
                    navigate('/')
                }
            } /* else if (active.includes("Maison Mère")) {
                if (active.includes("Settings") && selectedCustomer) {
                    navigate(`/maison-mere/settings?id=${selectedCustomer.IdTenant}`)
                } else if (active.includes("Historique") && selectedCustomer) {
                    navigate(`/maison-mere/history?id=${selectedCustomer.IdTenant}`)
                } else if (active.includes("Enrichissement") && (!selectedCustomer || !dataLoading.find(item => item.customerName === selectedCustomer.NomClient)?.isLoading)) {
                    handleOpen()
                } else if (active.includes("Données") && selectedCustomer) {
                    navigate(`/maison-mere/enrichissement/data?id=${selectedCustomer.IdTenant}`)
                } else if (active.includes("Initialement nul") && selectedCustomer) {
                    navigate(`/maison-mere/enrichissement/initially-null?id=${selectedCustomer.IdTenant}`)
                } else if (active.includes("Modification trouvée") && selectedCustomer) {
                    navigate(`/maison-mere/enrichissement/change-found?id=${selectedCustomer.IdTenant}`)
                } else if (active.includes("Aucune modification trouvée") && selectedCustomer) {
                    navigate(`/maison-mere/enrichissement/no-change-found?id=${selectedCustomer.IdTenant}`)
                } else {
                    navigate('/')
                }
            } */ else if (active.includes("Aide à l'import") && selectedCustomer) {
                navigate(`/import-assistance/form?id=${selectedCustomer.IdTenant}`)
            } else if (active.includes("Formatage") && selectedCustomer) {
                navigate(`/formatting?id=${selectedCustomer.IdTenant}`)
            } else {
                navigate('/')
            }
        }

        fetchNav()
    }, [active, selectedCustomer])

    const choices = [
        "Persona",
        "Maison Mère",
        "Aide à l'import",
        "Formatage"
    ]

    const persona = [
        "Settings",
        "Enrichissement",
        "Historique"
    ]

    const enrichissement = [
        "Données",
        "Initialement nul",
        "Modification trouvée",
        "Aucune modification trouvée"
    ]

    return (
        <Stack
            alignItems="center"
            maxWidth="200px"
            minWidth="200px"
            width="100%"
            overflow="hidden"
            flex="1 1 100%"
            minHeight="100vh"
            flexGrow={1}
            sx={{
                background: theme.palette.background.default,
                boxShadow: '0px 4px 10px 0px rgba(0, 0, 0, 0.25)',
                overflowY: 'auto'
            }}
        >
            <img
                src={process.env.PUBLIC_URL + "/images/logo/logo_yuzu.png"}
                alt="Logo"
                style={{
                    width: '100px',
                    position: 'absolute',
                    top: '5px',
                    left: '5px'
                }}
            />
            <Stack alignItems="center" height="100%" paddingTop="100px">
                <Stack paddingBottom="17px" overflow="hidden">
                    <Stack
                        spacing={2}
                        direction="row"
                        alignItems="center"
                        padding='15px 20px 15px 30px'
                        onMouseEnter={() => setHovered("customers accounts")}
                        onMouseLeave={() => setHovered("")}
                        onClick={() => setActive(["customers accounts"])}
                        sx={{
                            cursor: 'pointer',
                            background: active.includes("customers accounts") || hovered === "customers accounts" ? theme.palette.secondary.light : 'none'
                        }}
                    >
                        <FontAwesomeIcon icon={faUser} />
                        <Typography>
                            Comptes clients
                        </Typography>
                    </Stack>

                    {customersNames && account &&
                        <AAccordion title="Choix du client" values={customersNames} active={active} setActive={setActive} />
                    }
                </Stack>

                <Stack>
                    {customersNames && active.some(value => customersNames.includes(value)) &&
                        <AHeaderSelect values={choices} active={active} setActive={setActive} />
                    }
                    {(active.includes("Persona") /*|| active.includes("Maison Mère")*/) &&
                        <AHeaderSelect values={persona} active={active} setActive={setActive} />
                    }
                    {active.includes("Enrichissement") &&
                        <AHeaderSelect values={enrichissement} active={active} setActive={setActive} />
                    }
                </Stack>
            </Stack>

            <Stack
                spacing={1}
                direction="row"
                alignItems="center"
                paddingTop="50px"
                paddingBottom="50px"
                sx={{
                    cursor: 'pointer'
                }}
            >
                {account ? <Stack spacing={2} alignItems="center">
                    <Stack spacing={1} direction="row" alignItems="center">
                        {/*<img src={graphData} alt="Profile" style={{ borderRadius: "50%", width: "50px", height: "50px" }} />*/}

                        <Typography>
                            {account}
                        </Typography>
                    </Stack>

                    <Stack spacing={1} direction="row" alignItems="center" onClick={handleSignOut}>
                        <FontAwesomeIcon icon={faRightFromBracket} color={theme.palette.text.primary} />
                        <Typography>
                            Sign Out
                        </Typography>
                    </Stack>
                </Stack> : <Stack spacing={1} direction="row" alignItems="center" onClick={handleSignIn}>
                    <FontAwesomeIcon icon={faRightToBracket} color={theme.palette.text.primary} />
                    <Typography>
                        Sign In
                    </Typography>
                </Stack>}
            </Stack>

            <Modal open={open} onClose={handleClose}>
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
                        En vous dirigeant ici cela va lancer un chargement en fond, êtes vous sûr ?
                    </Typography>

                    <Stack spacing={4} direction="row">
                        <AButton variant="outlined" color="error" onClick={handleClose}>
                            Annuler
                        </AButton>

                        <AButton variant="contained" onClick={validate}>
                            Confirmer
                        </AButton>
                    </Stack>
                </Stack>
            </Modal>
        </Stack>
    )
}

export default THeader