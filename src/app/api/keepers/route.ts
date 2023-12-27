import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { routeWrapper, getParsedParams } from '@/app/api/utils/api'

export const GET = routeWrapper(
  async (req: NextRequest) => {
    const queryParams: any = getParsedParams(req.nextUrl)
    const keepers = await prisma.keeper.findMany({ ...queryParams })
    return NextResponse.json(keepers)
  }
)
