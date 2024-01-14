import { useState } from 'react'
import { DraftArgs, DraftTeamArgs } from '@/types'
import { useUpdateDraft } from '@/hooks/draft'
import Table, { TableColumn } from '@/components/Table'
import Modal from '@/components/Modal'
import ConfirmModal from '@/components/ConfirmModal'
import MoveButtons from './MoveButtons'

interface Props {
  draft: Partial<DraftArgs>;
  onClose: () => void;
}

const DraftOrderModal: React.FC<Props> = ({ draft, onClose }) => {
  const initialSlots = draft.draftTeams || []
  const [slots, setSlots] = useState<DraftTeamArgs[]>(initialSlots)
  const { updateObject: updateDraft } = useUpdateDraft()
  const [confirmSave, setConfirmSave] = useState(false)
  const [confirmGenerate, setConfirmGenerate] = useState(false)

  const slotData = slots?.map((slot, i) => ({ teamId: String(slot.teamId), order: i }))

  const handleSave = async () => {
    const res = await updateDraft({
      id: draft.id,
      draftTeams: {
        deleteMany: {},
        createMany: { data: slotData }
      },
      draftPicks: {
        deleteMany: {}
      }
    })
    if ('error' in res) return
    setConfirmSave(false)
  }

  const handleGenerate = async () => {
    const rounds = draft?.rounds || 0
    const pickData = Array.from(
      { length: rounds },
      () => slotData.map((s) => (s.teamId))
    ).flat().map((teamId, i) => ({ teamId, overall: i + 1 }))
    const res = await updateDraft({
      id: draft.id,
      draftTeams: {
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

  const columns: TableColumn<DraftTeamArgs>[] = [
    {
      header: 'Team name',
      value: (slot) => slot?.team?.name,
      renderedValue: (slot) => (
        <>
          <MoveButtons
            indexToMove={slots.findIndex((s) => s.id === slot.id)}
            array={slots}
            setArray={setSlots}
          />
          {slot?.team?.name}
        </>)
    },
    {
      header: 'Order',
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
