import { Stack, Typography } from "@mui/material"
import { useState } from "react"
import theme from "../../theme"

const AHeaderSelect = (props: { values: string[], active: string[], setActive: (item: string[]) => void }) => {

    const { values, active, setActive } = props

    const [hovered, setHovered] = useState("")

    const handleClick = (value: string) => {
        const updatedActive = active.filter(item => !values.includes(item))
        setActive([value, ...updatedActive])
    }

    return (
        <Stack paddingTop="17px" borderTop="1px solid #C1C1C1">
            {values.map((value) => <Typography
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