/// <reference types="cypress" />

describe('Draft tests', () => {
  before(() => {
    cy.visit('')
    cy.signUpUser()
  })
  after(() => { cy.task('deleteTestUsers') })

  it('User can create draft', () => {
    cy.visit('')
    cy.loginUser()

    // create draft and make sure its on the homepage
    cy.contains('My Leagues').click()
    cy.contains('li', 'Create league').click()
    const draftName = `Draft ${new Date().getTime()}`
    cy.fillInput('name', draftName)
    cy.fillInput('url', 'www.E2edDraft.com')
    cy.contains('button', 'Save').click()
    cy.contains(draftName).should('exist')

    // TODO invite users
    // TODO accept invite
    // TODO start draft
    // TODO draft player
  })
})
