import { User, Commissioner, Draft, League, Team, TeamUser } from '@prisma/client'

export interface CommissionerWithRelationships extends Commissioner {
  league: League
  user: User
}

export interface UserWithCommissioners extends User {
  commissioners: CommissionerWithRelationships[];
}

export interface LeagueWithRelationships extends League {
  commissioners: CommissionerWithRelationships[]
  teams: TeamWithRelationships[]
}

export interface TeamUserWithRelationships extends TeamUser {
  user: User
}

export interface TeamWithRelationships extends Team {
  teamUsers: TeamUserWithRelationships[]
  league: LeagueWithRelationships
}

export interface DraftWithRelationships extends Draft {
  league: LeagueWithRelationships
}
