/// <reference types="cypress" />
import csv from 'csvtojson'
import { createNewUser, User } from '../support'
import { playerData } from '../fixtures/player-data'

const commissioner = createNewUser('commissioner')
const secondUser = createNewUser('user')
const leagueName = `League ${new Date().getTime()}`
const keptPlayers: string[] = []
const allPlayers: string[] = []
const availablePlayers: string[] = []

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
  cy.get('#leagues-btn').click()
  cy.wait(1000)
  cy.contains('li', 'League invites').click()
  cy.get('#btn-accept-invite').click()
  cy.exitModal()
}

const goToLeagueHome = () => {
  cy.visit('/')
  cy.get('#leagues-btn').click()
  cy.contains(leagueName).click()
}

const draftPlayer = (playerName: string) => {
  cy.contains('a', playerName).click()
  cy.get('.modal-open').contains('button', 'Draft').click()
  cy.get('.modal-open').contains('button', 'Confirm').click()
  cy.get('td').contains('button', 'Draft').should('not.exist')
  availablePlayers.splice(availablePlayers.indexOf(playerName), 1)
}

const keepPlayer = (playerName: string, asCommissioner = true) => {
  // edit  keeper data in the all keepers table
  const buttonId = asCommissioner ? '#all-keeper-edit' : '#team-keeper-edit'
  cy.get(buttonId).click()
  const keeperEntryTd = cy.get('td')
    .filter((i, td) => Boolean(td.querySelector('div.input')))
    .first()
  keeperEntryTd.click() // click to enable the input
  keeperEntryTd.click() // click to insert the input
  keeperEntryTd.find('input').type(playerName.slice(0, 10))
  cy.contains(playerName).click()
  if (asCommissioner) {
    cy.get('input[placeholder="Round"]').first().type('3')
    cy.get('input[placeholder="Keeps"]').first().type('1')
  }
  cy.contains('button', 'Save').click()
  keptPlayers.push(playerName)
  availablePlayers.splice(availablePlayers.indexOf(playerName), 1)
}

describe('Draft create and start flow', () => {
  before(() => {
    cy.wrap((async () => csv().fromString(playerData))()).then((data) => {
      const parsedPlayerData = data as any[]
      allPlayers.push(...parsedPlayerData.map((player) => player.Name))
      availablePlayers.push(...parsedPlayerData.map((player) => player.Name))
    })
  })
  beforeEach(() => { cy.visit('/') })
  after(() => { cy.task('deleteTestUsers') })

  it('Commissioner can signup, create a league and invite users', () => {
    cy.signUpUser(commissioner)
    cy.get('#leagues-btn').click()
    cy.contains('li', 'Create league').click()
    cy.fillInput('name', leagueName)
    cy.fillInput('url', 'www.E2edDraft.com')
    cy.contains('button', 'Save').click()
    cy.contains(leagueName).should('exist')
    goToLeagueHome()
    inviteUser(commissioner)
    inviteUser(secondUser)
    cy.logoutUser()
  })

  it('User can signup and accept invite', () => {
    cy.visit('/')
    cy.signUpUser(secondUser)
    cy.visit('/')
    acceptInvite()
  })

  it('Commissioner can create draft', () => {
    cy.loginUser(commissioner)
    acceptInvite()
    goToLeagueHome()
    cy.contains('a', 'Draft').click()
    cy.contains('button', 'Start').should('not.exist')

    // commissioner creates draft
    goToLeagueHome()
    cy.contains('button', 'Add draft').click()
    cy.contains('button', 'Save').click()
    cy.reload() // TODO should improve UX
    cy.get('table > tbody').should('exist')
  })

  it('Commissioner can add players from csv', () => {
    cy.loginUser(commissioner)
    goToLeagueHome()
    cy.contains('a', 'Players').click()
    cy.contains('button', 'Import').click()
    cy.get('textarea').invoke('val', playerData).trigger('input')
    cy.get('textarea').type(' ') // type a char to enable the button
    cy.get('textarea').type('{backspace}')
    cy.contains('button', 'Read CSV').click()
    cy.get('table > tbody').should('exist')
    cy.contains('button', 'Overwrite').click()
    cy.contains('button', 'Confirm').click()
    cy.contains('a', allPlayers[0]).should('exist')
  })

  it('Commissioner can enable, edit, and import keepers', () => {
    cy.loginUser(commissioner)
    goToLeagueHome()
    cy.contains('a', 'Keepers').click()
    cy.contains('button', 'Generate').click()
    cy.contains('button', 'Generate keeper slots').click()
    cy.contains('button', 'Confirm').click()
    cy.get('table > tbody').should('exist')
    cy.contains('Keeper Entry').should('exist')

    // edit  keeper data in the all keepers table
    keepPlayer(availablePlayers[0])
  })

  it('Commissioner can set draft order, import keepers, start draft, and draft first player', () => {
    cy.loginUser(commissioner)
    goToLeagueHome()
    // TODO this can only happen after draft is created, need to handle vice versa
    cy.contains('a', 'Draft').click()
    cy.contains('button', 'Generate').click()
    cy.contains('button', 'Generate draft').click()
    cy.contains('button', 'Confirm').click()
    cy.get('table > tbody').contains(commissioner.username).should('exist')
    cy.get('table > tbody').contains(secondUser.username).should('exist')

    // import keepers into draft
    cy.contains('button', 'Keepers').click()
    cy.contains('button', 'Confirm').click()
    cy.get('tr').filter((index, tr) => (
      tr.innerText.includes(commissioner.username) &&
       tr.innerText.includes(keptPlayers[0])
    )).should('exist')
    cy.contains('button', 'Start').click()
    draftPlayer(availablePlayers[0])
  })

  it('User can draft the second player', () => {
    cy.loginUser(secondUser)
    goToLeagueHome()
    cy.contains('a', 'Draft').click()
    draftPlayer(availablePlayers[0])
  })
})
