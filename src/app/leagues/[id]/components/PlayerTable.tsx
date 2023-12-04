'use client'

import { useGetPlayers } from '@/hooks/player'
import Table, { TableColumn } from '@/components/Table'
import { PlayerArgs } from '@/types'
import { JsonObject } from '@prisma/client/runtime/library'

interface Props {
  leagueId: string;
  year: number;

}

const PlayerTable: React.FC<Props> = ({ leagueId, year }) => {
  const { data: players } = useGetPlayers(
    { where: { leagueId, year } },
    { skip: !leagueId }
  )

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
  return <Table columns={columns} data={players} xs />
}

export default PlayerTable
