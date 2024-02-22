import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { ApiError, routeWrapper, getParsedParams } from '@/app/api/utils/api'
import { checkLeagueCommissioner } from '@/app/api/utils/permissions'
import { importDraftData, importResultsData } from '../../utils/draft'

export const GET = routeWrapper(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    const { id } = params
    const queryParams: any = getParsedParams(req.nextUrl) || {}
    if (!id) throw new ApiError('League id required', 400)

    const league = await prisma.league.findUnique({ ...queryParams, where: { id } })
    const latestDraft = await prisma.draft.findFirst({ where: { leagueId: id }, orderBy: { year: 'desc' } })
    return NextResponse.json({ ...league, latestDraft })
  }
)

export const PUT = routeWrapper(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    const { id } = params

    if (!id) throw new ApiError('League id required', 400)

    await checkLeagueCommissioner(id) // must be commissioner of league

    const { importedDraftRecords, importedResultsRecords, ...data } = req.consumedBody

    if (importedDraftRecords?.length > 0) {
      const drafts = await importDraftData(id, importedDraftRecords as any)
      return NextResponse.json(drafts)
    }

    if (importedResultsRecords?.length > 0) {
      const results = await importResultsData(id, importedResultsRecords as any)
      return NextResponse.json(results)
    }

    const updatedLeague = await prisma.league.update({ where: { id }, data })
    return NextResponse.json(updatedLeague)
  }
)

export const DELETE = routeWrapper(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    const { id } = params

    if (!id) throw new ApiError('League id required', 400)

    await checkLeagueCommissioner(id) // must be commissioner of league

    const deletedLeague = await prisma.league.delete({ where: { id } })
    return NextResponse.json(deletedLeague)
  }
)
