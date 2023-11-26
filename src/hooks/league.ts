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
  useDeleteObject: useDeleteLeague
} = getCrudHooks<LeagueArgs, Prisma.LeagueFindManyArgs, Prisma.LeagueUpdateInput>(leagueApi)

export const useUserLeagues = (leagueId: string | null = null) => {
  const { user } = useSessionUser()
  const { id } = useParams()
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

  const isCommissioner = commissionerLeagues?.find((league) => league.id === (leagueId || id))
  const league = leagues?.find((lg) => lg?.id === leagueId)
  const isMember = Boolean(league)
  const teamCount = league?.teams?.length

  return {
    isLoading,
    leagues,
    commissionerLeagues,
    isCommissioner,
    isMember,
    defaultLeague,
    league,
    teamCount
  }
}
