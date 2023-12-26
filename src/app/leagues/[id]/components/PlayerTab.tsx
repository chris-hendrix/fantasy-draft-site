'use client'

import { useState } from 'react'
import { LeagueArgs } from '@/types'
import { useGetDrafts } from '@/hooks/draft'
import PlayersTable from './PlayersTable'
import PlayerImportModal from './PlayerImportModal'

interface Props {
  league: LeagueArgs;
}

const PlayerTab: React.FC<Props> = ({ league }) => {
  const [selectedDraftId, setSelectedDraftId] = useState<string | null>(null)
  const [importModalOpen, setImportModalOpen] = useState(false)

  const { data: drafts } = useGetDrafts({
    where: { leagueId: league.id },
    orderBy: { year: 'asc' }
  })

  return (
    <div className="flex flex-col items-start mt-8">
      <div>
      <button
          className="btn btn-sm mb-2 mr-2"
        onClick={() => setImportModalOpen(true)}
      >
        📤 Import
      </button>
        <select
          className="select select-bordered w-24 btn-sm"
          value={selectedDraftId || ''}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => (
            setSelectedDraftId(e.target.value)
          )}
        >
          <option disabled value="">
            Select year
          </option>
          {drafts?.map((d) => (
            <option key={d.id} value={d.id}>
              {d.year}
            </option>
          ))}
        </select>
      </div>
      {selectedDraftId && <PlayersTable draftId={selectedDraftId} />}
      {importModalOpen && <PlayerImportModal
        leagueId={league.id as string}
        onClose={() => {
          setImportModalOpen(false)
        }} />}
    </div>
  )
}

export default PlayerTab
