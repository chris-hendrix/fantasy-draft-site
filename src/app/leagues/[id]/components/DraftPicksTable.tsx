'use client'

import { useState, useEffect } from 'react'
import { DraftArgs, DraftPickArgs } from '@/types'
import Table, { TableColumn } from '@/components/Table'
import { formatRoundPick, getPlayerName } from '@/utils/draft'
import { useUserLeagues } from '@/hooks/league'
import MoveButtons from './MoveButtons'
import PlayerAutocomplete from './PlayerAutocomplete'

interface Props {
  draft: Partial<DraftArgs>;
  edit?: boolean;
  draftPicksCallback?: (draftPicks: Partial<DraftPickArgs>[]) => void
}

const DraftPicksTable: React.FC<Props> = ({ draft, edit = false, draftPicksCallback }) => {
  const { isCommissioner } = useUserLeagues(draft.leagueId)
  const [draftPicks, setDraftPicks] = useState<Partial<DraftPickArgs>[]>(draft?.draftPicks || [])
  const teamsCount = (draft?.draftOrderSlots?.length || 1)

  useEffect(() => { setDraftPicks(draft?.draftPicks || []) }, [draft?.draftPicks])
  useEffect(() => { draftPicksCallback && draftPicksCallback(draftPicks) }, [draftPicks])

  const handleSelection = (pickId: string, playerId: string) => console.log({ pickId, playerId })

  const columns: TableColumn<Partial<DraftPickArgs>>[] = [
    {
      name: '',
      hidden: !edit,
      renderedValue: (pick) => <MoveButtons
        indexToMove={draftPicks.findIndex((p) => p.id === pick.id)}
        array={draftPicks}
        setArray={setDraftPicks}
      />
    },
    { name: 'Pick', value: (pick) => formatRoundPick(pick?.overall || 0, teamsCount) },
    { name: 'Team', value: (pick) => pick.team?.name },
    {
      name: 'Player',
      value: ({ player }) => player && getPlayerName(player),
      renderedValue: ({ id, player }) => {
        if (!isCommissioner) return player && <div className="">{getPlayerName(player)}</div>
        if (player) return <div className="input w-full cursor-pointer">{getPlayerName(player)}</div>
        return <PlayerAutocomplete
          leagueId={draft.leagueId as string}
          year={draft.year as number}
          onSelection={(playerId) => handleSelection(id as string, playerId)}
          size="xs"
        />
      }
    }
  ]

  return <Table columns={columns} data={draftPicks} xs maxItemsPerPage={300} />
}

export default DraftPicksTable
