import { useState } from 'react'
import { LeagueFileArgs } from '@/types'
import { Prisma, LeagueFileCategory } from '@prisma/client'
import { getCrudHooks } from '@/utils/getCrudHooks'
import { leagueFileApi } from '@/store/leagueFile'

type FileData = {
  bucketPath?: string
  name?: string
  type?: string
  size?: number
  metadata?: Record<string, any> | null
}

export const {
  useGetObjects: useGetLeagueFiles,
  useAddObject: useAddLeagueFile,
  useUpdateObject: useUpdateLeagueFile,
  useDeleteObject: useDeleteLeagueFile,
  useInvalidateObject: useInvalidateLeagueFile,
  useInvalidateObjects: useInvalidateLeagueFiles,
} = getCrudHooks<LeagueFileArgs, Prisma.LeagueFileFindManyArgs,
Prisma.LeagueFileUncheckedUpdateInput & FileData>(
  leagueFileApi
)

type SignedUrlOptions = {
  isUpload?: boolean
  bucketPath?: string // for upload
  leagueFileId?: string // for download
}

type LeagueFileData = {
  category?: LeagueFileCategory
  metadata?: Record<string, any>
  draftId?: string
}

const getSignedUrl = async (leagueId: string, options: SignedUrlOptions = {}) => {
  const res = await fetch('/api/leagueFiles/signedUrl', {
    method: 'POST',
    body: JSON.stringify({ leagueId, ...options }),
    headers: {
      'Content-Type': 'application/json',
    },
  })
  if (!res.ok) throw new Error('Failed to get signed upload url')
  const data = await res.json()
  return data as { signedUrl: string, path: string }
}
const uploadFileToSignedUrl = async (
  file: File,
  leagueId: string,
) => {
  const bucketPath = `leagues/${leagueId}/${file.name}`
  const { signedUrl, path } = await getSignedUrl(leagueId, { isUpload: true, bucketPath })
  const res = await fetch(signedUrl, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type,
    },
  })
  if (!res.ok) throw new Error('Failed to upload file to signed URL')
  return path
}

const downloadFileFromSignedUrl = async (leagueId: string, leagueFileId: string) => {
  const { signedUrl } = await getSignedUrl(leagueId, { leagueFileId })
  const res = await fetch(signedUrl)
  if (!res.ok) throw new Error('Failed to download file from signed URL')
  return res.blob()
}

export const useLeagueFiles = (leagueId: string) => {
  const [isMutating, setIsMutating] = useState(false)
  const [mutateError, setMutateError] = useState<any | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState<any | null>(null)

  const { data: leagueFiles, isLoading: isQuerying, error: queryError } = useGetLeagueFiles({
    where: { leagueId },
    include: { file: true, draft: true },
  }, { skip: !leagueId })

  const { addObject } = useAddLeagueFile()
  const { updateObject } = useUpdateLeagueFile()
  const { deleteObject: deleteLeagueFile } = useDeleteLeagueFile()
  const { invalidateObject: invalidateLeagueFile } = useInvalidateLeagueFile()
  const { invalidateObjects: invalidateLeagueFiles } = useInvalidateLeagueFiles()

  const addLeagueFile = async ({
    file,
    category = LeagueFileCategory.other,
    metadata,
    draftId,
  }: { file: File } & LeagueFileData) => {
    setIsMutating(true)
    try {
      const bucketPath = await uploadFileToSignedUrl(file, leagueId)
      await addObject({
        leagueId,
        category,
        draftId,
        bucketPath,
        name: file.name,
        type: file.type,
        size: file.size,
        metadata
      } as any)
    } catch (error) {
      setMutateError(error)
    }
    setIsMutating(false)
  }

  const updateLeagueFile = async ({
    leagueFileId,
    file,
    category = LeagueFileCategory.other,
    draftId,
    metadata,
  }: { leagueFileId: string, file?: File } & LeagueFileData) => {
    setIsMutating(true)
    try {
      const newFileData: FileData = {}
      if (file) {
        const bucketPath = await uploadFileToSignedUrl(file, leagueId)
        Object.assign(newFileData, {
          bucketPath,
          name: file.name,
          type: file.type,
          size: file.size,
        })
      }
      await updateObject({
        id: leagueFileId,
        category,
        draftId,
        metadata,
        ...newFileData,
      })
    } catch (error) {
      setMutateError(error)
    }
    setIsMutating(false)
  }

  const downloadLeagueFile = async (leagueFileId: string) => {
    setIsDownloading(true)
    try {
      const blob = await downloadFileFromSignedUrl(leagueId, leagueFileId)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = leagueFiles?.find((file) => file.id === leagueFileId)?.file?.name || 'file'
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      setDownloadError(error)
    }
    setIsDownloading(false)
  }

  return {
    leagueFiles,
    isQuerying,
    isMutating,
    isDownloading,
    queryError,
    mutateError,
    downloadError,
    addLeagueFile,
    updateLeagueFile,
    deleteLeagueFile,
    downloadLeagueFile,
    invalidateLeagueFile,
    invalidateLeagueFiles,
  }
}
