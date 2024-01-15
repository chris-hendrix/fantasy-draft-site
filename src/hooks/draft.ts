import { draftApi } from '@/store/draft'
import { DraftArgs, KeeperArgs, PlayerData } from '@/types'
import { Prisma } from '@prisma/client'
import { getCrudHooks } from '@/utils/getCrudHooks'
import { useUserLeagues } from './league'
import { useSessionUser } from './user'

export const {
  useGetObject: useGetDraft,
  useGetObjects: useGetDrafts,
  useAddObject: useAddDraft,
  useUpdateObject: useUpdateDraft,
  useDeleteObject: useDeleteDraft
} = getCrudHooks<DraftArgs, Prisma.DraftFindManyArgs & {
  getAllData?: boolean
}, Prisma.DraftUpdateInput & {
  keeperCount?: number,
  setKeepers?: boolean,
  teamKeepers?: KeeperArgs[]
  updatePlayerData?: PlayerData[],
  startDraft?: boolean;
}>(draftApi)

export const useUserDraft = (draftId: string) => {
  const { data: draft, isLoading: isDraftLoading } = useGetDraft({ id: draftId })
  const { isCommissioner, isLoading: isLeagueLoading } = useUserLeagues(draft?.leagueId || null)
  return { draft, isCommissioner, isLoading: isDraftLoading || isLeagueLoading }
}

export const useDraftData = (draftId: string, skip: boolean = false) => {
  const { user } = useSessionUser()
  const userId = user?.id
  const { data: draft, isLoading, isSuccess, error, refetch } = useGetDraft({
    id: draftId,
    queryParams: { getAllData: true }
  }, { skip })

  const keepersLockDate = draft?.keepersLockDate
  const isCommissioner = Boolean(
    user && draft?.league.commissioners.find((c) => c.userId === user?.id)
  )
  const canEditKeepers = Boolean(
    (isSuccess && !keepersLockDate) || (keepersLockDate && keepersLockDate > new Date())
  )

  const sessionTeam = draft?.draftTeams.filter(
    (dt) => Boolean(dt.team.teamUsers.find((tu) => tu.userId === userId))
  )?.[0]?.team || null

  return {
    isLoading,
    isSuccess,
    error,
    isCommissioner,
    canEditKeepers,
    teamsCount: draft?.draftTeams?.length,
    sessionTeam,
    refetch,
    ...draft
  }
}

export const usePreviousDraftData = (currentDraftId: string) => {
  const { leagueId, year } = useDraftData(currentDraftId)
  const { data: drafts } = useGetDrafts(
    { where: { leagueId: String(leagueId), year: Number(year) - 1 } },
    { skip: !leagueId || !year }
  )
  const draftId = drafts?.[0]?.id
  const result = useDraftData(draftId as string, !draftId)
  return result
}
