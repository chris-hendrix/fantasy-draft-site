'use client'

import { useState, useEffect } from 'react'
import { DraftPickArgs } from '@/types'
import Table, { TableColumn } from '@/components/Table'
import { formatRoundPick, getPlayerName, getRound } from '@/utils/draft'
import { useInvalidatePlayer } from '@/hooks/player'
import { useGetDraftPicks, useUpdateDraftPick, useInvalidateDraftPick } from '@/hooks/draftPick'
import { useSendBroadcast, useReceiveBroadcast } from '@/hooks/supabase'
import ChipSelect from '@/components/ChipSelect'
import { getUnique } from '@/utils/array'
import SearchFilter from '@/components/SearchFilter'
import { useDraftData } from '@/hooks/draft'
import MoveButtons from './MoveButtons'
import PlayerAutocomplete from './PlayerAutocomplete'

interface Props {
  draftId: string;
  edit?: boolean;
  onOrderChange: (draftPicks: DraftPickArgs[]) => void
  onDraftPicksChanged?: (draftPicks: DraftPickArgs[]) => void
}

type FilterOptions = { [key: string]: (pick: DraftPickArgs) => boolean }

const DraftPicksTable: React.FC<Props> = ({
  draftId, edit = false,
  onOrderChange,
  onDraftPicksChanged
}) => {
  const { isCommissioner, teamsCount, rounds } = useDraftData(draftId)
  const { data: draftPicks, isSuccess } = useGetDraftPicks(
    {
      where: { draftId },
      include: { team: true, player: true },
      orderBy: { overall: 'asc' }
    }
  )
  const { updateObject: updateDraftPick } = useUpdateDraftPick()
  const { invalidateObject: invalidateDraftPick } = useInvalidateDraftPick()
  const { invalidateObject: invalidatePlayer } = useInvalidatePlayer()
  const [editPickId, setEditPickId] = useState<string | null>(null)
  const [editDraftPicks, setEditDraftPicks] = useState<DraftPickArgs[]>([])
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    round: () => true,
    team: () => true,
    playerSearch: () => true
  })

  const { send } = useSendBroadcast(draftId, 'draft')
  const { latestPayload } = useReceiveBroadcast(draftId, 'draft')

  // console.log({ latestPayload, draftId })
  useEffect(() => { setEditDraftPicks(draftPicks) }, [draftPicks])
  useEffect(() => { onOrderChange(editDraftPicks) }, [editDraftPicks])
  useEffect(() => {
    isSuccess && onDraftPicksChanged && onDraftPicksChanged(draftPicks)
  }, [isSuccess])

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

  const picks = edit ? editDraftPicks : draftPicks
  const columns: TableColumn<DraftPickArgs>[] = [
    {
      header: '',
      hidden: !edit,
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
      value: (pick) => pick.team?.name
    },
    {
      header: 'Player',
      hidden: edit,
      cellStyle: { maxWidth: '256px', width: '256px' },
      value: ({ player }) => player && getPlayerName(player),
      renderedValue: ({ id, player }) => {
        if (!isCommissioner) return player && <div className="">{getPlayerName(player)}</div>
        if (editPickId !== id) {
          return <div
            className="input input-xs input-bordered w-full cursor-pointer bg-base-200"
            onClick={() => setEditPickId(id || null)}
          >
            {player ? getPlayerName(player) : ''}
          </div>
        }
        return <PlayerAutocomplete
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
        <div className="w-24 card bg-base-200 p-1">
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
        <div className="w-60 card bg-base-200 p-1">
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
        <div className="flex-grow card bg-base-200 p-1">
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
        rowStyle={(pick: DraftPickArgs) => (!pick?.player ? {} : {
          className: 'bg-neutral-content'
        })}
      />
    </>
  )
}

export default DraftPicksTable
