/// <reference types="cypress" />
import { createNewUser } from '../support'

describe('Auth flow', () => {
  const user = createNewUser()

  beforeEach(() => {
    cy.visit('/')
  })

  after(() => { cy.task('deleteTestUsers') })

  it('New user can sign up, edit profile, and logout', () => {
    const newName = 'Patch Adams'
    cy.signUpUser(user)
    cy.openMenuAndClick('Profile')
    cy.get('#edit-profile').click()
    cy.get('input[name="name"]').type(newName)
    cy.get('button[type="submit"]').click()
    cy.contains('button', 'Close').click()
    cy.contains(newName).should('exist')
    cy.logoutUser()
  })

  it('User cannot signup with existing email', () => {
    cy.signUpUser(user)
    cy.contains('button', 'Sign up')
    cy.exitModal()
  })

  it('User can change password', () => {
    const newPassword = 'Abcd1234!!'
    cy.loginUser(user)
    cy.openMenuAndClick('Profile')
    cy.get('#edit-profile').click()
    cy.contains('button', 'Change password').click()
    cy.get('input[name="currentPassword"]').type('Abcd1234!')
    cy.get('input[name="password"]').type('Abcd1234!!')
    cy.get('input[name="confirmPassword"]').type(newPassword)
    cy.contains('button', 'Save').click()
    cy.contains('Edit profile')
    cy.logoutUser()
    cy.loginUser({ ...user, password: newPassword })
    cy.openMenuAndClick('Profile')
  })
})
