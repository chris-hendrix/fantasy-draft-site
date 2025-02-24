'use client'

import { useState } from 'react'
import { useDeleteLeague } from '@/hooks/league'
import { useAlert } from '@/hooks/app'
import Modal from '@/components/Modal'
import DraftImportModal from './DraftImportModal'
import LeagueFilesTable from './LeagueFilesTable'

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

  const handleExportLeagueData = async () => {
    const res = await fetch('/api/export', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ leagueId }),
    })

    if (res.ok) {
      showAlert({ successMessage: 'Download started' })
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      const timestamp = new Date().toISOString()
      a.href = url
      a.download = `league-data_${timestamp}.zip`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } else {
      showAlert({ errorMessage: 'Unable to download league data' })
    }
  }

  return (
    <>
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
      <div className="flex flex-col gap-4">
        <div className="flex mt-8 gap-2">
          <button className="btn btn-primary btn-sm" onClick={() => handleExportLeagueData()}>
            Export league data
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setImportModalOpen(true)}>
            Import drafts
          </button>
          <button className="btn btn-error btn-sm" onClick={() => setDeleteModalOpen(true)}>
            Delete league
          </button>
        </div>
        <div className="max-w-lg">
          <h2 className="text-lg font-bold my-6 mx-2">📁 League Files</h2>
          <LeagueFilesTable leagueId={leagueId} />
        </div>
      </div>
    </>

  )
}

export default CommissionerTab
