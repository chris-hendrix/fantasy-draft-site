'use client'

import { useState, useEffect } from 'react'
import { useDraft } from '@/hooks/draft'
import { DraftPickArgs } from '@/types'
import Modal from '@/components/Modal'
import ConfirmModal from '@/components/ConfirmModal'
import DateTimePicker from '@/components/DateTimePicker'
import { useInvalidateDraftPicks } from '@/hooks/draftPick'
import { useInvalidatePlayers } from '@/hooks/player'
import DraftOrderModal from './DraftOrderModal'
import DraftPicksTable from './DraftPicksTable'
import PlayersTable from './PlayersTable'

interface Props {
  draftId: string;
}

const DraftPage: React.FC<Props> = ({ draftId }) => {
  const {
    draft: { disableUserDraft },
    isCommissioner,
    canEditDraft,
    updateDraft,
    deleteDraft
  } = useDraft(draftId)
  const [draftPicks, setDraftPicks] = useState<DraftPickArgs[]>([])
  const [editOrder, setEditOrder] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [draftOrderModalOpen, setDraftOrderModalOpen] = useState(false)
  const [confirmKeepersModalOpen, setConfirmKeepersModalOpen] = useState(false)
  const [draftTimeModalOpen, setDraftTimeModalOpen] = useState(false)
  const [editDraftPicks, setEditDraftPicks] = useState<DraftPickArgs[]>([])
  const [editDraftTime, setEditDraftTime] = useState<Date>(() => {
    const now = new Date()
    now.setMinutes(now.getMinutes() + 30)
    now.setMinutes(0)
    return now
  })
  const { invalidateObjects: invalidateDraftPicks } = useInvalidateDraftPicks()
  const { invalidateObjects: invalidatePlayers } = useInvalidatePlayers()

  const draftingPick = canEditDraft && draftPicks?.filter((p) => p.playerId === null)?.[0]

  useEffect(() => { setEditDraftPicks(draftPicks) }, [draftPicks])

  const handleStart = async () => {
    await updateDraft({
      id: draftId,
      draftLockDate: null
    })
  }

  const handleLock = async () => {
    await updateDraft({
      id: draftId,
      draftLockDate: new Date()
    })
  }

  const handleDelete = async () => {
    const res = await deleteDraft(draftId)
    if ('error' in res) return
    window.location.reload()
  }

  const handleToggleUserDraft = async () => {
    await updateDraft({
      id: draftId,
      disableUserDraft: !disableUserDraft
    })
  }

  const handleSave = async () => {
    const draftPickData = editDraftPicks.map(({ teamId, playerId }, i) => ({
      teamId: teamId as string,
      playerId,
      overall: i + 1
    }))
    const res = await updateDraft({
      id: draftId,
      draftPicks: {
        deleteMany: {},
        createMany: { data: draftPickData }
      }
    })
    if ('error' in res) return
    invalidateDraftPicks()
    setEditOrder(false)
  }

  const handleSaveDraftTime = async () => {
    const res = await updateDraft({ id: draftId, draftTime: editDraftTime })
    if ('error' in res) return
    setDraftTimeModalOpen(false)
  }

  const handleConfirmKeepers = async () => {
    const res = await updateDraft({ id: draftId, setKeepers: true })
    if ('error' in res) return
    invalidateDraftPicks()
    invalidatePlayers()
    setConfirmKeepersModalOpen(false)
  }

  return (
    <div className="flex flex-col items-start mt-2 w-full">
      {isCommissioner &&
        <div className="flex gap-2 my-2 w-full">
          {!editOrder && <>
            {!canEditDraft && <button
              className="btn btn-sm btn-primary w-32"
              onClick={handleStart}
            >
              🚀 Start
            </button>}
            {canEditDraft && <button
              className="btn btn-sm btn-primary w-32"
              onClick={handleLock}
            >
              🔒 Lock
            </button>}
            <button
              className="btn btn-sm w-32"
              onClick={() => setDraftOrderModalOpen(true)}
            >
              🔄 Generate
            </button>
            <button
              className="btn btn-sm w-32"
              onClick={() => setConfirmKeepersModalOpen(true)}
            >
              📥 Keepers
            </button>
            <button
              className="btn btn-sm w-32"
              onClick={() => setDraftTimeModalOpen(true)}
            >
              🕜 Draft Time
            </button>
            <button
              className="btn btn-sm w-32"
              onClick={() => setEditOrder(true)}
            >
              📝 Draft Order
            </button>
            <button className="btn btn-sm btn-error w-32" onClick={() => setModalOpen(true)}>
              🗑️ Delete
            </button>
            <div className="form-control ml-auto">
              <label className="label cursor-pointer">
                <span className="label-text mr-2">Enable user draft</span>
                <input
                  type="checkbox"
                  className="toggle toggle-primary"
                  checked={!disableUserDraft}
                  onChange={handleToggleUserDraft}
                />
              </label>
            </div>
          </>}
          {editOrder && <>
            <button
              className="btn btn-sm w-32"
              onClick={handleSave}
            >
              💾 Save
            </button>
            <button
              className="btn btn-sm w-32"
              onClick={() => setEditOrder(false)}
            >
              ❌ Cancel
            </button>
          </>}

        </div>
      }
      <div className="flex flex-row h-full w-full">
        <div className="w-5/12 h-full max-h-screen min-h-screen overflow-y-auto">
          <h2 className="text-lg font-bold my-6 mx-2">📝 Draft</h2>
          <DraftPicksTable
            draftId={draftId}
            editOrder={editOrder}
            onOrderChange={setEditDraftPicks}
            onDraftPicksChanged={setDraftPicks}
          />
        </div>
        <div className="w-7/12 h-full max-h-screen min-h-screen overflow-y-auto">
          <h2 className="text-lg font-bold my-6 mx-2">🧢 Players</h2>
          <PlayersTable draftId={draftId} draftingPick={draftingPick || undefined} hideTeamColumn />
        </div>
      </div>
      {!draftPicks?.length &&
        <div className="text-sm w-full display-flex text-center p-4">
          <a onClick={() => setDraftOrderModalOpen(true)} className="link">Generate</a>
          &nbsp;the draft picks for this draft
        </div>}
      {modalOpen && (
        <Modal title="Are you sure?" size="xs" onClose={() => setModalOpen(false)}>
          <div>This cannot be undone.</div>
          <div className="flex justify-end mt-2">
            <button onClick={handleDelete} className="btn btn-error w-32 mr-2">Yes</button>
            <button onClick={() => setModalOpen(false)} className="btn w-32">Cancel</button>
          </div>
        </Modal>
      )}
      {draftTimeModalOpen && (
        <Modal title="Select Draft Time" size="xs" onClose={() => setDraftTimeModalOpen(false)}>
          <div className="flex flex-col w-full items-center">
            <DateTimePicker initialDate={editDraftTime || new Date()} onChange={setEditDraftTime} />
          </div>
          <div className="flex justify-end mt-4">
            <button onClick={handleSaveDraftTime} className="btn btn-primary w-32 mr-2">Save</button>
            <button onClick={() => setDraftTimeModalOpen(false)} className="btn w-32">Cancel</button>
          </div>
        </Modal>
      )}
      {draftOrderModalOpen && <DraftOrderModal
        draftId={draftId}
        onClose={() => setDraftOrderModalOpen(false)}
      />}
      {confirmKeepersModalOpen && <ConfirmModal
        onConfirm={handleConfirmKeepers}
        onClose={() => setConfirmKeepersModalOpen(false)}
      >
        This will clear all draft data. Continue?
      </ConfirmModal>}
    </div>
  )
}

export default DraftPage
