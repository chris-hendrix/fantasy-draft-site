import { User, Commissioner, League, Team, TeamUser } from '@prisma/client'

export interface CommissionerWithRelationships extends Commissioner {
  league: League
  user: User
}

export interface UserWithCommissioners extends User {
  commissioners: CommissionerWithRelationships[];
}

export interface LeagueWithRelationships extends League {
  commissioners: CommissionerWithRelationships[]
  teams: Team[]
}

export interface TeamUserWithRelationships extends TeamUser {
  user: User
}

export interface TeamWithRelationships extends Team {
  teamUsers: TeamUserWithRelationships[]
  league: LeagueWithRelationships
}
