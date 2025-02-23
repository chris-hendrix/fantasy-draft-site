import React from 'react'
import { useLeagueFiles } from '@/hooks/leagueFile'
import Table, { TableColumn } from '@/components/Table'
import { LeagueFileArgs } from '@/types'

interface Props {
  leagueId: string;
}

const LeagueFilesTable: React.FC<Props> = ({ leagueId }) => {
  const { leagueFiles, uploadLeagueFile, downloadLeagueFile, isLoading } = useLeagueFiles(leagueId)

  const columns: TableColumn<LeagueFileArgs>[] = [
    {
      header: 'Name',
      value: (leagueFile) => leagueFile.file.name,
    },
    {
      header: 'Download',
      renderedValue: (leagueFile) => (
        <button
          className="btn btn-primary"
          onClick={() => downloadLeagueFile(leagueFile.id)}
        >
          Download
        </button>
      ),
    }
  ]

  const UploadButton = () => {
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target?.files?.[0]
      if (!file) return
      await uploadLeagueFile(file)
    }
    return (
      <>
        <input
          type="file"
          className="hidden"
          id="fileInput"
          onChange={handleFileChange}
        />
        <label htmlFor="fileInput">
          <div className="btn btn-primary">
            Upload file
          </div>
        </label>
      </>
    )
  }

  return (
    <div>
      <UploadButton />
      <Table
        columns={columns}
        data={leagueFiles || []}
        isLoading={isLoading}
      />
    </div>
  )
}

export default LeagueFilesTable
