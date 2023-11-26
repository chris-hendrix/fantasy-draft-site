import { draftApi } from '@/store/draft'
import { DraftArgs } from '@/types'
import { Prisma } from '@prisma/client'
import { getCrudHooks } from '@/utils/getCrudHooks'

export const {
  useGetObject: useGetDraft,
  useGetObjects: useGetDrafts,
  useAddObject: useAddDraft,
  useUpdateObject: useUpdateDraft,
  useDeleteObject: useDeleteDraft
} = getCrudHooks<DraftArgs, Prisma.DraftFindManyArgs>(draftApi)
