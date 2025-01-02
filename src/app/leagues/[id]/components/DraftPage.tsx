'use client'

import { useState, useEffect } from 'react'
import { useDraft } from '@/hooks/draft'
import { DraftPickArgs } from '@/types'
import Modal from '@/components/Modal'
import ConfirmModal from '@/components/ConfirmModal'
import DateTimePicker from '@/components/DateTimePicker'
import { useInvalidateDraftPicks } from '@/hooks/draftPick'
import { useInvalidatePlayers } from '@/hooks/player'
import { getNearestFutureHalfHour } from '@/utils/date'
import DraftOrderModal from './DraftOrderModal'
import DraftPicksTable from './DraftPicksTable'
import PlayersTable from './PlayersTable'

interface Props {
  draftId: string;
}

const DraftPage: React.FC<Props> = ({ draftId }) => {
  const {
    draft: { disableUserDraft, draftTime },
    isCommissioner,
    isDraftOpen,
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
  const [editDraftTime, setEditDraftTime] = useState<Date | null>(null)
  const { invalidateObjects: invalidateDraftPicks } = useInvalidateDraftPicks()
  const { invalidateObjects: invalidatePlayers } = useInvalidatePlayers()

  useEffect(() => { setEditDraftPicks(draftPicks) }, [draftPicks])
  useEffect(() => { draftTime && setEditDraftTime(new Date(draftTime)) }, [draftTime])

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

  const handleToggleDraftTime = async () => {
    if (!editDraftTime) {
      setEditDraftTime(getNearestFutureHalfHour())
    } else {
      setEditDraftTime(null)
    }
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
            {!isDraftOpen && <button
              className="btn btn-sm btn-primary w-32"
              onClick={handleStart}
            >
              🚀 Start
            </button>}
            {isDraftOpen && <button
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
          <div className="flex justify-between my-6 mx-2 items-center">
            <h2 className="text-lg font-bold ">📝 Draft</h2>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => invalidateDraftPicks()}
            >
              🔃
            </button>
          </div>
          <DraftPicksTable
            draftId={draftId}
            editOrder={editOrder}
            onOrderChange={setEditDraftPicks}
            onDraftPicksChanged={setDraftPicks}
          />
        </div>
        <div className="w-7/12 h-full max-h-screen min-h-screen overflow-y-auto">
          <div className="flex justify-between my-6 mx-2 items-center">
            <h2 className="text-lg font-bold ">🧢 Players</h2>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => invalidatePlayers()}
            >
              🔃
            </button>
          </div>
          <PlayersTable draftId={draftId} hideTeamColumn={!isDraftOpen} />
        </div>
      </div>
      {
        !draftPicks?.length &&
        <div className="text-sm w-full display-flex text-center p-4">
          <a onClick={() => setDraftOrderModalOpen(true)} className="link">Generate</a>
          &nbsp;the draft picks for this draft
        </div>
      }
      {
        modalOpen && (
          <Modal title="Are you sure?" size="xs" onClose={() => setModalOpen(false)}>
            <div>This cannot be undone.</div>
            <div className="flex justify-end mt-2">
              <button onClick={handleDelete} className="btn btn-error w-32 mr-2">Yes</button>
              <button onClick={() => setModalOpen(false)} className="btn w-32">Cancel</button>
            </div>
          </Modal>
        )
      }
      {
        draftTimeModalOpen && (
          <Modal title="Select Draft Time" size="xs" onClose={() => setDraftTimeModalOpen(false)}>
            <div className="flex justify-between items-center">
              <DateTimePicker
                initialDate={editDraftTime || getNearestFutureHalfHour()}
                onChange={setEditDraftTime}
                disabled={!editDraftTime}
              />
              <div className="form-control">
                <label className="label cursor-pointer">
                  <span className="label-text mr-2">Enable draft time</span>
                  <input
                    type="checkbox"
                    className="toggle toggle-primary"
                    checked={Boolean(editDraftTime)}
                    onChange={handleToggleDraftTime}
                  />
                </label>
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <button onClick={handleSaveDraftTime} className="btn btn-primary w-32 mr-2">Save</button>
              <button onClick={() => setDraftTimeModalOpen(false)} className="btn w-32">Cancel</button>
            </div>
          </Modal>
        )
      }
      {
        draftOrderModalOpen && <DraftOrderModal
          draftId={draftId}
          onClose={() => setDraftOrderModalOpen(false)}
        />
      }
      {
        confirmKeepersModalOpen && <ConfirmModal
          onConfirm={handleConfirmKeepers}
          onClose={() => setConfirmKeepersModalOpen(false)}
        >
          This will clear all draft data. Continue?
        </ConfirmModal>
      }
    </div >
  )
}

export default DraftPage
