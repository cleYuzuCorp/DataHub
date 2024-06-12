const endpoints = {
    hubspot: {
        get: '/hubspot/install',
        patch: (id: number) => `/hubspot/contacts/persona/${id.toString()}`
    },
    tenant: {
        get: '/tenant',
        delete: (id: number) => `/tenant/${id.toString()}`,
        patch: (id: number) => `/tenant/${id.toString()}`
    },
    persona: {
        get: (id: number) => `/proposition-persona/associations-settings/${id.toString()}`,
        patch: (id: number) => `/proposition-persona/associations-settings/${id.toString()}`,
        post: (id: number) => `/proposition-persona/process/${id.toString()}`
    },
    import_assistance: {
        post: (id: number) => `/import/check/${id.toString()}`
    },
    formatting: {
        patch: (id: number) => `/formatage/afteranhour/${id.toString()}`,
        post: (id: number) => `/formatage/${id.toString()}`
    },
    dissociation: {
        post: (id: number) => `/dissociation/${id.toString()}`
    },
    settings_hubspot: {
        patch: (id: number) => `/hubspot-settings/${id.toString()}`,
        get: (id: number) => `/hubspot-settings/${id.toString()}`
    },
    settings_formatage: {
        patch: (id: number) => `/settings-formatage/${id.toString()}`,
        get: (id: number) => `/settings-formatage/${id.toString()}`
    },
    history: {
        persona: (id: number) => `/historique-persona/${id.toString()}`,
        formatage: (id: number) => `/historique-foramatge/${id.toString()}`,
        dissociation: (id: number) => `/historique-dissociation/${id.toString()}`,
        kpi: (id: number) => `/dataformatage/${id.toString()}`
    }
}

export default endpoints