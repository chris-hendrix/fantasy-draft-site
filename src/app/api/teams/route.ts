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
  const data: any = req.consumedBody
  const team = await prisma.team.create({ data })
  return NextResponse.json(team)
})
