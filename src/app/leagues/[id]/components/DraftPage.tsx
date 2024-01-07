'use client'

import { useState } from 'react'
import { useDeleteDraft, useGetDraft, useUpdateDraft } from '@/hooks/draft'
import { useUserLeagues } from '@/hooks/league'
import { DraftPickArgs } from '@/types'
import Modal from '@/components/Modal'
import ConfirmModal from '@/components/ConfirmModal'
import { useInvalidateDraftPicks } from '@/hooks/draftPick'
import { useInvalidatePlayers } from '@/hooks/player'
import DraftOrderModal from './DraftOrderModal'
import DraftPicksTable from './DraftPicksTable'
import PlayersTable from './PlayersTable'

interface Props {
  draftId: string;
}

const DraftPage: React.FC<Props> = ({ draftId }) => {
  const { data: draft, isLoading } = useGetDraft({
    id: draftId,
    queryParams: {
      include: {
        draftTeams: { include: { team: true }, orderBy: { order: 'asc' } },
        draftPicks: { include: { team: true }, orderBy: { overall: 'asc' } }
      }
    }
  })
  const { deleteObject: deleteLeague } = useDeleteDraft()
  const { updateObject: updateDraft } = useUpdateDraft()
  const [edit, setEdit] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [draftOrderModalOpen, setDraftOrderModalOpen] = useState(false)
  const [confirmKeepersModalOpen, setConfirmKeepersModalOpen] = useState(false)
  const { isCommissioner } = useUserLeagues(draft?.leagueId)
  const [draftPicks, setDraftPicks] = useState<Partial<DraftPickArgs>[]>(draft?.draftPicks || [])
  const { invalidateObjects: invalidateDraftPicks } = useInvalidateDraftPicks()
  const { invalidateObjects: invalidatePlayers } = useInvalidatePlayers()

  const handleDelete = async () => {
    const res = await deleteLeague(draftId as string)
    if ('error' in res) return
    window.location.reload()
  }

  const handleSave = async () => {
    const draftPickData = draftPicks.map(({ teamId, playerId }, i) => ({
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
    setEdit(false)
  }

  const handleConfirmKeepers = async () => {
    const res = await updateDraft({ id: draftId, setKeepers: true })
    if ('error' in res) return
    invalidateDraftPicks()
    invalidatePlayers()
    setConfirmKeepersModalOpen(false)
  }

  return (
    <div className="flex flex-col items-start mt-8">
      {isCommissioner &&
        <div className="flex mb-2">
          {!edit && <>
            <button
              className="btn btn-sm mr-2 w-32"
              onClick={() => setEdit(true)}
            >
              📝 Edit
            </button>
            <button
              className="btn btn-sm mr-2 w-32"
              onClick={() => setDraftOrderModalOpen(true)}
            >
              🔄 Generate
            </button>
            <button
              className="btn btn-sm mr-2 w-32"
              onClick={() => setConfirmKeepersModalOpen(true)}
            >
              📥 Keepers
            </button>
            <button className="btn btn-sm btn-error w-32" onClick={() => setModalOpen(true)}>
              🗑️ Delete
            </button>
          </>}
          {edit && <>
            <button
              className="btn btn-sm mr-2 w-32"
              onClick={handleSave}
            >
              💾 Save
            </button>
            <button
              className="btn btn-sm mr-2 w-32"
              onClick={() => setEdit(false)}
            >
              ❌ Cancel
            </button>
          </>}

        </div>
      }
      {draft && (
        <div className="flex flex-row h-full w-full">
          <div className="w-5/12 h-full max-h-screen min-h-screen overflow-y-auto">
            <DraftPicksTable draft={draft} edit={edit} onOrderChange={setDraftPicks} />
          </div>
          <div className="w-7/12 h-full max-h-screen min-h-screen overflow-y-auto">
            <PlayersTable draftId={draft.id} />
          </div>
        </div>
      )}
      {!isLoading && !draft?.draftPicks?.length &&
        <div className="text-sm w-full display-flex text-center p-4">
          <a onClick={() => setDraftOrderModalOpen(true)} className="link">Generate</a>
          &nbsp;the draft picks for this draft
        </div>}
      {modalOpen &&
        <Modal title="Are you sure?" size="xs" onClose={() => setModalOpen(false)}>
          <div>This cannot be undone.</div>
          <div className="flex justify-end mt-2">
            <button onClick={handleDelete} className="btn btn-error w-32 mr-2">Yes</button>
            <button onClick={() => setModalOpen(false)} className="btn w-32">Cancel</button>
          </div>
        </Modal>}
      {draftOrderModalOpen && <DraftOrderModal
        draft={draft}
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
