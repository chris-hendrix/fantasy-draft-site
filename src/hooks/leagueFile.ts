import { useState } from 'react'
import { LeagueFileArgs } from '@/types'
import { Prisma, LeagueFileCategory } from '@prisma/client'
import { getCrudHooks } from '@/utils/getCrudHooks'
import { leagueFileApi } from '@/store/leagueFile'
import { uploadFile } from '@/lib/supabase'

export const {
  useGetObjects: useGetLeagueFiles,
  useAddObject: useAddLeagueFile,
  useUpdateObject: useUpdateLeagueFile,
  useDeleteObject: useDeleteLeagueFile,
} = getCrudHooks<LeagueFileArgs, Prisma.LeagueFileFindManyArgs,
Prisma.LeagueFileUncheckedUpdateInput>(
  leagueFileApi
)

export const useLeagueFiles = (leagueId: string) => {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<any | null>(null)

  const { data: leagueFiles, isLoading } = useGetLeagueFiles({
    where: { leagueId },
    include: { file: true },
  }, { skip: !leagueId })

  const { addObject: addLeagueFile, error: addError } = useAddLeagueFile()

  const uploadLeagueFile = async (file: File) => {
    setIsUploading(true)
    try {
      const { path } = await uploadFile(file, `leagues/${leagueId}`)
      const leagueFileData = {
        leagueId,
        category: LeagueFileCategory.other,
        bucketPath: path,
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

  return {
    leagueFiles,
    isLoading,
    isUploading,
    uploadLeagueFile,
    uploadError: addError || uploadError,
  }
}
