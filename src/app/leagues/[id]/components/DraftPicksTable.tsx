'use client'

import { useState, useEffect } from 'react'
import { DraftPickArgs } from '@/types'
import Table, { TableColumn } from '@/components/Table'
import { formatRoundPick, getPlayerName, getRound } from '@/utils/draft'
import { useInvalidatePlayer } from '@/hooks/player'
import { useDraftPicks } from '@/hooks/draftPick'
import { useSendBroadcast, useReceiveBroadcast } from '@/hooks/supabase'
import ChipSelect from '@/components/ChipSelect'
import { getUnique } from '@/utils/array'
import SearchFilter from '@/components/SearchFilter'
import { useDraft } from '@/hooks/draft'
import MoveButtons from './MoveButtons'
import PlayerAutocomplete from './PlayerAutocomplete'
import PositionsTable from './PositionsTable'

interface Props {
  draftId: string;
  editOrder?: boolean;
  onOrderChange: (draftPicks: DraftPickArgs[]) => void
  onDraftPicksChanged?: (draftPicks: DraftPickArgs[]) => void
}

type FilterOptions = { [key: string]: (pick: DraftPickArgs) => boolean }

const DraftPicksTable: React.FC<Props> = ({
  draftId,
  editOrder = false,
  onOrderChange,
  onDraftPicksChanged
}) => {
  const { isCommissioner, teamsCount, rounds, canEditDraft } = useDraft(draftId)
  const { draftPicks, updateDraftPick, invalidateDraftPick } = useDraftPicks(draftId)
  const { invalidateObject: invalidatePlayer } = useInvalidatePlayer()
  const [editPickId, setEditPickId] = useState<string | null>(null)
  const [hoveredPickId, setHoveredPickId] = useState<string | null>(null)
  const [editDraftPicks, setEditDraftPicks] = useState<DraftPickArgs[]>([])
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    round: () => true,
    team: () => true,
    playerSearch: () => true
  })

  const { send } = useSendBroadcast(draftId, 'draft')
  const { latestPayload } = useReceiveBroadcast(draftId, 'draft')
  const draftingPick = draftPicks?.filter((p) => p.playerId === null)?.[0]

  useEffect(() => { setEditDraftPicks(draftPicks) }, [draftPicks])
  useEffect(() => { onOrderChange(editDraftPicks) }, [editDraftPicks])
  useEffect(() => { onDraftPicksChanged && onDraftPicksChanged(draftPicks) }, [draftPicks])

  useEffect(() => {
    const { pickId, oldPlayerId } = latestPayload || {}
    pickId && invalidateDraftPick(pickId)
    oldPlayerId && invalidatePlayer(latestPayload?.oldPlayerId)
  }, [latestPayload])

  const handleSelection = async (
    pickId: string,
    oldPlayerId: string,
    newPlayerId: string | null
  ) => {
    const res = await updateDraftPick({ id: pickId, playerId: newPlayerId || null })
    if ('error' in res) return
    await send({ pickId, oldPlayerId, newPlayerId })
  }

  const picks = editOrder ? editDraftPicks : draftPicks
  const columns: TableColumn<DraftPickArgs>[] = [
    {
      header: '',
      hidden: !editOrder,
      renderedValue: (pick) => (
        <MoveButtons
          indexToMove={editDraftPicks.findIndex((p) => p.id === pick.id)}
          array={editDraftPicks}
          setArray={setEditDraftPicks}
        />)
    },
    {
      header: 'Pick',
      cellStyle: { maxWidth: '56px' },
      value: (pick) => formatRoundPick(pick?.overall || 0, teamsCount)
    },
    {
      header: 'Team',
      value: (pick) => pick.team?.name,
      renderedValue: (pick) => (
        <div
          className="cursor-pointer w-40"
          onMouseEnter={() => setHoveredPickId(pick.id)}
          onMouseLeave={() => setHoveredPickId(null)}
        >
          {hoveredPickId === pick.id && (
            <div className="absolute menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-neutral rounded-box w-200 text-xs">
              <label className="text-xs w-fit p-0.5 text-neutral-content bold" >
                {pick?.team?.name || ''}
              </label>
              <PositionsTable draftId={pick.draftId} teamId={pick.teamId} />
            </div>
          )}
          {pick.team?.name}
        </div>
      )
    },
    {
      header: 'Player',
      hidden: editOrder,
      cellStyle: { maxWidth: '256px', width: '256px' },
      value: ({ player }) => player && getPlayerName(player),
      renderedValue: ({ id, player }) => {
        if (!isCommissioner || !canEditDraft) return player && <div className="">{getPlayerName(player)}</div>
        if (editPickId !== id) {
          return <div
            className="input input-xs input-bordered w-full cursor-pointer bg-base-300"
            onClick={() => setEditPickId(id || null)}
          >
            {player ? getPlayerName(player) : ''}
          </div>
        }
        return (
          <PlayerAutocomplete
            draftId={draftId}
            onSelection={(newPlayerId) => {
              handleSelection(String(id), String(player?.id), newPlayerId)
            }}
            size="xs"
            initialId={player?.id}
            excludeIds={draftPicks
              ?.filter((dp) => dp.playerId && dp.playerId !== player?.id)
              ?.map((dp) => dp.playerId || '') || []
            }
          />
        )
      }
    }
  ]

  if (!picks) return null

  const filteredPicks = (editDraftPicks || []).filter((pick) => Object
    .values(filterOptions)
    .every((filter) => filter(pick)))

  return (
    <>
      <div className="flex gap-1">
        <div className="w-24 card bg-base-300 p-1">
          <ChipSelect
            items={Array.from({ length: rounds })
              .map((_, i) => ({ value: i + 1, label: i + 1 }))
            }
            onSelection={({ selectedValues }) => {
              setFilterOptions({
                ...filterOptions,
                round: selectedValues?.length
                  ? (pick) => selectedValues.includes(getRound(pick.overall, teamsCount))
                  : () => true
              })
            }}
            label="Round"
          />
        </div>
        <div className="w-60 card bg-base-300 p-1">
          <ChipSelect
            items={getUnique<DraftPickArgs>(
              draftPicks,
              (p) => p.teamId
            ).map((p) => ({ value: p.teamId, label: p.team.name }))}
            label="Team"
            onSelection={({ selectedValues }) => {
              setFilterOptions({
                ...filterOptions,
                team: selectedValues?.length
                  ? (pick) => selectedValues.includes(pick.team.id)
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
                  ? ({ player }) => Boolean(player && getPlayerName(player)?.toLowerCase().includes(
                    value.toLowerCase()
                  ))
                  : () => true
              })
            }}
          />
        </div>
      </div>
      <Table
        columns={columns}
        data={filteredPicks}
        xs
        maxItemsPerPage={300}
        rowStyle={(pick: DraftPickArgs) => {
          if (!canEditDraft) return { className: '' }
          if (pick.id === draftingPick?.id) return { className: 'bg-primary bold text-primary-content' }
          if (pick?.player && canEditDraft) return { className: 'bg-gray-700 italic text-gray-500' }
          return { className: '' }
        }}
      />
    </>
  )
}

export default DraftPicksTable
