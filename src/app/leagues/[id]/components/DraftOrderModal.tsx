import { useState, useEffect } from 'react'
import { DraftTeamArgs } from '@/types'
import { useDraft } from '@/hooks/draft'
import { useInvalidateDraftPicks } from '@/hooks/draftPick'
import { useInvalidatePlayers } from '@/hooks/player'
import Table, { TableColumn } from '@/components/Table'
import Modal from '@/components/Modal'
import ConfirmModal from '@/components/ConfirmModal'
import MoveButtons from './MoveButtons'

interface Props {
  draftId: string;
  onClose: () => void;
}

const DraftOrderModal: React.FC<Props> = ({ draftId, onClose }) => {
  const { draft: { draftTeams, rounds }, updateDraft } = useDraft(draftId)
  const { invalidateObjects: invalidateDraftPicks } = useInvalidateDraftPicks()
  const { invalidateObjects: invalidatePlayers } = useInvalidatePlayers()
  const [editDraftTeams, setEditDraftTeams] = useState<DraftTeamArgs[]>([])
  const [confirmSave, setConfirmSave] = useState(false)
  const [confirmGenerate, setConfirmGenerate] = useState(false)
  const [editedRounds, setEditedRounds] = useState(rounds)

  const draftTeamData = editDraftTeams?.map((slot, i) => ({
    teamId: String(slot.teamId), order: i
  }))

  useEffect(() => { setEditDraftTeams(draftTeams) }, [draftTeams])

  const handleSave = async () => {
    const res = await updateDraft({
      id: draftId,
      draftTeams: {
        deleteMany: {},
        createMany: { data: draftTeamData }
      },
      draftPicks: {
        deleteMany: {}
      }
    })
    if ('error' in res) return
    invalidateDraftPicks()
    invalidatePlayers()
    setConfirmSave(false)
  }

  const handleGenerate = async () => {
    const pickData = Array.from(
      { length: editedRounds },
      () => draftTeamData.map((s) => (s.teamId))
    ).flat().map((teamId, i) => ({ teamId, overall: i + 1 }))
    const res = await updateDraft({
      id: draftId,
      rounds: editedRounds,
      draftTeams: {
        deleteMany: {},
        createMany: { data: draftTeamData }
      },
      draftPicks: {
        deleteMany: {},
        createMany: { data: pickData }
      }
    })
    if ('error' in res) return
    invalidateDraftPicks()
    invalidatePlayers()
    onClose()
  }

  const columns: TableColumn<DraftTeamArgs>[] = [
    {
      header: 'Team name',
      value: (slot) => slot?.team?.name,
      renderedValue: (slot) => (
        <>
          <MoveButtons
            indexToMove={editDraftTeams.findIndex((s) => s.id === slot.id)}
            array={editDraftTeams}
            setArray={setEditDraftTeams}
          />
          {slot?.team?.name}
        </>)
    },
    {
      header: 'Order',
      value: (slot) => 1 + editDraftTeams.findIndex((s) => s.id === slot.id),
    },
  ]

  if (confirmSave || confirmGenerate) {
    return <ConfirmModal
      onConfirm={confirmSave ? handleSave : handleGenerate}
      onClose={() => (confirmSave ? setConfirmSave : setConfirmGenerate)(false)}>
      This will delete existing draft data. Continue?
    </ConfirmModal>
  }

  const RoundInput = () => (
    <div className="flex items-center">
      <label className="mr-2">Rounds:</label>
      <input
        type="number"
        value={editedRounds}
        onChange={(e) => setEditedRounds(Number(e.target.value))}
        className="input input-bordered w-16"
      />
    </div>
  )

  return (
    <Modal title="Edit draft order" onClose={onClose}>
      <RoundInput />
      <Table columns={columns} data={editDraftTeams || []} />
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
