import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { routeWrapper, getParsedParams } from '@/app/api/utils/api'

export const GET = routeWrapper(
  async (req: NextRequest) => {
    console.log('HERE')
    const queryParams: any = getParsedParams(req.nextUrl)
    const draftPicks = await prisma.draftPick.findMany({ ...queryParams })
    return NextResponse.json(draftPicks)
  }
)
