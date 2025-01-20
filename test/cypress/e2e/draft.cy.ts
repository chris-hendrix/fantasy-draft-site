/// <reference types="cypress" />
import csv from 'csvtojson'
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

const draftPlayer = (playerName: string) => {
  cy.contains('a', playerName).click()
  cy.get('.modal-open').contains('button', 'Draft').click()
  cy.get('.modal-open').contains('button', 'Confirm').click()
  cy.get('td').contains('button', 'Draft').should('not.exist')
}

describe('Draft tests', () => {
  const commissioner = createNewUser('commissioner')
  const secondUser = createNewUser('user')
  const leagueName = `League ${new Date().getTime()}`

  let parsedPlayerData: any[] = []

  before(() => {
    cy.wrap((async () => csv().fromString(playerData))()).then((data) => {
      parsedPlayerData = data as any[]
    })
  })
  beforeEach(() => {
    cy.visit('/')
  })
  after(() => { cy.task('deleteTestUsers') })

  it('Commissioner can signup, create a league and invite users', () => {
    cy.signUpUser(commissioner)
    cy.contains('My Leagues').click()
    cy.contains('li', 'Create league').click()
    cy.fillInput('name', leagueName)
    cy.fillInput('url', 'www.E2edDraft.com')
    cy.contains('button', 'Save').click()
    cy.contains(leagueName).should('exist')

    goToLeagueHome(leagueName)
    inviteUser(commissioner)
    inviteUser(secondUser)
    acceptInvite()
  })

  it('User can signup and accept invite', () => {
    cy.signUpUser(secondUser)
    acceptInvite()
  })

  it('Commissioner can create draft, add players, and set draft order', () => {
    cy.loginUser(commissioner)
    goToLeagueHome(leagueName)
    cy.contains('a', 'Draft').click()
    cy.contains('button', 'Start').should('not.exist')

    // commissioner creates draft
    goToLeagueHome(leagueName)
    cy.contains('button', 'Add draft').click()
    cy.contains('button', 'Save').click()
    cy.reload() // TODO should improve UX
    cy.get('table > tbody').should('exist')

    // commissioner adds players
    cy.contains('a', 'Players').click()
    cy.contains('button', 'Import').click()
    cy.get('textarea').invoke('val', playerData).trigger('input')
    cy.get('textarea').type(' ') // type a char to enable the button
    cy.get('textarea').type('{backspace}')
    cy.contains('button', 'Read CSV').click()
    cy.get('table > tbody').should('exist')
    cy.contains('button', 'Overwrite').click()
    cy.contains('button', 'Confirm').click()
    cy.contains('a', parsedPlayerData[0]?.Name).should('exist')
  })

  it('Commissioner can set draft order, start draft, and draft first player', () => {
    cy.loginUser(commissioner)
    goToLeagueHome(leagueName)
    // TODO this can only happen after draft is created, need to handle vice versa
    cy.contains('a', 'Draft').click()
    cy.contains('button', 'Generate').click()
    cy.contains('button', 'Generate draft').click()
    cy.contains('button', 'Confirm').click()
    cy.get('table > tbody').contains(commissioner.username).should('exist')
    cy.get('table > tbody').contains(secondUser.username).should('exist')
    cy.contains('button', 'Start').click()
    draftPlayer(parsedPlayerData[0]?.Name)
  })
})
