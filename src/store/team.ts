import { createObjectApi } from '@/utils/createObjectApi'
import { Team } from '@prisma/client'

export const teamApi = createObjectApi<Team>('teams')

export const {
  useGetObjectQuery,
  useGetObjectsQuery,
  useAddObjectMutation,
  useUpdateObjectMutation,
  useDeleteObjectMutation
} = teamApi
