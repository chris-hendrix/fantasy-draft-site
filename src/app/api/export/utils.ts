import { JsonObject } from '@prisma/client/runtime/library'
import { Player } from '@prisma/client'

export const getPlayerInfo = (player: Player | null) => {
  const key = 'PlayerInfo'
  if (!player?.data) return null
  const data = player?.data as JsonObject
  if (!(key in data)) return null
  return data[key] as string
}
