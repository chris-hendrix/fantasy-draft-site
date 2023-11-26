'use client'

import { useState } from 'react'
import { DraftArgs, DraftOrderSlotArgs } from '@/types'
import Table, { TableColumn } from '@/components/Table'
import Modal from '@/components/Modal'

interface Props {
  draft: Partial<DraftArgs>;
  onClose: () => void
}

const DraftOrderModal: React.FC<Props> = ({ draft, onClose }) => {
  const initialSlots = draft.draftOrderSlots
  const [draftOrderSlots, setDraftOrderSlots] = useState<Partial<DraftOrderSlotArgs>[]>(
    initialSlots || []
  )

  const handleChange = (slotId: string, value: number) => {
    const updatedSlots = draftOrderSlots.map((slot) => (slot.id === slotId
      ? { ...slot, order: value }
      : slot
    ))
    setDraftOrderSlots(updatedSlots)
  }

  const handleSave = () => {
    console.log(draftOrderSlots) // TODO
  }

  const columns: TableColumn<Partial<DraftOrderSlotArgs>>[] = [
    { name: 'Team name', value: (slot) => slot?.team?.name },
    {
      name: 'Order',
      value: (slot) => slot?.order,
      renderedValue: ((slot) => (
        <input
          type="number"
          className="input input-bordered"
          value={slot.order}
          onChange={(e) => handleChange(String(slot.id), Number(e.target.value))}
        />))
    }
  ]

  return (
    <Modal title="Edit draft order" onClose={onClose}>
      <Table columns={columns} data={draftOrderSlots || []} />
      <div className="flex justify-end mt-2">
        <button onClick={handleSave} className="btn btn-primary w-32 mr-2">
          Save
        </button>
        <button onClick={onClose} className="btn w-32">
          Cancel
        </button>
      </div>
    </Modal>
  )
}

export default DraftOrderModal
