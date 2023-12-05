'use client'

import { useState } from 'react'
import { League } from '@prisma/client'
import { useGetPlayers } from '@/hooks/player'
import PlayerTable from './PlayerTable'
import PlayerImportModal from './PlayerImportModal'

interface Props {
  league: Partial<League>;
}

const PlayerTab: React.FC<Props> = ({ league }) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [importModalOpen, setImportModalOpen] = useState(false)

  const { data: players } = useGetPlayers(
    { where: { leagueId: league.id }, distinct: ['year'] },
    { skip: !league.id }
  )

  const years = players?.map((p) => p.year)

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
          value={selectedYear || ''}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => (
            setSelectedYear(parseInt(e.target.value, 10))
          )}
        >
          <option disabled value="">
            Select year
          </option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>
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
