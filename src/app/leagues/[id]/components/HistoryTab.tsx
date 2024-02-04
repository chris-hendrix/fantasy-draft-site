'use client'

import { useState } from 'react'
import ResultsImportModal from './ResultsImportModal'

interface Props {
  leagueId: string;
}

const HistoryTab: React.FC<Props> = ({ leagueId }) => {
  const [resultsModalOpen, setResultsModalOpen] = useState(false)

  return (
    <div className="flex flex-col items-center mt-8 gap-2">
      <div>
        <button
          className="btn btn-sm"
          onClick={() => setResultsModalOpen(true)}
        >
          📤 Import
        </button>
      </div>
      {resultsModalOpen && (
        <ResultsImportModal leagueId={leagueId} onClose={() => setResultsModalOpen(false)} />
      )}
    </div>
  )
}

export default HistoryTab
