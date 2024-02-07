'use client'

import { useState } from 'react'
import { useLeague } from '@/hooks/league'
import ResultsImportModal from './ResultsImportModal'
import StatsTable from './StatsTable'
import AggregateStatsTable from './AggregateStatsTable'

interface Props {
  leagueId: string;
}

const HistoryTab: React.FC<Props> = ({ leagueId }) => {
  const { isCommissioner } = useLeague(leagueId)
  const [resultsModalOpen, setResultsModalOpen] = useState(false)

  return (
    <div className="flex flex-col items-center mt-8 gap-2">
      {isCommissioner && (
        <div className="w-full">
          <button
            className="btn btn-sm"
            onClick={() => setResultsModalOpen(true)}
          >
            📤 Import
          </button>
        </div>
      )}
      <div className="w-full">
        <StatsTable leagueId={leagueId} />
        <AggregateStatsTable leagueId={leagueId} />
      </div>
      {resultsModalOpen && (
        <ResultsImportModal leagueId={leagueId} onClose={() => setResultsModalOpen(false)} />
      )}
    </div>
  )
}

export default HistoryTab
