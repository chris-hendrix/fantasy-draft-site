import { parse } from 'qs'
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { withSessionUser, routeWrapper } from '@/utils/api'

export const GET = routeWrapper(
  async (req: NextRequest) => {
    const searchParams: any = req.nextUrl.searchParams.toString()
    const findManyParams: any = parse(searchParams)
    const leagues = await prisma.league.findMany({ ...findManyParams })
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
