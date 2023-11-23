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

export interface TeamWithRelationships extends Team {
  teamUsers: TeamUser[]
}
