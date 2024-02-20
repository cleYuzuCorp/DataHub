import ReactDOM from 'react-dom/client'
import './index.css'
import reportWebVitals from './reportWebVitals'
import App from './App'
import { Stack } from '@mui/material'

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
)
root.render(
  <Stack>
    <App />
  </Stack>
)

reportWebVitals()