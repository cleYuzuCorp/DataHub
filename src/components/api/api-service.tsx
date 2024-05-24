import axios, { AxiosRequestConfig } from 'axios'

const api = axios.create({
    baseURL: `${process.env.REACT_APP_API}`,
    headers: {
        'Content-Type': 'application/json',
    },
})

api.interceptors.response.use(
    response => response,
    error => {
        const errorMessage = error.response?.data?.message || 'Une erreur est survenue'
        return Promise.reject({ message: errorMessage })
    }
)

export const fetchData = async (endpoint: string, options: AxiosRequestConfig<any>) => {
    try {
        const response = await api(endpoint, options)
        return { data: response.data }
    } catch (error) {
        if (axios.isAxiosError(error)) {
            return { error: error.message }
        }
        return { error: 'Une erreur inconnue est survenue' }
    }
}