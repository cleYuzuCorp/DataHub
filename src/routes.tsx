import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import THeader from './components/templates/t-header'
import { Drawer, IconButton, Stack, ThemeProvider, useMediaQuery } from '@mui/material'
import theme from './theme'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars } from '@fortawesome/free-solid-svg-icons'
import { useEffect, useState } from 'react'
import CustomersAccounts from './pages'
import { Customer } from './interfaces/customer'
import { JobTitle } from './interfaces/job-title'
import { Contact } from './interfaces/contact'
import { acquireToken } from './App'

const AppRoutes = (props: { instance?: any }) => {

  const { instance } = props

  const isDesktop = useMediaQuery('(min-width:1000px)')

  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [account, setAccount] = useState()

  const [openConfirm, setOpenConfirm] = useState(false)
  const [active, setActive] = useState([""])
  const [dataLoading, setDataLoading] = useState<{ customerName: string; isLoading: boolean }[]>([])
  const [dataInit, setDataInit] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer>()

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

  const validate = () => {
    setOpenConfirm(false)
    setLoading(true)

    const fetchData = async () => {
      try {
        await instance.initialize()
        const accessToken = await acquireToken(instance)

        const response = await fetch(`${process.env.REACT_APP_API}/proposition-persona/associations-settings?IdTenant=${selectedCustomer?.IdTenant}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          }
        })

        const data = await response.json()

        if (data.personasRoles || data.rolesMotsClefs || data.dbPersona) {
          const associationsPersonaRolesData = Object.keys(data.personasRoles).map((personaKey) => {
            return {
              parent: personaKey,
              childs: data.personasRoles[personaKey].Roles.map((role: any, rolesIndex: number) => ({
                id: rolesIndex + 1,
                value: role,
              }))
            }
          })

          setAssociationsPersonaRoles(associationsPersonaRolesData)

          const associationsRoleKeywordsData = Object.keys(data.rolesMotsClefs).map((roleKey) => {
            return {
              parent: roleKey,
              childs: data.rolesMotsClefs[roleKey].MotsClefs.length !== 0 ? data.rolesMotsClefs[roleKey].MotsClefs : [""]
            }
          })

          setAssociationsRoleKeywords(associationsRoleKeywordsData)

          const personas = data.dbPersona.map((persona: { description: string, value: string }) => {
            return {
              description: persona.description,
              value: persona.value
            }
          })

          setDbPersona(personas)

          setDataLoading(prevDataLoading => {
            return prevDataLoading.map(item => ({
              ...item,
              isLoading: item.customerName === selectedCustomer?.NomClient
            }))
          })

          setDataLoading(prevDataLoading => prevDataLoading.map(item => {
            if (item.customerName === selectedCustomer?.NomClient) {
              return { ...item, isLoading: true }
            }
            return item
          }))
          setDataInit(true)
          setActive([active[0], active[1], "Enrichissement", "Données"])
          setLoading(false)
        }

      } catch (error) {
        console.error("Une erreur s'est produite lors de la requête :", error)
      }
    }

    fetchData()
  }

  useEffect(() => {
    const fetchData = async () => {
      if (selectedCustomer?.IdTenant && dataInit) {
        setLoading(true)

        const parsedId = selectedCustomer?.IdTenant

        const body = {
          idTenant: parsedId,
          dbPersona: dbPersona,
          associationsRoleMotClef: associationsRoleKeywords.map((roleKeywords) => {
            if (roleKeywords.parent !== "" && roleKeywords.childs.every((child) => child !== "")) {
              return {
                NomRole: roleKeywords.parent,
                NomMotClef: roleKeywords.childs,
              }
            } else {
              return undefined
            }
          }).filter((association) => association !== undefined),
          associationsPersonaRole: associationsPersonaRoles.map((personaRoles) => {
            if (personaRoles.parent !== "" && personaRoles.childs.every((child) => child.value !== "")) {
              return {
                NomPersona: personaRoles.parent,
                NomRole: personaRoles.childs,
              }
            } else {
              return undefined
            }
          }).filter((association) => association !== undefined)
        }

        const accessToken = await acquireToken(instance)

        const response = await fetch(`${process.env.REACT_APP_API}/proposition-persona/process`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(body)
        })

        const data = await response.json()

        setNumberContacts(data.dashboard.totalOfDifferentContacts)
        setNumberRoles(data.dashboard.totalOfDifferentRoles)
        setNumberPersonas(data.dashboard.totalOfDifferentPersonas)

        setInitiallyNull(data.enrichment.contactsWithProposedPersonaAndNull)
        setChangeFound(data.enrichment.contactsWithProposedPersonaAndValue)
        setNoChangeFound(data.enrichment.contactsWithoutProposedPersona)

        const rolesData = Object.entries(data.dashboard.occurencesByRoles).map(([jobTitle, occurences]) => ({
          jobTitle: jobTitle as string,
          occurences: occurences as number
        }))

        setRoles(rolesData)

        const personasData = Object.entries(data.dashboard.occurencesByPersonas).map(([jobTitle, occurences]) => ({
          jobTitle: jobTitle as string,
          occurences: occurences as number
        }))

        setPersonas(personasData)

        const linksData = Object.entries(data.dashboard.occurencesByLiaisons).map(([jobTitle, occurences]) => ({
          jobTitle: jobTitle as string,
          occurences: occurences as number
        }))

        setLinks(linksData)

        setDataInit(false)
        setLoading(false)
      }
    }

    fetchData()
  }, [dataInit])

  return (
    <Router>
      <Routes>
        <Route path="/" element={<ThemeProvider theme={theme}>
          <Stack direction="row">
            {isDesktop ? <THeader
              instance={instance}
              account={account}
              setAccount={setAccount}
              customers={customers}
              setCustomers={setCustomers}
              active={active}
              setActive={setActive}
              open={openConfirm}
              setOpen={setOpenConfirm}
              dataLoading={dataLoading}
              setDataLoading={setDataLoading}
              selectedCustomer={selectedCustomer}
              setSelectedCustomer={setSelectedCustomer}
              setLoading={setLoading}
              validate={validate}
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
                  account={account}
                  setAccount={setAccount}
                  customers={customers}
                  setCustomers={setCustomers}
                  open={openConfirm}
                  setOpen={setOpenConfirm}
                  active={active}
                  setActive={setActive}
                  dataLoading={dataLoading}
                  setDataLoading={setDataLoading}
                  selectedCustomer={selectedCustomer}
                  setSelectedCustomer={setSelectedCustomer}
                  setLoading={setLoading}
                  validate={validate}
                />
              </Drawer>
            </Stack>}
            <CustomersAccounts instance={instance} account={account} customers={customers} setCustomers={setCustomers} loading={loading} />
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
                  account={account}
                  setAccount={setAccount}
                  customers={customers}
                  setCustomers={setCustomers}
                  open={openConfirm}
                  setOpen={setOpenConfirm}
                  active={active}
                  setActive={setActive}
                  dataLoading={dataLoading}
                  setDataLoading={setDataLoading}
                  selectedCustomer={selectedCustomer}
                  setSelectedCustomer={setSelectedCustomer}
                  setLoading={setLoading}
                  validate={validate}
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
                      account={account}
                      setAccount={setAccount}
                      customers={customers}
                      setCustomers={setCustomers}
                      open={openConfirm}
                      setOpen={setOpenConfirm}
                      active={active}
                      setActive={setActive}
                      dataLoading={dataLoading}
                      setDataLoading={setDataLoading}
                      selectedCustomer={selectedCustomer}
                      setSelectedCustomer={setSelectedCustomer}
                      setLoading={setLoading}
                      validate={validate}
                    />
                  </Drawer>
                </Stack>}
                <PageComponent
                  instance={instance}
                  account={account}
                  customers={customers}
                  selectedCustomer={selectedCustomer}
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
                  validate={validate}
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