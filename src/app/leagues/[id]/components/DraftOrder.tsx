'use client'

import { useState } from 'react'
import { DraftWithRelationships, TeamWithRelationships } from '@/types'
import Table, { TableColumn } from '@/components/Table'

interface Props {
  draft: Partial<DraftWithRelationships>;
}

const DraftOrder: React.FC<Props> = ({ draft }) => {
  const [draftOrderSlots, setDraftOrderSlots] = useState<TeamWithRelationships[]>(
    [...(draft?.league?.teams || [])]
  )

  console.log(setDraftOrderSlots)

  const columns: TableColumn<TeamWithRelationships>[] = [
    { name: 'Team name', value: (slot) => slot.name }
  ]

  return (
    <div className="flex flex-col items-center">
      <Table columns={columns} data={draftOrderSlots} />
    </div>
  )
}

export default DraftOrder
