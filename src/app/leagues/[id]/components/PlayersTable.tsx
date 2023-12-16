'use client'

import { useState } from 'react'
import { useGetPlayers } from '@/hooks/player'
import { useLeagueTeams } from '@/hooks/team'
import Table, { TableColumn } from '@/components/Table'
import { PlayerArgs, TeamArgs } from '@/types'
import { formatRoundPick, getPlayerData, getRound, getPlayerName, getPlayerTeam } from '@/utils/draft'
import { getUnique } from '@/utils/array'
import ChipSelect from '@/components/ChipSelect'
import SearchFilter from '@/components/SearchFilter'

const MAX_ROUND_FILTER = 30

interface Props {
  leagueId: string;
  year: number;
  maxItemsPerPage?: number
}

type FilterOptions = { [key: string]: (pick: PlayerArgs) => boolean }

const PlayersTable: React.FC<Props> = ({ leagueId, year, maxItemsPerPage = 100 }) => {
  const { data: players } = useGetPlayers(
    {
      where: { leagueId, year },
      include: { draftPicks: { include: { team: true }, where: { draft: { year } } } }
    },
    { skip: !leagueId }
  )

  const { teamsCount } = useLeagueTeams(leagueId)

  const getPlayerRound = (player: PlayerArgs) => {
    const round = getRound(Number(getPlayerData(player, 'Rank')), teamsCount)
    return Math.min(round, MAX_ROUND_FILTER)
  }

  const getUniqueTeamOptions = () => {
    const teams = players
      .map((player) => getPlayerTeam(player))
      .filter((team) => Boolean(team))
    const uniqueTeams = getUnique<TeamArgs>(teams, (team) => team.id)
    return [
      { value: 'free_agent', label: '👤 Free Agent' },
      ...uniqueTeams.map((t) => ({ value: t.id, label: t.name }))
    ]
  }

  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    round: () => true,
    team: () => true,
    playerSearch: () => true
  })

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
    { name: 'Projections', value: (player) => getPlayerData(player, 'Projections') },
    { name: 'Team', value: (player) => getPlayerTeam(player)?.name || '' }
  ]

  if (!players) return null

  const filteredPlayers = players.filter((player) => Object
    .values(filterOptions)
    .every((filter) => filter(player)))

  return (
    <>
      <div className="flex gap-1">
        <div className="w-24 card bg-base-200 p-1">
          <ChipSelect
            label="Rank Round"
            items={[
              ...Array
                .from({ length: MAX_ROUND_FILTER - 1 })
                .map((_, i) => ({ value: i + 1, label: i + 1 })),
              { value: MAX_ROUND_FILTER, label: `${MAX_ROUND_FILTER}+` }
            ]}
            onSelection={({ selectedValues }) => {
              setFilterOptions({
                ...filterOptions,
                round: selectedValues?.length
                  ? (player) => selectedValues.includes(getPlayerRound(player))
                  : () => true
              })
            }}
          />
        </div>
        <div className="flex-grow card bg-base-200 p-1">
          <SearchFilter
            label="Player"
            onSearch={(value) => {
              setFilterOptions({
                ...filterOptions,
                playerSearch: value
                  ? (player) => getPlayerName(player)?.toLowerCase().includes(
                    value.toLowerCase()
                  )
                  : () => true
              })
            }}
          />
        </div>
        <div className="w-60 card bg-base-200 p-1">
          <ChipSelect
            label="Team"
            items={getUniqueTeamOptions()}
            onSelection={({ selectedValues }) => {
              setFilterOptions({
                ...filterOptions,
                team: selectedValues?.length
                  ? (player) => selectedValues.includes(getPlayerTeam(player)?.id || 'free_agent')
                  : () => true
              })
            }}
          />
        </div>
      </div>
      <Table columns={columns} data={filteredPlayers} maxItemsPerPage={maxItemsPerPage} xs />
    </>
  )
}

export default PlayersTable
