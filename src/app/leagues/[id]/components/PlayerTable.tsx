'use client'

import { useGetPlayers } from '@/hooks/player'
import { useLeagueTeams } from '@/hooks/team'
import Table, { TableColumn } from '@/components/Table'
import { PlayerArgs } from '@/types'
import { JsonObject } from '@prisma/client/runtime/library'
import { formatRoundPick } from '@/utils/draft'

interface Props {
  leagueId: string;
  year: number;
  maxItemsPerPage?: number
}

const PlayerTable: React.FC<Props> = ({ leagueId, year, maxItemsPerPage = 100 }) => {
  const { data: players } = useGetPlayers(
    { where: { leagueId, year } },
    { skip: !leagueId }
  )

  const { teamsCount } = useLeagueTeams(leagueId)

  const getPlayerData = (player: PlayerArgs, key: string) => {
    const data = player?.data as JsonObject
    if (key in data) return data[key] as any
    return ''
  }

  const columns: TableColumn<PlayerArgs>[] = [
    {
      name: 'Rank',
      value: (player) => formatRoundPick(Number(getPlayerData(player, 'Rank')), teamsCount)
    },
    {
      name: 'ADP',
      value: (player) => formatRoundPick(Number(getPlayerData(player, 'ADP')), teamsCount)
    },
    { name: 'Player', value: (player) => getPlayerData(player, 'PlayerInfo') },
    { name: 'Projections', value: (player) => getPlayerData(player, 'Projections') }
  ]
  return <Table columns={columns} data={players} maxItemsPerPage={maxItemsPerPage} xs />
}

export default PlayerTable
