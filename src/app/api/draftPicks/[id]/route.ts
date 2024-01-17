import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { ApiError, routeWrapper } from '@/app/api/utils/api'
import { checkTeamEdit } from '@/app/api/utils/permissions'
import { getNextPick } from '../../utils/draft'

export const PUT = routeWrapper(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    const { id } = params
    if (!id) throw new ApiError('Pick id required', 400)
    const pick = await prisma.draftPick.findFirst({ where: { id }, include: { draft: true } })
    if (!pick) throw new ApiError('Pick not found', 400)
    await checkTeamEdit(pick.teamId, pick.draft.disableUserDraft)
    const { startClock, ...data }: any = req.consumedBody
    const updatedPick = await prisma.draftPick.update({ where: { id }, data })

    if (startClock) {
      const nextPick = await getNextPick(pick.draftId, pick.overall)
      nextPick && await prisma.draftPick.update({
        where: { id: nextPick.id },
        data: { clockStartedAt: new Date() }
      })
    }
    return NextResponse.json(updatedPick)
  }
)
