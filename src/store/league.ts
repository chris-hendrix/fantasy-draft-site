import { createObjectApi } from '@/utils/createObjectApi'
import { League } from '@prisma/client'

export const leagueApi = createObjectApi<League>('leagues')

export const {
  useGetObjectQuery: useGetLeagueQuery,
  useGetObjectsQuery: useGetLeaguesQuery,
  useAddObjectMutation: useAddLeagueMutation,
  useUpdateObjectMutation: useUpdateLeagueMutation,
  useDeleteObjectMutation: useDeleteLeagueMutation,
} = leagueApi
