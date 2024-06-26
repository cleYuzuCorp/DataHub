import { createTheme } from '@mui/material/styles'

const customColors = {
    darkYellow: '#F7E13D',
    lightYellow: '#FFF080',
    lightYellowMid: 'rgba(255, 240, 128, 0.50)',
    darkBlue: '#1B255F',
    darkBlueMid: 'rgba(27, 37, 95, 0.50)',
    lightBlue: '#001FD0',
    orange: '#F37962',
    lightOrange: 'rgba(243, 121, 98, 0.50)',
    grey: '#F5F5F7',
    white: '#FFFFFF'
}

export const theme = createTheme({
    palette: {
        primary: {
            main: customColors.darkYellow,
        },
        secondary: {
            main: customColors.lightYellow,
            light: customColors.lightYellowMid
        },
        text: {
            primary: customColors.darkBlue,
            secondary: customColors.darkBlueMid,
            disabled: customColors.lightBlue
        },
        info: {
            main: customColors.orange,
            light: customColors.lightOrange
        },
        background: {
            default: customColors.white,
            paper: customColors.grey
        }
    },
    typography: {
        fontFamily: 'BD Supper, sans serif',
        h1: {
            fontSize: '83px',
            lineHeight: '74,7px',
            fontWeight: 700,
            color: '#ffffff'
        },
        h2: {
            fontSize: '70px',
            lineHeight: '84px',
            fontWeight: 700,
            color: '#001fd0'
        },
        h3: {
            fontSize: '40px',
            lineHeight: '40px',
            fontWeight: 400,
            color: '#1b255f'
        },
        h4: {
            fontSize: '19px',
            lineHeight: '22,8px',
            fontWeight: 700,
            color: '#1b255f'
        },
        body1: {
            fontSize: '15px',
            lineHeight: '24px',
            fontWeight: 400,
            color: '#1b255f'
        },
        body2: {
            fontSize: '15px',
            lineHeight: '24px',
            fontWeight: 700,
            color: '#1b255f'
        }
    },
    components: {
        MuiCircularProgress: {
            styleOverrides: {
                root: {
                    color: customColors.darkBlue,
                }
            }
        },
        MuiCheckbox: {
            styleOverrides: {
                root: {
                    color: customColors.darkBlue,
                    '&.Mui-checked': {
                        color: customColors.darkBlue
                    },
                    '&.MuiCheckbox-indeterminate': {
                        color: customColors.darkBlue
                    }
                }
            }
        },
        MuiRadio: {
            styleOverrides: {
                root: {
                    color: customColors.darkBlue,
                    '&.Mui-checked': {
                        color: customColors.darkBlue
                    }
                }
            }
        },
        MuiRating: {
            styleOverrides: {
                iconFilled: {
                    color: customColors.darkBlue
                },
                iconHover: {
                    color: customColors.lightBlue
                }
            }
        },
        MuiSwitch: {
            styleOverrides: {
                root: {
                    '& .MuiSwitch-switchBase.Mui-checked': {
                        color: customColors.darkBlue
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: customColors.darkBlue
                    }
                }
            }
        },
        MuiSlider: {
            styleOverrides: {
                root: {
                    color: customColors.darkYellow
                },
                markLabel: {
                    color: customColors.darkBlue
                }
            }
        },
        MuiSelect: {
            styleOverrides: {
                root: {
                    color: customColors.darkBlue,
                }
            }
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    minWidth: '120px',
                    border: '1px solid',
                    borderRadius: '15px',
                    background: customColors.white,
                    "& label.Mui-focused": {
                        color: customColors.darkBlue
                    },
                    "&:hover": {
                        "& label": {
                            color: customColors.darkBlue
                        },
                        "& .MuiInput-underline:before": {
                            borderBottomColor: 'transparent'
                        },
                        "& .MuiInput-underline:after": {
                            borderBottomColor: 'transparent'
                        },
                        "& .MuiFilledInput-underline:before": {
                            borderBottomColor: 'transparent'
                        },
                        "& .MuiFilledInput-underline:after": {
                            borderBottomColor: 'transparent'
                        },
                        "& .MuiOutlinedInput-root": {
                            "&.Mui-focused fieldset": {
                                borderColor: 'transparent'
                            },
                            "& fieldset": {
                                borderColor: 'transparent'
                            }
                        },
                    },
                    "& .MuiInput-underline:before": {
                        borderBottomColor: 'transparent'
                    },
                    "& .MuiInput-underline:after": {
                        borderBottomColor: 'transparent'
                    },
                    "& .MuiFilledInput-underline:before": {
                        borderBottomColor: 'transparent'
                    },
                    "& .MuiFilledInput-underline:after": {
                        borderBottomColor: 'transparent'
                    },
                    "& .MuiOutlinedInput-root": {
                        "&.Mui-focused fieldset": {
                            borderColor: 'transparent'
                        },
                        "& fieldset": {
                            borderColor: 'transparent'
                        }
                    },
                    "& .MuiInputLabel-root": {
                        color: customColors.darkBlue
                    }
                },
            }
        },
        MuiStepLabel: {
            styleOverrides: {
                label: {
                    fontWeight: 400,
                    '&.Mui-active, &.Mui-completed': {
                        fontWeight: 700
                    }
                }
            }
        },
        MuiStepIcon: {
            styleOverrides: {
                root: {
                    color: customColors.darkBlue,
                    '&.Mui-active, &.Mui-completed': {
                        color: customColors.darkBlue,
                        fontWeight: 700
                    }
                },
                text: {
                    fill: customColors.white
                }
            }
        },
        MuiStepConnector: {
            styleOverrides: {
                line: {
                    border: '1px solid',
                    borderColor: customColors.darkBlue,
                }
            }
        }
    }
})

export default theme