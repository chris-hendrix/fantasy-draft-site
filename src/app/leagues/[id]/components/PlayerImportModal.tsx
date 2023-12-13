import { ChangeEvent, useState } from 'react'
import csv from 'csvtojson'
import { PlayerArgs } from '@/types'
import { useUpdateLeague } from '@/hooks/league'
import Table, { TableColumn } from '@/components/Table'
import Modal from '@/components/Modal'
import ConfirmModal from '@/components/ConfirmModal'

interface Props {
  leagueId: string
  onClose: () => void;
}

type Player = { name: string, year: number, data: any }

const PlayerImportModal: React.FC<Props> = ({ leagueId, onClose }) => {
  const [players, setPlayers] = useState<Player[]>([])
  const [confirmSave, setConfirmSave] = useState(false)
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
  const { updateObject: updateLeague } = useUpdateLeague()
  const [csvString, setCsvString] = useState('')

  const years = Array.from(
    { length: 10 },
    (_, index) => new Date().getFullYear() - index + 1
  )

  const handleSave = async () => {
    const res = await updateLeague({
      id: leagueId,
      players: {
        deleteMany: { year: selectedYear },
        createMany: { data: players }
      }
    })
    if ('error' in res) return
    onClose()
  }

  const columns: TableColumn<Partial<PlayerArgs>>[] = [
    { name: 'Name', value: (player) => player.name },
    { name: 'Year', value: (player) => player.year },
    { name: 'Data', value: (player) => JSON.stringify(player?.data || '') },
  ]

  const handleImport = async () => {
    const objects = await csv({ checkType: true }).fromString(csvString)
    const imported = objects.map((obj: any) => ({
      name: String(obj?.name || obj?.Name),
      year: selectedYear,
      data: obj
    }))
    setPlayers(imported)
  }

  if (confirmSave) {
    return <ConfirmModal
      onConfirm={handleSave}
      onClose={() => setConfirmSave(false)}
    >
      {`This will delete all existing player data for ${selectedYear}. Continue?`}
    </ConfirmModal>
  }

  return (
    <Modal title="Import players" size="lg" onClose={onClose}>
      <div className="mb-2">
        {` Paste a csv of players here. The first line must have column names, and 
        a "Name" column must exist.`}
      </div>
      <div>Year</div>
      <select
        className="select select-bordered w-200"
        value={selectedYear || ''}
        onChange={(e: ChangeEvent<HTMLSelectElement>) => (
          setSelectedYear(parseInt(e.target.value, 10))
        )}
      >
        <option disabled value="">
          Select year
        </option>
        {years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
      <textarea
        className="textarea textarea-bordered w-full textarea-sm mt-2 mb-2"
        onChange={(e) => setCsvString(e.target.value)}
        placeholder="Paste csv values here"
      />
      <div className="flex justify-end mb-2">
        <button
          onClick={handleImport}
          className="btn btn-secondary w-32 mr-2"
          disabled={!csvString.length}
        >
          Import
        </button>
        <button
          onClick={() => setConfirmSave(true)}
          className="btn btn-primary w-32 mr-2"
          disabled={!players?.length}
        >
          Save
        </button>
        <button onClick={onClose} className="btn w-32">
          Cancel
        </button>
      </div>
      {players?.length > 0 && <Table columns={columns} data={players} />}
    </Modal>
  )
}

export default PlayerImportModal
