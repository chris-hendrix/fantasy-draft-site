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
  const [isSeason, setIsSeason] = useState(true)
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
      </div>
      <div className="w-full">
        {isSeason && <StatsTable leagueId={leagueId} />}
        {isOverall && (
          <div>
            <h2 className="text-lg font-bold my-6 mx-2">Totals</h2>
            <AggregateStatsTable leagueId={leagueId} />
            <h2 className="text-lg font-bold my-6 mx-2">Season Averages</h2>
            <AggregateStatsTable leagueId={leagueId} average />
          </div>
        )}
      </div>
      {resultsModalOpen && (
        <ResultsImportModal leagueId={leagueId} onClose={() => setResultsModalOpen(false)} />
      )}
    </div>
  )
}

export default HistoryTab
