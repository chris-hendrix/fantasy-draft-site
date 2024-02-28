import {
  User,
  Commissioner,
  Draft,
  DraftTeam,
  DraftPick,
  Keeper,
  League,
  Player,
  SavedPlayer,
  Team,
  TeamUser,
} from '@prisma/client'

export interface CommissionerArgs extends Commissioner {
  league: League
  user: User
}

export interface UserArgs extends User {
  commissioners: CommissionerArgs[];
}

export interface LeagueArgs extends League {
  commissioners: CommissionerArgs[]
  teams: TeamArgs[]
  drafts: DraftArgs[]
  latestDraft: DraftArgs
}

export interface TeamUserArgs extends TeamUser {
  user: UserArgs
  team: TeamArgs
}

export interface TeamArgs extends Team {
  teamUsers: TeamUserArgs[]
  league: LeagueArgs,
  draftTeams: DraftTeamArgs[]
}

export interface DraftArgs extends Draft {
  league: LeagueArgs
  draftTeams: DraftTeamArgs[]
  draftPicks: DraftPickArgs[]
  keepers: KeeperArgs[]
  players: PlayerArgs[]
}

export interface DraftTeamArgs extends DraftTeam {
  league: LeagueArgs
  team: TeamArgs
  draft: DraftArgs
}

export interface DraftPickArgs extends DraftPick {
  draft: DraftArgs
  team: TeamArgs
  player: PlayerArgs | null
}

export interface PlayerArgs extends Player {
  league: LeagueArgs,
  draftPicks: DraftPickArgs[]
  savedPlayers: SavedPlayerArgs[]
  previousDraftInfo?: { round: Number, draftPick: DraftPickArgs, keeper: KeeperArgs }
}

export interface KeeperArgs extends Keeper {
  draft: DraftArgs
  team: TeamArgs
  player: PlayerArgs | null,
  previousDraftInfo?: { round: Number, draftPick: DraftPickArgs, keeper: KeeperArgs }
}

export interface SavedPlayerArgs extends SavedPlayer {
  team: TeamArgs
  player: PlayerArgs,
}

export type PlayerData = { name: string, data: any } // for importing/updating players

export type ImportedDraftRecord = {
  draftYear: number,
  teamName: string,
  playerName: string,
  overall: number,
  playerData: any,
  keeps: number | null
}

export type ImportedResultsRecord = {
  draftYear: number,
  teamName: string,
  data?: any
}
