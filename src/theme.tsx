import { createTheme } from '@mui/material/styles'
export { }

const customColors = {
    darkYellow: '#F7E13D',
    lightYellow: '#FFF080',
    lightYellowMid: 'rgba(255, 240, 128, 0.50)',
    darkBlue: '#1B255F',
    lightBlue: '#001FD0',
    orange: '#F37962',
    grey: '#F4F5FD',
    white: '#FFFFFF'
}

const theme = createTheme({
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
            secondary: customColors.lightBlue
        },
        info: {
            main: customColors.orange,
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
                    minWidth: '240px',
                    "& label.Mui-focused": {
                        color: customColors.darkBlue
                    },
                    "& .MuiInput-underline:before": {
                        borderBottomColor: customColors.darkBlue
                    },
                    "& .MuiInput-underline:after": {
                        borderBottomColor: customColors.darkBlue
                    },
                    "& .MuiFilledInput-underline:before": {
                        borderBottomColor: customColors.darkBlue
                    },
                    "& .MuiFilledInput-underline:after": {
                        borderBottomColor: customColors.darkBlue
                    },
                    "& .MuiOutlinedInput-root": {
                        "&.Mui-focused fieldset": {
                            borderColor: customColors.darkBlue
                        },
                        "& fieldset": {
                            borderColor: customColors.darkBlue
                        }
                    },
                    "& .MuiInputLabel-root": {
                        color: customColors.darkBlue
                    }
                }
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