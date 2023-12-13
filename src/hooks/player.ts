import { playerApi } from '@/store/player'
import { PlayerArgs } from '@/types'
import { Prisma } from '@prisma/client'
import { getCrudHooks } from '@/utils/getCrudHooks'

export const {
  useGetObject: useGetPlayer,
  useGetObjects: useGetPlayers,
  useAddObject: useAddPlayer,
  useUpdateObject: useUpdatePlayer,
  useDeleteObject: useDeletePlayer,
  useInvalidateObject: useInvalidatePlayer,
  useInvalidateObjects: useInvalidatePlayers
} = getCrudHooks<PlayerArgs, Prisma.PlayerFindManyArgs, Prisma.PlayerUpdateInput>(playerApi)
