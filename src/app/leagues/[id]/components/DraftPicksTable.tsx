'use client'

import { useState, useEffect } from 'react'
import { DraftArgs, DraftPickArgs } from '@/types'
import Table, { TableColumn } from '@/components/Table'
import { formatRoundPick, getPlayerName } from '@/utils/draft'
import { useUserLeagues } from '@/hooks/league'
import { useGetDraftPicks, useUpdateDraftPick } from '@/hooks/draft-pick'
import MoveButtons from './MoveButtons'
import PlayerAutocomplete from './PlayerAutocomplete'

interface Props {
  draft: Partial<DraftArgs>;
  edit?: boolean;
  draftPicksCallback: (draftPicks: Partial<DraftPickArgs>[]) => void
}

const DraftPicksTable: React.FC<Props> = ({ draft, edit = false, draftPicksCallback }) => {
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
  const [editPickId, setEditPickId] = useState<string | null>(null)

  const [editedDraftPicks, setEditedDraftPicks] = useState<Partial<DraftPickArgs>[]>([])
  const teamsCount = (draft?.draftOrderSlots?.length || 1)

  useEffect(() => { setEditedDraftPicks(draftPicks || []) }, [draftPicks])
  useEffect(() => { draftPicksCallback(editedDraftPicks) }, [editedDraftPicks])

  const handleSelection = async (pickId: string, playerId: string) => {
    await updateDraftPick({ id: pickId, playerId })
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
        return <PlayerAutocomplete
          leagueId={draft.leagueId as string}
          year={draft.year as number}
          onSelection={(playerId) => handleSelection(id as string, playerId)}
          size="xs"
          initialId={player?.id}
          excludeIds={draftPicks?.map((dp) => dp.playerId || '') || []}
        />
      }
    }
  ]

  if (!picks) return null

  return <Table columns={columns} data={picks} xs maxItemsPerPage={300} />
}

export default DraftPicksTable
