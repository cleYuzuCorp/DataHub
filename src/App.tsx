import { ThemeProvider } from '@mui/material'
import theme from './theme'
import AppRoutes from './routes'
import { PublicClientApplication, EventType } from '@azure/msal-browser'
import { LogLevel } from 'msal'
import { useEffect } from 'react'

const App = () => {

  const mslInstance = new PublicClientApplication(mslInstanceConfig)

  const initializeMsal = async () => {
    await mslInstance.initialize()
    await mslInstance.handleRedirectPromise()

    if (!mslInstance.getActiveAccount() && mslInstance.getAllAccounts().length > 0) {
      mslInstance.setActiveAccount(mslInstance.getAllAccounts()[0])
    }
    mslInstance.addEventCallback((event) => {
      if (event.eventType === EventType.LOGIN_SUCCESS && event.payload && 'account' in event.payload && event.payload.account !== undefined) {
        const account = event.payload.account
        mslInstance.setActiveAccount(account)
      }
    })
  }

  useEffect(() => {
    initializeMsal()
  }, [])

  return (
    <ThemeProvider theme={theme}>
      <AppRoutes instance={mslInstance} />
    </ThemeProvider>
  )
}

const clientid = process.env.REACT_APP_APPID as string
const tid = process.env.REACT_APP_TID as string

export const mslInstanceConfig = {
  auth: {
    clientId: clientid,
    authority: `https://login.microsoftonline.com/${tid}`,
    redirectUri: "/",
    postLogoutRedirectUri: "/",
    navigateToLoginRequestUrl: false
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false
  },
  system: {
    loggerOptions: {
      loggerCallback: (level: any, message: any, containsPii: any) => {
        if (containsPii) {
          return
        }
        switch (level) {
          case LogLevel.Error:
            console.error(message)
            return
          case LogLevel.Info:
            return
          case LogLevel.Verbose:
            console.debug(message)
            return
          case LogLevel.Warning:
            console.warn(message)
            return
          default:
            return
        }
      }
    }
  }
}

export const acquireToken = async (instance: any) => {
  try {
    const accounts = await instance.getAllAccounts()
    const data = await instance.acquireTokenSilent({
      scopes: [`api://${clientid}/User.read`],
      account: accounts[0],
    })
    return data.accessToken
  } catch (silentError) {
    try {
      const interactiveResult = await instance.acquireTokenPopup({
        scopes: [`api://${clientid}/User.read`],
      })
      return interactiveResult.accessToken
    } catch (interactiveError) {
      console.error("Erreur lors de l'acquisition du jeton de manière interactive : ", interactiveError)
    }
  }
}

export default App