import { uniqueNamesGenerator, Config, names } from 'unique-names-generator'
import { PrismaClient } from '@prisma/client'
import * as fs from 'fs/promises'
import * as path from 'path'
import csv from 'csvtojson'
import { createTeamIdArray } from '../src/utils/draft'
import { generateHash } from '../src/app/api/utils/hash'

const PLAYER_DATA = 'player-data-raw-seed.csv'
type Player = { name: string, data: any }

const readFileIntoString = async (fileName: string): Promise<string> => {
  try {
    const filePath = path.resolve(__dirname, fileName)
    const fileContents = await fs.readFile(filePath, 'utf-8')
    return fileContents
  } catch (error: any) {
    throw new Error(error?.message || 'An error occurred')
  }
}

const getPlayerData = async (): Promise<Player[]> => {
  const csvString = await readFileIntoString(PLAYER_DATA)
  const objects = await csv({ checkType: true }).fromString(csvString)
  const imported = objects.map((obj: any) => ({
    name: String(obj?.name || obj?.Name),
    data: obj
  }))
  return imported
}

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
  const rounds = 22
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
    }
  })

  const teams = await Promise.all([admin, ...users].map((u) => prisma.team.create({
    data: {
      leagueId: league.id,
      name: `${u.name} Team`,
      teamUsers: { create: [{ userId: u.id }] }
    }
  })))

  const draft = await prisma.draft.create({
    data: {
      leagueId: league.id,
      year: new Date().getFullYear() - 1,
      rounds,
      draftTeams: { create: teams.map((t, i) => ({ teamId: t.id, order: i })) }
    }
  })

  const players = await Promise.all((await getPlayerData()).map((p) => prisma.player.create({
    data: {
      draftId: draft.id,
      name: p.name,
      data: p.data
    }
  })))

  const draftTeamData = await Promise.all(teams.map((t, i) => ({
    draftId: draft.id, teamId: t.id, order: i
  })))

  Promise.all(
    createTeamIdArray(draftTeamData.map((s) => s.teamId), rounds)
      .map((teamId, i) => (prisma.draftPick.create({
        data: {
          draftId: draft.id,
          teamId,
          overall: i + 1,
          playerId: players?.[i]?.id
        }
      })))
  )

  return { league }
}

export const deleteSeedData = async () => prisma.user.deleteMany({
  where: { email: { endsWith: `@${SEED_EMAIL_DOMAIN}` } }
})
