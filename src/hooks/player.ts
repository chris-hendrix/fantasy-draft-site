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

export const useGetSortedPlayers = (draftId: string, dataKey?: string, nullValue?: any) => {
  const result = useGetPlayers(
    {
      where: { draftId },
      include: { draftPicks: { include: { team: true }, orderBy: { overall: 'asc' } } }
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

  return { players, ...result }
}
