import {
  User,
  Commissioner,
  Draft,
  DraftTeam,
  DraftPick,
  Keeper,
  League,
  Player,
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
}

export interface TeamUserArgs extends TeamUser {
  user: User
  team: TeamArgs
}

export interface TeamArgs extends Team {
  teamUsers: TeamUserArgs[]
  league: LeagueArgs
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
}

export interface DraftPickArgs extends DraftPick {
  draft: DraftArgs
  team: TeamArgs
  player: PlayerArgs | null
}

export interface PlayerArgs extends Player {
  league: LeagueArgs,
  draftPicks: DraftPickArgs[]
  previousDraftInfo?: { round: Number, draftPick: DraftPickArgs, keeper: KeeperArgs }
}

export interface KeeperArgs extends Keeper {
  draft: DraftArgs
  team: TeamArgs
  player: PlayerArgs | null,
  previousDraftInfo?: { round: Number, draftPick: DraftPickArgs, keeper: KeeperArgs }
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
