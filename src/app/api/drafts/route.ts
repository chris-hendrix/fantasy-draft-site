import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { routeWrapper, getParsedParams, ApiError } from '@/app/api/utils/api'
import { checkLeagueCommissioner } from '../utils/permissions'

export const GET = routeWrapper(
  async (req: NextRequest) => {
    const queryParams: any = getParsedParams(req.nextUrl)
    const drafts = await prisma.draft.findMany({ ...queryParams })
    return NextResponse.json(drafts)
  }
)

export const POST = routeWrapper(async (req: NextRequest) => {
  const data: any = req.consumedBody
  if (!data.leagueId) throw new ApiError('Must have league id', 400)
  await checkLeagueCommissioner(data.leagueId)
  const draft = await prisma.draft.create({ data })
  return NextResponse.json(draft)
})
