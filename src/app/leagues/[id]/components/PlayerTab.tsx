'use client'

import { useState } from 'react'
import { League } from '@prisma/client'
import { useGetPlayers } from '@/hooks/player'
import Table, { TableColumn } from '@/components/Table'
import { PlayerArgs } from '@/types'
import { JsonObject } from '@prisma/client/runtime/library'
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

  const getPlayerData = (player: PlayerArgs, key: string) => {
    const data = player?.data as JsonObject
    if (key in data) return data[key] as any
    return ''
  }

  const columns: TableColumn<PlayerArgs>[] = [
    { name: 'Rank', value: (player) => getPlayerData(player, 'Rank') },
    { name: 'Name', value: (player) => player.name },
    { name: 'Year', value: (player) => player.year },
    { name: 'Team', value: (player) => getPlayerData(player, 'Team') },
    { name: 'Positions', value: (player) => getPlayerData(player, 'Positions'), }
  ]
  return (
    <div className="flex flex-col items-start mt-8">
      <button
        className="btn btn-sm mb-2"
        onClick={() => setImportModalOpen(true)}
      >
        📤 Import
      </button>
      <Table columns={columns} data={players} xs />
      {importModalOpen && <PlayerImportModal
        leagueId={league.id as string}
        onClose={() => {
          setImportModalOpen(false)
          refetch()
        }} />}
    </div>
  )
}

export default PlayerTab
