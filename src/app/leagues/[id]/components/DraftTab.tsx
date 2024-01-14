'use client'

import React, { useState, ChangeEvent } from 'react'
import { useAddDraft, useGetDrafts } from '@/hooks/draft'
import Tabs from '@/components/Tabs'
import Modal from '@/components/Modal'
import DraftPage from './DraftPage'

interface Props {
  leagueId: string;
}

const DraftTab: React.FC<Props> = ({ leagueId }) => {
  const currentYear = new Date().getFullYear()
  const defaultRounds = 22 // TODO add to league model

  const { data: drafts, refetch } = useGetDrafts({
    where: { leagueId },
    orderBy: { year: 'desc' }
  })
  const { addObject: addDraft } = useAddDraft()
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedYear, setSelectedYear] = useState<number>(currentYear)
  const [rounds, setRounds] = useState<number>(defaultRounds)

  const yearsToExclude = drafts?.map((d) => d.year) || []
  const years = Array.from(
    { length: 10 },
    (_, index) => new Date().getFullYear() - index + 1
  ).filter((year) => !yearsToExclude.includes(year))

  const handleAddDraft = async () => {
    if (selectedYear !== null) {
      await addDraft({ rounds, year: selectedYear, leagueId })
      refetch()
      setModalOpen(false)
      setSelectedYear(currentYear)
      setRounds(defaultRounds)
    }
  }

  const tabs = drafts?.map((d, i) => ({
    name: String(d.year),
    component: <DraftPage draftId={d.id} />,
    default: i === 0,
  })) || []

  return (
    <div className="flex flex-col items-center mt-3">
      <Tabs tabs={tabs} onAdd={() => setModalOpen(true)} width="full" />
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
    </div>
  )
}

export default DraftTab
