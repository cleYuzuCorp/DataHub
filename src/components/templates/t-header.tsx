import { faRightFromBracket, faRightToBracket, faUser, faXmark } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { IconButton, Modal, Stack, TextField, Typography } from "@mui/material"
import AAccordion from "../atoms/a-accordion"
import AHeaderSelect from "../atoms/a-header-select"
import { useEffect, useState } from "react"
import theme from "../../theme"
import { useNavigate } from "react-router-dom"
import { Customer } from "../../interfaces/customer"
import { acquireToken } from "../../App"
import { JobTitle } from "../../interfaces/job-title"
import { Contact } from "../../interfaces/contact"
import AButton from "../atoms/a-button"

const THeader = (props: {
    instance?: any,
    customers: Customer[]
    setCustomers: (value: Customer[]) => void
    setLoading: (value: boolean) => void
    dbPersona: { description: string, value: string }[]
    setDbPersona: (value: { description: string, value: string }[]) => void
    associationsRoleKeywords: { parent: string, childs: string[] }[]
    setAssociationsRoleKeywords: (value: { parent: string, childs: string[] }[]) => void
    associationsPersonaRoles: { parent: string, childs: { id: number, value: string }[] }[]
    setAssociationsPersonaRoles: (value: { parent: string, childs: { id: number, value: string }[] }[]) => void
    setNumberContacts: (value: number) => void
    setNumberRoles: (value: number) => void
    setNumberPersonas: (value: number) => void
    setRoles: (value: JobTitle[]) => void
    setPersonas: (value: JobTitle[]) => void
    setLinks: (value: JobTitle[]) => void
    setInitiallyNull: (value: [Contact]) => void
    setChangeFound: (value: Contact[]) => void
    setNoChangeFound: (value: Contact[]) => void
}) => {

    const { instance, customers, setCustomers, setLoading, dbPersona, setDbPersona, associationsRoleKeywords, setAssociationsRoleKeywords, associationsPersonaRoles, setAssociationsPersonaRoles, setNumberContacts, setNumberRoles, setNumberPersonas, setRoles, setPersonas, setLinks, setInitiallyNull, setChangeFound, setNoChangeFound } = props

    const navigate = useNavigate()

    const [hovered, setHovered] = useState("")
    const [open, setOpen] = useState(false)
    const [dataInit, setDataInit] = useState(false)
    const [interactionInProgress, setInteractionInProgress] = useState(false)
    const [active, setActive] = useState([""])
    const [account, setAccount] = useState()
    const [customersNames, setCustomersNames] = useState<Array<string>>()
    const [selectedCustomer, setSelectedCustomer] = useState<Customer>()

    const handleOpen = () => {
        if (dataInit === false) {
            setOpen(true)
        }
    }

    const handleClose = () => {
        setActive((prevActive) => prevActive.filter((value) => value !== "Enrichissement"))
        setOpen(false)
    }

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

    const validate = () => {
        setOpen(false)
        setLoading(true)

        const fetchData = async () => {
            try {
                await instance.initialize()
                const accessToken = await acquireToken(instance)

                const response = await fetch(`${process.env.REACT_APP_API}/proposition-persona/associations-settings?IdTenant=${selectedCustomer?.IdTenant}`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json"
                    }
                })

                const data = await response.json()

                if (data.personasRoles || data.rolesMotsClefs || data.dbPersona) {
                    const associationsPersonaRolesData = Object.keys(data.personasRoles).map((personaKey) => {
                        return {
                            parent: personaKey,
                            childs: data.personasRoles[personaKey].Roles.map((role: any, rolesIndex: number) => ({
                                id: rolesIndex + 1,
                                value: role,
                            }))
                        }
                    })

                    setAssociationsPersonaRoles(associationsPersonaRolesData)

                    const associationsRoleKeywordsData = Object.keys(data.rolesMotsClefs).map((roleKey) => {
                        return {
                            parent: roleKey,
                            childs: data.rolesMotsClefs[roleKey].MotsClefs.length !== 0 ? data.rolesMotsClefs[roleKey].MotsClefs : [""]
                        }
                    })

                    setAssociationsRoleKeywords(associationsRoleKeywordsData)

                    const personas = data.dbPersona.map((persona: { description: string, value: string }) => {
                        return {
                            description: persona.description,
                            value: persona.value
                        }
                    })

                    setDbPersona(personas)

                    setDataInit(true)
                    setLoading(false)
                }

            } catch (error) {
                console.error("Une erreur s'est produite lors de la requête :", error)
            }
        }

        fetchData()
    }

    useEffect(() => {
        setLoading(true)

        const fetchData = async () => {
            if (selectedCustomer?.IdTenant && dataInit) {
                const parsedId = selectedCustomer?.IdTenant

                const body = {
                    idTenant: parsedId,
                    dbPersona: dbPersona,
                    associationsRoleMotClef: associationsRoleKeywords.map((roleKeywords) => {
                        if (roleKeywords.parent !== "" && roleKeywords.childs.every((child) => child !== "")) {
                            return {
                                NomRole: roleKeywords.parent,
                                NomMotClef: roleKeywords.childs,
                            }
                        } else {
                            return undefined
                        }
                    }).filter((association) => association !== undefined),
                    associationsPersonaRole: associationsPersonaRoles.map((personaRoles) => {
                        if (personaRoles.parent !== "" && personaRoles.childs.every((child) => child.value !== "")) {
                            return {
                                NomPersona: personaRoles.parent,
                                NomRole: personaRoles.childs,
                            }
                        } else {
                            return undefined
                        }
                    }).filter((association) => association !== undefined)
                }

                const accessToken = await acquireToken(instance)

                const response = await fetch(`${process.env.REACT_APP_API}/proposition-persona/process`, {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(body)
                })

                const data = await response.json()

                setNumberContacts(data.dashboard.totalOfDifferentContacts)
                setNumberRoles(data.dashboard.totalOfDifferentRoles)
                setNumberPersonas(data.dashboard.totalOfDifferentPersonas)

                setInitiallyNull(data.enrichment.contactsWithProposedPersonaAndNull)
                setChangeFound(data.enrichment.contactsWithProposedPersonaAndValue)
                setNoChangeFound(data.enrichment.contactsWithoutProposedPersona)

                const rolesData = Object.entries(data.dashboard.occurencesByRoles).map(([jobTitle, occurences]) => ({
                    jobTitle: jobTitle as string,
                    occurences: occurences as number
                }))

                setRoles(rolesData)

                const personasData = Object.entries(data.dashboard.occurencesByPersonas).map(([jobTitle, occurences]) => ({
                    jobTitle: jobTitle as string,
                    occurences: occurences as number
                }))

                setPersonas(personasData)

                const linksData = Object.entries(data.dashboard.occurencesByLiaisons).map(([jobTitle, occurences]) => ({
                    jobTitle: jobTitle as string,
                    occurences: occurences as number
                }))

                setLinks(linksData)
                setLoading(false)
            }
        }

        fetchData()
    }, [dataInit])

    useEffect(() => {
        if (active.includes("Dashboard")) {
            navigate(`/persona/dashboard?id=${selectedCustomer?.IdTenant}`)
        } else if (active.includes("Données")) {
            navigate(`/persona/enrichissement/data?id=${selectedCustomer?.IdTenant}`)
        } else if (active.includes("Initialement nul")) {
            navigate(`/persona/enrichissement/initially-null?id=${selectedCustomer?.IdTenant}`)
        } else if (active.includes("Modification trouvée")) {
            navigate(`/persona/enrichissement/change-found?id=${selectedCustomer?.IdTenant}`)
        } else if (active.includes("Aucune modification trouvée")) {
            navigate(`/persona/enrichissement/no-change-found?id=${selectedCustomer?.IdTenant}`)
        } else if (active.includes("Historique")) {
            navigate(`/persona/history?id=${selectedCustomer?.IdTenant}`)
        } else if (active.includes("Enrichissement")) {
            handleOpen()
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