import React from 'react'
import { useLeagueFiles } from '@/hooks/leagueFile'
import Table, { TableColumn } from '@/components/Table'
import { LeagueFileArgs } from '@/types'
import { getSignedUrl } from '@/lib/supabase'

interface Props {
  leagueId: string;
}

const LeagueFilesTable: React.FC<Props> = ({ leagueId }) => {
  const { leagueFiles, uploadLeagueFile, isLoading } = useLeagueFiles(leagueId)
  console.log({ leagueFiles })

  const downloadFile = async (leagueFile: LeagueFileArgs) => {
    const url = await getSignedUrl(leagueFile.file.bucketUrl)
    if (!url) return
    const a = document.createElement('a')
    a.href = url
    a.download = leagueFile.file.name
    a.click()
    a.remove()
  }

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
          onClick={() => downloadFile(leagueFile)}
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
