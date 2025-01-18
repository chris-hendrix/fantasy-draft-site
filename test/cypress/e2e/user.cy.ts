/// <reference types="cypress" />

describe('User tests', () => {
  before(() => {
    cy.visit('')
    cy.signUpUser()
  })
  after(() => { cy.task('deleteTestUsers') })

  it('New user can sign in, edit profile, and logout', () => {
    cy.visit('')

    // user cannot signup twice
    cy.signUpUser()
    cy.contains('button', 'Sign up')
    cy.exitModal()

    // user can login and edit profile
    const newName = 'Patch Adams'
    cy.loginUser()
    cy.openMenuAndClick('Profile')
    cy.get('#edit-profile').click()
    cy.get('input[name="name"]').type(newName)
    cy.get('button[type="submit"]').click()
    cy.contains('button', 'Close').click()
    cy.contains(newName).should('exist')

    // user can logout
    cy.logoutUser()
  })

  it('User can change password', () => {
    cy.visit('')
    cy.loginUser()
    cy.openMenuAndClick('Profile')
    cy.get('#edit-profile').click()
    cy.contains('button', 'Change password').click()
    cy.get('input[name="currentPassword"]').type('Abcd1234!')
    cy.get('input[name="password"]').type('Abcd1234!!')
    cy.get('input[name="confirmPassword"]').type('Abcd1234!!')
    cy.contains('button', 'Save').click()
    cy.contains('Edit profile')
  })
})
