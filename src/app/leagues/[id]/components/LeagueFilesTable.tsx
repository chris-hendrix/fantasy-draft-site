import { useState } from 'react'
import { useLeagueFiles } from '@/hooks/leagueFile'
import Table, { TableColumn } from '@/components/Table'
import { LeagueFileArgs } from '@/types'
import LeagueFileUploadModal from './LeagueFileUploadModal'

interface Props {
  leagueId: string;
}

const LeagueFilesTable: React.FC<Props> = ({ leagueId }) => {
  const {
    leagueFiles,
    downloadLeagueFile,
    isQuerying
  } = useLeagueFiles(leagueId)
  const [addModalOpen, setIsAddModalOpen] = useState(false)

  const columns: TableColumn<LeagueFileArgs>[] = [
    {
      header: 'Name',
      value: (leagueFile) => leagueFile.file.name,
    },
    {
      header: 'Download',
      renderedValue: (leagueFile) => (
        <button
          className="btn btn-square btn-primary"
          onClick={() => downloadLeagueFile(leagueFile.id)}
        >
          ⬇️
        </button>
      ),
    }
  ]

  return (
    <>
      {addModalOpen && (
        <LeagueFileUploadModal
          leagueId={leagueId}
          onClose={() => setIsAddModalOpen(false)}
        />
      )}
      <div>
        <button
          className="btn btn-primary"
          onClick={() => setIsAddModalOpen(true)}
        >
          Add File
        </button>
        <Table
          columns={columns}
          data={leagueFiles || []}
          isLoading={isQuerying}
        />
      </div>
    </>
  )
}

export default LeagueFilesTable
