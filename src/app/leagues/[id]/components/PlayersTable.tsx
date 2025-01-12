'use client'

import { useState } from 'react'
import { useSortedPlayers } from '@/hooks/player'
import { useDraft } from '@/hooks/draft'
import { useLiveDraftPicks } from '@/hooks/draftPick'
import Table, { TableColumn } from '@/components/Table'
import Tooltip from '@/components/Tooltip'
import { PlayerArgs, DraftPickArgs } from '@/types'
import {
  formatRoundPick,
  getPlayerData,
  getRound,
  getPlayerName,
  getPlayerTeam,
  POSITIONS,
  getPlayerPositions,
} from '@/utils/draft'
import ChipSelect from '@/components/ChipSelect'
import ConfirmModal from '@/components/ConfirmModal'
import SearchFilter from '@/components/SearchFilter'
import DraftPlayerModal from './DraftPlayerModal'
import PlayerSorter, { PlayerSortOption } from './PlayerSorter'

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
  customSort?: { key: string, order: 'asc' | 'desc', isHitterStat?: boolean }
}

type FilterOptions = { [key: string]: (pick: PlayerArgs) => boolean }

const PlayersTable: React.FC<Props> = ({
  draftId,
  maxItemsPerPage = 100,
  hideTeamColumn,
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
  const { draftPicks, makeLiveSelection, draftingPick } = useLiveDraftPicks(draftId)
  const { players, isLoading: isPlayersLoading, updatePlayer } = useSortedPlayers(draftId, 'Rank', 9999)
  const [playerToBeDrafted, setPlayerToBeDrafted] = useState<PlayerArgs | null>(null)
  const [clickedPlayer, setClickedPlayer] = useState<PlayerArgs | null>(null)
  const [sortOption, setSortOption] = useState<PlayerSortOption | null>(null)
  const sessionTeamId = sessionTeamIds?.[0] // TODO just choose first for now
  const isLoading = isDraftLoading || isPlayersLoading

  const canDraft = (player: PlayerArgs) => {
    if (disableUserDraft) return false
    if (!draftingPick) return false
    if (player.draftPicks?.length) return false
    if (!isSessionTeam(draftingPick.teamId)) return false
    return true
  }

  const handleDraft = async (player: PlayerArgs) => {
    if (!draftingPick || !player) return
    const pickId = draftingPick.id
    const newPlayerId = player.id
    if (await makeLiveSelection(pickId, null, newPlayerId)) {
      setPlayerToBeDrafted(null)
    }
  }

  const handleSavePlayer = async (player: PlayerArgs) => {
    const savedPlayer = player.savedPlayers.find((sp) => isSessionTeam(sp.teamId)) || null
    if (!sessionTeamId) return
    await updatePlayer({
      id: player.id,
      savedPlayer
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
            onClick={() => setClickedPlayer(player)}
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
          {getPlayerData(player, 'Projections')}
        </div>
      ),
    },
    {
      header: 'Team',
      value: (player) => getPlayerTeam(player)?.name || '',
      hidden: hideTeamColumn,
      renderedValue: (player) => {
        const isDrafted = player?.draftPicks?.length > 0
        if (!isDrafted && canDraft(player)) {
          return (
            <button
              className="btn btn-xs btn-primary text-xs w-full"
              onClick={() => draftingPick && setPlayerToBeDrafted(player)}
            >
              Draft
            </button>
          )
        }
        return getPlayerTeam(player)?.name || ''
      }
    },
  ]

  const filteredPlayers = players.filter((player) => Object
    .values(filterOptions)
    .every((filter) => filter(player)))

  const sortedPlayers = (() => {
    if (!sortOption) return filteredPlayers
    const { key, order, filter } = sortOption

    // add additional filter
    const filtered = filter ? filteredPlayers.filter(filter) : filteredPlayers

    // sort
    const sorted = filtered.sort((a, b) => {
      const valueA = getPlayerData(a, key)
      const valueB = getPlayerData(b, key)

      if (!valueA) return 1 // if data is '', send to back
      if (!valueB) return -1
      if (valueA < valueB) return order === 'asc' ? -1 : 1
      if (valueA > valueB) return order === 'asc' ? 1 : -1
      return 0
    })
    return sorted
  })()

  const goToNextPlayer = () => {
    if (!clickedPlayer) return
    const index = players.findIndex((p) => p.id === clickedPlayer.id)
    const nextPlayer = players[index + 1]
    if (nextPlayer) setClickedPlayer(nextPlayer)
  }

  const goToPreviousPlayer = () => {
    if (!clickedPlayer) return
    const index = players.findIndex((p) => p.id === clickedPlayer.id)
    const previousPlayer = players[index - 1]
    if (previousPlayer) setClickedPlayer(previousPlayer)
  }

  return (
    <>
      <div className="flex gap-1">
        <div className="w-32 card bg-base-300 p-1">
          <PlayerSorter onSortChange={setSortOption} />
        </div>
        {sessionTeamId && (
          <div className="w-24 card bg-base-300 p-1">
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
          </div>
        )}
        <div className="w-32 card bg-base-300 p-1">
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

      </div >
      <Table
        columns={columns}
        data={sortedPlayers}
        maxItemsPerPage={maxItemsPerPage}
        xs
        rowStyle={(player: PlayerArgs) => (!player?.draftPicks?.length ? {} : {
          className: isDraftOpen ? 'bg-gray-700 italic text-gray-500' : ''
        })}
        isLoading={isLoading}
        minHeight="600px"
        disableSort
      />
      {
        draftingPick && playerToBeDrafted && (
          <ConfirmModal
            onConfirm={async () => handleDraft(playerToBeDrafted)}
            onClose={() => setPlayerToBeDrafted(null)}
          >
            Draft&nbsp;
            <b>{getPlayerName(playerToBeDrafted)}</b>
            &nbsp;in round&nbsp;
            {getRound(draftingPick.overall, teamsCount)}
            ?
          </ConfirmModal>
        )
      }
      {clickedPlayer && (
        <DraftPlayerModal
          player={clickedPlayer}
          onClose={() => setClickedPlayer(null)}
          setPlayerToBeDrafted={setPlayerToBeDrafted}
          goToNextPlayer={goToNextPlayer}
          goToPreviousPlayer={goToPreviousPlayer}
          canDraft={canDraft}
        />
      )}
    </>
  )
}

export default PlayersTable
