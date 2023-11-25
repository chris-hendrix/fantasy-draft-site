import { createObjectApi } from '@/utils/createObjectApi'
import { Draft } from '@prisma/client'

export const draftApi = createObjectApi<Draft>('drafts')

export const {
  useGetObjectQuery,
  useGetObjectsQuery,
  useAddObjectMutation,
  useUpdateObjectMutation,
  useDeleteObjectMutation
} = draftApi
