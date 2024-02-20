import { CircularProgress, Container, Stack, Typography } from "@mui/material"
import OTableEnrichment from "../../../components/organisms/o-table-enrichment"
import { useState, useEffect } from "react"
import { acquireToken } from "../../../App"
import { useLocation } from "react-router-dom"

const InitiallyNull = (props: { instance: any }) => {

    const { instance } = props

    const idTenant = new URLSearchParams(useLocation().search).get('id')

    const [dbPersona, setDbPersona] = useState([{ description: "", value: "" }])
    const [associationsRoleKeywords, setAssociationsRoleKeywords] = useState([{ parent: "", childs: [""] }])
    const [associationsPersonaRoles, setAssociationsPersonaRoles] = useState([{ parent: "", childs: [""] }])

    const [loading, setLoading] = useState(false)
    const [fetchDataInit, setFetchDataInit] = useState(false)
    const [dataInit, setDataInit] = useState(false)
    const [contacts, setContacts] = useState([])

    useEffect(() => {
        setFetchDataInit(true)
    }, [])

    useEffect(() => {
        setLoading(true)

        const fetchData = async () => {
            if (fetchDataInit) {
                try {
                    await instance.initialize()
                    const accessToken = await acquireToken(instance)

                    const response = await fetch(`${process.env.REACT_APP_API_PERSONA}/persona/findAllAssociationsForTenant?IdTenant=${idTenant}`, {
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
                        setDataInit(true)
                        setLoading(false)
                    }

                } catch (error) {
                    console.error("Une erreur s'est produite lors de la requête :", error)
                }
            }
        }

        fetchData()
    }, [fetchDataInit])

    useEffect(() => {
        setLoading(true)

        const fetchData = async () => {
            if (idTenant && dataInit) {
                const parsedId = parseInt(idTenant, 10)

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
                        if (personaRoles.parent !== "" && personaRoles.childs.every((child) => child !== "")) {
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

                const response = await fetch(`${process.env.REACT_APP_API_PERSONA}/hubspot/processPersona`, {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(body)
                })

                const data = await response.json()

                setContacts(data.enrichment.contactsWithProposedPersonaAndNull)
                setLoading(false)
            }
        }

        fetchData()
    }, [dataInit])

    return (
        <Container maxWidth="lg">
            <Stack spacing={8} alignItems="center" marginTop="100px" marginBottom="100px">
                <Typography variant="h3">
                    DataHub
                </Typography>

                {loading ? <CircularProgress /> : <OTableEnrichment instance={instance} id={idTenant} contacts={contacts} dbPersona={dbPersona} />}
            </Stack>
        </Container>
    )
}

export default InitiallyNull