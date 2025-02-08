import { NextRequest, NextResponse } from 'next/server'
import archiver from 'archiver'
import { routeWrapper } from '@/app/api/utils/api'
import { PassThrough } from 'stream'
import { checkLeagueCommissioner } from '../utils/permissions'
import getTeamSeasonData from './team-season-data'
import getDraftPickData from './draft-pick-data'
import getKeeperData from './keeper-data'

const convertToCSV = (objArray: any[]): any => {
  const array = [Object.keys(objArray[0])].concat(objArray)
  return array.map((row) => Object.values(row)
    .map((value) => (typeof value === 'string' ? JSON.stringify(value) : value)).toString())
    .join('\n')
}

export const POST = routeWrapper(
  async (req: NextRequest) => {
    const { leagueId } = req.consumedBody
    await checkLeagueCommissioner(leagueId)

    const teamSeasonData = await getTeamSeasonData(leagueId)
    const draftPickData = await getDraftPickData(leagueId)
    const keeperData = await getKeeperData(leagueId)

    const teamSeasonCSV = convertToCSV(teamSeasonData)
    const draftPickCSV = convertToCSV(draftPickData)
    const keeperCSV = convertToCSV(keeperData)

    const archive = archiver('zip', {
      zlib: { level: 9 }
    })

    const passThrough = new PassThrough()

    archive.pipe(passThrough)

    archive.append(teamSeasonCSV, { name: 'team-season-data.csv' })
    archive.append(draftPickCSV, { name: 'draft-pick-data.csv' })
    archive.append(keeperCSV, { name: 'keeper-data.csv' })

    await archive.finalize()

    const readableStream = new ReadableStream({
      start(controller) {
        passThrough.on('data', (chunk) => controller.enqueue(chunk))
        passThrough.on('end', () => controller.close())
        passThrough.on('error', (err) => controller.error(err))
      }
    })

    return new NextResponse(readableStream, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="export.zip"',
      },
    })
  }
)
