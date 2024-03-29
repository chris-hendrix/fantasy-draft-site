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
  useDeleteObject: useDeleteTeam,
  useInvalidateObject: useInvalidateTeam,
  useInvalidateObjects: useInvalidateTeams
} = getCrudHooks<TeamArgs & {
  inviteEmail?: string
}, Prisma.TeamFindManyArgs, Prisma.TeamUpdateInput & {
  inviteEmails?: string[],
  acceptEmail?: string,
  declineEmail?: string
}>(teamApi)

export const useInviteTeams = () => {
  const { user } = useSessionUser()
  const { data, isLoading, isSuccess, refetch } = useGetTeams(
    {
      where: { teamUsers: { some: { inviteEmail: user?.email, userId: null } } },
      include: { league: true, teamUsers: { where: { userId: user?.id } } }
    },
    { skip: !user || !user?.email }
  )

  const inviteTeams = data?.filter((team) => team.teamUsers.length === 0)

  return { inviteTeams, isLoading, isSuccess, refetch }
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

export const useLeagueTeams = (leagueId: string) => {
  const { data: teams, isLoading, isSuccess } = useGetTeams(
    { where: { leagueId, teamUsers: { some: { inviteDeclinedAt: null } } }, }
  )
  const teamsCount = teams?.length || 0
  return { teams, teamsCount, isLoading, isSuccess }
}

export const useTeams = (leagueId: string) => {
  const { data: teams, ...rest } = useGetTeams({
    where: { leagueId },
    include: {
      teamUsers: { include: { user: true, team: true } },
      draftTeams: { include: { draft: true, team: true } },
    },
    orderBy: [{ archivedAt: 'desc' }, { name: 'asc' }]
  })
  const { updateObject: updateTeam, isLoading: isUpdating } = useUpdateTeam()
  const { deleteObject: deleteTeam, isLoading: isDeleting } = useDeleteTeam()

  const draftTeams = teams?.flatMap((t) => t.draftTeams) || []
  const statDraftTeams = draftTeams
    ?.filter((dt) => dt.seasonFinish !== null)
    ?.sort((a, b) => ((a.seasonFinish || 99) < (b.seasonFinish || 99) ? 1 : -1))
    ?.sort((a, b) => (a.draft.year < b.draft.year ? 1 : -1))

  return {
    teams,
    draftTeams,
    statDraftTeams,
    updateTeam,
    isUpdating,
    deleteTeam,
    isDeleting,
    ...rest
  }
}

export const useTeam = (teamId: string) => {
  const { data: team, ...rest } = useGetTeam({
    id: teamId,
    queryParams: {
      include: { teamUsers: { include: { user: true, team: true } } }
    }
  })

  const { updateObject: updateTeam, isLoading: isUpdating } = useUpdateTeam()
  return { team, ...rest, updateTeam, isUpdating }
}
