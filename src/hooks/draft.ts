import { draftApi } from '@/store/draft'
import { DraftArgs } from '@/types'
import { Prisma } from '@prisma/client'
import { getCrudHooks } from '@/utils/getCrudHooks'
import { useUserLeagues } from './league'

export const {
  useGetObject: useGetDraft,
  useGetObjects: useGetDrafts,
  useAddObject: useAddDraft,
  useUpdateObject: useUpdateDraft,
  useDeleteObject: useDeleteDraft
} = getCrudHooks<DraftArgs, Prisma.DraftFindManyArgs, Prisma.DraftUpdateInput & {
  keeperCount?: number
}>(draftApi)

export const useUserDraft = (draftId: string) => {
  const { data: draft, isLoading: isDraftLoading } = useGetDraft({ id: draftId })
  const { isCommissioner, isLoading: isLeagueLoading } = useUserLeagues(draft?.leagueId || null)
  return { draft, isCommissioner, isLoading: isDraftLoading || isLeagueLoading }
}

export const useDraftData = (draftId: string, skip: boolean = false) => {
  const { data: draft, isLoading, isSuccess, error } = useGetDraft({
    id: draftId,
    queryParams: {
      include: {
        draftTeams: { include: { team: true } },
        keepers: { include: { player: true } },
        draftPicks: { include: { player: true } }
      }
    }
  }, { skip })

  return {
    draft,
    isLoading,
    isSuccess,
    error,
    leagueId: draft?.leagueId,
    year: draft?.year,
    teamsCount: draft?.draftTeams?.length,
    rounds: draft?.rounds,
    draftPicks: draft?.draftPicks
  }
}

export const usePreviousDraftData = (currentDraftId: string) => {
  const { leagueId, year } = useDraftData(currentDraftId)
  const { data: drafts } = useGetDrafts(
    { where: { leagueId: leagueId as string, year: year as number } },
    { skip: !leagueId || !year }
  )
  const draftId = drafts?.[0]?.id
  const result = useDraftData(draftId as string, !draftId)
  return result
}
