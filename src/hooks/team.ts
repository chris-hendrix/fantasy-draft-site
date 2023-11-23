import { teamApi } from '@/store/team'
import { Prisma } from '@prisma/client'
import { TeamWithRelationships } from '@/types'
import { getCrudHooks } from '@/utils/getCrudHooks'
import { useSessionUser } from './user'

export const {
  useGetObject: useGetTeam,
  useGetObjects: useGetTeams,
  useAddObject: useAddTeam,
  useUpdateObject: useUpdateTeam,
  useDeleteObject: useDeleteTeam
} = getCrudHooks<TeamWithRelationships & {
  inviteEmail?: string,
  acceptEmail?: string,
  declineEmail?: string
}, Prisma.TeamFindManyArgs>(teamApi)

export const useInviteTeams = () => {
  const { user } = useSessionUser()
  const { data: inviteTeams, isLoading, isSuccess } = useGetTeams(
    {
      where: { teamUsers: { some: { inviteEmail: user?.email, userId: null } } },
      include: { league: true }
    },
    { skip: !user?.email }
  )

  return { inviteTeams, isLoading, isSuccess }
}
