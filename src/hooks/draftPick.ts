import { DraftPickArgs } from '@/types'
import { Prisma } from '@prisma/client'
import { getCrudHooks } from '@/utils/getCrudHooks'
import { draftPickApi } from '@/store/draftPick'

export const {
  useGetObjects: useGetDraftPicks,
  useUpdateObject: useUpdateDraftPick,
  useInvalidateObject: useInvalidateDraftPick,
  useInvalidateObjects: useInvalidateDraftPicks
} = getCrudHooks<DraftPickArgs, Prisma.DraftPickFindManyArgs, {
  startClock?: boolean
} & Prisma.DraftPickUncheckedUpdateInput>(
  draftPickApi
)

export const useDraftPicks = (draftId: string) => {
  const { data: draftPicks, ...rest } = useGetDraftPicks(
    {
      where: { draftId },
      include: { team: true, player: true },
      orderBy: { overall: 'asc' }
    }
  )
  const draftingPick = draftPicks?.filter((p) => p.playerId === null)?.[0] || null
  const { updateObject: updateDraftPick, isLoading: isUpdating } = useUpdateDraftPick()
  const { invalidateObject: invalidateDraftPick } = useInvalidateDraftPick()

  return {
    draftPicks,
    draftingPick,
    updateDraftPick,
    isUpdating,
    invalidateDraftPick,
    ...rest
  }
}
