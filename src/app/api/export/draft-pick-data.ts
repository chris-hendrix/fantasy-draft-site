import prisma from '@/lib/prisma'
import { getPlayerInfo } from './utils'

const getDraftPickData = async (leagueId: string) => {
  const draftPicks = await prisma.draftPick.findMany({
    where: { draft: { leagueId } },
    include: {
      player: true,
      draft: { include: { draftTeams: true, league: true } },
      team: {
        include: {
          teamUsers: { include: { user: true } }
        }
      }
    },
  })

  const keepers = await prisma.keeper.findMany({
    where: { draft: { leagueId } },
  })

  const draftPickData = draftPicks.map((dp) => {
    const { overall, draft, playerId, player } = dp
    const keeper = keepers.find((k) => k.playerId && k.playerId === playerId)
    const teamsCount = draft.draftTeams?.length || null
    const round = teamsCount ? Math.floor((overall - 1) / teamsCount) + 1 : 99
    const roundPick = teamsCount ? ((overall - 1) % teamsCount) + 1 : 99
    const teamName = (
      dp.team?.teamUsers?.[0]?.user?.name ||
      dp.team.name
    )
    return {
      year: draft.year,
      overall,
      round,
      roundPick,
      team: teamName || null,
      player: player?.name || null,
      playerInfo: getPlayerInfo(player) || null,
      keeperRound: keeper?.round || null,
      keeperKeeps: keeper?.keeps || null,
    }
  })

  // sort by year, then by overall
  draftPickData.sort((a, b) => {
    if (a.year === b.year) {
      return a.overall - b.overall
    }
    return a.year - b.year
  })

  return draftPickData
}

export default getDraftPickData
