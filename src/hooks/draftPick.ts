import { DraftPickArgs } from '@/types'
import { Prisma } from '@prisma/client'
import { getCrudHooks } from '@/utils/getCrudHooks'
import { draftPickApi } from '@/store/draftPick'

export const {
  useGetObjects: useGetDraftPicks,
  useUpdateObject: useUpdateDraftPick,
} = getCrudHooks<DraftPickArgs, Prisma.DraftPickFindManyArgs, Prisma.DraftPickUncheckedUpdateInput>(
  draftPickApi
)
