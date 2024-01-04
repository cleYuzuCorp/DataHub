import { faRightToBracket, faUser } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Stack, Typography } from "@mui/material"
import AAccordion from "../atoms/a-accordion"
import AHeaderSelect from "../atoms/a-header-select"
import { useEffect, useMemo, useState } from "react"
import theme from "../../theme"
import { useNavigate } from "react-router-dom"
import { EventType, LogLevel, PublicClientApplication } from "@azure/msal-browser"

const THeader = () => {

    const navigate = useNavigate()

    const [hovered, setHovered] = useState("")
    const [active, setActive] = useState([""])

    const clientid = '8bbbed94-f29e-4371-a35e-1be5ab9b127a'
    const tid = '38f7ed09-cbe6-415b-aea9-9f74c54f0c18'
    const mslInstanceConfig = useMemo(() => {
        return {
            auth: {
                clientId: clientid,
                authority: `https://login.microsoftonline.com/${tid}`,
                redirectUri: "/",
                postLogoutRedirectUri: "/",
                navigateToLoginRequestUrl: false
            },
            cache: {
                cacheLocation: "localStorage",
                storeAuthStateInCookie: false
            },
            system: {
                loggerOptions: {
                    loggerCallback: (level: any, message: any, containsPii: any) => {
                        if (containsPii) {
                            return
                        }
                        switch (level) {
                            case LogLevel.Error:
                                console.error(message)
                                return
                            case LogLevel.Info:
                                return
                            case LogLevel.Verbose:
                                console.debug(message)
                                return
                            case LogLevel.Warning:
                                console.warn(message)
                                return
                            default:
                                return
                        }
                    }
                }
            }
        }
    }, [])

    const mslInstance = new PublicClientApplication(mslInstanceConfig)

    const initializeMsal = async () => {
        await mslInstance.initialize()
        await mslInstance.handleRedirectPromise();

        if (!mslInstance.getActiveAccount() && mslInstance.getAllAccounts().length > 0) {
            mslInstance.setActiveAccount(mslInstance.getAllAccounts()[0]);
        }
        mslInstance.addEventCallback((event) => {
            if (event.eventType === EventType.LOGIN_SUCCESS && event.payload && 'account' in event.payload && event.payload.account !== undefined) {
                const account = event.payload.account;
                mslInstance.setActiveAccount(account);
            }
        });
    };

    useEffect(() => {
        initializeMsal()
    }, []);

    const handleSubmit = async () => {

        const loginRequest = {
            scopes: ["openid", "user.read"],
        }
        const accounts = mslInstance.getAllAccounts();
        if (accounts.length === 0) {
            await mslInstance.loginRedirect({ ...loginRequest, prompt: "select_account" }).catch((error: any) => console.log(error))
        }
    }

    useEffect(() => {
        if (active.includes("Dashboard")) {
            navigate('persona/dashboard')
        } else if (active.includes("Enrichissement")) {
            navigate('persona/enrichissement')
        } else if (active.includes("Historique")) {
            navigate('persona/historique')
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