import { teamApi } from '@/store/team'
import { Prisma } from '@prisma/client'
import { TeamArgs } from '@/types'
import { getCrudHooks } from '@/utils/getCrudHooks'
import { useSessionUser } from './user'
import { useDraftData } from './draft'

export const {
  useGetObject: useGetTeam,
  useGetObjects: useGetTeams,
  useAddObject: useAddTeam,
  useUpdateObject: useUpdateTeam,
  useDeleteObject: useDeleteTeam
} = getCrudHooks<TeamArgs & {
  inviteEmail?: string
}, Prisma.TeamFindManyArgs, Prisma.TeamUpdateInput & {
  acceptEmail?: string,
  declineEmail?: string
}>(teamApi)

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

export const useUserTeam = (leagueId: string, skip: boolean = false) => {
  const { user } = useSessionUser()
  const { data: teams, isLoading, isSuccess } = useGetTeams(
    {
      where: { leagueId, teamUsers: { some: { userId: user?.id, inviteDeclinedAt: null } } },
    },
    { skip: !user || skip }
  )
  const team = teams?.[0]
  return { team, isLoading, isSuccess, teamId: team?.id }
}

export const useUserDraftTeam = (draftId: string) => {
  const { leagueId } = useDraftData(draftId)
  const result = useUserTeam(leagueId, !leagueId)
  return result
}

export const useLeagueTeams = (leagueId: string) => {
  const { data: teams, isLoading, isSuccess } = useGetTeams(
    { where: { leagueId, teamUsers: { some: { inviteDeclinedAt: null } } }, }
  )
  const teamsCount = teams?.length || 0
  return { teams, teamsCount, isLoading, isSuccess }
}
