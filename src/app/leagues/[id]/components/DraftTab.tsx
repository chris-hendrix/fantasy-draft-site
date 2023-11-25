'use client'

import { League } from '@prisma/client'
import { useAddDraft, useGetDrafts } from '@/hooks/draft'
import Tabs from '@/components/Tabs'

interface Props {
  league: Partial<League>;
}

const DraftTab: React.FC<Props> = ({ league }) => {
  const { data: drafts } = useGetDrafts({ where: { leagueId: league.id }, orderBy: { year: 'asc' } })
  const { addObject: addDraft } = useAddDraft()

  const handleAddDraft = async () => {
    await addDraft({ year: 2012, leagueId: league.id })
  }

  const tabs = drafts.map((d) => ({
    name: String(d.year),
    hash: String(d.year),
    component: <>{d.year}</>
  }))

  return (
    <div className="flex flex-col items-center mt-8">
      <button onClick={async () => handleAddDraft()} className="btn" >Add draft</button>
      <Tabs tabs={tabs} />
    </div>
  )
}

export default DraftTab
