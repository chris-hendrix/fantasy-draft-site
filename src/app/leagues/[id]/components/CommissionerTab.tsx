'use client'

import { useState } from 'react'
import { useDeleteLeague } from '@/hooks/league'
import { useAlert } from '@/hooks/app'
import Modal from '@/components/Modal'
import DraftImportModal from './DraftImportModal'

interface Props {
  leagueId: string;
}

const CommissionerTab: React.FC<Props> = ({ leagueId }) => {
  const { deleteObject: deleteLeague } = useDeleteLeague()
  const { showAlert } = useAlert()
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [importModalOpen, setImportModalOpen] = useState(false)

  const handleDelete = async () => {
    const res = await deleteLeague(leagueId)
    if ('error' in res) return
    window.location.reload()
  }

  const handleExportLeagueData = async (exportName: string) => {
    const res = await fetch('/api/export', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ leagueId, exportName }),
    })

    if (res.ok) {
      showAlert({ successMessage: 'Download started' })
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${exportName}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } else {
      showAlert({ errorMessage: 'Unable to download league data' })
    }
  }

  return (
    <div className="flex flex-col items-center mt-8 gap-4">
      <button className="btn btn-primary" onClick={() => handleExportLeagueData('draft-pick-data')}>
        Export league data
      </button>
      <button className="btn btn-primary" onClick={() => handleExportLeagueData('historical-data')}>
        Export historical data
      </button>
      <button className="btn btn-primary" onClick={() => handleExportLeagueData('historical-avg-data')}>
        Export historical (averages)
      </button>
      <button className="btn btn-primary" onClick={() => setImportModalOpen(true)}>
        Import drafts
      </button>
      <button className="btn btn-error" onClick={() => setDeleteModalOpen(true)}>
        Delete league
      </button>
      {deleteModalOpen && (
        <Modal title="Are you sure?" size="xs" onClose={() => setDeleteModalOpen(false)}>
          <div>This cannot be undone.</div>
          <div className="flex justify-end mt-2">
            <button onClick={handleDelete} className="btn btn-error w-32 mr-2">Yes</button>
            <button onClick={() => setDeleteModalOpen(false)} className="btn w-32">Cancel</button>
          </div>
        </Modal>
      )}
      {importModalOpen && (
        <DraftImportModal leagueId={leagueId} onClose={() => setImportModalOpen(false)} />
      )}
    </div>
  )
}

export default CommissionerTab
