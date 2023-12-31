import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { ApiError, routeWrapper } from '@/app/api/utils/api'
import { checkDraftCommissioner } from '@/app/api/utils/permissions'

export const PUT = routeWrapper(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    const { id } = params
    if (!id) throw new ApiError('Pick id required', 400)
    const pick = await prisma.draftPick.findFirst({ where: { id } })
    if (!pick) throw new ApiError('Pick not found', 400)
    await checkDraftCommissioner(pick.draftId)
    const data: any = req.consumedBody
    const updatedPick = await prisma.draftPick.update({ where: { id }, data })
    return NextResponse.json(updatedPick)
  }
)
