import { playerApi } from '@/store/player'
import { PlayerArgs } from '@/types'
import { Prisma } from '@prisma/client'
import { getCrudHooks } from '@/utils/getCrudHooks'
import { getPlayerData } from '@/utils/draft'

export const {
  useGetObject: useGetPlayer,
  useGetObjects: useGetPlayers,
  useAddObject: useAddPlayer,
  useUpdateObject: useUpdatePlayer,
  useDeleteObject: useDeletePlayer,
  useInvalidateObject: useInvalidatePlayer,
  useInvalidateObjects: useInvalidatePlayers
} = getCrudHooks<PlayerArgs, Prisma.PlayerFindManyArgs, Prisma.PlayerUpdateInput>(playerApi)

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

  return { players, updatePlayer, isUpdating, invalidatePlayer, ...result }
}
