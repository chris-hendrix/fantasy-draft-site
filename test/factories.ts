/* eslint-disable max-classes-per-file */
import prisma from '@/lib/prisma'
import { generateHash } from '@/app/api/utils/hash'
import { Prisma, Sport } from '@prisma/client'
import { TEST_EMAIL_DOMAIN } from './utils'

export const createUser = async (data: Partial<Prisma.UserUncheckedCreateInput> = {}) => {
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

export const createLeague = async (data: Partial<Prisma.LeagueUncheckedCreateInput> = {}) => {
  const league = await prisma.league.create({
    data: {
      name: `League ${new Date().getTime()}`,
      sport: 'baseball',
      ...data
    }
  })
  return league
}

export const createTeam = async (data: Partial<Prisma.TeamUncheckedCreateInput> = {}) => {
  const team = await prisma.team.create({
    data: {
      name: `Team ${new Date().getTime()}`,
      leagueId: data?.leagueId || (await createLeague()).id,
      teamUsers: data.teamUsers || { create: [{ userId: (await createUser()).id }] },
      ...data,
    }
  })
  return team
}

export const createDraft = async (data: Partial<Prisma.DraftUncheckedCreateInput> = {}) => {
  const draft = await prisma.draft.create({
    data: {
      year: data.year || (new Date()).getFullYear(),
      rounds: 22,
      leagueId: data.leagueId || (await createLeague()).id,
      ...data
    }
  })
  return draft
}

export const createPlayer = async (data: Partial<Prisma.PlayerUncheckedCreateInput> = {}) => {
  const player = await prisma.player.create({
    data: {
      name: `Player ${new Date().getTime()}`,
      draftId: data.draftId || (await createDraft()).id,
      ...data
    }
  })
  return player
}

export const createDraftPick = async (data: Partial<Prisma.DraftPickUncheckedCreateInput> = {}) => {
  const draft = data.draftId
    ? await prisma.draft.findUnique({ where: { id: data.draftId } })
    : await createDraft()
  if (!draft) return null
  const draftPick = await prisma.draftPick.create({
    data: {
      draftId: draft.id,
      teamId: data.teamId || (await createTeam({ leagueId: draft.leagueId })).id,
      overall: data.overall || Math.floor(Math.random() * 500),
      ...data
    }
  })
  return draftPick
}

export const createKeeper = async (data: Partial<Prisma.KeeperUncheckedCreateInput> = {}) => {
  const draft = data.draftId
    ? await prisma.draft.findUnique({ where: { id: data.draftId } })
    : await createDraft()
  if (!draft) return null
  const keeper = await prisma.keeper.create({
    data: {
      draftId: draft.id,
      teamId: data.teamId || (await createTeam({ leagueId: draft.leagueId })).id,
      ...data
    }
  })
  return keeper
}

export const getLeagueBody: () => { name: string; sport: Sport } = () => ({
  name: `League ${new Date().getTime()}`,
  sport: 'baseball'
})

export const getDraftBody: () => { year: number; } = () => ({
  year: (new Date()).getFullYear()
})
