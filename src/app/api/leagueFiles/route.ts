import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { routeWrapper, getParsedParams, ApiError, withSessionUser } from '@/app/api/utils/api'
import { checkLeagueCommissioner } from '../utils/permissions'

export const GET = routeWrapper(
  async (req: NextRequest) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const queryParams : any = getParsedParams(req.nextUrl)
    const leagueFiles = await prisma.leagueFile.findMany({ ...queryParams })
    return NextResponse.json(leagueFiles)
  }
)

export const POST = routeWrapper(async (req: NextRequest) => {
  const data: any = req.consumedBody
  if (!data.leagueId) throw new ApiError('Must have league id', 400)
  await checkLeagueCommissioner(data.leagueId)
  const user = await withSessionUser()

  const fileData = {
    userId: user.id,
    name: data.name,
    bucketPath: data.bucketPath,
    type: data.type,
    size: data.size,
    metadata: { title: 'File Name', description: 'File Description' },
  }

  const file = await prisma.file.create({
    data: fileData,
  })

  const leagueFileData = {
    leagueId: data.leagueId,
    fileId: file.id,
    category: data.category,
    draftId: data.draftId,
  }

  const leagueFile = await prisma.leagueFile.create({
    data: leagueFileData,
  })

  return NextResponse.json(leagueFile)
})
