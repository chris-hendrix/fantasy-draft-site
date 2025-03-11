'use client'

import { useState, useEffect } from 'react'
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
import Toggle from '@/components/Toggle'
import DraftPlayerModal from './DraftPlayerModal'
import PlayerSorter, { PlayerSortOption } from './PlayerSorter'

const MAX_ROUND_FILTER = 30

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
    isLoading: isDraftLoading,
    teamsCount,
    isDraftOpen,
    sessionTeamIds,
  } = useDraft(draftId)

  const { draftPicks, makeLiveSelection, draftingPick, canDraft } = useLiveDraftPicks(draftId)
  const {
    players,
    isLoading: isPlayersLoading,
    handleSavePlayer,
    getIsSaved,
    canSave,
  } = useSortedPlayers(draftId, 'Rank', 9999)
  const [playerToBeDrafted, setPlayerToBeDrafted] = useState<PlayerArgs | null>(null)
  const [clickedPlayer, setClickedPlayer] = useState<PlayerArgs | null>(null)
  const [sortOption, setSortOption] = useState<PlayerSortOption | null>(null)
  const [availableOnly, setAvailableOnly] = useState(false)
  const sessionTeamId = sessionTeamIds?.[0] // TODO just choose first for now
  const isLoading = isDraftLoading || isPlayersLoading

  useEffect(() => {
    const handleKeyDown = (event: any) => {
      if (clickedPlayer !== null) {
        if (event.key === 'ArrowRight') {
          goToNextPlayer()
        } else if (event.key === 'ArrowLeft') {
          goToPreviousPlayer()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [clickedPlayer, draftPicks])

  const handleDraft = async (player: PlayerArgs) => {
    if (!draftingPick || !player) return
    const pickId = draftingPick.id
    const newPlayerId = player.id
    if (await makeLiveSelection(pickId, null, newPlayerId)) {
      setPlayerToBeDrafted(null)
      setClickedPlayer(null)
    }
  }

  const getExpectedOverall = (player: PlayerArgs) => {
    const rank = Number(getPlayerData(player, 'Rank'))
    const picksBefore = draftingPick?.overall || rank
    const draftedBefore = draftPicks
      ?.filter((dp) => Boolean(dp.player) && getPlayerData(dp.player, 'Rank') < rank)
      ?.length || 0
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
    available: () => true,
    round: () => true,
    team: () => true,
    position: () => true,
    playerSearch: () => true
  })

  const columns: TableColumn<PlayerArgs>[] = [
    {
      header: '',
      hidden: !canSave,
      value: (player) => (getIsSaved(player.id) ? '⭐' : '☆'),
      renderedValue: (player) => (
        <Tooltip text="Save player">
          <div
            onClick={() => handleSavePlayer(player.id)}
            className="text-[0.5rem] flex text-center cursor-pointer"
          >
            {getIsSaved(player.id) ? '⭐' : '☆'}
          </div>
        </Tooltip>
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
              onClick={() => setPlayerToBeDrafted(player)}
            >
              Draft
            </button>
          )
        }
        return getPlayerTeam(player)?.name || ''
      }
    },
  ]

  const filteredPlayers = players
    ?.filter((player) => Object
      .values(filterOptions)
      .every((filter) => filter(player))) || []

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
    const index = sortedPlayers.findIndex((p) => p.id === clickedPlayer.id)
    const nextPlayer = sortedPlayers[index + 1]
    if (nextPlayer) setClickedPlayer(nextPlayer)
  }

  const goToPreviousPlayer = () => {
    if (!clickedPlayer) return
    const index = sortedPlayers.findIndex((p) => p.id === clickedPlayer.id)
    const previousPlayer = sortedPlayers[index - 1]
    if (previousPlayer) setClickedPlayer(previousPlayer)
  }

  return (
    <>
      <div className="flex gap-1">
        <div className="w-24 card bg-base-300 p-1">
          <PlayerSorter onSortChange={setSortOption} />
        </div>
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
        <div className="w-24 card bg-base-300 p-1 flex items-center">
          <Toggle
            label="Available"
            value={availableOnly}
            size="xs"
            setValue={(value: boolean) => {
              setAvailableOnly(value)
              setFilterOptions({
                ...filterOptions,
                available: (player) => !value || !player.draftPicks.length
              })
            }}
          />
          {sessionTeamId && (
            <Toggle
              label="⭐Saved"
              value={availableOnly}
              size="xs"
              setValue={(value: boolean) => {
                setAvailableOnly(value)
                setFilterOptions({
                  ...filterOptions,
                  saved: (player) => (
                    !value ||
                    player.savedPlayers.some((sp) => sp.teamId === sessionTeamId && sp.isDraftable)
                  ),
                })
              }}
            />
          )}
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
      />
      {draftingPick && playerToBeDrafted && (
        <ConfirmModal
          onConfirm={async () => handleDraft(playerToBeDrafted)}
          onClose={() => setPlayerToBeDrafted(null)}
        >
          <>
            Draft&nbsp;
            <b>{getPlayerName(playerToBeDrafted)}</b>
            &nbsp;in round&nbsp;
            {getRound(draftingPick.overall, teamsCount)}
            ?
          </>
        </ConfirmModal>
      )}
      {clickedPlayer && !playerToBeDrafted && (
        <DraftPlayerModal
          player={clickedPlayer}
          onClose={() => setClickedPlayer(null)}
          setPlayerToBeDrafted={setPlayerToBeDrafted}
          goToNextPlayer={goToNextPlayer}
          goToPreviousPlayer={goToPreviousPlayer}
        />
      )}
    </>
  )
}

export default PlayersTable
