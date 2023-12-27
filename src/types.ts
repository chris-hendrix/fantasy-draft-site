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
}

export interface TeamUserArgs extends TeamUser {
  user: User
}

export interface TeamArgs extends Team {
  teamUsers: TeamUserArgs[]
  league: LeagueArgs
}

export interface DraftArgs extends Draft {
  league: LeagueArgs
  draftTeams: DraftTeamArgs[]
  draftPicks: DraftPickArgs[]
}

export interface DraftTeamArgs extends DraftTeam {
  league: LeagueArgs
  team: TeamArgs
}

export interface DraftPickArgs extends DraftPick {
  draft: DraftArgs
  team: TeamArgs
  player: PlayerArgs
}

export interface PlayerArgs extends Player {
  league: LeagueArgs,
  draftPicks: DraftPickArgs[]
}

export interface KeeperArgs extends Keeper {
  draft: DraftArgs
  team: TeamArgs
  player: PlayerArgs
}
