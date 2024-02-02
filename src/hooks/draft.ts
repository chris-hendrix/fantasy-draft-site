import { draftApi } from '@/store/draft'
import { DraftArgs, KeeperArgs, PlayerData } from '@/types'
import { Prisma } from '@prisma/client'
import { getCrudHooks } from '@/utils/getCrudHooks'
import { useSessionUser } from './user'

export const {
  useGetObject: useGetDraft,
  useGetObjects: useGetDrafts,
  useAddObject: useAddDraft,
  useUpdateObject: useUpdateDraft,
  useDeleteObject: useDeleteDraft,
  useInvalidateObjects: useInvalidateDrafts
} = getCrudHooks<DraftArgs, Prisma.DraftFindManyArgs & {
  getAllData?: boolean,
  previousYear?: boolean,
}, Prisma.DraftUpdateInput & {
  keeperCount?: number,
  setKeepers?: boolean,
  teamKeepers?: KeeperArgs[]
  updatePlayerData?: PlayerData[],
  startDraft?: boolean;
}>(draftApi)

type UseDraftOptions = {
  skip?: boolean
  previousYear?: boolean
}

export const useDraft = (draftId: string, options: UseDraftOptions = {}) => {
  const { skip, previousYear } = { skip: false, previousYear: false, ...options }
  const { user } = useSessionUser()
  const userId = user?.id
  const { data: draft, isSuccess, ...rest } = useGetDraft({
    id: draftId,
    queryParams: { getAllData: true, previousYear }
  }, { skip })

  const keepersLockDate = draft?.keepersLockDate
  const draftLockDate = draft?.draftLockDate
  const isCommissioner = Boolean(
    user && draft?.league?.commissioners.find((c) => c.userId === user?.id)
  )
  const canEditDraft = Boolean(
    (isSuccess && !draftLockDate) || (draftLockDate && draftLockDate > new Date())
  )
  const canEditKeepers = Boolean(
    (isSuccess && !keepersLockDate) || (keepersLockDate && keepersLockDate > new Date())
  )
  const sessionTeamIds = draft?.draftTeams?.filter(
    (dt) => Boolean(dt.team.teamUsers.find((tu) => tu.userId === userId))
  )?.map((tu) => tu.team.id) || []

  const isComplete = Boolean(
    draft?.draftPicks?.length
    && draft.draftPicks.length === draft.draftPicks.filter((dp) => Boolean(dp.playerId)).length
  )

  const isSessionTeam = (teamId: string | null | undefined) => {
    if (!teamId) return false
    const draftTeamUsers = draft?.draftTeams?.flatMap((dt) => dt.team.teamUsers)
    return draftTeamUsers?.some((tu) => Boolean(tu.userId === userId && tu.teamId === teamId))
  }

  const { updateObject: updateDraft, isLoading: isUpdating } = useUpdateDraft()
  const { deleteObject: deleteDraft, isLoading: isDeleting } = useDeleteDraft()
  return {
    draft: draft || {},
    isSuccess,
    isCommissioner,
    canEditKeepers,
    canEditDraft,
    teamsCount: draft?.draftTeams?.length,
    isComplete,
    isSessionTeam,
    sessionTeamIds,
    updateDraft,
    isUpdating,
    deleteDraft,
    isDeleting,
    ...rest
  }
}
