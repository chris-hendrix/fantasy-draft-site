import React from 'react'
import { useLeagueFiles } from '@/hooks/leagueFile'

interface Props {
  leagueId: string;
}

const LeagueFilesTable: React.FC<Props> = ({ leagueId }) => {
  const { uploadLeagueFile } = useLeagueFiles(leagueId)

  const UploadButton = () => {
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target?.files?.[0]
      console.log({ file })
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
    </div>
  )
}

export default LeagueFilesTable
