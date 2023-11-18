'use client'

import { League } from '@prisma/client'
import LeagueCard from '@/components/LeagueCard'

interface LeagueInfoProps {
  league: Partial<League>;
}

const LeagueInfo: React.FC<LeagueInfoProps> = ({ league }) => (
  <div>
    <LeagueCard league={league} canEdit={true} />
  </div>
)

export default LeagueInfo
