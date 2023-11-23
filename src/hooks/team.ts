import { teamApi } from '@/store/team'
import { Prisma } from '@prisma/client'
import { TeamWithRelationships } from '@/types'
import { getCrudHooks } from '@/utils/getCrudHooks'

export const {
  useGetObject: useGetTeam,
  useGetObjects: useGetTeams,
  useAddObject: useAddTeam,
  useUpdateObject: useUpdateTeam,
  useDeleteObject: useDeleteTeam
} = getCrudHooks<TeamWithRelationships & { inviteEmail: string }, Prisma.TeamFindManyArgs>(teamApi)
