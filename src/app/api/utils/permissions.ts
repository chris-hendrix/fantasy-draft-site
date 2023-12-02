import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import authOptions from '@/lib/auth'
import { ApiError } from './api'

export const checkLeagueMember = async (leagueId: string) => {
  const session = await getServerSession(authOptions)
  if (!session) throw new ApiError('Unauthorized', 401)
  const userId = session.user.id

  const commissioner = await prisma.commissioner.findFirst({ where: { userId, leagueId } })
  const team = await prisma.team.findFirst({
    where: { leagueId, teamUsers: { some: { userId } } }
  })
  if (!commissioner || !team) throw new ApiError('Unauthorized', 401)
}

export const checkTeamEdit = async (teamId: string, commissionerOnly: boolean = false) => {
  const session = await getServerSession(authOptions)
  if (!session) throw new ApiError('Unauthorized', 401)
  const userId = session.user.id
  const team = !commissionerOnly && await prisma.team.findFirst({
    where: { id: teamId, teamUsers: { every: { userId: String(userId) } } }
  })

  if (!team) {
    const league = commissionerOnly && await prisma.league.findFirst({
      where: { teams: { some: { id: teamId } } }
    })
    if (!league) throw new ApiError('Unauthorized', 401)
  }
  return { user: session.user, team }
}

export const checkLeagueCommissioner = async (leagueId: string) => {
  const session = await getServerSession(authOptions)
  if (!session) throw new ApiError('Unauthorized', 401)
  const userId = session.user.id
  const commissioner = await prisma.commissioner.findFirst({ where: { userId, leagueId } })
  if (!commissioner) throw new ApiError('Unauthorized', 401)
}

export const checkDraftCommissioner = async (draftId: string) => {
  const draft = await prisma.draft.findFirst({ where: { id: draftId } })
  if (!draft) throw new ApiError('Unauthorized', 401)
  await checkLeagueCommissioner(draft.leagueId)
}
