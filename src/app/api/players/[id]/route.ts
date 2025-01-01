import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { ApiError, routeWrapper, getParsedParams } from '@/app/api/utils/api'
import { checkDraftCommissioner, checkDraftTeam } from '@/app/api/utils/permissions'

export const GET = routeWrapper(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params
    const queryParams: any = getParsedParams(req.nextUrl) || {}
    if (!id) throw new ApiError('Player id required', 400)
    const player = await prisma.player.findUnique({ ...queryParams, where: { id } })
    return NextResponse.json(player)
  }
)

export const PUT = routeWrapper(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params
    if (!id) throw new ApiError('Player id required', 400)
    const player = await prisma.player.findFirst({ where: { id } })
    if (!player) throw new ApiError('Player not found', 400)
    const { savedPlayer, ...data }: any = req.consumedBody

    if (savedPlayer !== undefined) {
      const { teamId } = await checkDraftTeam(player.draftId)
      const isDraftable = savedPlayer?.isDraftable
      const updatedPlayer = await prisma.player.update({
        where: { id },
        data: {
          savedPlayers: {
            delete: savedPlayer ? { id: savedPlayer.id } : undefined,
            create: isDraftable === false
              ? { teamId, isDraftable: null }
              : { teamId, isDraftable: !isDraftable }
          }
        }
      })
      return NextResponse.json(updatedPlayer)
    }

    await checkDraftCommissioner(player.draftId)
    const updatedPlayer = await prisma.player.update({ where: { id }, data })
    return NextResponse.json(updatedPlayer)
  }
)

export const DELETE = routeWrapper(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params
    if (!id) throw new ApiError('Player id required', 400)
    const player = await prisma.player.findFirst({ where: { id } })
    if (!player) throw new ApiError('Player not found', 400)
    await checkDraftCommissioner(player.draftId)
    const deletedPlayer = await prisma.player.delete({ where: { id } })
    return NextResponse.json(deletedPlayer)
  }
)
