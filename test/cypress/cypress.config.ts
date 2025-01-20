import { defineConfig } from 'cypress'
import cypressFailFast from 'cypress-fail-fast/plugin'
import { deleteTestUsers } from '../utils'
import { APP_URL } from '../../src/config'

const cypressConfig = defineConfig({
  e2e: {
    baseUrl: APP_URL,
    retries: { runMode: 2, openMode: 1 },
    video: false,
    screenshotOnRunFailure: false,
    downloadsFolder: 'test/cypress/download',
    supportFile: 'test/cypress/support.ts',
    specPattern: 'test/cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    setupNodeEvents(on, _config) {
      on('task', {
        deleteTestUsers: async () => deleteTestUsers(),
      })
      cypressFailFast(on, _config)
    },
    env: { },
  },
})

export default cypressConfig
