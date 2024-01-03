import { faChevronDown, faUser } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Accordion, AccordionDetails, AccordionSummary, Stack, Typography } from "@mui/material"
import theme from "../../theme"
import { useState } from "react"

const AAccordion = (props: { title: string, value: string[], active: string[], setActive: (item: string[]) => void }) => {

    const { title, value, active, setActive } = props

    const [hovered, setHovered] = useState("")

    return (
        <Accordion
            disableGutters
            elevation={0}
            sx={{
                background: theme.palette.background.default,
                boxShadow: 'none',
                "&.MuiAccordion-root:before": {
                    display: 'none',
                }
            }}
        >
            <AccordionSummary
                onMouseEnter={() => setHovered(title)}
                onMouseLeave={() => setHovered("")}
                expandIcon={<FontAwesomeIcon icon={faChevronDown} />}
                sx={{
                    cursor: 'pointer',
                    padding: '0px 20px 0px 20px',
                    background: hovered === title ? theme.palette.secondary.light : 'none'
                }}
            >
                <Stack spacing={1} direction="row" alignItems="center">
                    <FontAwesomeIcon icon={faUser} />
                    <Typography>
                        {title}
                    </Typography>
                </Stack>
            </AccordionSummary>

            <AccordionDetails sx={{ width: "100%" }}>
                <Stack>
                    {value.map((v) => <Typography
                        onMouseEnter={() => setHovered(v)}
                        onMouseLeave={() => setHovered("")}
                        onClick={() => title === "Logiciel" ? setActive([...active, v]) : setActive([v])}
                        sx={{
                            cursor: 'pointer',
                            padding: '5px 0px 5px 0px',
                            background: active.includes(v) || hovered === v ? theme.palette.secondary.light : 'none'
                        }}
                    >
                        {v}
                    </Typography>)}
                </Stack>
            </AccordionDetails>
        </Accordion>
    )
}

export default AAccordion