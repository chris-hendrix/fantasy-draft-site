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

type CheckTeamEditOptions = {
  commissionerOnly?: boolean
  inviteEmail?: string
}
export const checkTeamEdit = async (teamId: string, options: CheckTeamEditOptions = {}) => {
  const { commissionerOnly, inviteEmail } = { ...options }
  const session = await getServerSession(authOptions)
  if (!session) throw new ApiError('Unauthorized', 401)
  const userId = session.user.id

  const teamUser = !commissionerOnly && await prisma.teamUser.findFirst({
    where: { teamId, OR: [{ userId }, { inviteEmail }] },
    include: { team: true }
  })

  // check for commissioner
  if (!teamUser) {
    const league = await prisma.league.findFirst({
      where: { teams: { some: { id: teamId } } }
    })
    const commissioner = league && await prisma.commissioner.findFirst({
      where: { userId, leagueId: league.id }
    })
    if (!commissioner) throw new ApiError('Unauthorized', 401)
  }
  return { user: session.user, team: teamUser ? teamUser.team : null }
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

export const checkDraftTeam = async (draftId: string) => {
  const session = await getServerSession(authOptions)
  if (!session) throw new ApiError('Unauthorized', 401)
  const userId = session.user.id
  const draftTeam = await prisma.draftTeam.findFirst({
    where: { draftId, team: { teamUsers: { some: { userId } } } }
  })
  if (!draftTeam) throw new ApiError('Unauthorized', 401)
  return draftTeam
}

export const checkAdmin = async () => {
  const session = await getServerSession(authOptions)
  if (!session) throw new ApiError('Unauthorized', 401)
  const userId = session.user.id
  const admin = await prisma.user.findFirst({ where: { id: userId, admin: true } })
  if (!admin) throw new ApiError('Unauthorized', 401)
}
