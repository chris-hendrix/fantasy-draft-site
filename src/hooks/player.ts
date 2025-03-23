import { useState } from 'react'
import { playerApi } from '@/store/player'
import { PlayerArgs, SavedPlayerArgs, PlayerData } from '@/types'
import { Prisma } from '@prisma/client'
import { getCrudHooks } from '@/utils/getCrudHooks'
import { getPlayerData } from '@/utils/draft'
import { useDraft } from './draft'
import { useAlert } from './app'

export const {
  useGetObject: useGetPlayer,
  useGetObjects: useGetPlayers,
  useAddObject: useAddPlayer,
  useUpdateObject: useUpdatePlayer,
  useDeleteObject: useDeletePlayer,
  useInvalidateObject: useInvalidatePlayer,
  useInvalidateObjects: useInvalidatePlayers
} = getCrudHooks<PlayerArgs, Prisma.PlayerFindManyArgs, Prisma.PlayerUpdateInput & {
  savedPlayer?: SavedPlayerArgs | null,
}>(playerApi)

export const useSortedPlayers = (draftId: string, dataKey?: string, nullValue?: any) => {
  const result = useGetPlayers(
    {
      where: { draftId },
      include: {
        draftPicks: { include: { team: true }, orderBy: { overall: 'asc' } },
        savedPlayers: { include: { team: true } }
      }
    }
  )

  const { sessionTeamIds, isSessionTeam, isComplete } = useDraft(draftId)
  const sessionTeamId = sessionTeamIds?.[0] // TODO just choose first for now
  const canSave = !isComplete && sessionTeamId

  const { showAlert } = useAlert()
  const [isSavingPlayerData, setIsSavingPlayerData] = useState(false)

  const players = [...(result?.data || [])].sort((a, b) => {
    const aValue = dataKey ? getPlayerData(a, dataKey) || nullValue : a.name
    const bValue = dataKey ? getPlayerData(b, dataKey) || nullValue : b.name
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return aValue - bValue
    }
    return String(aValue).localeCompare(String(bValue))
  }) || []

  const { updateObject: updatePlayer, isLoading: isUpdating } = useUpdatePlayer()
  const { invalidateObject: invalidatePlayer } = useInvalidatePlayer()
  const { invalidateObjects: invalidatePlayers } = useInvalidatePlayers()

  const getIsSaved = (playerId: string) => {
    const player = players.find((p) => p.id === playerId)
    const savedPlayer = player?.savedPlayers?.find((sp) => isSessionTeam(sp.teamId))
    return !savedPlayer ? null : savedPlayer.isDraftable
  }

  const handleSavePlayer = async (playerId: string) => {
    const player = players.find((p) => p.id === playerId)
    if (!player) return
    const savedPlayer = player.savedPlayers.find((sp) => isSessionTeam(sp.teamId)) || null
    if (!sessionTeamId) return
    await updatePlayer({
      id: player.id,
      savedPlayer
    })
    await invalidatePlayer(playerId)
  }

  const savePlayerData = async (
    playerData: PlayerData[],
    options: { overwrite?: boolean } = {}
  ) => {
    const { overwrite = false } = options
    setIsSavingPlayerData(true)

    try {
      const res = await fetch('/api/players/upsert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          draftId,
          playerData,
          overwrite,
        }),
      })
      if (!res.ok) throw new Error('Failed to save players')
      showAlert({ successMessage: 'Players saved successfully' })
    } catch {
      showAlert({ errorMessage: 'Failed to save players' })
    }
    invalidatePlayers()
    setIsSavingPlayerData(false)
  }

  return {
    players,
    updatePlayer,
    isUpdating,
    invalidatePlayer,
    invalidatePlayers,
    savePlayerData,
    isSavingPlayerData,
    getIsSaved,
    handleSavePlayer,
    canSave,
    ...result
  }
}
