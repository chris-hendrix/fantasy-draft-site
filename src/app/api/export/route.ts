import { NextRequest, NextResponse } from 'next/server'
import { routeWrapper } from '@/app/api/utils/api'
import { checkLeagueCommissioner } from '../utils/permissions'
import getHistoricalData from './historical-data'
import getDraftPickData from './draft-picks'

const convertToCSV = (objArray: any[]): any => {
  const array = [Object.keys(objArray[0])].concat(objArray)
  return array.map((row) => Object.values(row)
    .map((value) => (typeof value === 'string' ? JSON.stringify(value) : value)).toString())
    .join('\n')
}

export const POST = routeWrapper(
  async (req: NextRequest) => {
    const { leagueId } = req.consumedBody
    const exportName = req.consumedBody?.exportName || 'league-data'
    await checkLeagueCommissioner(leagueId)

    let data: any = {}
    if (exportName === 'historical-data') {
      data = await getHistoricalData(leagueId)
    } else if (exportName === 'historical-avg-data') {
      data = await getHistoricalData(leagueId, true)
    } else {
      data = await getDraftPickData(leagueId)
    }

    const csv = convertToCSV(data)
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${exportName}.csv"`,
      },
    })
  }
)
