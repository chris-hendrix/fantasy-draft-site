import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { ApiError, routeWrapper, getParsedParams } from '@/app/api/utils/api'
import { checkTeamEdit } from '@/app/api/utils/permissions'

export const GET = routeWrapper(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params
    const queryParams: any = getParsedParams(req.nextUrl) || {}
    if (!id) throw new ApiError('League id required', 400)
    const team = await prisma.team.findUnique({ ...queryParams, where: { id } })
    return NextResponse.json(team)
  }
)

export const PUT = routeWrapper(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params
    if (!id) throw new ApiError('Team id required', 400)
    const {
      inviteEmails,
      acceptEmail,
      declineEmail,
      ...data
    }: any = req.consumedBody

    // add/edit new invites
    if (inviteEmails) {
      await checkTeamEdit(id, { commissionerOnly: true }) // commissioner only
      const inviteData: { inviteEmail: string } = inviteEmails.map(
        (email: string) => ({ inviteEmail: email })
      )
      await prisma.team.update({
        where: { id },
        data: {
          teamUsers: {
            deleteMany: { userId: null }, // delete and replace non-user invites
            createMany: { data: inviteData }
          }
        }
      })
    }

    // accepting invite
    if (acceptEmail) {
      const { user } = await checkTeamEdit(id, { inviteEmail: acceptEmail })
      const teamUser = await prisma.teamUser.findFirst({ where: { inviteEmail: acceptEmail } })
      teamUser && await prisma.teamUser.update({
        where: { id: teamUser.id },
        data: { inviteAcceptedAt: new Date(), userId: user.id }
      })
    }

    // declining invite
    if (declineEmail) {
      const { user } = await checkTeamEdit(id, { inviteEmail: declineEmail })
      const teamUser = await prisma.teamUser.findFirst({ where: { inviteEmail: declineEmail } })
      teamUser && await prisma.teamUser.update({
        where: { id: teamUser.id },
        data: { inviteDeclinedAt: new Date(), userId: user.id }
      })
    }

    await checkTeamEdit(id)
    const updatedTeam = await prisma.team.update({
      where: { id },
      data,
    })
    return NextResponse.json(updatedTeam)
  }
)

export const DELETE = routeWrapper(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params
    if (!id) throw new ApiError('Team id required', 400)
    await checkTeamEdit(id, { commissionerOnly: true }) // commissioner only
    const deletedTeam = await prisma.team.delete({ where: { id } })
    return NextResponse.json(deletedTeam)
  }
)
