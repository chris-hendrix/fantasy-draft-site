'use client'

import React, { useState, ChangeEvent } from 'react'
import { LeagueWithRelationships } from '@/types'
import { useAddDraft, useGetDrafts } from '@/hooks/draft'
import Tabs from '@/components/Tabs'
import Modal from '@/components/Modal'
import DraftPage from './DraftPage'

interface Props {
  league: Partial<LeagueWithRelationships>;
}

const DraftTab: React.FC<Props> = ({ league }) => {
  const { data: drafts, refetch } = useGetDrafts({
    where: { leagueId: league.id },
    include: { league: { include: { teams: true } } },
    orderBy: { year: 'asc' }
  })
  const { addObject: addDraft } = useAddDraft()
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedYear, setSelectedYear] = useState<number | null>(null)

  const yearsToExclude = drafts?.map((d) => d.year) || []
  const years = Array.from(
    { length: 10 },
    (_, index) => new Date().getFullYear() - index + 1
  ).filter((year) => !yearsToExclude.includes(year))

  const handleAddDraft = async () => {
    if (selectedYear !== null) {
      await addDraft({
        year: selectedYear,
        leagueId: league.id
      })
      refetch()
      setModalOpen(false)
      setSelectedYear(null)
    }
  }

  const tabs = drafts?.map((d, i) => ({
    name: String(d.year),
    component: <DraftPage draft={d} />,
    default: i + 1 === drafts.length,
  })) || []

  return (
    <div className="flex flex-col items-center mt-3">
      {tabs.length > 0 && <Tabs tabs={tabs} onAdd={() => setModalOpen(true)} width="full" />}
      {modalOpen && (
        <Modal title="Add draft" size="xs" onClose={() => setModalOpen(false)}>
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
