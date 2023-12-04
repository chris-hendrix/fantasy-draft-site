'use client'

import { useState } from 'react'
import { League } from '@prisma/client'
import PlayerTable from './PlayerTable'
import PlayerImportModal from './PlayerImportModal'
import YearSelect from './YearSelect'

interface Props {
  league: Partial<League>;
}

const PlayerTab: React.FC<Props> = ({ league }) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [importModalOpen, setImportModalOpen] = useState(false)

  return (
    <div className="flex flex-col items-start mt-8">
      <button
        className="btn btn-sm mb-2"
        onClick={() => setImportModalOpen(true)}
      >
        📤 Import
      </button>
      <YearSelect onYearChange={setSelectedYear} initialSelection={selectedYear} />
      <PlayerTable leagueId={league?.id as string} year={selectedYear} />
      {importModalOpen && <PlayerImportModal
        leagueId={league.id as string}
        onClose={() => {
          setImportModalOpen(false)
        }} />}
    </div>
  )
}

export default PlayerTab
