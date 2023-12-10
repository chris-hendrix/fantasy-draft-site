import { createObjectApi } from '@/utils/createObjectApi'
import { DraftPick, Prisma } from '@prisma/client'

export const draftPickApi = createObjectApi<DraftPick, Prisma.DraftPickUpdateInput>('draft-picks')

export const {
  useGetObjectsQuery,
  useUpdateObjectMutation,
} = draftPickApi
