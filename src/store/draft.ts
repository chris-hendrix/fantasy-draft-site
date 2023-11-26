import { createObjectApi } from '@/utils/createObjectApi'
import { Draft, Prisma } from '@prisma/client'

export const draftApi = createObjectApi<Draft, Prisma.DraftUpdateInput>('drafts')

export const {
  useGetObjectQuery,
  useGetObjectsQuery,
  useAddObjectMutation,
  useUpdateObjectMutation,
  useDeleteObjectMutation
} = draftApi
