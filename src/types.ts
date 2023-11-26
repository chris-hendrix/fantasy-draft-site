import {
  User,
  Commissioner,
  Draft,
  DraftOrderSlot,
  League,
  Team,
  TeamUser
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
  draftOrderSlots: DraftOrderSlot[]
}

export interface DraftOrderSlotArgs extends DraftOrderSlot {
  league: LeagueArgs
  draftOrderSlots: DraftOrderSlot[]
  team: TeamArgs
}
