'use client'

import { useState, useEffect } from 'react'
import { DraftArgs, DraftPickArgs } from '@/types'
import Table, { TableColumn } from '@/components/Table'
import MoveButtons from './MoveButtons'

interface Props {
  draft: Partial<DraftArgs>;
  edit?: boolean
}

const DraftPickTable: React.FC<Props> = ({ draft, edit = false }) => {
  const [draftPicks, setDraftPicks] = useState<Partial<DraftPickArgs>[]>(draft?.draftPicks || [])
  const teamsCount = (draft?.draftOrderSlots?.length || 1)

  useEffect(() => { setDraftPicks(draft?.draftPicks || []) }, [draft?.draftPicks])

  const formatRoundPick = (pick: Partial<DraftPickArgs>) => {
    const getRound = () => 1 + Math.floor((pick?.overall || 0) / teamsCount)
    const getRoundPick = () => 1 + ((pick?.overall || 0) % teamsCount)
    const round = String(getRound()).padStart(2, '0')
    const roundPick = String(getRoundPick()).padStart(2, '0')
    return `${round}:${roundPick}`
  }
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
    { name: 'Overall', value: (pick) => pick.overall },
    { name: 'Pick', value: (pick) => formatRoundPick(pick) },
    { name: 'Team', value: (pick) => pick.team?.name }
  ]

  return (
    <Table columns={columns} data={draftPicks} xs />
  )
}

export default DraftPickTable
