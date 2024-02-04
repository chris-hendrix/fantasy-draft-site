'use client'

import { useEffect } from 'react'
import { useLeague } from '@/hooks/league'
import Tabs from '@/components/Tabs'
import NotFound from '@/app/not-found'
import { useCurrentDraftId } from '@/hooks/app'
import LeagueTab from './components/LeagueTab'
import TeamsTab from './components/TeamsTab'
import DraftTab from './components/DraftTab'
import PlayerTab from './components/PlayerTab'
import KeeperTab from './components/KeeperTab'
import HistoryTab from './components/HistoryTab'
import RulesTab from './components/RulesTab'
import CommissionerTab from './components/CommissionerTab'

const LeaguePage: React.FC = () => {
  const { league, isCommissioner, isLoading, latestDraftId: defaultDraftId } = useLeague()
  const { setCurrentDraftId } = useCurrentDraftId()

  useEffect(() => { setCurrentDraftId(defaultDraftId) }, [])

  if (!league && !isLoading) return <NotFound />
  if (!league) return <></>

  const tabs = [
    { hash: 'league', name: 'League', component: <LeagueTab leagueId={league.id} /> },
    { hash: 'teams', name: 'Teams', component: <TeamsTab leagueId={league.id} /> },
    { hash: 'draft', name: 'Draft', component: <DraftTab leagueId={league.id} /> },
    { hash: 'keepers', name: 'Keepers', component: <KeeperTab leagueId={league.id} /> },
    { hash: 'history', name: 'History', component: <HistoryTab leagueId={league.id} /> },
    { hash: 'rules', name: 'Rules', component: <RulesTab leagueId={league.id} /> },
    ...(isCommissioner && league ? [{ hash: 'players', name: 'Players', component: <PlayerTab leagueId={league.id} /> }] : []),
    ...(isCommissioner && league ? [{ hash: 'commissioner', name: 'Commissioner', component: <CommissionerTab leagueId={league.id} /> }] : []),
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
