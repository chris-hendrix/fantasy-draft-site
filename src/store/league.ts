import { createObjectApi } from '@/utils/createObjectApi'
import { League } from '@prisma/client'

export const leagueApi = createObjectApi<League>('leagues')

export const {
  useGetObjectQuery,
  useGetObjectsQuery,
  useAddObjectMutation,
  useUpdateObjectMutation,
  useDeleteObjectMutation
} = leagueApi
