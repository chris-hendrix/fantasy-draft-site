import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { routeWrapper, ApiError } from '@/app/api/utils/api'
import { getSignedDownloadUrl, getSignedUploadUrl } from '../../utils/supabase'
import { checkLeagueMember, checkLeagueCommissioner } from '../../utils/permissions'

export const POST = routeWrapper(async (req: NextRequest) => {
  const { bucketPath, leagueId, isUpload, leagueFileId }: any = req.consumedBody

  if (!leagueId) throw new ApiError('Must specify league id', 400)
  checkLeagueMember(leagueId)

  if (isUpload) {
    if (!bucketPath) throw new ApiError('Must specify bucket path', 400)
    checkLeagueCommissioner(leagueId)
    const { signedUrl } = await getSignedUploadUrl(
      bucketPath,
    )
    return NextResponse.json({ signedUrl, path: bucketPath })
  }

  if (!leagueFileId) throw new ApiError('Must specify league file id', 400)
  const leagueFile = await prisma.leagueFile.findUnique({
    where: { id: leagueFileId },
    select: { file: true },
  })
  if (!leagueFile) throw new ApiError('League file not found', 404)
  const { signedUrl } = await getSignedDownloadUrl(
    leagueFile.file.bucketPath
  )
  return NextResponse.json({ signedUrl })
})
