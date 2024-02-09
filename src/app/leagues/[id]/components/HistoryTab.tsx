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
  const [resultsModalOpen, setResultsModalOpen] = useState(true)
  const [isSeason, setIsSeason] = useState(false)
  const [isOverall, setIsOverall] = useState(false)

  const clearOptions = () => {
    setIsSeason(false)
    setIsOverall(false)
  }

  return (
    <div className="flex flex-col items-center mt-8 gap-2">
      <div className="flex gap-2 w-full">
        {isCommissioner && (
          <button
            className="btn btn-sm"
            onClick={() => setResultsModalOpen(true)}
          >
            📤 Import
          </button>
        )}
        <button
          className={`btn btn-sm ${isSeason && 'btn-primary'}`}
          onClick={() => {
            clearOptions()
            setIsSeason(true)
          }}
        >
          📑 Season Totals
        </button>
        <button
          className={`btn btn-sm ${isOverall && 'btn-primary'}`}
          onClick={() => {
            clearOptions()
            setIsOverall(true)
          }}
        >
          📊 Overall Totals
        </button>
        <button
          className="btn btn-sm"
          onClick={() => console.log('TODO')}
        >
          📏 Season Average
        </button>
      </div>
      <div className="w-full">
        {isSeason && <StatsTable leagueId={leagueId} />}
        {isOverall && <AggregateStatsTable leagueId={leagueId} />}
      </div>
      {resultsModalOpen && (
        <ResultsImportModal leagueId={leagueId} onClose={() => setResultsModalOpen(false)} />
      )}
    </div>
  )
}

export default HistoryTab
