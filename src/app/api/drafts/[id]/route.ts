import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { ApiError, routeWrapper, getParsedParams } from '@/app/api/utils/api'
import { checkDraftCommissioner, checkTeamEdit } from '@/app/api/utils/permissions'
import { createTeamIdArray, getRound } from '@/utils/draft'
import { getUnique } from '@/utils/array'
import { getAllDraftData } from '../../utils/draft'

export const GET = routeWrapper(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params
    const { getAllData, previousYear, ...queryParams }: any = getParsedParams(req.nextUrl) || {}
    if (!id) throw new ApiError('Draft id required', 400)

    let draftId = id
    if (previousYear) {
      const currentDraft = previousYear && await prisma.draft.findUnique({ where: { id: draftId } })
      const previousDraft = currentDraft && await prisma.draft.findFirst({
        where: { leagueId: currentDraft?.leagueId, year: currentDraft.year - 1 }
      })
      draftId = previousDraft.id
    }
    if (getAllData) {
      const draft = await getAllDraftData(draftId)
      return NextResponse.json(draft)
    }
    const draft = await prisma.draft.findUnique({ ...queryParams, where: { id: draftId } })
    if (!draft) throw new ApiError('Draft not found', 400)
    return NextResponse.json(draft)
  }
)

export const PUT = routeWrapper(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params
    if (!id) throw new ApiError('Draft id required', 400)
    const {
      keeperCount,
      setKeepers,
      teamKeepers,
      ...data
    }: any = req.consumedBody

    // add team specific keepers
    if (teamKeepers?.length) {
      const uniqueTeamIds = getUnique<any>(teamKeepers, (tk) => tk?.teamId).map((tk) => tk.teamId)
      if (uniqueTeamIds?.length !== 1) throw new ApiError('Invalid request')
      const editingTeamId = uniqueTeamIds[0]
      await checkTeamEdit(editingTeamId)
      const draft = await prisma.draft.findUnique({ where: { id }, include: { keepers: true } })
      if (!draft) throw new ApiError('Draft not found', 400)
      const existingKeeperData = draft.keepers
        .filter((k) => k.teamId !== editingTeamId)
        .map(({ teamId, playerId, round, keeps }) => ({ teamId, playerId, round, keeps }))
      const newKeeperData = teamKeepers
        .map(({ teamId, playerId, round, keeps }: any) => ({ teamId, playerId, round, keeps }))

      const updatedDraft = await prisma.draft.update({
        where: { id },
        data: {
          keepers: {
            deleteMany: {},
            createMany: { data: [...existingKeeperData, ...newKeeperData] }
          }
        }
      })
      return NextResponse.json(updatedDraft)
    }

    await checkDraftCommissioner(id)
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
        ...(!keeperCount ? {} : {
          keepers: {
            deleteMany: {},
            createMany: { data: teamIds.map((teamId) => ({ teamId })) }
          }
        }),
        ...(!setKeepers ? {} : {
          draftPicks: {
            deleteMany: {},
            createMany: {
              data: draft.draftPicks.map((pick) => {
                const { overall, teamId } = pick
                const round = getRound(overall, draft.draftTeams.length)
                const keeper = draft?.keepers.find((k) => k.round === round && k.teamId === teamId)
                return { teamId, overall, playerId: keeper?.playerId || null }
              })
            }
          }
        }),
      }
    })
    return NextResponse.json(updatedDraft)
  }
)

export const DELETE = routeWrapper(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params
    if (!id) throw new ApiError('Draft id required', 400)
    await checkDraftCommissioner(id) // commissioner only
    const deletedDraft = await prisma.draft.delete({ where: { id } })
    return NextResponse.json(deletedDraft)
  }
)
