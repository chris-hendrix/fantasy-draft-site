'use client'

import { useState } from 'react'
import { League } from '@prisma/client'
import { useGetPlayers, useAddPlayer } from '@/hooks/player'
import Table, { TableColumn } from '@/components/Table'
import { PlayerArgs } from '@/types'
import PlayerImportModal from './PlayerImportModal'

interface Props {
  league: Partial<League>;
}

const PlayerTab: React.FC<Props> = ({ league }) => {
  const { data: players, refetch } = useGetPlayers(
    { where: { leagueId: league.id } },
    { skip: !league?.id }
  )
  const [importModalOpen, setImportModalOpen] = useState(false)
  const { addObject: addPlayer } = useAddPlayer()

  const handleAddPlayer = async () => {
    // TODO
    const res = await addPlayer({
      leagueId: league.id,
      year: new Date().getFullYear(),
      name: `Player ${new Date().getTime()}`
    })
    if ('error' in res) return
    refetch()
  }

  const columns: TableColumn<PlayerArgs>[] = [
    {
      name: 'Name',
      value: (player) => player.name
    },
    {
      name: 'Year',
      value: (player) => player.year
    },
  ]
  return (
    <div className="flex flex-col items-start mt-8">
      <button
        className="btn btn-sm mb-2"
        onClick={handleAddPlayer}
      >
        ➕ Add player
      </button>
      <button
        className="btn btn-sm mb-2"
        onClick={() => setImportModalOpen(true)}
      >
        📤 Import
      </button>
      <Table columns={columns} data={players} />
      {importModalOpen && <PlayerImportModal onClose={() => setImportModalOpen(false)} />}
    </div>
  )
}

export default PlayerTab
