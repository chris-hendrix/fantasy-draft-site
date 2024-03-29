'use client'

import { useLeague } from '@/hooks/league'
import LeagueCard from '@/components/LeagueCard'
import DraftsTable from './DraftsTable'

interface LeagueTabProps {
  leagueId: string;
}

const LeagueTab: React.FC<LeagueTabProps> = ({ leagueId }) => {
  const { league, isLoading } = useLeague(leagueId)
  const { url } = league
  if (isLoading) return
  return (
    <div className="flex flex-col w-full mt-8">
      {url && <div className="bg-primary p-2 text-center text-primary-content shadow-md">
        {'Go to your '}
        <a className="link" href={url} target="_blank">
          season home
        </a>
        {' after your draft'}
      </div>}
      <LeagueCard league={league} />
      <h2 className="text-lg font-bold my-6 mx-2">Drafts</h2>
      <DraftsTable leagueId={leagueId} />
    </div>
  )
}

export default LeagueTab
