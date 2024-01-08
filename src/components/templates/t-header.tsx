import { faRightToBracket, faUser } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Stack, Typography } from "@mui/material"
import AAccordion from "../atoms/a-accordion"
import AHeaderSelect from "../atoms/a-header-select"
import { useEffect, useState } from "react"
import theme from "../../theme"
import { useNavigate } from "react-router-dom"

const THeader = (props: { instance?: any }) => {

    const { instance } = props

    const navigate = useNavigate()

    const [hovered, setHovered] = useState("")
    const [active, setActive] = useState([""])

    const handleSubmit = async () => {

        const loginRequest = {
            scopes: ["openid", "user.read"],
        }
        const accounts = instance.getAllAccounts()
        console.log(accounts)
        if (accounts.length === 0) {
            await instance.loginRedirect({ ...loginRequest, prompt: "select_account" }).catch((error: any) => console.log(error))
        }
    }

    useEffect(() => {
        if (active.includes("customers accounts")) {
            navigate('/comptes-clients')
        } else if (active.includes("Dashboard")) {
            navigate('/persona/dashboard')
        } else if (active.includes("Enrichissement")) {
            navigate('/persona/enrichissement')
        } else if (active.includes("Historique")) {
            navigate('/persona/historique')
        }
    }, [active])

    const customers = [
        "Compte de Thomas",
        "DataHub test",
        "YuzuCorp"
    ]

    const softwares = [
        "Hubspot"
    ]

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
        "Association rôle - mot clés",
        "Association persona - rôle"
    ]

    const enrichissement = [
        "Initialement nul",
        "Modification trouvé",
        "Aucune modification trouvé"
    ]

    return (
        <Stack
            alignItems="center"
            maxWidth="200px"
            minWidth="200px"
            width="100%"
            overflow="hidden"
            flex='1 1 100%'
            height="100vh"
            sx={{
                boxShadow: '0px 4px 10px 0px rgba(0, 0, 0, 0.25)'
            }}
        >
            <img
                src="images/logo/logo_yuzu.png"
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

                    <AAccordion title="Choix du client" values={customers} active={active} setActive={setActive} />
                    {active.some(value => customers.includes(value)) &&
                        <AAccordion title="Logiciel" values={softwares} active={active} setActive={setActive} />
                    }
                </Stack>

                <Stack>
                    {active.some(value => softwares.includes(value)) &&
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
                paddingBottom="50px"
                onClick={handleSubmit}
                sx={{
                    cursor: 'pointer'
                }}
            >
                <FontAwesomeIcon icon={faRightToBracket} />
                <Typography>
                    Sign In
                </Typography>
            </Stack>
        </Stack>
    )
}

export default THeader