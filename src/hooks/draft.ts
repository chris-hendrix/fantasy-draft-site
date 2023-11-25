import { draftApi } from '@/store/draft'
import { DraftWithRelationships } from '@/types'
import { Prisma } from '@prisma/client'
import { getCrudHooks } from '@/utils/getCrudHooks'

export const {
  useGetObject: useGetDraft,
  useGetObjects: useGetDrafts,
  useAddObject: useAddDraft,
  useUpdateObject: useUpdateDraft,
  useDeleteObject: useDeleteDraft
} = getCrudHooks<DraftWithRelationships, Prisma.DraftFindManyArgs>(draftApi)
