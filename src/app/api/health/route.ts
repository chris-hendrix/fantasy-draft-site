import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { routeWrapper } from '@/app/api/utils/api'

export const GET = routeWrapper(
  async (_req: NextRequest) => {
    const leagues = await prisma.league.count()
    const users = await prisma.user.count()
    return NextResponse.json({ leagues, users })
  }
)
