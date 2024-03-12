import { faRightFromBracket, faRightToBracket, faUser } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Stack, Typography } from "@mui/material"
import AAccordion from "../atoms/a-accordion"
import AHeaderSelect from "../atoms/a-header-select"
import { useEffect, useState } from "react"
import theme from "../../theme"
import { useNavigate } from "react-router-dom"
import { Customer } from "../../interfaces/customer"
import { acquireToken } from "../../App"

const THeader = (props: { instance?: any, customers: Customer[], setCustomers: (value: Customer[]) => void, setLoading: (value: boolean) => void }) => {

    const { instance, customers, setCustomers, setLoading } = props

    const navigate = useNavigate()

    const [hovered, setHovered] = useState("")
    const [interactionInProgress, setInteractionInProgress] = useState(false)
    const [active, setActive] = useState([""])
    const [account, setAccount] = useState()
    const [customersNames, setCustomersNames] = useState<Array<string>>()
    const [selectedCustomer, setSelectedCustomer] = useState<Customer>()

    useEffect(() => {
        const accounts = instance.getAllAccounts()
        if (accounts.length !== 0) {
            setAccount(accounts[0].name)
        }
    }, [customers])

    useEffect(() => {
        const names = customers.map((customer) => customer.NomClient as string)
        setCustomersNames(names)
    }, [customers])

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

                const response = await fetch(`${process.env.REACT_APP_API}/tenant/`, {
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
                console.log("Erreur:", error)
            }
        }

        fetchData()
    }, [instance])

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
        if (active.includes("Formulaire")) {
            navigate(`/persona/dashboard/form?id=${selectedCustomer?.IdTenant}`)
        } else if (active.includes("Données")) {
            navigate(`/persona/dashboard/data?id=${selectedCustomer?.IdTenant}`)
        } else if (active.includes("Initialement nul")) {
            navigate(`/persona/enrichissement/initially-null?id=${selectedCustomer?.IdTenant}`)
        } else if (active.includes("Modification trouvé")) {
            navigate(`/persona/enrichissement/change-found?id=${selectedCustomer?.IdTenant}`)
        } else if (active.includes("Aucune modification trouvé")) {
            navigate(`/persona/enrichissement/no-change-found?id=${selectedCustomer?.IdTenant}`)
        } else if (active.includes("Historique")) {
            navigate(`/persona/history?id=${selectedCustomer?.IdTenant}`)
        } else {
            navigate('/')
        }
    }, [active])

    const choices = [
        "Persona",
        "Secteur d'activité"
    ]

    const persona = [
        "Dashboard",
        "Enrichissement",
        "Historique"
    ]

    const dashboard = [
        "Formulaire",
        "Données"
    ]

    const enrichissement = [
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
                boxShadow: '0px 4px 10px 0px rgba(0, 0, 0, 0.25)'
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

                    {customersNames &&
                        <AAccordion title="Choix du client" values={customersNames} active={active} setActive={setActive} />
                    }
                </Stack>

                <Stack>
                    {customersNames && active.some(value => customersNames.includes(value)) &&
                        <AHeaderSelect values={choices} active={active} setActive={setActive} />
                    }
                    {active.includes("Persona") &&
                        <AHeaderSelect values={persona} active={active} setActive={setActive} />
                    }
                    {active.includes("Dashboard") &&
                        <AHeaderSelect values={dashboard} active={active} setActive={setActive} />
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
                    <Stack>
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
        </Stack>
    )
}

export default THeader