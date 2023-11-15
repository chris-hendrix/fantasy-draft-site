import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { withSessionUser, routeWrapper, getQueryParams } from '@/utils/api'

export const GET = routeWrapper(
  async (req: NextRequest) => {
    const queryParams: any = getQueryParams(req.nextUrl)
    const leagues = await prisma.league.findMany({ ...queryParams })
    return NextResponse.json(leagues)
  }
)

export const POST = routeWrapper(async (req: NextRequest) => {
  const user = await withSessionUser() // user must be logged in
  const data: any = req.consumedBody
  const league = await prisma.league.create({ data })
  const commissioner = await prisma.commissioner.create({
    data: { leagueId: league.id, userId: user.id }
  })
  return NextResponse.json({ league, commissioner })
})
