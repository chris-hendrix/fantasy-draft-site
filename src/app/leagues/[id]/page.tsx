'use client'

import { useLeagueData } from '@/hooks/league'
import Tabs from '@/components/Tabs'
import NotFound from '@/app/not-found'
import LeagueTab from './components/LeagueTab'
import TeamsTab from './components/TeamsTab'
import DraftTab from './components/DraftTab'
import PlayerTab from './components/PlayerTab'
import KeeperTab from './components/KeeperTab'
import CommissionerTab from './components/CommissionerTab'

const LeaguePage: React.FC = () => {
  const { league, isCommissioner, isLoading } = useLeagueData()

  if (!league && !isLoading) return <NotFound />
  if (!league) return <></>

  const tabs = [
    { hash: 'league', name: 'League', component: <LeagueTab league={league} /> },
    { hash: 'teams', name: 'Teams', component: <TeamsTab league={league} /> },
    { hash: 'draft', name: 'Draft', component: <DraftTab leagueId={league.id} /> },
    { hash: 'keepers', name: 'Keepers', component: <KeeperTab leagueId={league.id} /> },
    { hash: 'history', name: 'History', component: <>Coming Soon!</> },
    ...(isCommissioner ? [{ hash: 'players', name: 'Players', component: <PlayerTab leagueId={league.id} /> }] : []),
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
