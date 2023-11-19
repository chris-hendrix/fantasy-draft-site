'use client'

import { League } from '@prisma/client'
import LeagueCard from '@/components/LeagueCard'

interface LeagueTabProps {
  league: Partial<League>;
}

const LeagueTab: React.FC<LeagueTabProps> = ({ league }) => (
  <div>
    <LeagueCard league={league} />
  </div>
)

export default LeagueTab
