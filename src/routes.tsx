import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import THeader from './components/templates/t-header'
import { Drawer, IconButton, Stack, ThemeProvider, useMediaQuery } from '@mui/material'
import theme from './theme'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars } from '@fortawesome/free-solid-svg-icons'
import { useState } from 'react'
import CustomersAccounts from './pages'
import { Customer } from './interfaces/customer'

const AppRoutes = (props: { instance?: any }) => {

  const { instance } = props

  const isDesktop = useMediaQuery('(min-width:1000px)')

  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [customers, setCustomers] = useState<Customer[]>([])

  const pagesContext = (require as any).context('./pages', true, /\.(tsx|jsx)$/)

  return (
    <Router>
      <Routes>
        <Route path="/" element={<ThemeProvider theme={theme}>
          <Stack direction="row">
            {isDesktop ? <THeader
              instance={instance}
              customers={customers}
              setCustomers={setCustomers}
              loading={loading}
              setLoading={setLoading}
            /> : <Stack>
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
                <THeader
                  instance={instance}
                  customers={customers}
                  setCustomers={setCustomers}
                  loading={loading}
                  setLoading={setLoading}
                />
              </Drawer>
            </Stack>}
            <CustomersAccounts instance={instance} customers={customers} setCustomers={setCustomers} loading={loading} />
          </Stack>
        </ThemeProvider>} />
        {pagesContext.keys().map((modulePath: string) => {
          const module = pagesContext(modulePath)
          const pageName = modulePath.replace('./', '').replace(/\.(tsx|jsx)$/, '')
          const PageComponent = module.default || module

          return (
            <Route key={pageName} path={`/${pageName}`} element={<ThemeProvider theme={theme}>
              <Stack direction="row">
                {isDesktop ? <THeader
                  instance={instance}
                  customers={customers}
                  setCustomers={setCustomers}
                  loading={loading}
                  setLoading={setLoading}
                /> : <Stack>
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
                    <THeader
                      instance={instance}
                      customers={customers}
                      setCustomers={setCustomers}
                      loading={loading}
                      setLoading={setLoading}
                    />
                  </Drawer>
                </Stack>}
                <PageComponent instance={instance} customers={customers} loading={loading} />
              </Stack>
            </ThemeProvider>} />
          )
        })}
      </Routes>
    </Router>
  )
}

export default AppRoutes