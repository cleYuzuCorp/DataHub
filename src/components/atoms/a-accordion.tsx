import { faChevronDown, faUser } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Accordion, AccordionDetails, AccordionSummary, Stack, Typography } from "@mui/material"
import theme from "../../theme"
import { useState } from "react"

const AAccordion = (props: { title: string, values: string[], active: string[], setActive: (item: string[]) => void }) => {

    const { title, values, active, setActive } = props

    const [hovered, setHovered] = useState("")

    const handleClick = (value: string) => {
        setActive([value, 'Persona', 'Dashboard'])
    }


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
                    padding: '0px 20px 0px 30px',
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
                    {values.map((value) => <Typography
                        key={value}
                        onMouseEnter={() => setHovered(value)}
                        onMouseLeave={() => setHovered("")}
                        onClick={() => handleClick(value)}
                        sx={{
                            minWidth: '160px',
                            maxWidth: '160px',
                            width: '100%',
                            cursor: 'pointer',
                            padding: '5px 20px 5px 20px',
                            background: active.includes(value) || hovered === value ? theme.palette.secondary.light : 'none'
                        }}
                    >
                        {value}
                    </Typography>)}
                </Stack>
            </AccordionDetails>
        </Accordion>
    )
}

export default AAccordion