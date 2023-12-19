import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { routeWrapper, getParsedParams, ApiError } from '@/app/api/utils/api'
import { checkDraftCommissioner } from '../utils/permissions'

export const GET = routeWrapper(
  async (req: NextRequest) => {
    const queryParams: any = getParsedParams(req.nextUrl)
    const players = await prisma.player.findMany({ ...queryParams })
    return NextResponse.json(players)
  }
)

export const POST = routeWrapper(async (req: NextRequest) => {
  const data: any = req.consumedBody
  if (!data.draftId) throw new ApiError('Must have draft id', 400)
  await checkDraftCommissioner(data.draftId)
  const player = await prisma.player.create({ data })
  return NextResponse.json(player)
})
