import prisma from '@/lib/prisma'
import { Prisma } from '@prisma/client'

const getTeamSeasonData = async (leagueId: string) => {
  const teams = await prisma.team.findMany({
    where: { leagueId },
    include: {
      teamUsers: { include: { user: true, team: true } },
      draftTeams: { include: {
        draft: true,
        team: { include: { teamUsers: { include: { user: true } } } }
      } },
    },
    orderBy: [{ archivedAt: 'desc' }, { name: 'asc' }]
  })

  const draftTeams = teams?.flatMap((t) => t.draftTeams) || []

  const statDraftTeams = draftTeams
    ?.filter((dt) => dt.seasonFinish !== null)
    ?.sort((a, b) => ((a.seasonFinish || 99) < (b.seasonFinish || 99) ? 1 : -1))
    ?.sort((a, b) => (a.draft.year < b.draft.year ? 1 : -1))

  const data = statDraftTeams.map((dt) => {
    const seasonData = dt.seasonData as Prisma.JsonObject
    const orderedKeys = [
      'Year', 'Team', 'Rank', 'Wins', 'Losses', 'Ties', 'Pct', 'AVG', 'R', 'HR', 'RBI', 'SB', 'K', 'W', 'SV', 'ERA', 'WHIP', 'Moves'
    ]
    const record: any = {
      Year: dt.draft.year,
      Team: dt.team.teamUsers?.[0]?.user?.name || dt.team.name,
    }
    orderedKeys.forEach((key) => {
      if (seasonData && key in seasonData) {
        record[key] = seasonData[key]
        delete seasonData[key]
      }
    })
    Object.assign(record, seasonData)

    return record
  })

  // sort by year then by rank
  data.sort((a, b) => {
    if (a.Year === b.Year) {
      return a.Rank - b.Rank
    }
    return a.Year - b.Year
  })
  return data
}

export default getTeamSeasonData
