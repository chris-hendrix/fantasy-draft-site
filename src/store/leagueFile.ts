import { createObjectApi } from '@/utils/createObjectApi'
import { LeagueFile, Prisma } from '@prisma/client'

export const leagueFileApi = createObjectApi<LeagueFile, Prisma.DraftPickUpdateInput>(
  'leagueFiles'
)

export const {
  useGetObjectsQuery,
  useUpdateObjectMutation,
} = leagueFileApi
