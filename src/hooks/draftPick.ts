import { useEffect } from 'react'
import { DraftPickArgs, PlayerArgs } from '@/types'
import { Prisma } from '@prisma/client'
import { getCrudHooks } from '@/utils/getCrudHooks'
import { draftPickApi } from '@/store/draftPick'
import { getRound } from '@/utils/draft'
import { useDraft } from './draft'
import { useInvalidatePlayer, useInvalidatePlayers } from './player'
import { useSendBroadcast, useReceiveBroadcast } from './supabase'

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
  const { draft: { disableUserDraft }, teamsCount, isSessionTeam, isDraftOpen } = useDraft(draftId)
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
  const { invalidateObjects: invalidateDraftPicks } = useInvalidateDraftPicks()
  const { invalidateObject: invalidatePlayer } = useInvalidatePlayer()
  const { invalidateObjects: invalidatePlayers } = useInvalidatePlayers()

  const getDraftedRound = (player: PlayerArgs) => {
    const pick = draftPicks?.find((dp) => dp.playerId === player.id)
    return pick ? getRound(pick.overall, teamsCount) : null
  }

  const canDraft = (player: PlayerArgs) => {
    if (!isDraftOpen) return false
    if (disableUserDraft) return false
    if (!draftingPick) return false
    if (player.draftPicks?.length) return false
    if (!isSessionTeam(draftingPick.teamId)) return false
    return true
  }

  return {
    draftPicks,
    draftingPick,
    updateDraftPick,
    isUpdating,
    invalidateDraftPick,
    invalidateDraftPicks,
    invalidatePlayer,
    invalidatePlayers,
    canDraft,
    getDraftedRound,
    ...rest
  }
}

export const useLiveDraftPicks = (draftId: string) => {
  const results = useDraftPicks(draftId)
  const { updateDraftPick, invalidateDraftPick, invalidatePlayer } = results

  const { send } = useSendBroadcast(draftId, 'draft')
  const { latestPayload } = useReceiveBroadcast(draftId, 'draft')

  // send message on draft pick update
  const makeLiveSelection = async (
    pickId: string,
    oldPlayerId: string | null,
    newPlayerId: string | null
  ) => {
    const res = await updateDraftPick({ id: pickId, playerId: newPlayerId || null })
    if ('error' in res) return false
    await send({ pickId, oldPlayerId, newPlayerId })
    return true
  }

  // invalidate player and pick when a pick is made
  useEffect(() => {
    const { pickId, oldPlayerId } = latestPayload || {}
    pickId && invalidateDraftPick(pickId)
    oldPlayerId && invalidatePlayer(latestPayload?.oldPlayerId)
  }, [latestPayload])

  return {
    ...results,
    makeLiveSelection
  }
}
