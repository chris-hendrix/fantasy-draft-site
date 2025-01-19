import { draftApi } from '@/store/draft'
import { DraftArgs, KeeperArgs, PlayerData } from '@/types'
import { Prisma } from '@prisma/client'
import { getCrudHooks } from '@/utils/getCrudHooks'
import { useParams } from 'next/navigation'
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
    queryParams: { previousYear }
  }, { skip })

  const keepersLockDate = draft?.keepersLockDate
  const draftLockDate = draft?.draftLockDate
  const draftTime = draft?.draftTime

  const isCommissioner = Boolean(
    user && draft?.league?.commissioners.find((c) => c.userId === user?.id)
  )
  const isDraftOpen = Boolean(
    (isSuccess && !draftLockDate) || (draftLockDate && draftLockDate > new Date())
  )
  const areKeepersOpen = Boolean(
    (isSuccess && !keepersLockDate) || (keepersLockDate && keepersLockDate > new Date())
  )
  const sessionTeamIds = draft?.draftTeams?.filter(
    (dt) => Boolean(dt.team.teamUsers.find((tu) => tu.userId === userId))
  )?.map((tu) => tu.team.id) || []

  const isComplete = Boolean(
    draft?.draftPicks?.length
    && draft.draftPicks.length === draft.draftPicks.filter((dp) => Boolean(dp.playerId)).length
  )
  const draftingPick = draft?.draftPicks?.filter((p) => p.playerId === null)?.[0] || null
  const hasFutureDraftTime = draftTime && new Date(draftTime) > new Date()

  const isSessionTeam = (teamId: string | null | undefined) => {
    if (!teamId) return false
    const draftTeamUsers = draft?.draftTeams?.flatMap((dt) => dt.team.teamUsers)
    return draftTeamUsers?.some((tu) => Boolean(tu.userId === userId && tu.teamId === teamId))
  }

  const { addObject: addDraft, isLoading: isAdding } = useAddDraft()
  const { updateObject: updateDraft, isLoading: isUpdating } = useUpdateDraft()
  const { deleteObject: deleteDraft, isLoading: isDeleting } = useDeleteDraft()
  return {
    draft: draft || {},
    isSuccess,
    isCommissioner,
    areKeepersOpen,
    isDraftOpen,
    draftingPick,
    teamsCount: draft?.draftTeams?.length,
    isComplete,
    hasFutureDraftTime,
    isSessionTeam,
    sessionTeamIds,
    addDraft,
    isAdding,
    updateDraft,
    isUpdating,
    deleteDraft,
    isDeleting,
    ...rest
  }
}

type UseDraftsOptions = {
  skip?: boolean,
  yearOrderBy?: 'asc' | 'desc'
}

export const useDrafts = (leagueId?: string, options: UseDraftsOptions = {}) => {
  const { skip, yearOrderBy } = { skip: false, yearOrderBy: 'desc', ...options }
  const { id } = useParams()
  const { data: drafts, ...rest } = useGetDrafts({
    where: { leagueId: leagueId || String(id) },
    include: {
      draftTeams: { include: { team: true } }
    },
    orderBy: { year: yearOrderBy as any }
  }, { skip })

  const { addObject: addDraft, isLoading: isAdding } = useAddDraft()
  const { updateObject: updateDraft, isLoading: isUpdating } = useUpdateDraft()
  const { deleteObject: deleteDraft, isLoading: isDeleting } = useDeleteDraft()

  return {
    drafts,
    addDraft,
    isAdding,
    updateDraft,
    isUpdating,
    deleteDraft,
    isDeleting,
    ...rest
  }
}
