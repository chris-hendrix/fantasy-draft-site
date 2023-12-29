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
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmGenerate, setConfirmGenerate] = useState(false)
  const [draftId, setDraftId] = useState<string | null>(null)
  const [keeperCount, setKeeperCount] = useState(defaultKeeperCount)
  const {
    sessionTeam,
    isCommissioner,
    canEditKeepers
  } = useDraftData(draftId as string, !draftId)

  const handleClose = () => {
    setModalOpen(false)
    setConfirmGenerate(false)
  }

  const handleGenerate = async () => {
    if (!draftId) return
    const res = await updateDraft({
      id: draftId,
      keeperCount
    })
    if ('error' in res) return
    invalidateKeepers()
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
      {draftId && sessionTeam && (
        <>
          <h2 className="text-md font-bold mt-6">{`${sessionTeam.name}'s keeper entry`}</h2>
          <div className="flex flex-row">
            <div className="w-7/12">
              <KeepersTable draftId={draftId} teamId={sessionTeam.id} edit={canEditKeepers} />
            </div>
            <div className="w-5/12">
              <KeeperInfo draftId={draftId} />
            </div>
          </div>
        </>

      )}
      <h2 className="text-md font-bold mt-6">All keepers</h2>
      {isCommissioner && <div className="my-4">
        <button
          className="btn btn-sm w-32 mr-2"
          onClick={() => setModalOpen(true)}
        >
          🔄 Generate
        </button>
        <button
          className="btn btn-sm w-32"
          onClick={handleLock}
        >
          {canEditKeepers ? '🔐 Lock' : '🔑 Unlock'}
        </button>
      </div>}
      {draftId && <KeepersTable draftId={draftId} edit={canEditKeepers} />}
      {modalOpen && <Modal title="Generate keeper slots" onClose={handleClose} size="xs">
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
    </>

  )
}

export default KeeperTab
