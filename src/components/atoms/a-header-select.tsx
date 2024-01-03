import { Stack, Typography } from "@mui/material"
import { useState } from "react"
import theme from "../../theme"

const AHeaderSelect = (props: { choices: string[], active: string[], setActive: (item: string[]) => void }) => {

    const { choices, active, setActive } = props

    const [hovered, setHovered] = useState("")

    return (
        <Stack paddingTop="17px" borderTop="1px solid #C1C1C1">
            {choices.map((choice) => <Typography
                onMouseEnter={() => setHovered(choice)}
                onMouseLeave={() => setHovered("")}
                onClick={() => setActive([...active, choice])}
                sx={{
                    cursor: 'pointer',
                    padding: '15px 40px 15px 40px',
                    background: active.includes(choice) || hovered === choice ? theme.palette.secondary.light : 'none'
                }}
            >
                {choice}
            </Typography>)}
        </Stack>
    )
}

export default AHeaderSelect