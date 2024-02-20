export interface Contact {
    intituledePoste: string
    personaProposed: string
    occurence: number
    contacts: [
        {
            hs_object_id: string
            role: string
            persona: string
            firsname: string
            lastname: string
        }
    ]
}