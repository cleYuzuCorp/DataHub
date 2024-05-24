import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'

const ANotification = (props: { open: boolean, message: string, severity: string, onClose: () => void }) => {

    const { open, message, severity, onClose } = props

    return (
        <Snackbar
            open={open}
            onClose={onClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            autoHideDuration={6000}
        >
            <Alert onClose={onClose} severity={severity === "success" ? 'success' : 'error'} variant="filled">
                {message}
            </Alert>
        </Snackbar>
    )
}

export default ANotification