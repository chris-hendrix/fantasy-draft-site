import { leagueApi } from '@/store/league'
import { LeagueArgs, ImportedDraftRecord } from '@/types'
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
  useInvalidateObject: useInvalidateLeague,
  useInvalidateObjects: useInvalidateLeagues
} = getCrudHooks<LeagueArgs, Prisma.LeagueFindManyArgs, Prisma.LeagueUpdateInput & {
  importedDraftRecords?: ImportedDraftRecord[]
}>(leagueApi)

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

type UseLeagueOptions = {
  skip?: boolean
}

export const useLeague = (leagueId?: string, options: UseLeagueOptions = {}) => {
  const { skip } = { skip: false, ...options }
  const { id } = useParams()
  const { user } = useSessionUser()
  const { data: league, ...rest } = useGetLeague({
    id: leagueId || String(id),
    queryParams: {
      include: {
        drafts: { orderBy: { year: 'desc' } },
        commissioners: { include: { user: true } },
        teams: { include: { teamUsers: true } }
      }
    }
  }, { skip: !id || skip })

  const defaultDraftId = league?.drafts[0]?.id || null
  const isCommissioner = Boolean(
    user && league?.commissioners.find((c) => c.userId === user?.id)
  )
  const isMember = Boolean(
    user && league?.teams.some((t) => t.teamUsers.find((tu) => tu.userId === user.id))
  )

  const { addObject: addLeague, isLoading: isAdding } = useAddLeague()
  const { updateObject: updateLeague, isLoading: isUpdating } = useUpdateLeague()

  return {
    league: league || {},
    defaultDraftId,
    isCommissioner,
    isMember,
    addLeague,
    isAdding,
    updateLeague,
    isUpdating,
    ...rest,
  }
}
