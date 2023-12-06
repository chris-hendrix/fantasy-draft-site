'use client'

import { useState, useEffect } from 'react'
import { DraftArgs, DraftPickArgs } from '@/types'
import Table, { TableColumn } from '@/components/Table'
import { formatRoundPick } from '@/utils/draft'
import MoveButtons from './MoveButtons'

interface Props {
  draft: Partial<DraftArgs>;
  edit?: boolean;
  draftPicksCallback?: (draftPicks: Partial<DraftPickArgs>[]) => void
}

const DraftPickTable: React.FC<Props> = ({ draft, edit = false, draftPicksCallback }) => {
  const [draftPicks, setDraftPicks] = useState<Partial<DraftPickArgs>[]>(draft?.draftPicks || [])
  const teamsCount = (draft?.draftOrderSlots?.length || 1)

  useEffect(() => { setDraftPicks(draft?.draftPicks || []) }, [draft?.draftPicks])
  useEffect(() => { draftPicksCallback && draftPicksCallback(draftPicks) }, [draftPicks])

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
    { name: 'Team', value: (pick) => pick.team?.name }
  ]

  return <Table columns={columns} data={draftPicks} xs maxItemsPerPage={300} />
}

export default DraftPickTable
