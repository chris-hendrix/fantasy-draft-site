import { DraftTeamArgs, PlayerArgs } from '@/types'
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

export const PITCHER_POSITIONS = ['SP', 'RP']
export const HITTER_POSITIONS = POSITIONS.filter((pos) => !PITCHER_POSITIONS.includes(pos))

export const DEFAULT_ROUNDS = 22
export const DEFAULT_KEEPER_COUNT = 0

export const getMedal = (place?: number | null) => {
  switch (place) {
    case 1: return '🥇'
    case 2: return '🥈'
    case 3: return '🥉'
    default: return ''
  }
}

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

export const getPlayerPositions = (player: PlayerArgs) => {
  const positions = String(getPlayerData(player, 'Positions'))
  return positions.split(',')
}

export const getPlayersByPosition = (players: PlayerArgs[]) => {
  const data: { [x: string]: PlayerArgs[] } = {}
  POSITIONS.forEach((position) => {
    data[position] = players.filter((player) => getPlayerPositions(player)?.includes(position))
  })
  return data
}

export const createTeamIdArray = (teamIds: string[], repeats: number) => Array
  .from({ length: repeats }, () => teamIds)
  .flat()

export const getDraftTeamData = (draftTeam: DraftTeamArgs | null, key: string) => {
  if (!draftTeam?.seasonData) return ''
  const data = draftTeam?.seasonData as JsonObject
  if (!(key in data)) return ''
  const value: any = data[key]
  if (!Number.isNaN(Number(value))) return Number(value) as any
  return value
}

export const isPitcherPlayer = (player: PlayerArgs) => {
  const positions = getPlayerPositions(player)
  return positions.some((pos) => PITCHER_POSITIONS.includes(pos))
}

export const isHitterPlayer = (player: PlayerArgs) => {
  const positions = getPlayerPositions(player)
  return positions.some((pos) => HITTER_POSITIONS.includes(pos))
}

export const isPitcherOnly = (player: PlayerArgs) => (
  isPitcherPlayer(player) && !isHitterPlayer(player)
)

export const isHitterOnly = (player: PlayerArgs) => (
  isHitterPlayer(player) && !isPitcherPlayer(player)
)
