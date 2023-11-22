'use client'

import { useState } from 'react'
import { League } from '@prisma/client'
import { useDeleteLeague } from '@/hooks/league'
import Modal from '@/components/Modal'

interface Props {
  league: Partial<League>;
}

const CommissionerTab: React.FC<Props> = ({ league }) => {
  const { deleteObject: deleteLeague } = useDeleteLeague()
  const [modalOpen, setModalOpen] = useState(false)
  const handleDelete = async () => {
    const res = await deleteLeague(league.id as string)
    if ('error' in res) return
    window.location.reload()
  }

  return (
    <div className="flex flex-col items-center mt-8">
      <button className="btn btn-error" onClick={() => setModalOpen(true)}>
        Delete league
      </button>
      {modalOpen &&
        <Modal title="Are you sure?" size="xs" setOpen={setModalOpen}>
          <div>This cannot be undone.</div>
          <div className="flex justify-end mt-2">
            <button onClick={handleDelete} className="btn btn-error w-32 mr-2">Yes</button>
            <button onClick={() => setModalOpen(false)} className="btn w-32">Cancel</button>
          </div>
        </Modal>}
    </div>
  )
}

export default CommissionerTab
