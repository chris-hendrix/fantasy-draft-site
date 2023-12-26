'use client'

import { useState } from 'react'
import DraftYearTabs from './DraftYearTabs'
import PlayersTable from './PlayersTable'
import PlayerImportModal from './PlayerImportModal'

interface Props {
  leagueId: string;
}

const PlayerTab: React.FC<Props> = ({ leagueId }) => {
  const [selectedDraftId, setSelectedDraftId] = useState<string | null>(null)
  const [importModalOpen, setImportModalOpen] = useState(false)

  return (
    <div className="flex flex-col items-start mt-8">
      <DraftYearTabs leagueId={leagueId} onSelect={setSelectedDraftId} />
      <div className="mt-2">
        <button
          className="btn btn-sm mb-2 mr-2"
          onClick={() => setImportModalOpen(true)}
        >
          📤 Import
        </button>
      </div>
      {selectedDraftId && <PlayersTable draftId={selectedDraftId} />}
      {importModalOpen && <PlayerImportModal
        leagueId={leagueId}
        onClose={() => {
          setImportModalOpen(false)
        }} />}
    </div>
  )
}

export default PlayerTab
