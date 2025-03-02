import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { ApiError, routeWrapper, withSessionUser } from '@/app/api/utils/api'
import { checkLeagueCommissioner } from '@/app/api/utils/permissions'
import { File } from '@prisma/client'
import { deleteObject } from '../../utils/supabase'

export const PUT = routeWrapper(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const user = await withSessionUser()
    const { id } = await params
    if (!id) throw new ApiError('League file id required', 400)
    const leagueFile = await prisma.leagueFile.findFirst({
      where: { id },
      include: { file: true }
    })
    if (!leagueFile) throw new ApiError('Keeper not found', 400)

    await checkLeagueCommissioner(leagueFile.leagueId)

    const data = req.consumedBody
    const oldBucketPath = leagueFile.file.bucketPath

    // create new file if file updated
    let newFile: File | undefined
    if (data.bucketPath) {
      const fileData = {
        userId: user.id,
        name: data.name,
        bucketPath: data.bucketPath,
        type: data.type,
        size: data.size,
        metadata: data.metadata,
      }
      newFile = await prisma.file.create({
        data: fileData,
      })
    }

    // update league file
    const updatedLeagueFile = await prisma.leagueFile.update({ where: { id },
      data: {
        fileId: newFile?.id,
        category: data.category,
        draftId: data.draftId
      } })

    // update file metadata
    if (data.metadata || data.isArchived !== undefined) {
      await prisma.file.update({
        where: { id: updatedLeagueFile.fileId },
        data: {
          metadata: data.metadata,
          archivedAt: data.isArchived ? new Date() : null
        }
      })
    }

    // delete old supabase file if file updated
    if (newFile) {
      await deleteObject(oldBucketPath)
    }

    return NextResponse.json(updatedLeagueFile)
  }
)

export const DELETE = routeWrapper(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params
    if (!id) throw new ApiError('League file id required', 400)
    const leagueFile = await prisma.leagueFile.findFirst({
      where: { id },
      include: { file: true }
    })
    if (!leagueFile) throw new ApiError('Keeper not found', 400)
    await checkLeagueCommissioner(leagueFile.leagueId)
    const bucketPath = leagueFile?.file?.bucketPath
    await prisma.leagueFile.delete({ where: { id } })

    bucketPath && await deleteObject(bucketPath)
    return NextResponse.json({ id })
  }
)
