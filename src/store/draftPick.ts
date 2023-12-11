import { createObjectApi } from '@/utils/createObjectApi'
import { DraftPick, Prisma } from '@prisma/client'

export const draftPickApi = createObjectApi<DraftPick, Prisma.DraftPickUpdateInput>(
  'draftPicks'
)

export const {
  useGetObjectsQuery,
  useUpdateObjectMutation,
} = draftPickApi
