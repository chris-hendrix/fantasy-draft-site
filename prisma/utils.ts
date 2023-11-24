import { uniqueNamesGenerator, Config, names } from 'unique-names-generator'
import { PrismaClient } from '@prisma/client'
import { generateHash } from '../src/app/api/utils/hash'

const SEED_EMAIL_DOMAIN = 'seed.com'

export const prisma = new PrismaClient()

const generateUser = async () => {
  const config: Config = { dictionaries: [names] }
  const firstName = uniqueNamesGenerator(config)
  const lastName = uniqueNamesGenerator(config)
  const username = `${firstName.toLowerCase()}-${lastName.toLowerCase()}`

  const user = await prisma.user.create({
    data: {
      name: `${firstName} ${lastName}`,
      username,
      email: `${username}@${SEED_EMAIL_DOMAIN}`,
      password: await generateHash('Abcd1234!')
    }
  })
  return user
}

export const generateSeedData = async () => {
  const teamCount = 10
  const adminEmail = `admin@${SEED_EMAIL_DOMAIN}`
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { email: adminEmail },
    create: {
      email: adminEmail,
      username: 'admin',
      name: 'Admin',
      password: await generateHash('Abcd1234!')
    }
  })
  const users = await Promise.all([...Array(teamCount - 1)].map(() => generateUser()))

  const league = await prisma.league.create({
    data: {
      name: `Seed League ${new Date().getTime()}`,
      sport: 'baseball',
      commissioners: { create: [{ userId: admin.id }] },
      teams: {
        create: [
          { name: 'Admin Team', teamUsers: { create: [{ userId: admin.id }] } },
          ...users.map((user) => ({ name: `${user.name} Team`, teamUsers: { create: [{ userId: user.id }] } }))
        ]
      }
    }
  })
  return { league }
}

export const deleteSeedData = async () => prisma.user.deleteMany({
  where: { email: { endsWith: `@${SEED_EMAIL_DOMAIN}` } }
})
