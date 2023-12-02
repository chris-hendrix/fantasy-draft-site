import { useState } from 'react'
import { PlayerArgs } from '@/types'
import Table, { TableColumn } from '@/components/Table'
import Modal from '@/components/Modal'
import ConfirmModal from '@/components/ConfirmModal'
import { csvToObjectArray } from '@/utils/csv'

interface Props {
  onClose: () => void;
}

const PlayerImportModal: React.FC<Props> = ({ onClose }) => {
  const [players, setPlayers] = useState<Partial<PlayerArgs>[]>([])
  const [confirmSave, setConfirmSave] = useState(false)
  const [csv, setCsv] = useState('')

  const handleSave = async () => {
    // TODO
    console.log({ players, setPlayers })
  }

  const columns: TableColumn<Partial<PlayerArgs>>[] = [
    {
      name: 'Name',
      value: (player) => player.name
    },
    {
      name: 'Year',
      value: (player) => player.year
    },
    {
      name: 'Data',
      value: (player) => JSON.stringify(player?.data || '')
    },
  ]

  const handleImport = () => {
    const objects = csvToObjectArray(csv)
    console.log(objects)

    const imported = objects.map((obj: any) => ({
      name: String(obj?.name || obj?.Name),
      year: 2023, // TODO,
      data: String(obj)
    }))

    setPlayers(imported)
  }

  if (confirmSave) {
    return <ConfirmModal
      onConfirm={handleSave}
      onClose={() => setConfirmSave(false)}>
      This will delete existing draft data. Continue?
    </ConfirmModal>
  }

  return (
    <Modal title="Import players" size="lg" onClose={onClose}>
      <div className="mb-2">
        {` Paste a csv of players here. The first line must have column names, and 
        a "Name" column must exist.`}
      </div>
      <textarea
        className="textarea textarea-bordered w-full textarea-sm mb-2"
        onChange={(e) => setCsv(e.target.value)}
        placeholder="Paste csv values here"
      />
      <Table columns={columns} data={players} />
      <div className="flex justify-end mt-2">
        <button onClick={handleImport} className="btn btn-secondary w-32 mr-2">
          Import
        </button>
        <button onClick={() => setConfirmSave(true)} className="btn btn-primary w-32 mr-2">
          Save
        </button>
        <button onClick={onClose} className="btn w-32">
          Cancel
        </button>
      </div>
    </Modal>
  )
}

export default PlayerImportModal
