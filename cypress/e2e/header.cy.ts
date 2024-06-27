describe('THeader Component', () => {
  beforeEach(() => {
    cy.login()
  })

  it('should display logo correctly', () => {
    cy.get('img[alt="Logo"]').should('be.visible');
  })

  it('should display account options when logged in', () => {
    cy.get('Typography').contains('Sign Out').should('be.visible');
    cy.get('img[alt="Profile"]').should('be.visible');
  })
})