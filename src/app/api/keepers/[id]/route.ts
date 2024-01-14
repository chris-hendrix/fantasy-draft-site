import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { ApiError, routeWrapper } from '@/app/api/utils/api'
import { checkTeamEdit } from '@/app/api/utils/permissions'

export const PUT = routeWrapper(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    const { id } = params
    if (!id) throw new ApiError('Keeper id required', 400)
    const keeper = await prisma.keeper.findFirst({ where: { id } })
    if (!keeper) throw new ApiError('Keeper not found', 400)
    await checkTeamEdit(keeper.teamId)
    const data: any = req.consumedBody
    const updatedPick = await prisma.keeper.update({ where: { id }, data })
    return NextResponse.json(updatedPick)
  }
)
