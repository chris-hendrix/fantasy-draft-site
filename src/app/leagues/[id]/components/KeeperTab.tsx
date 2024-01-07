import { useUpdateDraft, useDraftData } from '@/hooks/draft'
import { useState } from 'react'
import Modal from '@/components/Modal'
import ConfirmModal from '@/components/ConfirmModal'
import { useInvalidateKeepers } from '@/hooks/keeper'
import DraftYearTabs from './DraftYearTabs'
import KeepersTable from './KeepersTable'
import KeeperInfo from './KeeperInfo'

interface Props {
  leagueId: string;
}

const KeeperTab: React.FC<Props> = ({ leagueId }) => {
  const defaultKeeperCount = 5 // TODO add to league model
  const { updateObject: updateDraft } = useUpdateDraft()
  const { invalidateObjects: invalidateKeepers } = useInvalidateKeepers()
  const [note, setNote] = useState('')
  const [generateModalOpen, setGenerateModalOpen] = useState(false)
  const [noteModalOpen, setNoteModalOpen] = useState(false)
  const [confirmGenerate, setConfirmGenerate] = useState(false)
  const [draftId, setDraftId] = useState<string | null>(null)
  const [keeperCount, setKeeperCount] = useState(defaultKeeperCount)
  const {
    sessionTeam,
    isCommissioner,
    canEditKeepers,
    keeperEntryNote
  } = useDraftData(draftId as string, !draftId)

  const handleClose = () => {
    setGenerateModalOpen(false)
    setNoteModalOpen(false)
    setConfirmGenerate(false)
  }

  const handleGenerate = async () => {
    if (!draftId) return
    const res = await updateDraft({ id: draftId, keeperCount })
    if ('error' in res) return
    invalidateKeepers()
    handleClose()
  }

  const handleSaveNote = async () => {
    if (!draftId) return
    const res = await updateDraft({ id: draftId, keeperEntryNote: note })
    if ('error' in res) return
    handleClose()
  }

  const handleLock = async () => {
    if (!draftId || !isCommissioner) return
    await updateDraft({
      id: draftId,
      keepersLockDate: canEditKeepers ? new Date() : null
    })
  }

  if (confirmGenerate) {
    return <ConfirmModal
      onConfirm={handleGenerate}
      onClose={() => setConfirmGenerate(false)}>
      This will delete existing keeper data. Continue?
    </ConfirmModal>
  }

  return (
    <>
      <div className="flex flex-col items-center mt-8 mb-2">
        <DraftYearTabs leagueId={leagueId} onSelect={setDraftId} />
      </div>
      {isCommissioner && <div className="mt-4 flex gap-2">
        <button
          className="btn btn-sm w-32"
          onClick={handleLock}
        >
          {canEditKeepers ? '🔐 Lock' : '🔑 Unlock'}
        </button>
        <button
          className="btn btn-sm w-32"
          onClick={() => setGenerateModalOpen(true)}
          disabled={!canEditKeepers}
        >
          🔄 Generate
        </button>
        <button
          className="btn btn-sm w-32"
          onClick={() => {
            setNoteModalOpen(true)
            setNote(keeperEntryNote || '')
          }}
          disabled={!canEditKeepers}
        >
          📝 Edit note
        </button>
      </div>}
      {draftId && sessionTeam && (
        <>
          <h2 className="text-md font-bold mt-6">{`${sessionTeam.name}'s keeper entry`}</h2>
          <div className="flex flex-row">
            <KeepersTable
              draftId={draftId}
              teamId={sessionTeam.id}
              edit={canEditKeepers}
              notes={<KeeperInfo draftId={draftId} />}
            />
          </div>
        </>

      )}
      <h2 className="text-md font-bold mt-6">All keepers</h2>
      {draftId && <KeepersTable draftId={draftId} edit={canEditKeepers} />}
      {generateModalOpen && <Modal title="Generate keeper slots" onClose={handleClose} size="xs">
        <input
          type="number"
          className="input input-bordered w-full"
          placeholder="Keepers"
          value={keeperCount}
          onChange={(e) => setKeeperCount(Number(e.target.value))}
        />
        <div className="flex justify-end mt-2">
          <button onClick={() => setConfirmGenerate(true)} className="btn btn-secondary w-32 mr-2">
            Generate keeper slots
          </button>
          <button onClick={handleClose} className="btn w-32">
            Cancel
          </button>
        </div>
      </Modal>}
      {noteModalOpen && <Modal title="Edit keeper entry note" onClose={handleClose} size="xs">
        <textarea
          className="textarea textarea-bordered w-full font-mono min-h-[144px] textarea-sm mt-2 mb-2"
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add your note here"
          value={note}
        />
        <div className="text-xs">
          Supports&nbsp;
          <a className="link link-primary" href="https://www.markdownguide.org/cheat-sheet/" target="_blank">
            Markdown syntax
          </a>
        </div>
        <div className="flex justify-end mt-2">
          <button onClick={handleSaveNote} className="btn btn-secondary w-32 mr-2">
            Save
          </button>
          <button onClick={handleClose} className="btn w-32">
            Cancel
          </button>
        </div>
      </Modal>}
    </>

  )
}

export default KeeperTab
