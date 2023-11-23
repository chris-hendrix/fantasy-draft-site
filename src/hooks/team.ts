import { teamApi } from '@/store/team'
import { Team, Prisma } from '@prisma/client'
import { getCrudHooks } from '@/utils/getCrudHooks'

export const {
  useGetObject: useGetTeam,
  useGetObjects: useGetTeams,
  useAddObject: useAddTeam,
  useUpdateObject: useUpdateTeam,
  useDeleteObject: useDeleteTeam
} = getCrudHooks<Team, Prisma.TeamFindManyArgs>(teamApi)
