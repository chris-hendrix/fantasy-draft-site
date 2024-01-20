import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { routeWrapper, getParsedParams, ApiError } from '@/app/api/utils/api'

export const GET = routeWrapper(
  async (req: NextRequest) => {
    const queryParams: any = getParsedParams(req.nextUrl)
    const draftPicks = await prisma.draftPick.findMany({ ...queryParams })
    return NextResponse.json(draftPicks)
  }
)

export const POST = routeWrapper(async (_req: NextRequest) => {
  throw new ApiError('Route not found', 404)
})
