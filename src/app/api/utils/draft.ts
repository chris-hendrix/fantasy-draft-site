import prisma from '@/lib/prisma'
import { ApiError } from '@/app/api/utils/api'
import { getRound } from '@/utils/draft'
import { Player } from '@prisma/client'

export const getAllDraftData = async (draftId: string) => {
  const draft = await prisma.draft.findUnique({
    where: { id: draftId },
    include: {
      league: { include: { commissioners: true } },
      draftTeams: { include: { team: { include: { teamUsers: true } } } },
      keepers: { include: { player: true, team: true }, orderBy: { round: 'asc' } },
      draftPicks: { include: { player: true, team: true }, orderBy: { overall: 'asc' } },
      players: { include: { draftPicks: { include: { team: true } } } }
    }
  })

  if (!draft) throw new ApiError('Draft not found', 400)

  const previousDraft = await prisma.draft.findFirst({
    where: { leagueId: draft.leagueId, year: draft.year - 1 },
    include: { draftTeams: true, draftPicks: { include: { team: true, player: true } } }
  })

  if (!previousDraft) return draft

  const { draftPicks, draftTeams } = previousDraft
  const teamsCount = draftTeams.length
  const playerData = draft.players.map((player: Player) => {
    const draftPick = draftPicks.find((dp) => dp.player && dp.player.name === player?.name)
    const round = draftPick && getRound(draftPick.overall, teamsCount)
    const previousDraftInfo = draftPick && { round, draftPick }
    return { ...player, previousDraftInfo }
  })

  return { ...draft, players: playerData }
}
