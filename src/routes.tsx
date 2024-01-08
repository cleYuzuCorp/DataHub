import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Home from './pages'
import THeader from './components/templates/t-header'
import { Drawer, IconButton, Stack, ThemeProvider, useMediaQuery } from '@mui/material'
import theme from './theme'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars } from '@fortawesome/free-solid-svg-icons'
import { useState } from 'react'

const AppRoutes = (props: { instance?: any }) => {

  const { instance } = props

  const isDesktop = useMediaQuery(theme.breakpoints.up('sm'))

  const [open, setOpen] = useState(false)

  const pagesContext = (require as any).context('./pages', true, /\.(tsx|jsx)$/)

  return (
    <Router>
      <Routes>
        <Route path="/" element={<ThemeProvider theme={theme}>
          <Stack direction="row">
            {isDesktop ? <THeader instance={instance} /> : <Stack>
              <IconButton
                onClick={() => setOpen(true)}
                sx={{
                  position: 'absolute',
                  top: '5px',
                  left: '5px'
                }}
              >
                <FontAwesomeIcon icon={faBars} color={theme.palette.text.primary} />
              </IconButton>
              <Drawer anchor="left" open={open} onClose={() => setOpen(false)}>
                <THeader instance={instance} />
              </Drawer>
            </Stack>}
            <Home />
          </Stack>
        </ThemeProvider>} />
        {pagesContext.keys().map((modulePath: string) => {
          const module = pagesContext(modulePath)
          const pageName = modulePath.replace('./', '').replace(/\.(tsx|jsx)$/, '')
          const PageComponent = module.default || module

          return (
            <Route key={pageName} path={`/${pageName}`} element={<ThemeProvider theme={theme}>
              <Stack direction="row">
                {isDesktop ? <THeader instance={instance} /> : <Stack>
                  <IconButton
                    onClick={() => setOpen(true)}
                    sx={{
                      position: 'absolute',
                      top: '5px',
                      left: '5px'
                    }}
                  >
                    <FontAwesomeIcon icon={faBars} color={theme.palette.text.primary} />
                  </IconButton>
                  <Drawer anchor="left" open={open} onClose={() => setOpen(false)}>
                    <THeader instance={instance} />
                  </Drawer>
                </Stack>}
                <PageComponent instance={instance} />
              </Stack>
            </ThemeProvider>} />
          )
        })}
      </Routes>
    </Router>
  )
}

export default AppRoutes