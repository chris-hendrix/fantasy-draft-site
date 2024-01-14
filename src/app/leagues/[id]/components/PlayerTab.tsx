'use client'

import { useState } from 'react'
import { useUpdateDraft } from '@/hooks/draft'
import { useInvalidatePlayers } from '@/hooks/player'
import ConfirmModal from '@/components/ConfirmModal'
import DraftYearTabs from './DraftYearTabs'
import PlayersTable from './PlayersTable'
import PlayerImportModal from './PlayerImportModal'

interface Props {
  leagueId: string;
}

const PlayerTab: React.FC<Props> = ({ leagueId }) => {
  const { invalidateObjects: invalidatePlayers } = useInvalidatePlayers()
  const { updateObject: updateDraft } = useUpdateDraft()

  const [draftId, setDraftId] = useState<string | null>(null)
  const [importModalOpen, setImportModalOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const handleDelete = async () => {
    if (!draftId) return
    const res = await updateDraft({
      id: draftId,
      players: { deleteMany: {} }
    })
    if ('error' in res) return
    invalidatePlayers()
    setConfirmDelete(false)
  }

  return (
    <div className="flex flex-col items-start mt-8">
      <DraftYearTabs leagueId={leagueId} onSelect={setDraftId} />
      <div className="my-2 flex gap-2">
        <button
          className="btn btn-sm"
          onClick={() => setImportModalOpen(true)}
        >
          📤 Import
        </button>
        <button
          className="btn btn-sm btn-error"
          onClick={() => setConfirmDelete(true)}
        >
          🗑️ Delete
        </button>
      </div>
      {draftId && <PlayersTable draftId={draftId} />}
      {draftId && importModalOpen && <PlayerImportModal
        draftId={draftId}
        onClose={() => {
          setImportModalOpen(false)
        }} />}
      {confirmDelete && (
        <ConfirmModal
          onConfirm={handleDelete}
          onClose={() => setConfirmDelete(false)}
        >
          {'This will delete all existing player data. Continue?'}
        </ConfirmModal>
      )}
    </div>
  )
}

export default PlayerTab
