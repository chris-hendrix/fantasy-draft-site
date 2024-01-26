'use client'

import { useState, ChangeEvent } from 'react'
import { useAddDraft, useInvalidateDrafts } from '@/hooks/draft'
import { useDeleteLeague, useLeagueData } from '@/hooks/league'
import { useCurrentDraftId } from '@/hooks/app'
import Modal from '@/components/Modal'
import DraftImportModal from './DraftImportModal'

interface Props {
  leagueId: string;
}

const CommissionerTab: React.FC<Props> = ({ leagueId }) => {
  const currentYear = new Date().getFullYear()
  const defaultRounds = 22 // TODO add to league model

  const { data: league } = useLeagueData()
  const { addObject: addDraft } = useAddDraft()
  const { deleteObject: deleteLeague } = useDeleteLeague()
  const { invalidateObjects: invalidateDrafts } = useInvalidateDrafts()
  const { setCurrentDraftId } = useCurrentDraftId()
  const [selectedYear, setSelectedYear] = useState<number>(currentYear)
  const [rounds, setRounds] = useState<number>(defaultRounds)

  const [modalOpen, setModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [importModalOpen, setImportModalOpen] = useState(false)

  const yearsToExclude = league?.drafts?.map((d) => d.year) || []
  const years = Array.from(
    { length: 20 },
    (_, index) => new Date().getFullYear() - index + 1
  ).filter((year) => !yearsToExclude.includes(year))

  const handleAddDraft = async () => {
    if (selectedYear !== null) {
      const draft = await addDraft({ rounds, year: selectedYear, leagueId })
      setModalOpen(false)
      setSelectedYear(currentYear)
      setRounds(defaultRounds)
      invalidateDrafts()
      setCurrentDraftId(draft?.id as string || null)
    }
  }

  const handleDelete = async () => {
    const res = await deleteLeague(leagueId)
    if ('error' in res) return
    window.location.reload()
  }

  return (
    <div className="flex flex-col items-center mt-8 gap-2">
      <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
        Create new draft
      </button>
      <button className="btn btn-primary" onClick={() => setImportModalOpen(true)}>
        Import drafts
      </button>
      <button className="btn btn-error" onClick={() => setDeleteModalOpen(true)}>
        Delete league
      </button>
      {modalOpen && (
        <Modal title="Add draft" size="xs" onClose={() => setModalOpen(false)}>
          <div>Year</div>
          <select
            className="select select-bordered w-full"
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
          <div className="mt-2">Rounds</div>
          <input
            type="number"
            className="input input-bordered w-full"
            placeholder="Rounds"
            value={rounds}
            onChange={(e) => setRounds(Number(e.target.value))}
          />
          <div className="flex justify-end mt-2">
            <button onClick={handleAddDraft} className="btn btn-error w-32 mr-2">
              Yes
            </button>
            <button onClick={() => setModalOpen(false)} className="btn w-32">
              Cancel
            </button>
          </div>
        </Modal>
      )}
      {deleteModalOpen && (
        <Modal title="Are you sure?" size="xs" onClose={() => setDeleteModalOpen(false)}>
          <div>This cannot be undone.</div>
          <div className="flex justify-end mt-2">
            <button onClick={handleDelete} className="btn btn-error w-32 mr-2">Yes</button>
            <button onClick={() => setDeleteModalOpen(false)} className="btn w-32">Cancel</button>
          </div>
        </Modal>
      )}
      {importModalOpen && (
        <DraftImportModal leagueId={leagueId} onClose={() => setImportModalOpen(false)} />
      )}
    </div>
  )
}

export default CommissionerTab
