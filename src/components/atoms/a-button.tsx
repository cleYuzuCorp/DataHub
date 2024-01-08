import Button from '@mui/material/Button'
import { FC, ReactNode, useState } from 'react'
import theme from '../../theme'

interface AButtonProps {
    variant?: 'text' | 'outlined' | 'contained'
    size?: 'small' | 'medium' | 'large'
    color?: 'white' | 'colorful' | 'error'
    disabled?: boolean
    children: string | ReactNode
    isActive?: boolean
    onClick?: () => void
}

const AButton: FC<AButtonProps> = ({ variant, size, color, disabled, children, isActive, onClick }) => {
    const [hovered, setHovered] = useState(false)

    return (
        <Button
            variant={variant}
            disabled={disabled}
            size={size}
            disableRipple={variant === 'text'}
            onClick={onClick}
            sx={{
                minWidth: variant === "text" ? "0px" : "219px",
                color: color === "error" ? theme.palette.error.main : variant === "outlined" || color === "colorful" ? theme.palette.text.primary : isActive ? theme.palette.primary.main : theme.palette.background.default,
                fontWeight: 700,
                textDecoration: isActive ? 'underline' : 'none',
                textDecorationLine: isActive ? theme.palette.primary.main : 'none',
                textUnderlineOffset: '10px',
                background: variant === "contained" ? theme.palette.text.primary : 'transparent',
                border: variant === "text" ? "none" : "1px solid",
                borderColor: variant === "text" ? "none" : color === "error" ? theme.palette.error.main : theme.palette.text.primary,
                borderRadius: "15px",
                transition: "all 0.5s ease 0s",
                position: 'relative',
                overflow: 'hidden',
                '&:hover': {
                    color: color === "error" ? theme.palette.background.default : variant === "outlined" ? theme.palette.background.default : variant === "contained" ? theme.palette.text.primary : theme.palette.primary.main,
                    borderColor: variant === "contained" ? theme.palette.text.primary : variant === "outlined" ? theme.palette.background.default : "transparent",
                    background: variant === "contained" ? theme.palette.primary.main : variant === "outlined" && color === "error" ? theme.palette.error.main : variant === "text" ? 'transparent' : theme.palette.text.primary,
                    textDecoration: isActive ? 'underline' : 'none',
                    textDecorationLine: isActive ? theme.palette.primary.main : 'none',
                    textUnderlineOffset: '5px',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: hovered ? '100%' : 0,
                        width: '100%',
                        height: '100%',
                        background: variant === "contained" ? theme.palette.text.primary : variant === "outlined" ? theme.palette.background.default : 'transparent',
                        transition: 'left 0.5s ease',
                    },
                },
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {children}
        </Button>
    )
}

export default AButton