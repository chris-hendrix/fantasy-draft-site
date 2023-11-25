import prisma from '@/lib/prisma'
import { LeagueWithRelationships, TeamWithRelationships, DraftWithRelationships } from '@/types'
import { generateHash } from '@/app/api/utils/hash'
import { Team, Prisma, Sport } from '@prisma/client'
import { TEST_EMAIL_DOMAIN } from './utils'

export const createUser = async (data: any = {}) => {
  const datetime = new Date().getTime()
  const user = await prisma.user.create({
    data: {
      name: `Patch Adams ${datetime}`,
      username: `patch-adams-${datetime}`,
      email: `patch-adams-${datetime}@${TEST_EMAIL_DOMAIN}`,
      password: await generateHash('Abcd1234!'),
      ...data
    }
  })
  return user
}

export const createLeague = async (data: any = {}) => {
  const league = await prisma.league.create({
    data: {
      name: `League ${new Date().getTime()}`,
      sport: 'baseball',
      ...data
    }
  })
  return league as LeagueWithRelationships
}

export const createTeam = async ({ createInput, userId, leagueId }: {
  createInput?: Prisma.XOR<Prisma.TeamCreateInput, Prisma.TeamUncheckedCreateInput>,
  userId?: string,
  leagueId?: string
} = {}): Promise<Partial<Team>> => {
  const league = leagueId
    ? await prisma.league.findUnique({ where: { id: leagueId } })
    : await createLeague()

  const team = await prisma.team.create({
    data: {
      ...createInput,
      name: `Team ${new Date().getTime()}`,
      leagueId: league?.id as any,
    }
  })
  if (userId) {
    await prisma.teamUser.create({ data: { userId, teamId: team.id } })
  }
  return team as TeamWithRelationships
}

export const createDraft = async ({ commissionerId }: {
  commissionerId?: string,
} = {}) => {
  const league = await createLeague({
    commissioners:
      { create: [{ userId: commissionerId || (await createUser()).id }] }
  })
  const draft = await prisma.draft.create({
    data: { leagueId: league.id, year: (new Date()).getFullYear() }
  })
  return draft as DraftWithRelationships
}

export const getLeagueBody: () => { name: string; sport: Sport } = () => ({
  name: `League ${new Date().getTime()}`,
  sport: 'baseball'
})

export const getDraftBody: () => { year: number; } = () => ({
  year: (new Date()).getFullYear()
})
