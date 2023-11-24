/* eslint-disable no-console */
/* eslint-disable import/no-extraneous-dependencies */

import { generateSeedData, prisma } from './utils'

generateSeedData()
  .then(async (res) => {
    console.log(res)
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
