import { faChevronDown, faUser } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Accordion, AccordionDetails, AccordionSummary, Stack, Typography } from "@mui/material"
import AAccordion from "../atoms/a-accordion"
import AHeaderSelect from "../atoms/a-header-select"
import { useEffect, useState } from "react"
import theme from "../../theme"

const THeader = () => {

    const [hovered, setHovered] = useState("")
    const [active, setActive] = useState([""])

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

    return (
        <Stack
            maxWidth="200px"
            minWidth="200px"
            width="100%"
            overflow="hidden"
            flex='1 1 100%'
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
            <Stack alignItems="center" height="100%" minHeight="100vh" paddingTop="150px" paddingBottom="150px">
                <Stack paddingBottom="17px" overflow="hidden">
                    <Stack
                        spacing={2}
                        direction="row"
                        alignItems="center"
                        padding='15px 40px 15px 20px'
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

                    <AAccordion title="Choix du client" value={customers} active={active} setActive={setActive} />
                    {active.some(value => customers.includes(value)) &&
                        <AAccordion title="Logiciel" value={softwares} active={active} setActive={setActive} />
                    }
                </Stack>

                <Stack spacing={2}>
                    {active.some(value => softwares.includes(value)) &&
                        <AHeaderSelect choices={choices} active={active} setActive={setActive} />
                    }
                </Stack>
            </Stack>
        </Stack >
    )
}

export default THeader