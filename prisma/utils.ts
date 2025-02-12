import { uniqueNamesGenerator, Config, names } from 'unique-names-generator'
import { PrismaClient } from '@prisma/client'
import * as fs from 'fs/promises'
import * as path from 'path'
import csv from 'csvtojson'
import { createTeamIdArray, getRound } from '../src/utils/draft'
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
    name: String(obj?.ID || obj?.id || obj.Id || obj?.name || obj?.Name),
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
  const teamsCount = 10
  const keepersCount = 5
  const rounds = 22
  const adminEmail = `admin@${SEED_EMAIL_DOMAIN}`

  // create admin and users
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { email: adminEmail },
    create: {
      email: adminEmail,
      username: 'admin',
      name: 'Admin',
      password: await generateHash('Abcd1234!'),
      admin: true
    }
  })
  const users = await Promise.all([...Array(teamsCount - 1)].map(() => generateUser()))

  // create league
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

  // round to the nearest x places
  const adjStat = (stat: number, places = 0) => (
    Math.round(stat * (0.5 + Math.random()) * 10 ** places) / 10 ** places
  )

  const createDraft = async (year: number, isComplete = false) => {
    // create last year's draft
    const draft = await prisma.draft.create({
      data: {
        leagueId: league.id,
        year,
        rounds,
        keeperCount: 5,
        draftTeams: { create: teams.map((t, i) => ({
          teamId: t.id,
          order: i,
          seasonFinish: isComplete ? i + 1 : undefined,
          seasonData: isComplete ? {
            K: adjStat(1500),
            R: adjStat(727),
            W: adjStat(85),
            GB: adjStat(5),
            HR: adjStat(213),
            SB: adjStat(90),
            SV: adjStat(75),
            AVG: adjStat(0.247, 3),
            ERA: adjStat(3.44, 2),
            Pct: adjStat(0.423, 3),
            RBI: adjStat(667),
            Name: t.name,
            Rank: i + 1,
            Team: t.name,
            Ties: adjStat(11),
            WHIP: adjStat(1.182, 3),
            Wins: adjStat(79),
            Year: year,
            Moves: adjStat(49),
            Losses: adjStat(110),
            RegRank: i + 1,
            PlayRank: i < 4 ? i + 1 : 'DNQ',
          } : undefined
        })) }
      }
    })

    const players = await Promise.all((await getPlayerData()).map((p) => prisma.player.create({
      data: {
        draftId: draft.id,
        name: p.name,
        data: p.data
      }
    })))

    // keepers
    Promise.all(
      createTeamIdArray(teams.map((team) => team.id), keepersCount)
        .map((teamId, i) => (prisma.keeper.create({
          data: {
            draftId: draft.id,
            teamId,
            playerId: players?.[i]?.id,
            round: getRound(i + 1, teamsCount),
            keeps: (i % 3) + 1
          }
        })))
    )

    // draft picks
    Promise.all(
      createTeamIdArray(teams.map((team) => team.id), rounds)
        .map((teamId, i) => (prisma.draftPick.create({
          data: {
            draftId: draft.id,
            teamId,
            overall: i + 1,
            playerId: isComplete ? players?.[i]?.id : null
          }
        })))
    )

    return draft
  }

  await createDraft(new Date().getFullYear() - 2, true)
  await createDraft(new Date().getFullYear() - 1, true)
  await createDraft(new Date().getFullYear(), false)

  return {
    league,
    commissioner: admin,
  }
}

export const deleteSeedData = async () => prisma.user.deleteMany({
  where: { email: { endsWith: `@${SEED_EMAIL_DOMAIN}` } }
})
