import { useState } from 'react'
import csv from 'csvtojson'
import { useLeague } from '@/hooks/league'
import Table, { TableColumn } from '@/components/Table'
import Modal from '@/components/Modal'
import ConfirmModal from '@/components/ConfirmModal'
import { ImportedResultsRecord } from '@/types'

interface Props {
  leagueId: string
  onClose: () => void;
}

const ResultsImportModal: React.FC<Props> = ({ leagueId, onClose }) => {
  const { updateLeague, invalidateLeague } = useLeague(leagueId)
  const [records, setRecords] = useState<ImportedResultsRecord[]>([])
  const [confirmOverwrite, setConfirmOverwrite] = useState(false)
  const [confirmUpdate, setConfirmUpdate] = useState(false)
  const [csvString, setCsvString] = useState('')

  const columns: TableColumn<ImportedResultsRecord>[] = [
    { header: 'Year', value: ({ draftYear }) => draftYear },
    { header: 'Team name', value: ({ teamName }) => teamName },
    { header: 'Data', value: ({ data }) => JSON.stringify(data || '') },
  ]

  const handleReadCsv = async () => {
    if (!leagueId) return
    const objects = await csv({ checkType: true }).fromString(csvString)
    const imported = objects.map((obj: any) => ({
      teamName: String(obj?.teamName || obj?.Team || ''),
      draftYear: Number(obj?.draftYear || obj?.Year || ''),
      data: obj
    }))
    setRecords(imported)
  }

  const handleImport = async () => {
    const res = await updateLeague({ id: leagueId, importedResultsRecords: records })
    if ('error' in res) return
    invalidateLeague(leagueId)
    onClose()
  }

  if (confirmOverwrite || confirmUpdate) {
    return <ConfirmModal
      onConfirm={handleImport}
      onClose={() => {
        setConfirmOverwrite(false)
        setConfirmUpdate(false)
      }}
    >
      {'This will overwrite all existing result data. Continue?'}
    </ConfirmModal>
  }

  return (
    <Modal title={'Import season results'} size="lg" onClose={onClose}>
      <div className="mb-2">
        {` Paste a csv of results here. These columns must exist:
        draftYear and teamName`}
      </div>
      <textarea
        className="textarea textarea-bordered w-full textarea-sm mt-2 mb-2 min-h-[300px]"
        onChange={(e) => setCsvString(e.target.value)}
        placeholder="Paste csv values here"
      />
      <div className="flex justify-end mb-2">
        <button
          onClick={handleReadCsv}
          className="btn btn-secondary w-32 mr-2"
          disabled={!csvString.length}
        >
          Read CSV
        </button>
        <button
          onClick={() => setConfirmUpdate(true)}
          className="btn btn-primary w-32 mr-2"
          disabled={!records?.length}
        >
          Update
        </button>
        <button
          onClick={() => setConfirmOverwrite(true)}
          className="btn btn-error w-32 mr-2"
          disabled={!records?.length}
        >
          Overwrite
        </button>
        <button onClick={onClose} className="btn w-32">
          Cancel
        </button>
      </div>
      {records?.length > 0 && <Table columns={columns} data={records} />}
    </Modal>
  )
}

export default ResultsImportModal
