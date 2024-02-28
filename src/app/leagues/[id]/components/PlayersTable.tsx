'use client'

import { useState } from 'react'
import { useSortedPlayers } from '@/hooks/player'
import { useDraft } from '@/hooks/draft'
import { useSendBroadcast } from '@/hooks/supabase'
import { useDraftPicks } from '@/hooks/draftPick'
import Table, { TableColumn } from '@/components/Table'
import Tooltip from '@/components/Tooltip'
import { PlayerArgs, TeamArgs, DraftPickArgs } from '@/types'
import { formatRoundPick, getPlayerData, getRound, getPlayerName, getPlayerTeam, POSITIONS, getPlayerPositions } from '@/utils/draft'
import { getUnique } from '@/utils/array'
import ChipSelect from '@/components/ChipSelect'
import ConfirmModal from '@/components/ConfirmModal'
import SearchFilter from '@/components/SearchFilter'

const MAX_ROUND_FILTER = 30

const ICONS = {
  true: '🟢',
  false: '🔴',
  null: '⚫'
}

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
  hideTeamColumn
}) => {
  const {
    draft: { disableUserDraft },
    isLoading: isDraftLoading,
    teamsCount,
    isComplete,
    isDraftOpen,
    sessionTeamIds,
    isSessionTeam
  } = useDraft(draftId)
  const { draftPicks, updateDraftPick, draftingPick } = useDraftPicks(draftId)
  const { players, isLoading: isPlayersLoading, invalidatePlayer, updatePlayer } = useSortedPlayers(draftId, 'Rank', 9999)
  const { send } = useSendBroadcast(draftId, 'draft')
  const [playerToBeDrafted, setPlayerToBeDrafted] = useState<PlayerArgs | null>(null)
  const sessionTeamId = sessionTeamIds?.[0] // TODO just choose first for now
  const canDraft = draftingPick && isSessionTeam(draftingPick.teamId)
  const isLoading = isDraftLoading || isPlayersLoading

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

  const handleSavePlayer = async (player: PlayerArgs) => {
    const savedPlayer = player.savedPlayers.find((sp) => isSessionTeam(sp.teamId))
    const isDraftable = savedPlayer?.isDraftable
    if (!sessionTeamId) return
    await updatePlayer({
      id: player.id,
      savedPlayers: {
        delete: savedPlayer ? { id: savedPlayer.id } : undefined,
        create: isDraftable === false
          ? { teamId: sessionTeamId, isDraftable: null }
          : { teamId: sessionTeamId, isDraftable: !isDraftable }
      }
    })
  }

  const getExpectedOverall = (player: PlayerArgs) => {
    const rank = Number(getPlayerData(player, 'Rank'))
    const picksBefore = draftingPick?.overall || rank
    const draftedBefore = draftPicks
      .filter((dp) => Boolean(dp.player) && getPlayerData(dp.player, 'Rank') < rank)
      .length
    const expected = rank + picksBefore - draftedBefore - 1
    return expected
  }

  const getExpectedRound = (player: PlayerArgs) => {
    const expected = getExpectedOverall(player)
    if (!expected) return null
    const round = getRound(expected, teamsCount)
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
    saved: () => true,
    round: () => true,
    team: () => true,
    position: () => true,
    playerSearch: () => true
  })

  const getIcon = (isDraftable: boolean | undefined | null) => {
    if (isDraftable === undefined || isDraftable === null) return ICONS.null
    return isDraftable ? ICONS.true : ICONS.false
  }

  const getIsDraftable = (player: PlayerArgs) => {
    const savedPlayer = player?.savedPlayers?.find((sp) => isSessionTeam(sp.teamId))
    return !savedPlayer ? null : savedPlayer.isDraftable
  }

  const columns: TableColumn<PlayerArgs>[] = [
    {
      header: '',
      hidden: !sessionTeamId || isComplete,
      value: (player) => getIcon(getIsDraftable(player)),
      renderedValue: (player) => (
        <div onClick={() => handleSavePlayer(player)} className="text-[0.5rem] flex text-center cursor-pointer">
          {getIcon(getIsDraftable(player))}
        </div>
      )
    },
    {
      header: 'Rank',
      value: (player) => formatRoundPick(Number(getPlayerData(player, 'Rank')), teamsCount)
    },
    {
      header: 'ADP',
      value: (player) => formatRoundPick(Number(getPlayerData(player, 'ADP')), teamsCount)
    },
    {
      header: (
        <Tooltip text="Expected draft position considering keepers">
          Expected
        </Tooltip>
      ),
      value: (player) => {
        const expected = getExpectedOverall(player)
        if (!expected) return null
        return formatRoundPick(expected || 9999, teamsCount)
      },
    },
    {
      header: 'Player',
      value: (player) => getPlayerData(player, 'PlayerInfo'),
      renderedValue: (player) => {
        const link = getPlayerData(player, 'Link')
        if (!link) return getPlayerData(player, 'PlayerInfo')
        return (
          <a
            className="link"
            href={getPlayerData(player, 'Link')}
            target="_blank"
            rel="noopener noreferrer"
          >
            {getPlayerData(player, 'PlayerInfo')}
          </a>
        )
      },
    },
    {
      header: 'Projections',
      value: (player) => getPlayerData(player, 'Projections'),
      renderedValue: (player) => (
        <div className="w-40">
          <Tooltip text={getPlayerData(player, 'Notes')} >
            {getPlayerData(player, 'Projections')}
          </Tooltip>
        </div>
      ),
    },
    { header: 'Team', value: (player) => getPlayerTeam(player)?.name || '', hidden: hideTeamColumn },
    {
      header: '',
      hidden: !isDraftOpen || disableUserDraft || !draftingPick,
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

  const filteredPlayers = players.filter((player) => Object
    .values(filterOptions)
    .every((filter) => filter(player)))

  return (
    <>
      <div className="flex gap-1">
        {sessionTeamId && <div className="w-16 card bg-base-300 p-1">
          <ChipSelect
            label="Saved"
            items={[
              { label: ICONS.true, value: true },
              { label: ICONS.false, value: false },
              { label: ICONS.null, value: null }
            ]}
            onSelection={({ selectedValues }) => {
              setFilterOptions({
                ...filterOptions,
                saved: selectedValues?.length
                  ? (player) => selectedValues.includes(getIsDraftable(player))
                  : () => true
              })
            }}
          />
        </div>}
        <div className="w-24 card bg-base-300 p-1">
          <ChipSelect
            label="Expected Rnd"
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
                  ? (player) => selectedValues.includes(getExpectedRound(player))
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
          className: isDraftOpen ? 'bg-gray-700 italic text-gray-500' : ''
        })}
        isLoading={isLoading}
        minHeight="600px"
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
