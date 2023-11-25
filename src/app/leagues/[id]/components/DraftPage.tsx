'use client'

import { useState } from 'react'
import { Draft } from '@prisma/client'
import { useDeleteDraft } from '@/hooks/draft'
import { useUserLeagues } from '@/hooks/league'
import Modal from '@/components/Modal'
import DraftOrder from './DraftOrder'

interface Props {
  draft: Partial<Draft>;
}

const DraftPage: React.FC<Props> = ({ draft }) => {
  const { deleteObject: deleteLeague } = useDeleteDraft()
  const [modalOpen, setModalOpen] = useState(false)
  const { isCommissioner } = useUserLeagues(draft.leagueId)
  const handleDelete = async () => {
    const res = await deleteLeague(draft.id as string)
    if ('error' in res) return
    window.location.reload()
  }

  return (
    <div className="flex flex-col items-center mt-8">
      <DraftOrder draft={draft} />
      {isCommissioner && <button className="btn btn-error" onClick={() => setModalOpen(true)}>
        Delete draft
      </button>}
      {modalOpen &&
        <Modal title="Are you sure?" size="xs" onClose={() => setModalOpen(false)}>
          <div>This cannot be undone.</div>
          <div className="flex justify-end mt-2">
            <button onClick={handleDelete} className="btn btn-error w-32 mr-2">Yes</button>
            <button onClick={() => setModalOpen(false)} className="btn w-32">Cancel</button>
          </div>
        </Modal>}
    </div>
  )
}

export default DraftPage
