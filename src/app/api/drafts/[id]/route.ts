import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { ApiError, routeWrapper, getParsedParams } from '@/app/api/utils/api'
import { checkDraftCommissioner } from '@/app/api/utils/permissions'
import { createTeamIdArray, getRound } from '@/utils/draft'

export const GET = routeWrapper(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    const { id } = params
    const queryParams: any = getParsedParams(req.nextUrl) || {}
    if (!id) throw new ApiError('League id required', 400)
    const draft = await prisma.draft.findUnique({ ...queryParams, where: { id } })
    return NextResponse.json(draft)
  }
)

export const PUT = routeWrapper(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    const { id } = params
    if (!id) throw new ApiError('Draft id required', 400)
    await checkDraftCommissioner(id)
    const { keeperCount, setKeepers, ...data }: any = req.consumedBody
    const draft = await prisma.draft.findUnique({
      where: { id },
      include: {
        draftTeams: true,
        draftPicks: true,
        keepers: true
      }
    })
    if (!draft) throw new ApiError('Draft not found', 400)

    const teamIds = createTeamIdArray(draft.draftTeams.map((dt) => dt.teamId), keeperCount || 0)
    const updatedDraft = await prisma.draft.update({
      where: { id },
      data: {
        ...data,
        keepers: keeperCount ? {
          deleteMany: {},
          createMany: { data: teamIds.map((teamId) => ({ teamId })) }
        } : undefined,
        draftPicks: setKeepers ? {
          deleteMany: {},
          createMany: {
            data: draft.draftPicks.map((pick) => {
              const { overall, teamId } = pick
              const round = getRound(overall, draft.draftTeams.length)
              const keeper = draft?.keepers.find((k) => k.round === round && k.teamId === teamId)
              return { teamId, overall, playerId: keeper?.playerId || null }
            })
          }
        } : undefined,
      }
    })
    return NextResponse.json(updatedDraft)
  }
)

export const DELETE = routeWrapper(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    const { id } = params
    if (!id) throw new ApiError('Draft id required', 400)
    await checkDraftCommissioner(id) // commissioner only
    const deletedDraft = await prisma.draft.delete({ where: { id } })
    return NextResponse.json(deletedDraft)
  }
)
