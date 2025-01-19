/* eslint-disable @typescript-eslint/no-namespace */
import { TEST_EMAIL_DOMAIN } from '../utils'

export type User = { username: string, email: string, password: string }
declare global {
  namespace Cypress {
    interface Chainable {
      signUpUser: (user?: User) => User,
      loginUser: (user?: User) => User,
      logoutUser: () => void,
      openMenuAndClick: (linkText: string) => void
      fillInput: (name: string, value: string) => void
      exitModal: () => void
    }
  }
}

export const createNewUser = (username: string = 'patch-adams') => ({
  username: `${username}-${new Date().getTime()}`,
  email: `${username}-${new Date().getTime()}@${TEST_EMAIL_DOMAIN}`,
  password: 'Abcd1234!'
})

export const defaultUser = createNewUser()

Cypress.Commands.add('openMenuAndClick', (linkText) => {
  cy.get('[id="dropdown"]').click()
  cy.contains('li', linkText).click()
})

Cypress.Commands.add('signUpUser', (user = defaultUser) => {
  cy.openMenuAndClick('Sign up')
  cy.get('input[name="email"]').type(user.email)
  cy.get('input[name="password"]').type(user.password)
  cy.get('input[name="confirmPassword"]').type(user.password)
  cy.contains('button', 'Sign up').click()
  cy.wait(1000)
})

Cypress.Commands.add('loginUser', (user = defaultUser) => {
  cy.openMenuAndClick('Log in')
  cy.get('input[name="email"]').type(user.email)
  cy.get('input[name="password"]').type(user.password)
  cy.contains('button', 'Log in').click()
})

Cypress.Commands.add('logoutUser', () => {
  cy.visit('/')
  cy.openMenuAndClick('Log out')
  cy.visit('/')
})

Cypress.Commands.add('fillInput', (name, value) => {
  cy.get(`input[name="${name}"]`).type(value)
})

Cypress.Commands.add('exitModal', () => {
  cy.contains('button', '✕').click()
  cy.get('.modal-open').should('not.exist')
})
