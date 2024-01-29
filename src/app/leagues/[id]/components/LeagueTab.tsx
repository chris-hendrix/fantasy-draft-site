'use client'

import { useLeague } from '@/hooks/league'
import LeagueCard from '@/components/LeagueCard'

interface LeagueTabProps {
  leagueId: string;
}

const LeagueTab: React.FC<LeagueTabProps> = ({ leagueId }) => {
  const { league, isLoading } = useLeague(leagueId)
  if (isLoading) return
  return (
    <div>
      <LeagueCard league={league} />
    </div>
  )
}

export default LeagueTab
