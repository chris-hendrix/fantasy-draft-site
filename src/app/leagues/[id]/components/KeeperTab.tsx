import { useState } from 'react'
import { useDraft } from '@/hooks/draft'
import { useLeagueFiles } from '@/hooks/leagueFile'
import Modal from '@/components/Modal'
import ConfirmModal from '@/components/ConfirmModal'
import { useInvalidateKeepers } from '@/hooks/keeper'
import { KeeperArgs } from '@/types'
import { useCurrentDraftId } from '@/hooks/app'
import { LeagueFileCategory } from '@prisma/client'
import DraftYearTabs from './DraftYearTabs'
import KeepersTable from './KeepersTable'
import KeeperInfo from './KeeperInfo'
import PlayersTable from './PlayersTable'

interface Props {
  leagueId: string;
}

const KeeperTab: React.FC<Props> = ({ leagueId }) => {
  const defaultKeeperCount = 5 // TODO add to league model
  const { invalidateObjects: invalidateKeepers } = useInvalidateKeepers()
  const { currentDraftId } = useCurrentDraftId()
  const [note, setNote] = useState('')
  const [generateModalOpen, setGenerateModalOpen] = useState(false)
  const [noteModalOpen, setNoteModalOpen] = useState(false)
  const [confirmGenerate, setConfirmGenerate] = useState(false)
  const [keeperCount, setKeeperCount] = useState(defaultKeeperCount)
  const [teamEdit, setTeamEdit] = useState(false)
  const [allEdit, setAllEdit] = useState(false)
  const [teamKeepers, setTeamKeepers] = useState<KeeperArgs[]>([])
  const [allKeepers, setAllKeepers] = useState<KeeperArgs[]>([])

  const {
    isSessionTeam,
    sessionTeamIds,
    isCommissioner,
    areKeepersOpen: canEditKeepers,
    updateDraft,
    draft: { keeperEntryNote, leagueFiles },
  } = useDraft(currentDraftId as string, { skip: !currentDraftId })

  const { downloadLeagueFile } = useLeagueFiles(leagueId)
  const keeperFiles = leagueFiles?.filter((lf) => lf.category === LeagueFileCategory.keepers) || []

  const handleClose = () => {
    setGenerateModalOpen(false)
    setNoteModalOpen(false)
    setConfirmGenerate(false)
  }

  const handleGenerate = async () => {
    if (!currentDraftId) return
    const res = await updateDraft({ id: currentDraftId, keeperCount })
    if ('error' in res) return
    invalidateKeepers()
    handleClose()
  }

  const handleSaveTeamKeepers = async () => {
    if (!currentDraftId) return

    const res = await updateDraft({
      id: currentDraftId,
      teamKeepers: teamKeepers.filter((k) => isSessionTeam(k.teamId))
    })
    if ('error' in res) return
    invalidateKeepers()
    setTeamEdit(false)
  }

  const handleSaveAllKeepers = async () => {
    if (!currentDraftId) return
    const keeperData = allKeepers.map(({ teamId, playerId, round, keeps }) => ({
      teamId, playerId, round, keeps
    }))
    const res = await updateDraft({
      id: currentDraftId,
      keepers: {
        deleteMany: {},
        createMany: { data: keeperData }
      },
    })
    if ('error' in res) return
    invalidateKeepers()
    setAllEdit(false)
  }

  const handleSaveNote = async () => {
    if (!currentDraftId) return
    const res = await updateDraft({ id: currentDraftId, keeperEntryNote: note })
    if ('error' in res) return
    handleClose()
  }

  const handleLock = async () => {
    if (!currentDraftId || !isCommissioner) return
    await updateDraft({
      id: currentDraftId,
      keepersLockDate: canEditKeepers ? new Date() : null
    })
  }

  const KeeperFileClickableChips = () => (
    <div className="flex flex-wrap gap-2">
      {keeperFiles.map((lf) => (
        <div
          key={lf.id}
          onClick={() => downloadLeagueFile(lf.id)}
          className="badge badge-secondary cursor-pointer"
        >
          {`${lf?.file?.name || ''} ⬇️`}
        </div>
      ))}
    </div >
  )

  return (
    <>
      <div className="flex flex-col items-center mt-8 mb-2">
        <DraftYearTabs leagueId={leagueId} />
      </div>
      {isCommissioner &&
        <div className="mt-4 flex gap-2">
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
        </div>
      }
      {currentDraftId && sessionTeamIds && canEditKeepers && (
        <>
          <h2 className="text-lg font-bold my-6 mx-2">📝 Keeper Entry</h2>
          <div className="flex gap-2 mb-2 items-center">
            {!teamEdit && <button id="team-keeper-edit" className="btn btn-sm w-32" onClick={() => setTeamEdit(true)}>📝 Edit</button>}
            {teamEdit && <button className="btn btn-sm w-32 btn-primary" onClick={handleSaveTeamKeepers}>💾 Save</button>}
            {teamEdit && <button className="btn btn-sm w-32 btn-error" onClick={() => setTeamEdit(false)}>❌ Cancel</button>}
            <KeeperFileClickableChips />
          </div>
          <div className="flex flex-row">
            <KeepersTable
              draftId={currentDraftId}
              teamIds={sessionTeamIds}
              edit={teamEdit && canEditKeepers}
              onKeepersChange={setTeamKeepers}
              showPlayerData
              notes={<>
                <div className="divider" />
                <KeeperInfo draftId={currentDraftId} />
              </>}
            />
          </div>
          <div className="divider" />
        </>
      )}
      {currentDraftId && (
        <div className="flex flex-col md:flex-row h-full w-full">
          <div className="w-full md:w-1/2 h-full max-h-screen min-h-screen overflow-y-auto">
            <h2 className="text-lg font-bold my-6 mx-2">✅ Selected Keepers</h2>
            {isCommissioner && <div className="flex gap-2 mb-2">
              {!allEdit && <button id="all-keeper-edit" className="btn btn-sm w-32" onClick={() => setAllEdit(true)}>📝 Edit</button>}
              {allEdit && <button className="btn btn-sm w-32 btn-primary" onClick={handleSaveAllKeepers}>💾 Save</button>}
              {allEdit && <button className="btn btn-sm w-32 btn-error" onClick={() => setAllEdit(false)}>❌ Cancel</button>}
            </div>}
            <KeepersTable
              draftId={currentDraftId}
              edit={allEdit && canEditKeepers}
              onKeepersChange={setAllKeepers}
            />
          </div>
          <div className="w-full md:w-1/2 h-full max-h-screen min-h-screen overflow-y-auto">
            <h2 className="text-lg font-bold my-6 mx-2">🧢 Players</h2>
            <PlayersTable draftId={currentDraftId} hideTeamColumn />
          </div>
        </div>
      )}
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
      {confirmGenerate && <ConfirmModal
        onConfirm={handleGenerate}
        onClose={() => setConfirmGenerate(false)}>
        This will delete existing keeper data. Continue?
      </ConfirmModal>}
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
