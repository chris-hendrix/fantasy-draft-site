import { useState } from 'react'
import { DraftArgs, DraftOrderSlotArgs } from '@/types'
import { useUpdateDraft } from '@/hooks/draft'
import Table, { TableColumn } from '@/components/Table'
import Modal from '@/components/Modal'
import ConfirmModal from '@/components/ConfirmModal'

interface Props {
  draft: Partial<DraftArgs>;
  onClose: () => void;
}

const DraftOrderModal: React.FC<Props> = ({ draft, onClose }) => {
  const initialSlots = draft.draftOrderSlots || []
  const [slots, setSlots] = useState<Partial<DraftOrderSlotArgs>[]>(initialSlots)
  const { updateObject: updateDraft } = useUpdateDraft()
  const [confirmSave, setConfirmSave] = useState(false)
  const [confirmGenerate, setConfirmGenerate] = useState(false)

  const slotData = slots?.map((slot, i) => ({ teamId: String(slot.teamId), order: i }))

  const handleMove = (slotId: string, direction: 'up' | 'down') => {
    const currentIndex = slots.findIndex((slot) => slot.id === slotId)
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1

    if (currentIndex >= 0 && newIndex >= 0 && newIndex < slots.length) {
      const updatedSlots = [...slots];
      [updatedSlots[currentIndex], updatedSlots[newIndex]] = [
        updatedSlots[newIndex], updatedSlots[currentIndex]
      ]
      setSlots(updatedSlots)
    }
  }

  const handleSave = async () => {
    const res = await updateDraft({
      id: draft.id,
      draftOrderSlots: {
        deleteMany: {},
        createMany: { data: slotData }
      },
      draftPicks: {
        deleteMany: {}
      }
    })
    if ('error' in res) return
    onClose()
  }

  const handleGenerate = async () => {
    const rounds = draft?.rounds || 0
    const pickData = Array.from(
      { length: rounds },
      () => slotData.map((s) => (s.teamId))
    ).flat().map((teamId, i) => ({ teamId, overall: i + 1 }))
    const res = await updateDraft({
      id: draft.id,
      draftOrderSlots: {
        deleteMany: {},
        createMany: { data: slotData }
      },
      draftPicks: {
        deleteMany: {},
        createMany: { data: pickData }
      }
    })
    if ('error' in res) return
    onClose()
  }

  const columns: TableColumn<Partial<DraftOrderSlotArgs>>[] = [
    {
      name: 'Team name',
      value: (slot) => slot?.team?.name,
      renderedValue: (slot) => (
        <>
          <button
            onClick={() => handleMove(String(slot.id), 'up')}
            className="btn btn-xs btn-ghost btn-square">
            ⬆️
          </button>
          <button
            onClick={() => handleMove(String(slot.id), 'down')}
            className="btn btn-xs btn-ghost btn-square mr-1">
            ⬇️
          </button>
          {slot?.team?.name}
        </>)
    },
    {
      name: 'Order',
      value: (slot) => 1 + slots.findIndex((s) => s.id === slot.id),
    },
  ]

  if (confirmSave || confirmGenerate) {
    return <ConfirmModal
      onConfirm={confirmSave ? handleSave : handleGenerate}
      onClose={() => (confirmSave ? setConfirmSave : setConfirmGenerate)(false)}>
      This will delete existing draft data. Continue?
    </ConfirmModal>
  }

  return (
    <Modal title="Edit draft order" onClose={onClose}>
      <Table columns={columns} data={slots || []} />
      <div className="flex justify-end mt-2">
        <button onClick={() => setConfirmGenerate(true)} className="btn btn-secondary w-32 mr-2">
          Generate draft
        </button>
        <button onClick={() => setConfirmSave(true)} className="btn btn-primary w-32 mr-2">
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
