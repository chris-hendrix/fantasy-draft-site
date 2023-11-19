import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import authOptions from '@/lib/auth'
import { ApiError } from './api'

export const checkLeagueMember = async (leagueId: string) => {
  const session = await getServerSession(authOptions)
  if (!session) throw new ApiError('Unauthorized', 401)
  const userId = session.user.id

  const commissioner = prisma.commissioner.findFirst({ where: { userId, leagueId } })
  // TODO team
  if (!commissioner) throw new ApiError('Unauthorized', 401)
}

export const checkLeagueCommissioner = async (leagueId: string) => {
  const session = await getServerSession(authOptions)
  if (!session) throw new ApiError('Unauthorized', 401)
  const userId = session.user.id

  const commissioner = await prisma.commissioner.findFirst({ where: { userId, leagueId } })
  if (!commissioner) throw new ApiError('Unauthorized', 401)
}
