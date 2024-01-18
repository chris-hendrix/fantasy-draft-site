import { leagueApi } from '@/store/league'
import { LeagueArgs } from '@/types'
import { Prisma } from '@prisma/client'
import { useParams } from 'next/navigation'
import { getCrudHooks } from '@/utils/getCrudHooks'
import { useSessionUser } from './user'

export const {
  useGetObject: useGetLeague,
  useGetObjects: useGetLeagues,
  useAddObject: useAddLeague,
  useUpdateObject: useUpdateLeague,
  useDeleteObject: useDeleteLeague,
  useInvalidateObjects: useInvalidateLeagues
} = getCrudHooks<LeagueArgs, Prisma.LeagueFindManyArgs, Prisma.LeagueUpdateInput>(leagueApi)

export const useUserLeagues = () => {
  const { user } = useSessionUser()
  const userId = user?.id
  const { data: commissionerLeagues, isLoading: isCommissionerLeaguesLoading } = useGetLeagues({
    where: { commissioners: { some: { userId } } },
    include: { teams: { include: { teamUsers: true } } }
  }, { skip: !userId })

  const { data: teamLeagues, isLoading: isTeamLeaguesLoading } = useGetLeagues({
    where: { commissioners: { none: {} }, teams: { some: { teamUsers: { some: { userId } } } } },
    include: { teams: { include: { teamUsers: true } } }
  }, { skip: !userId })

  const isLoading = isCommissionerLeaguesLoading && isTeamLeaguesLoading
  const leagues = Array.from(
    new Map([...(teamLeagues || []), ...(commissionerLeagues || [])]
      .map((league) => [league.id, league]))
      .values()
  )
  const defaultLeague = leagues?.[0] || null

  return {
    isLoading,
    leagues,
    commissionerLeagues,
    defaultLeague
  }
}

export const useLeagueData = (leagueId?: string) => {
  const { id } = useParams()
  const { user } = useSessionUser()
  const result = useGetLeague({
    id: leagueId || String(id),
    queryParams: {
      include: {
        drafts: { orderBy: { year: 'desc' } },
        commissioners: { include: { user: true } },
        teams: { include: { teamUsers: true } }
      }
    }
  }, { skip: !id })

  const league = result.data
  const isCommissioner = Boolean(
    user && league?.commissioners.find((c) => c.userId === user?.id)
  )
  const isMember = Boolean(
    user && league?.teams.some((t) => t.teamUsers.find((tu) => tu.userId === user.id))
  )

  return { league, isCommissioner, isMember, ...result }
}
