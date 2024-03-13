import { Stack, Typography } from "@mui/material"
import { useState } from "react"
import theme from "../../theme"

const AHeaderSelect = (props: { values: string[], active: string[], setActive: (item: string[]) => void }) => {

    const { values, active, setActive } = props

    const [hovered, setHovered] = useState("")

    const handleClick = (value: string) => {
        if (value === "Persona") {
            setActive([active[0], value, 'Dashboard'])
        } else if (values.includes('Persona')) {
            setActive([active[0], value])
        } else if (value === "Enrichissement") {
            setActive([active[0], active[1], value, "Données"])
        } else if (values.includes('Dashboard')) {
            setActive([active[0], active[1], value])
        } else if (active.length === 3 || active.length === 4) {
            setActive([active[0], active[1], active[2], value])
        } else {
            setActive([value])
        }
    }

    return (
        <Stack paddingTop="17px" borderTop="1px solid #C1C1C1">
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
                    padding: '15px 20px 15px 20px',
                    background: active.includes(value) || hovered === value ? theme.palette.secondary.light : 'none'
                }}
            >
                {value}
            </Typography>)}
        </Stack>
    )
}

export default AHeaderSelect