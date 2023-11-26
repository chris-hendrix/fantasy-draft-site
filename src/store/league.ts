import { createObjectApi } from '@/utils/createObjectApi'
import { League, Prisma } from '@prisma/client'

export const leagueApi = createObjectApi<League, Prisma.LeagueUpdateInput>('leagues')

export const {
  useGetObjectQuery,
  useGetObjectsQuery,
  useAddObjectMutation,
  useUpdateObjectMutation,
  useDeleteObjectMutation
} = leagueApi
