function loginViaAAD(username: string, password: string) {
    cy.visit('/', {
        onBeforeLoad: (win) => {
            cy.stub(win, 'open').as('open')
        },
    })

    cy.get('Button').contains('Sign In').click()

    cy.origin(
        'login.microsoftonline.com',
        {
            args: {
                username,
            },
        },
        ({ username }) => {
            cy.get('input[type="email"]').type(username, { log: false })
            cy.get('input[type="submit"]').click()
        }
    )

    cy.origin(
        'login.microsoftonline.com',
        {
            args: {
                password,
            },
        },
        ({ password }) => {
            cy.get('input[type="password"]').type(password, { log: false })
            cy.get('input[type="submit"]').click()
        }
    )

    cy.url().should('equal', 'http://localhost:3000/')
    cy.get('#welcome-div').should(
        'contain',
        `Welcome ${Cypress.env('aad_username')}!`
    )
}

Cypress.Commands.add('login', () => {
    const log = Cypress.log({
        displayName: 'Azure Active Directory Login',
        message: [`🔐 Authenticating | "cle@yuzucorp.com"`],
        autoEnd: false,
    })
    log.snapshot('before')

    loginViaAAD("cle@yuzucorp.com", "27Robes!")

    log.snapshot('after')
    log.end()
})