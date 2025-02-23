import { useState } from 'react'
import { LeagueFileArgs } from '@/types'
import { Prisma, LeagueFileCategory } from '@prisma/client'
import { getCrudHooks } from '@/utils/getCrudHooks'
import { leagueFileApi } from '@/store/leagueFile'

export const {
  useGetObjects: useGetLeagueFiles,
  useAddObject: useAddLeagueFile,
  useUpdateObject: useUpdateLeagueFile,
  useDeleteObject: useDeleteLeagueFile,
} = getCrudHooks<LeagueFileArgs, Prisma.LeagueFileFindManyArgs,
Prisma.LeagueFileUncheckedUpdateInput>(
  leagueFileApi
)

type SignedUrlOptions = {
  isUpload?: boolean
  bucketPath?: string // for upload
  leagueFileId?: string // for download
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
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<any | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState<any | null>(null)

  const { data: leagueFiles, isLoading } = useGetLeagueFiles({
    where: { leagueId },
    include: { file: true },
  }, { skip: !leagueId })

  const { addObject: addLeagueFile, error: addError } = useAddLeagueFile()

  const uploadLeagueFile = async (file: File) => {
    setIsUploading(true)
    try {
      const bucketPath = await uploadFileToSignedUrl(file, leagueId)
      const leagueFileData = {
        leagueId,
        category: LeagueFileCategory.other,
        bucketPath,
        name: file.name,
        type: file.type,
        size: file.size,
      }

      await addLeagueFile(leagueFileData)
    } catch (error) {
      setUploadError(error)
    }
    setIsUploading(false)
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
    isLoading,
    isUploading,
    uploadLeagueFile,
    downloadLeagueFile,
    isDownloading,
    uploadError: addError || uploadError,
    downloadError,
  }
}
