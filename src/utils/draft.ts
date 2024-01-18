import { PlayerArgs } from '@/types'
import { JsonObject } from '@prisma/client/runtime/library'

const NAME_KEY = 'PlayerInfo'

export const POSITIONS = [
  'C',
  '1B',
  '2B',
  '3B',
  'SS',
  'OF',
  'DH',
  'SP',
  'RP'
]

export const getRound = (overall: number, teamsCount: number, noOverallValue: number = 99) => (
  overall ? Math.floor((overall - 1) / teamsCount) + 1 : noOverallValue
)

export const getRoundPick = (overall: number, teamsCount: number, noOverallValue: number = 99) => (
  overall ? ((overall - 1) % teamsCount) + 1 : noOverallValue
)

export const formatRoundPick = (overall: number, teamsCount: number) => {
  const round = String(getRound(overall, teamsCount)).padStart(2, '0')
  const roundPick = String(getRoundPick(overall, teamsCount)).padStart(2, '0')
  return `${round}:${roundPick}`
}

export const getPlayerData = (player: PlayerArgs | null, key: string) => {
  if (!player?.data) return ''
  const data = player?.data as JsonObject
  if (!(key in data)) return ''
  return data[key] as any
}

export const getPlayerName = (player: PlayerArgs | null | undefined) => {
  if (!player) return null
  return String(getPlayerData(player, NAME_KEY))
}

export const getPlayerTeam = (player: PlayerArgs) => {
  const teams = player.draftPicks.map((dp) => dp.team)
  return teams?.[0]
}

export const createTeamIdArray = (teamIds: string[], repeats: number) => Array
  .from({ length: repeats }, () => teamIds)
  .flat()
