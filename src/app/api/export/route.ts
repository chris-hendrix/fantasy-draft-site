import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { routeWrapper } from '@/app/api/utils/api'
import { checkLeagueCommissioner } from '../utils/permissions'

export function convertToCSV(objArray: any[]): any {
  const array = [Object.keys(objArray[0])].concat(objArray)
  return array.map((row) => Object.values(row)
    .map((value) => (typeof value === 'string' ? JSON.stringify(value) : value)).toString())
    .join('\n')
}

export const POST = routeWrapper(
  async (req: NextRequest) => {
    const { leagueId } = req.consumedBody
    checkLeagueCommissioner(leagueId)
    const draftPicks = await prisma.draftPick.findMany({
      where: { draft: { leagueId } },
      include: {
        player: true,
        draft: true,
        team: { include: { teamUsers: { include: { user: true } } } } },
    })

    const keepers = await prisma.keeper.findMany({
      where: { draft: { leagueId } },
    })

    const draftPickData = draftPicks.map((dp) => {
      const keeper = keepers.find((k) => k.playerId && k.playerId === dp?.playerId)
      return {
        year: dp.draft.year,
        overall: dp.overall,
        team: dp?.team?.teamUsers?.[0]?.user?.name || null,
        player: dp?.player?.name || null,
        keeperRound: keeper?.round || null,
        keeperKeeps: keeper?.keeps || null
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
