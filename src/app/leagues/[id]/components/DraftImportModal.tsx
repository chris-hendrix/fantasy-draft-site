import { useState } from 'react'
import csv from 'csvtojson'
import Table, { TableColumn } from '@/components/Table'
import Modal from '@/components/Modal'
import ConfirmModal from '@/components/ConfirmModal'

type ImportData = {
  draftYear: number,
  teamName: string,
  playerName: string,
  overall: number,
  playerData: any,
  keeps: number | null
}

interface Props {
  leagueId: string
  onClose: () => void;
}

const DraftImportModal: React.FC<Props> = ({ leagueId, onClose }) => {
  const [data, setData] = useState<ImportData[]>([])
  const [confirmOverwrite, setConfirmOverwrite] = useState(false)
  const [confirmUpdate, setConfirmUpdate] = useState(false)
  const [csvString, setCsvString] = useState('')

  const handleSave = async () => {
    console.log('TODO')
  }

  const columns: TableColumn<ImportData>[] = [
    { header: 'Year', value: ({ draftYear }) => draftYear },
    { header: 'Team', value: ({ teamName }) => teamName },
    { header: 'Player', value: ({ playerName }) => playerName },
    { header: 'Overall', value: ({ overall }) => Number(overall) },
    { header: 'Data', value: ({ playerData }) => JSON.stringify(playerData) },
    { header: 'Keeps', value: ({ keeps }) => keeps },
  ]

  const handleImport = async () => {
    if (!leagueId) return
    const objects = await csv({ checkType: true }).fromString(csvString)
    const imported = objects.map((obj: any) => ({
      ...obj
    }))
    setData(imported)
  }

  if (confirmOverwrite || confirmUpdate) {
    return <ConfirmModal
      onConfirm={handleSave}
      onClose={() => {
        setConfirmOverwrite(false)
        setConfirmUpdate(false)
      }}
    >
      {'TODO. Continue?'}
    </ConfirmModal>
  }

  return (
    <Modal title={'Import draft data'} size="lg" onClose={onClose}>
      <div className="mb-2">
        {` Paste a csv of draft data here. You must have the following columns (keeps is optional): 
        draftYear,teamName,playerName,overall,playerData,keeps`}
      </div>
      <textarea
        className="textarea textarea-bordered w-full textarea-sm mt-2 mb-2 min-h-[300px]"
        onChange={(e) => setCsvString(e.target.value)}
        placeholder="Paste csv values here"
      />
      <div className="flex justify-end mb-2">
        <button
          onClick={handleImport}
          className="btn btn-secondary w-32 mr-2"
          disabled={!csvString.length}
        >
          Read CSV
        </button>
        <button
          onClick={() => setConfirmOverwrite(true)}
          className="btn btn-primary w-32 mr-2"
          disabled={!data?.length}
        >
          Import
        </button>
        <button onClick={onClose} className="btn w-32">
          Cancel
        </button>
      </div>
      {data?.length > 0 && <Table columns={columns} data={data} />}
    </Modal>
  )
}

export default DraftImportModal
