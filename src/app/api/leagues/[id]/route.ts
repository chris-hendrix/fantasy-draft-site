import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { ApiError, routeWrapper, getParsedParams } from '@/app/api/utils/api'
import { checkLeagueCommissioner } from '@/app/api/utils/permissions'

export const GET = routeWrapper(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    const { id } = params
    const queryParams: any = getParsedParams(req.nextUrl) || {}
    if (!id) throw new ApiError('League id required', 400)

    const league = await prisma.league.findUnique({ ...queryParams, where: { id } })
    return NextResponse.json(league)
  }
)

export const PUT = routeWrapper(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    const { id } = params

    if (!id) throw new ApiError('League id required', 400)

    await checkLeagueCommissioner(id) // must be commissioner of league

    const updatedLeague = await prisma.league.update({
      where: { id },
      data: req.consumedBody,
    })
    return NextResponse.json(updatedLeague)
  }
)

export const DELETE = routeWrapper(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    const { id } = params

    if (!id) throw new ApiError('League id required', 400)

    await checkLeagueCommissioner(id) // must be commissioner of league

    const deletedLeague = await prisma.league.delete({ where: { id } })
    return NextResponse.json(deletedLeague)
  }
)
