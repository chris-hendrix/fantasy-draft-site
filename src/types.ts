import { User, Commissioner, League } from '@prisma/client'

export interface CommissionerWithRelationships extends Commissioner {
  league: League
  user: User
}

export interface UserWithCommissioners extends User {
  commissioners: CommissionerWithRelationships[];
}

export interface LeagueWithRelationships extends League {
  commissioners: CommissionerWithRelationships[]
}
