import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { withSessionUser, routeWrapper, getParsedParams } from '@/app/api/utils/api'

export const GET = routeWrapper(
  async (req: NextRequest) => {
    const queryParams: any = getParsedParams(req.nextUrl)
    const teams = await prisma.team.findMany({ ...queryParams })
    return NextResponse.json(teams)
  }
)

export const POST = routeWrapper(async (req: NextRequest) => {
  await withSessionUser() // user must be logged in
  const { inviteEmail, ...data }: any = req.consumedBody
  const team = await prisma.team.create({ data })
  if (inviteEmail) {
    await prisma.teamUser.create({
      data: { teamId: team.id, inviteEmail: inviteEmail as string }
    })
  }
  return NextResponse.json(team)
})
