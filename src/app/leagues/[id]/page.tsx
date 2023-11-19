'use client'

import { useGetLeague, useUserLeagues } from '@/hooks/league'
import Tabs from '@/components/Tabs'
import NotFound from '@/app/not-found'
import LeagueInfo from './components/LeagueInfo'

interface LeaguePageProps {
  params: { id: string };
}

const LeaguePage: React.FC<LeaguePageProps> = ({ params }) => {
  const { data: league, isLoading } = useGetLeague(params.id)
  const { isCommissioner } = useUserLeagues(params.id)

  if (!league && !isLoading) return <NotFound />
  if (!league) return <></>

  const tabs = [
    { hash: 'info', name: 'League info', component: <LeagueInfo league={league} /> },
    { hash: 'teams', name: 'Teams', component: <>Teams</> },
    { hash: 'keepers', name: 'Keepers', component: <>Keepers</> },
    { hash: 'draft', name: 'Draft', component: <>Draft</> },
    { hash: 'history', name: 'History', component: <>History</> },
    ...(isCommissioner ? [{ hash: 'commissioner', name: 'Commissioner', component: <>Commissioner</> }] : []),
  ]

  return (
    <main className="w-full px-6 py-0 max-w-screen-lg">
      <div>
        <Tabs tabs={tabs} />
      </div>
    </main>
  )
}

export default LeaguePage
