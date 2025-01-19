/// <reference types="cypress" />
import { createNewUser, User } from '../support'
import { playerData } from '../fixtures/player-data'

const inviteUser = (user: User) => {
  cy.contains('a', 'Teams').click()
  cy.contains('button', 'Invite team').click()
  cy.fillInput('name', user.username)
  cy.fillInput('email', user.email)
  cy.contains('button', 'Save').click()
  cy.contains('td', user.username).should('exist')
}

const acceptInvite = () => {
  cy.visit('/')
  cy.contains('My Leagues').click()
  cy.contains('li', 'League invites').click()
  cy.get('#btn-accept-invite').click()
  cy.get('#btn-accept-invite').should('be.disabled')
  cy.exitModal()
}

const goToLeagueHome = (leagueName: string) => {
  cy.visit('/')
  cy.contains('My Leagues').click()
  cy.contains(leagueName).click()
}

describe('Draft tests', () => {
  before(() => {
    cy.visit('/')
  })
  after(() => { cy.task('deleteTestUsers') })

  it('User can create draft', () => {
    cy.visit('')
    const commissioner = createNewUser('commissioner')
    const secondUser = createNewUser('user')

    // commissioner creates league and make sure its on the homepage
    cy.signUpUser(commissioner)
    cy.contains('My Leagues').click()
    cy.contains('li', 'Create league').click()
    const leagueName = `League ${new Date().getTime()}`
    cy.fillInput('name', leagueName)
    cy.fillInput('url', 'www.E2edDraft.com')
    cy.contains('button', 'Save').click()
    cy.contains(leagueName).should('exist')

    // commissioner goes to teams and invites self and user
    goToLeagueHome(leagueName)
    inviteUser(commissioner)
    inviteUser(secondUser)
    acceptInvite()

    // commissioner logs out
    cy.logoutUser()

    // user signs up and accepts invite
    cy.signUpUser(secondUser)
    acceptInvite()

    // user logs out
    cy.logoutUser()

    // commissioner logs in
    cy.loginUser(commissioner)

    // commissioner creates draft
    goToLeagueHome(leagueName)
    cy.contains('button', 'Add draft').click()
    cy.contains('button', 'Save').click()
    cy.reload() // TODO should improve UX
    cy.get('table > tbody').should('exist')

    // commissioner adds players
    cy.contains('a', 'Players').click()
    cy.contains('button', 'Import').click()
    cy.get('textarea').invoke('val', playerData.trim()).trigger('input')
    cy.get('textarea').type(' ') // type a char to enable the button
    cy.contains('button', 'Read CSV').click()
    cy.get('table > tbody').should('exist')
    cy.contains('button', 'Overwrite').click()
    cy.contains('button', 'Confirm').click()

    // commissioner sets draft order
    // TODO this can only happen after draft is created, need to handle vice versa
    goToLeagueHome(leagueName)
    cy.contains('a', 'Draft').click()
    cy.contains('button', 'Generate').click()
    cy.contains('button', 'Generate draft').click()
    cy.contains('button', 'Confirm').click()
    cy.get('table > tbody').contains(commissioner.username).should('exist')
    cy.get('table > tbody').contains(secondUser.username).should('exist')

    // TODO start draft
    // TODO draft player
  })
})
