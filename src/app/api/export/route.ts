import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { routeWrapper } from '@/app/api/utils/api'
import { JsonObject } from '@prisma/client/runtime/library'
import { Player } from '@prisma/client'
import { checkLeagueCommissioner } from '../utils/permissions'

const convertToCSV = (objArray: any[]): any => {
  const array = [Object.keys(objArray[0])].concat(objArray)
  return array.map((row) => Object.values(row)
    .map((value) => (typeof value === 'string' ? JSON.stringify(value) : value)).toString())
    .join('\n')
}

const getPlayerInfo = (player: Player | null) => {
  const key = 'PlayerInfo'
  if (!player?.data) return null
  const data = player?.data as JsonObject
  if (!(key in data)) return null
  return data[key] as string
}

export const POST = routeWrapper(
  async (req: NextRequest) => {
    const { leagueId } = req.consumedBody
    checkLeagueCommissioner(leagueId)
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

    const csv = convertToCSV(draftPickData)
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="league-data.csv"',
      },
    })
  }
)
