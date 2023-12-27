import { ChangeEvent, useState } from 'react'
import csv from 'csvtojson'
import { useGetDrafts, useUpdateDraft } from '@/hooks/draft'
import { useInvalidatePlayers } from '@/hooks/player'
import Table, { TableColumn } from '@/components/Table'
import Modal from '@/components/Modal'
import ConfirmModal from '@/components/ConfirmModal'

interface Props {
  leagueId: string
  onClose: () => void;
}

type Player = { name: string, data: any }

const PlayerImportModal: React.FC<Props> = ({ leagueId, onClose }) => {
  const { data: drafts } = useGetDrafts({
    where: { leagueId },
    orderBy: { year: 'asc' }
  })
  const { invalidateObjects: invalidatePlayers } = useInvalidatePlayers()
  const [players, setPlayers] = useState<Player[]>([])
  const [confirmSave, setConfirmSave] = useState(false)
  const [selectedDraftId, setSelectedDraftId] = useState<string | null>(null)
  const { updateObject: updateDraft } = useUpdateDraft()
  const [csvString, setCsvString] = useState('')

  const selectedDraftYear = drafts?.find((d) => d.id === selectedDraftId)?.year

  const handleSave = async () => {
    if (!selectedDraftId) return
    const res = await updateDraft({
      id: selectedDraftId,
      players: {
        deleteMany: {},
        createMany: { data: players }
      }
    })
    if ('error' in res) return
    invalidatePlayers()
    onClose()
  }

  const columns: TableColumn<Player>[] = [
    { name: 'Name', value: (player) => player.name },
    { name: 'Data', value: (player) => JSON.stringify(player?.data || '') },
  ]

  const handleImport = async () => {
    if (!selectedDraftId) return
    const objects = await csv({ checkType: true }).fromString(csvString)
    const imported = objects.map((obj: any) => ({
      name: String(obj?.name || obj?.Name),
      data: obj
    }))
    setPlayers(imported)
  }

  if (confirmSave) {
    return <ConfirmModal
      onConfirm={handleSave}
      onClose={() => setConfirmSave(false)}
    >
      {`This will delete all existing player data for ${selectedDraftYear}. Continue?`}
    </ConfirmModal>
  }

  if (!drafts) return null

  return (
    <Modal title="Import players" size="lg" onClose={onClose}>
      <div className="mb-2">
        {` Paste a csv of players here. The first line must have column names, and 
        a "Name" column must exist.`}
      </div>
      <div>Year</div>
      <select
        className="select select-bordered w-200"
        value={selectedDraftId || ''}
        onChange={(e: ChangeEvent<HTMLSelectElement>) => (
          setSelectedDraftId(e.target.value || null)
        )}
      >
        <option disabled value="">
          Select year
        </option>
        {drafts.map((d) => (
          <option key={d.id} value={d.id}>
            {d.year}
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
