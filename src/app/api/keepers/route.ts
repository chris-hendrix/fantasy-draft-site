import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getRound } from '@/utils/draft'
import { routeWrapper, getParsedParams, ApiError } from '@/app/api/utils/api'

export const GET = routeWrapper(
  async (req: NextRequest) => {
    const { getPreviousPick, include, ...queryParams }: any = getParsedParams(req.nextUrl)
    let keepers = await prisma.keeper.findMany({
      include: { ...include, ...(getPreviousPick ? { team: true, player: true } : {}) },
      ...queryParams
    })

    // this attaches last years draft pick for each player
    const draftId = queryParams?.where?.draftId
    if (getPreviousPick && draftId) {
      const draft = await prisma.draft.findFirst({ where: { id: String(draftId) } })
      if (!draft) throw new ApiError('Keeper not found', 400)

      const previousDraft = await prisma.draft.findFirst({
        where: { leagueId: draft.leagueId, year: draft.year - 1 },
        include: { draftTeams: true, draftPicks: { include: { team: true, player: true } } }
      })

      if (previousDraft) {
        const { draftPicks, draftTeams } = previousDraft
        const teamsCount = draftTeams.length
        keepers = keepers.map((k: any) => {
          const draftPick = draftPicks.find((dp) => dp.player && dp.player.name === k.player?.name)
          const round = draftPick && getRound(draftPick.overall, teamsCount)
          const previousDraftInfo = draftPick && { round, draftPick }
          return { ...k, previousDraftInfo }
        })
      }
    }
    return NextResponse.json(keepers)
  }
)
