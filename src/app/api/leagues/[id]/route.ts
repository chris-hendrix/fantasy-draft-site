import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { ApiError, routeWrapper } from '@/utils/api'

export const GET = routeWrapper(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    const { id } = params

    if (!id) throw new ApiError('League id required', 400)

    const league = await prisma.league.findUnique({ where: { id } })
    return NextResponse.json(league)
  }
)

export default GET
