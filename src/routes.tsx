import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import THeader from './components/templates/t-header'
import { Drawer, IconButton, Stack, ThemeProvider, useMediaQuery } from '@mui/material'
import theme from './theme'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars } from '@fortawesome/free-solid-svg-icons'
import { useState } from 'react'
import CustomersAccounts from './pages'
import { Customer } from './interfaces/customer'
import { JobTitle } from './interfaces/job-title'
import { Contact } from './interfaces/contact'

const AppRoutes = (props: { instance?: any }) => {

  const { instance } = props

  const isDesktop = useMediaQuery('(min-width:1000px)')

  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [customers, setCustomers] = useState<Customer[]>([])

  const [dbPersona, setDbPersona] = useState([{ description: "", value: "" }])
  const [associationsRoleKeywords, setAssociationsRoleKeywords] = useState([{ parent: "", childs: [""] }])
  const [associationsPersonaRoles, setAssociationsPersonaRoles] = useState([{ parent: "", childs: [{ id: 0, value: "" }] }])

  const [numberContacts, setNumberContacts] = useState<number>(0)
  const [numberRoles, setNumberRoles] = useState<number>(0)
  const [numberPersonas, setNumberPersonas] = useState<number>(0)

  const [roles, setRoles] = useState<JobTitle[]>([])
  const [personas, setPersonas] = useState<JobTitle[]>([])
  const [links, setLinks] = useState<JobTitle[]>([])

  const [initiallyNull, setInitiallyNull] = useState<Array<Contact>>([])
  const [changeFound, setChangeFound] = useState<Array<Contact>>([])
  const [noChangeFound, setNoChangeFound] = useState<Array<Contact>>([])

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
              setLoading={setLoading}
              dbPersona={dbPersona}
              setDbPersona={setDbPersona}
              associationsRoleKeywords={associationsRoleKeywords}
              setAssociationsRoleKeywords={setAssociationsRoleKeywords}
              associationsPersonaRoles={associationsPersonaRoles}
              setAssociationsPersonaRoles={setAssociationsPersonaRoles}
              setNumberContacts={setNumberContacts}
              setNumberRoles={setNumberRoles}
              setNumberPersonas={setNumberPersonas}
              setRoles={setRoles}
              setPersonas={setPersonas}
              setLinks={setLinks}
              setInitiallyNull={setInitiallyNull}
              setChangeFound={setChangeFound}
              setNoChangeFound={setNoChangeFound}
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
                  setLoading={setLoading}
                  dbPersona={dbPersona}
                  setDbPersona={setDbPersona}
                  associationsRoleKeywords={associationsRoleKeywords}
                  setAssociationsRoleKeywords={setAssociationsRoleKeywords}
                  associationsPersonaRoles={associationsPersonaRoles}
                  setAssociationsPersonaRoles={setAssociationsPersonaRoles}
                  setNumberContacts={setNumberContacts}
                  setNumberRoles={setNumberRoles}
                  setNumberPersonas={setNumberPersonas}
                  setRoles={setRoles}
                  setPersonas={setPersonas}
                  setLinks={setLinks}
                  setInitiallyNull={setInitiallyNull}
                  setChangeFound={setChangeFound}
                  setNoChangeFound={setNoChangeFound}
                />
              </Drawer>
            </Stack>}
            <CustomersAccounts instance={instance} customers={customers} setCustomers={setCustomers} loading={loading} setLoading={setLoading} />
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
                  setLoading={setLoading}
                  dbPersona={dbPersona}
                  setDbPersona={setDbPersona}
                  associationsRoleKeywords={associationsRoleKeywords}
                  setAssociationsRoleKeywords={setAssociationsRoleKeywords}
                  associationsPersonaRoles={associationsPersonaRoles}
                  setAssociationsPersonaRoles={setAssociationsPersonaRoles}
                  setNumberContacts={setNumberContacts}
                  setNumberRoles={setNumberRoles}
                  setNumberPersonas={setNumberPersonas}
                  setRoles={setRoles}
                  setPersonas={setPersonas}
                  setLinks={setLinks}
                  setInitiallyNull={setInitiallyNull}
                  setChangeFound={setChangeFound}
                  setNoChangeFound={setNoChangeFound}
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
                      setLoading={setLoading}
                      dbPersona={dbPersona}
                      setDbPersona={setDbPersona}
                      associationsRoleKeywords={associationsRoleKeywords}
                      setAssociationsRoleKeywords={setAssociationsRoleKeywords}
                      associationsPersonaRoles={associationsPersonaRoles}
                      setAssociationsPersonaRoles={setAssociationsPersonaRoles}
                      setNumberContacts={setNumberContacts}
                      setNumberRoles={setNumberRoles}
                      setNumberPersonas={setNumberPersonas}
                      setRoles={setRoles}
                      setPersonas={setPersonas}
                      setLinks={setLinks}
                      setInitiallyNull={setInitiallyNull}
                      setChangeFound={setChangeFound}
                      setNoChangeFound={setNoChangeFound}
                    />
                  </Drawer>
                </Stack>}
                <PageComponent
                  instance={instance}
                  customers={customers}
                  loading={loading}
                  dbPersona={dbPersona}
                  setDbPersona={setDbPersona}
                  associationsRoleKeywords={associationsRoleKeywords}
                  setAssociationsRoleKeywords={setAssociationsRoleKeywords}
                  associationsPersonaRoles={associationsPersonaRoles}
                  setAssociationsPersonaRoles={setAssociationsPersonaRoles}
                  numberContacts={numberContacts}
                  setNumberContacts={setNumberContacts}
                  numberRoles={numberRoles}
                  setNumberRoles={setNumberRoles}
                  numberPersonas={numberPersonas}
                  setNumberPersonas={setNumberPersonas}
                  roles={roles}
                  setRoles={setRoles}
                  personas={personas}
                  setPersonas={setPersonas}
                  links={links}
                  setLinks={setLinks}
                  initiallyNull={initiallyNull}
                  setInitiallyNull={setInitiallyNull}
                  changeFound={changeFound}
                  setChangeFound={setChangeFound}
                  noChangeFound={noChangeFound}
                  setNoChangeFound={setNoChangeFound}
                />
              </Stack>
            </ThemeProvider>} />
          )
        })}
      </Routes>
    </Router>
  )
}

export default AppRoutes