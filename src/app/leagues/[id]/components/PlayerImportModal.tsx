import { useState } from 'react'
import csv from 'csvtojson'
import { useDraftData, useUpdateDraft } from '@/hooks/draft'
import { useInvalidatePlayers } from '@/hooks/player'
import Table, { TableColumn } from '@/components/Table'
import Modal from '@/components/Modal'
import ConfirmModal from '@/components/ConfirmModal'
import { PlayerData } from '@/types'

interface Props {
  draftId: string
  onClose: () => void;
}

const PlayerImportModal: React.FC<Props> = ({ draftId, onClose }) => {
  const { year } = useDraftData(draftId)
  const { invalidateObjects: invalidatePlayers } = useInvalidatePlayers()
  const [players, setPlayers] = useState<PlayerData[]>([])
  const [confirmOverwrite, setConfirmOverwrite] = useState(false)
  const [confirmUpdate, setConfirmUpdate] = useState(false)
  const { updateObject: updateDraft } = useUpdateDraft()
  const [csvString, setCsvString] = useState('')

  const handleSave = async () => {
    if (!draftId) return
    const res = await updateDraft({
      id: draftId,
      ...(!confirmOverwrite ? {} : {
        players: {
          deleteMany: {},
          createMany: { data: players }
        }
      }),
      ...(!confirmUpdate ? {} : {
        updatePlayerData: players
      })
    })
    if ('error' in res) return
    invalidatePlayers()
    onClose()
  }

  const columns: TableColumn<PlayerData>[] = [
    { header: 'Name', value: (player) => player.name },
    { header: 'Data', value: (player) => JSON.stringify(player?.data || '') },
  ]

  const handleImport = async () => {
    if (!draftId) return
    const objects = await csv({ checkType: true }).fromString(csvString)
    const imported = objects.map((obj: any) => ({
      name: String(obj?.id || obj?.ID || obj?.Id || obj?.name || obj?.Name),
      data: obj
    }))
    setPlayers(imported)
  }

  if (confirmOverwrite || confirmUpdate) {
    return <ConfirmModal
      onConfirm={handleSave}
      onClose={() => {
        setConfirmOverwrite(false)
        setConfirmUpdate(false)
      }}
    >
      {`This will ${confirmOverwrite ? 'overwrite' : 'update'} all existing player data for ${year}. Continue?`}
    </ConfirmModal>
  }

  return (
    <Modal title={`Import players for ${year}`} size="lg" onClose={onClose}>
      <div className="mb-2">
        {` Paste a csv of players here. The first line must have column names, and 
        a "Name" column must exist.`}
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
          onClick={() => setConfirmUpdate(true)}
          className="btn btn-primary w-32 mr-2"
          disabled={!players?.length}
        >
          Update
        </button>
        <button
          onClick={() => setConfirmOverwrite(true)}
          className="btn btn-error w-32 mr-2"
          disabled={!players?.length}
        >
          Overwrite
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
