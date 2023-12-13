'use client'

import { useGetLeague, useUserLeagues } from '@/hooks/league'
import Tabs from '@/components/Tabs'
import NotFound from '@/app/not-found'
import LeagueTab from './components/LeagueTab'
import TeamsTab from './components/TeamsTab'
import DraftTab from './components/DraftTab'
import PlayerTab from './components/PlayerTab'
import CommissionerTab from './components/CommissionerTab'

interface LeaguePageProps {
  params: { id: string };
}

const LeaguePage: React.FC<LeaguePageProps> = ({ params }) => {
  const { data: league, isLoading } = useGetLeague({
    id: params.id,
    queryParams: {
      include: {
        commissioners: { include: { user: true } },
        teams: true
      }
    }
  })
  const { isCommissioner } = useUserLeagues(params.id)

  if (!league && !isLoading) return <NotFound />
  if (!league) return <></>

  const tabs = [
    { hash: 'league', name: 'League', component: <LeagueTab league={league} /> },
    { hash: 'teams', name: 'Teams', component: <TeamsTab league={league} /> },
    { hash: 'draft', name: 'Draft', component: <DraftTab league={league} /> },
    { hash: 'keepers', name: 'Keepers', component: <>Keepers</> },
    { hash: 'history', name: 'History', component: <>History</> },
    ...(isCommissioner ? [{ hash: 'players', name: 'Players', component: <PlayerTab league={league} /> }] : []),
    ...(isCommissioner ? [{ hash: 'commissioner', name: 'Commissioner', component: <CommissionerTab league={league} /> }] : []),
  ]

  return (
    <main className="w-full px-6 py-0 max-w-screen-xl">
      <div>
        <Tabs tabs={tabs} />
      </div>
    </main>
  )
}

export default LeaguePage
