'use client'

import { useState } from 'react'
import { useGetSortedPlayers, useInvalidatePlayer } from '@/hooks/player'
import { useDraftData } from '@/hooks/draft'
import { useSendBroadcast } from '@/hooks/supabase'
import { useUpdateDraftPick } from '@/hooks/draftPick'
import Table, { TableColumn } from '@/components/Table'
import { PlayerArgs, TeamArgs, DraftPickArgs } from '@/types'
import { formatRoundPick, getPlayerData, getRound, getPlayerName, getPlayerTeam, POSITIONS } from '@/utils/draft'
import { getUnique } from '@/utils/array'
import ChipSelect from '@/components/ChipSelect'
import ConfirmModal from '@/components/ConfirmModal'
import SearchFilter from '@/components/SearchFilter'

const MAX_ROUND_FILTER = 30

interface Props {
  draftId: string;
  maxItemsPerPage?: number,
  hideTeamColumn?: boolean,
  draftingPick?: DraftPickArgs
}

type FilterOptions = { [key: string]: (pick: PlayerArgs) => boolean }

const PlayersTable: React.FC<Props> = ({
  draftId,
  maxItemsPerPage = 100,
  hideTeamColumn,
  draftingPick
}) => {
  const { teamsCount, sessionTeam, canEditDraft } = useDraftData(draftId)
  const { players } = useGetSortedPlayers(draftId, 'Rank')
  const { invalidateObject: invalidatePlayer } = useInvalidatePlayer()
  const { send } = useSendBroadcast(draftId, 'draft')
  const { updateObject: updateDraftPick } = useUpdateDraftPick()
  const [hoveredPlayerId, setHoveredPlayerId] = useState<string | null>(null)
  const [playerToBeDrafted, setPlayerToBeDrafted] = useState<PlayerArgs | null>(null)
  const canDraft = draftingPick && sessionTeam && draftingPick.teamId === sessionTeam.id

  const handleDraft = async () => {
    if (!draftingPick || !playerToBeDrafted) return
    const pickId = draftingPick.id
    const newPlayerId = playerToBeDrafted.id
    const res = await updateDraftPick({ id: pickId, playerId: newPlayerId || null })
    if ('error' in res) return
    setPlayerToBeDrafted(null)
    invalidatePlayer(newPlayerId)
    await send({ pickId, oldPlayerId: null, newPlayerId })
  }

  const getPlayerRound = (player: PlayerArgs) => {
    const round = getRound(Number(getPlayerData(player, 'Rank')), teamsCount)
    return Math.min(round, MAX_ROUND_FILTER)
  }

  const getPlayerPositions = (player: PlayerArgs) => {
    const positions = String(getPlayerData(player, 'Positions'))
    return positions.split(',')
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
    position: () => true,
    playerSearch: () => true
  })

  const columns: TableColumn<PlayerArgs>[] = [
    {
      header: 'Rank',
      value: (player) => formatRoundPick(Number(getPlayerData(player, 'Rank')), teamsCount)
    },
    {
      header: 'ADP',
      value: (player) => formatRoundPick(Number(getPlayerData(player, 'ADP')), teamsCount)
    },
    {
      header: 'Player',
      value: (player) => getPlayerData(player, 'PlayerInfo'),
      renderedValue: (player) => (
        <a
          className="link"
          href={getPlayerData(player, 'Link')}
          target="_blank"
          rel="noopener noreferrer"
        >
          {getPlayerData(player, 'PlayerInfo')}
        </a>
      ),
    },
    {
      header: 'Projections',
      value: (player) => getPlayerData(player, 'Projections'),
      renderedValue: (player) => (
        <div
          className="cursor-pointer w-40"
          onMouseEnter={() => setHoveredPlayerId(player.id)}
          onMouseLeave={() => setHoveredPlayerId(null)}
        >
          {hoveredPlayerId === player.id && (
            <div className="absolute menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-neutral rounded-box w-200 text-xs">
              {getPlayerData(player, 'Notes')}
            </div>
          )}
          {getPlayerData(player, 'Projections')}
        </div>
      ),
    },
    { header: 'Team', value: (player) => getPlayerTeam(player)?.name || '', hidden: hideTeamColumn },
    {
      header: '',
      hidden: !canEditDraft,
      renderedValue: (player) => (
        <button
          className="btn btn-xs btn-primary text-xs"
          disabled={player?.draftPicks?.length > 0 || !canDraft}
          onClick={() => draftingPick && setPlayerToBeDrafted(player)}
        >
          Draft
        </button>
      )
    }
  ]

  if (!players) return null

  const filteredPlayers = players.filter((player) => Object
    .values(filterOptions)
    .every((filter) => filter(player)))

  return (
    <>
      <div className="flex gap-1">
        <div className="w-24 card bg-base-300 p-1">
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
        <div className="w-24 card bg-base-300 p-1">
          <ChipSelect
            label="Position"
            items={POSITIONS.map((pos) => ({ value: pos, label: pos }))}
            onSelection={({ selectedValues }) => {
              setFilterOptions({
                ...filterOptions,
                position: selectedValues?.length
                  ? (player) => selectedValues.some(
                    (value) => getPlayerPositions(player)?.includes(String(value))
                  )
                  : () => true
              })
            }}
          />
        </div>
        <div className="flex-grow card bg-base-300 p-1">
          <SearchFilter
            label="Player"
            onSearch={(value) => {
              setFilterOptions({
                ...filterOptions,
                playerSearch: value
                  ? (player) => String(getPlayerName(player))
                    ?.toLowerCase()
                    .includes(value.toLowerCase())
                  : () => true
              })
            }}
          />
        </div>
        {!hideTeamColumn && <div className="w-60 card bg-base-300 p-1">
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
        </div>}
      </div>
      <Table
        columns={columns}
        data={filteredPlayers}
        maxItemsPerPage={maxItemsPerPage}
        xs
        rowStyle={(player: PlayerArgs) => (!player?.draftPicks?.length ? {} : {
          className: canEditDraft ? 'bg-gray-700 italic text-gray-500' : ''
        })}
      />
      {draftingPick && playerToBeDrafted && (
        <ConfirmModal
          onConfirm={handleDraft}
          onClose={() => setPlayerToBeDrafted(null)}
        >
          Draft&nbsp;
          <b>{getPlayerName(playerToBeDrafted)}</b>
          &nbsp;in round&nbsp;
          {getRound(draftingPick.overall, teamsCount)}
          ?
        </ConfirmModal>
      )}
    </>
  )
}

export default PlayersTable
