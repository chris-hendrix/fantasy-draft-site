import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { ApiError, routeWrapper, getParsedParams } from '@/app/api/utils/api'
import { checkTeamEdit } from '@/app/api/utils/permissions'

export const GET = routeWrapper(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    const { id } = params
    const queryParams: any = getParsedParams(req.nextUrl) || {}
    if (!id) throw new ApiError('League id required', 400)
    const team = await prisma.team.findUnique({ ...queryParams, where: { id } })
    return NextResponse.json(team)
  }
)

export const PUT = routeWrapper(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    const { id } = params
    if (!id) throw new ApiError('Team id required', 400)
    await checkTeamEdit(id)
    const updatedTeam = await prisma.team.update({
      where: { id },
      data: req.consumedBody,
    })
    return NextResponse.json(updatedTeam)
  }
)

export const DELETE = routeWrapper(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    const { id } = params
    if (!id) throw new ApiError('Team id required', 400)
    await checkTeamEdit(id, true) // commissioner only
    const deletedTeam = await prisma.team.delete({ where: { id } })
    return NextResponse.json(deletedTeam)
  }
)
