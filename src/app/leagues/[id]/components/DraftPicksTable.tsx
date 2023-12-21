'use client'

import { useState, useEffect } from 'react'
import { DraftArgs, DraftPickArgs } from '@/types'
import Table, { TableColumn } from '@/components/Table'
import { formatRoundPick, getPlayerName, getRound } from '@/utils/draft'
import { useUserLeagues } from '@/hooks/league'
import { useInvalidatePlayer } from '@/hooks/player'
import { useGetDraftPicks, useUpdateDraftPick, useInvalidateDraftPick } from '@/hooks/draftPick'
import { useSendBroadcast, useReceiveBroadcast } from '@/hooks/supabase'
import ChipSelect from '@/components/ChipSelect'
import { getUnique } from '@/utils/array'
import SearchFilter from '@/components/SearchFilter'
import MoveButtons from './MoveButtons'
import PlayerAutocomplete from './PlayerAutocomplete'

interface Props {
  draft: DraftArgs;
  edit?: boolean;
  onOrderChange: (draftPicks: Partial<DraftPickArgs>[]) => void
}

type FilterOptions = { [key: string]: (pick: DraftPickArgs) => boolean }

const DraftPicksTable: React.FC<Props> = ({ draft, edit = false, onOrderChange }) => {
  const { isCommissioner } = useUserLeagues(draft.leagueId)
  const { data: draftPicks } = useGetDraftPicks(
    {
      where: { draftId: draft.id },
      include: { team: true, player: true },
      orderBy: { overall: 'asc' }
    },
    { skip: !draft.id }
  )
  const { updateObject: updateDraftPick } = useUpdateDraftPick()
  const { invalidateObject: invalidateDraftPick } = useInvalidateDraftPick()
  const { invalidateObject: invalidatePlayer } = useInvalidatePlayer()
  const [editPickId, setEditPickId] = useState<string | null>(null)
  const [editedDraftPicks, setEditedDraftPicks] = useState<DraftPickArgs[]>([])
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    round: () => true,
    team: () => true,
    playerSearch: () => true
  })
  const teamsCount = (draft?.draftOrderSlots?.length || 1)

  const { send } = useSendBroadcast(draft.id as string, 'test')
  const { latestPayload } = useReceiveBroadcast(draft.id as string, 'test')

  useEffect(() => { setEditedDraftPicks(draftPicks || []) }, [draftPicks])
  useEffect(() => { onOrderChange(editedDraftPicks) }, [editedDraftPicks])

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

  const picks = edit ? editedDraftPicks : draftPicks
  const columns: TableColumn<Partial<DraftPickArgs>>[] = [
    {
      name: '',
      hidden: !edit,
      renderedValue: (pick) => <MoveButtons
        indexToMove={editedDraftPicks.findIndex((p) => p.id === pick.id)}
        array={editedDraftPicks}
        setArray={setEditedDraftPicks}
      />
    },
    { name: 'Pick', value: (pick) => formatRoundPick(pick?.overall || 0, teamsCount) },
    { name: 'Team', value: (pick) => pick.team?.name },
    {
      name: 'Player',
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
        return draft?.id && <PlayerAutocomplete
          draftId={draft.id}
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

  const filteredPicks = draftPicks.filter((pick) => Object
    .values(filterOptions)
    .every((filter) => filter(pick)))

  return (
    <>
      <div className="flex gap-1">
        <div className="w-24 card bg-base-200 p-1">
          <ChipSelect
            items={Array.from({ length: draft?.rounds || 0 })
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
                  ? (pick) => getPlayerName(pick?.player)?.toLowerCase().includes(
                    value.toLowerCase()
                  )
                  : () => true
              })
            }}
          />
        </div>
      </div>
      <Table columns={columns} data={filteredPicks} xs maxItemsPerPage={300} />
    </>
  )
}

export default DraftPicksTable
