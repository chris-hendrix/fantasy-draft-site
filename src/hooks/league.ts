import { leagueApi } from '@/store/league'
import { LeagueWithRelationships } from '@/types'
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
} = getCrudHooks<LeagueWithRelationships, Prisma.LeagueFindManyArgs>(leagueApi)

export const useUserLeagues = (leagueId: string | null = null) => {
  const { user } = useSessionUser()
  const { id } = useParams()
  const userId = user?.id
  const { data: commissionerLeagues, isLoading: isCommissionerLeaguesLoading } = useGetLeagues({
    where: { commissioners: { some: { userId } } }
  }, { skip: !userId })

  const isLoading = isCommissionerLeaguesLoading
  const leagues = [...(commissionerLeagues || [])]
  const defaultLeague = leagues?.[0] || null

  const isCommissioner = commissionerLeagues?.find((league) => league.id === (leagueId || id))
  const isMember = leagues?.find((league) => league.id === leagueId)

  return { leagues, commissionerLeagues, isCommissioner, isMember, defaultLeague, isLoading }
}
