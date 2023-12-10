import { draftPickApi } from '@/store/draft-pick'
import { DraftPickArgs } from '@/types'
import { Prisma } from '@prisma/client'
import { getCrudHooks } from '@/utils/getCrudHooks'

export const {
  useGetObjects: useGetDraftPicks,
  useUpdateObject: useUpdateDraftPick,
} = getCrudHooks<DraftPickArgs, Prisma.DraftPickFindManyArgs, Prisma.DraftPickUncheckedUpdateInput>(
  draftPickApi
)
