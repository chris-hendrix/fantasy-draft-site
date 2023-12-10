'use client'

import { useGetPlayers } from '@/hooks/player'
import { useLeagueTeams } from '@/hooks/team'
import Table, { TableColumn } from '@/components/Table'
import { PlayerArgs } from '@/types'
import { formatRoundPick, getPlayerData } from '@/utils/draft'

interface Props {
  leagueId: string;
  year: number;
  maxItemsPerPage?: number
}

const PlayersTable: React.FC<Props> = ({ leagueId, year, maxItemsPerPage = 100 }) => {
  const { data: players } = useGetPlayers(
    { where: { leagueId, year }, include: { draftPicks: { where: { draft: { year } } } } },
    { skip: !leagueId }
  )

  const { teamsCount } = useLeagueTeams(leagueId)

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
    // { name: 'Projections', value: (player) => getPlayerData(player, 'Projections') },
    { name: 'Status', value: (player) => (player?.draftPicks?.length > 0 ? 'Drafted' : 'Free agent') }
  ]

  if (!players) return <></>
  return <Table columns={columns} data={players} maxItemsPerPage={maxItemsPerPage} xs />
}

export default PlayersTable