'use client'

import { DraftArgs, DraftPickArgs } from '@/types'
import Table, { TableColumn } from '@/components/Table'

interface Props {
  draft: Partial<DraftArgs>;
}

const DraftPickTable: React.FC<Props> = ({ draft }) => {
  const draftPicks = draft?.draftPicks || []
  const teamsCount = (draft?.draftOrderSlots?.length || 1)

  const formatRoundPick = (pick: Partial<DraftPickArgs>) => {
    const getRound = () => 1 + Math.floor(pick?.overall || 0) / teamsCount
    const getRoundPick = () => ((pick?.overall || 0) % teamsCount) + 1
    const round = String(getRound()).padStart(2, '0')
    const roundPick = String(getRoundPick()).padStart(2, '0')
    return `${round}:${roundPick}`
  }
  const columns: TableColumn<Partial<DraftPickArgs>>[] = [
    { name: 'Overall', value: (pick) => pick.overall },
    { name: 'Pick', value: (pick) => formatRoundPick(pick) },
    { name: 'Team', value: (pick) => pick.team?.name }
  ]

  return (
    <Table columns={columns} data={draftPicks} xs />
  )
}

export default DraftPickTable
