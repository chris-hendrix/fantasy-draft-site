import { useState } from 'react'
import { useLeagueFiles } from '@/hooks/leagueFile'
import Table, { TableColumn } from '@/components/Table'
import { LeagueFileArgs } from '@/types'
import ConfirmModal from '@/components/ConfirmModal'
import LeagueFileUploadModal, { LEAGUE_FILE_CATEGORIES } from './LeagueFileUploadModal'

interface Props {
  leagueId: string;
}

const LeagueFilesTable: React.FC<Props> = ({ leagueId }) => {
  const {
    leagueFiles,
    deleteLeagueFile,
    downloadLeagueFile,
    isQuerying
  } = useLeagueFiles(leagueId)
  const [addModalOpen, setIsAddModalOpen] = useState(false)
  const [fileToUpdate, setFileToUpdate] = useState<LeagueFileArgs | null>(null)
  const [fileToDelete, setFileToDelete] = useState<LeagueFileArgs | null>(null)

  const columns: TableColumn<LeagueFileArgs>[] = [
    {
      header: 'File',
      value: (leagueFile) => leagueFile.file.name,
    },
    {
      header: 'Category',
      value: (leagueFile) => (
        LEAGUE_FILE_CATEGORIES.find((c) => c.enum === leagueFile.category)?.name
      ),
    },
    {
      header: 'Draft',
      value: (leagueFile) => leagueFile.draft?.year || null
    },
    {
      header: '',
      renderedValue: (leagueFile) => (
        <div className="flex gap-1 align-center">
          <button
            className="btn btn-xs btn-square"
            onClick={() => downloadLeagueFile(leagueFile.id)}
          >
            ⬇️
          </button>
          <button
            className="btn btn-xs btn-square"
            onClick={() => setFileToUpdate(leagueFile)}
          >
            ✏️
          </button>
          <button
            className="btn btn-xs btn-square"
            onClick={() => setFileToDelete(leagueFile)}
          >
            🗑️
          </button>
        </div>
      ),
    }
  ]

  const DeleteModal = () => (
    <ConfirmModal
      title="Delete File"
      onConfirm={async () => {
        fileToDelete && deleteLeagueFile(fileToDelete.id)
        setFileToDelete(null)
      }}
      onClose={() => setFileToDelete(null)}
    >
      {`Are you sure you want to delete ${fileToDelete?.file.name}?`}
    </ConfirmModal>
  )

  return (
    <>
      {addModalOpen && (
        <LeagueFileUploadModal
          leagueId={leagueId}
          onClose={() => setIsAddModalOpen(false)}
        />
      )}
      {fileToUpdate && (
        <LeagueFileUploadModal
          leagueId={leagueId}
          leagueFile={fileToUpdate}
          onClose={() => setFileToUpdate(null)}
        />
      )}
      {fileToDelete && <DeleteModal />}
      <div>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => setIsAddModalOpen(true)}
        >
          Add File
        </button>
        <Table
          columns={columns}
          data={leagueFiles || []}
          isLoading={isQuerying}
          enableSort
        />
      </div>
    </>
  )
}

export default LeagueFilesTable
