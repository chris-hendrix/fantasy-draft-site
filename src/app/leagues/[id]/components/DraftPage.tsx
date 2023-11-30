'use client'

import { useState } from 'react'
import { useDeleteDraft, useGetDraft } from '@/hooks/draft'
import { useUserLeagues } from '@/hooks/league'
import Modal from '@/components/Modal'
import DraftOrderModal from './DraftOrderModal'
import DraftPickTable from './DraftPickTable'

interface Props {
  draftId: string;
}

const DraftPage: React.FC<Props> = ({ draftId }) => {
  const { data: draft, isLoading } = useGetDraft({
    id: draftId,
    queryParams: {
      include: {
        draftOrderSlots: { include: { team: true }, orderBy: { order: 'asc' } },
        draftPicks: { include: { team: true }, orderBy: { overall: 'asc' } }
      }
    }
  })
  const { deleteObject: deleteLeague } = useDeleteDraft()
  const [edit, setEdit] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [draftOrderModalOpen, setDraftOrderModalOpen] = useState(false)
  const { isCommissioner } = useUserLeagues(draft?.leagueId)

  const handleDelete = async () => {
    const res = await deleteLeague(draftId as string)
    if ('error' in res) return
    window.location.reload()
  }

  return (
    <div className="flex flex-col items-start mt-8">
      {isCommissioner &&
        <div className="flex mb-2">
          <button
            className="btn btn-sm mr-2 w-32"
            onClick={() => setEdit(!edit)}
          >
            📝 Edit
          </button>
          <button
            className="btn btn-sm mr-2 w-32"
            onClick={() => setDraftOrderModalOpen(true)}
          >
            🔄 Generate
          </button>
          <button className="btn btn-sm btn-error w-32" onClick={() => setModalOpen(true)}>
            🗑️ Delete
          </button>
        </div>
      }
      <DraftPickTable draft={draft} edit={edit} />
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
    </div>
  )
}

export default DraftPage
