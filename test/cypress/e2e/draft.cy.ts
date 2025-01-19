/// <reference types="cypress" />
import { createNewUser, User } from '../support'

const inviteUser = (user: User) => {
  cy.contains('a', 'Teams').click()
  cy.contains('button', 'Invite team').click()
  cy.fillInput('name', user.username)
  cy.fillInput('email', user.email)
  cy.contains('button', 'Save').click()
  cy.contains('td', user.username).should('exist')
}

const acceptInvite = () => {
  cy.visit('')
  cy.contains('My Leagues').click()
  cy.contains('li', 'League invites').click()
  cy.get('#btn-accept-invite').click()
  cy.get('#btn-accept-invite').should('be.disabled')
  cy.exitModal()
}

describe('Draft tests', () => {
  before(() => {
    cy.visit('')
  })
  after(() => { cy.task('deleteTestUsers') })

  it('User can create draft', () => {
    cy.visit('')
    const commissioner = createNewUser('commissioner')
    const secondUser = createNewUser('user')

    // admin creates draft and make sure its on the homepage
    cy.signUpUser(commissioner)
    cy.contains('My Leagues').click()
    cy.contains('li', 'Create league').click()
    const leagueName = `League ${new Date().getTime()}`
    cy.fillInput('name', leagueName)
    cy.fillInput('url', 'www.E2edDraft.com')
    cy.contains('button', 'Save').click()
    cy.contains(leagueName).should('exist')

    // admin goes to league
    cy.contains('My Leagues').click()
    cy.contains(leagueName).click()

    // admin creates draft
    cy.contains('button', 'Add draft').click()
    cy.contains('button', 'Save').click()

    // admin goes to teams and invites self and user
    inviteUser(commissioner)
    inviteUser(secondUser)
    acceptInvite()

    // admin logs out
    cy.logoutUser()

    // user signs up and accepts invite
    cy.signUpUser(secondUser)
    acceptInvite()

    // user goes to league home
    cy.contains('My Leagues').click()
    cy.contains('li', leagueName).click()

    // TODO invite users
    // TODO accept invite
    // TODO start draft
    // TODO draft player
  })
})
