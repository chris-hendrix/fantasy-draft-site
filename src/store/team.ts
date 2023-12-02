import { createObjectApi } from '@/utils/createObjectApi'
import { Team, Prisma } from '@prisma/client'

export const teamApi = createObjectApi<Team, Prisma.TeamUpdateInput>('teams')

export const {
  useGetObjectQuery,
  useGetObjectsQuery,
  useAddObjectMutation,
  useUpdateObjectMutation,
  useDeleteObjectMutation
} = teamApi
