import prisma from '@/lib/prisma'
import { getPlayerInfo } from './utils'

const getKeeperData = async (leagueId: string) => {
  const keepers = await prisma.keeper.findMany({
    where: { draft: { leagueId } },
    include: {
      draft: true,
      player: true,
      team: {
        include: {
          teamUsers: { include: { user: true } }
        }
      }
    },
  })

  const filledKeepers = keepers.filter((k) => k.playerId)
  const data = filledKeepers.map((k) => {
    const { team, player } = k
    return {
      year: k.draft.year,
      team: team.teamUsers?.[0]?.user?.name || team.name,
      player: player?.name,
      playerInfo: getPlayerInfo(player) || null,
      round: k.round,
      keeps: k.keeps,
    }
  })

  // sort by year, then by team
  data.sort((a, b) => {
    if (a.year === b.year) {
      return a.team.localeCompare(b.team)
    }
    return a.year - b.year
  })
  return data
}

export default getKeeperData
