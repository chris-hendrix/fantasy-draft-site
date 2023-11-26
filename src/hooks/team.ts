import { teamApi } from '@/store/team'
import { Prisma } from '@prisma/client'
import { TeamArgs } from '@/types'
import { getCrudHooks } from '@/utils/getCrudHooks'
import { useSessionUser } from './user'

export const {
  useGetObject: useGetTeam,
  useGetObjects: useGetTeams,
  useAddObject: useAddTeam,
  useUpdateObject: useUpdateTeam,
  useDeleteObject: useDeleteTeam
} = getCrudHooks<TeamArgs & {
  inviteEmail?: string,
  acceptEmail?: string,
  declineEmail?: string
}, Prisma.TeamFindManyArgs, Prisma.TeamUpdateInput>(teamApi)

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

export const useUserTeam = (leagueId: string) => {
  const { user } = useSessionUser()
  const { data: teams, isLoading, isSuccess } = useGetTeams(
    {
      where: { leagueId, teamUsers: { some: { userId: user?.id, inviteDeclinedAt: null } } },
    },
    { skip: !user }
  )
  const team = teams?.[0]
  return { team, isLoading, isSuccess }
}
