import { useState } from 'react'

const useNotification = () => {
    const [notification, setNotification] = useState({
        open: false,
        message: '',
        severity: 'info',
    })

    const showNotification = (message: any, severity = 'info') => {
        setNotification({ open: true, message, severity })
    }

    const closeNotification = () => {
        setNotification(prev => ({ ...prev, open: false }))
    }

    return { notification, showNotification, closeNotification }
}

export default useNotification