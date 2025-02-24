'use client'

import React, { useEffect, useState } from 'react'
import { useLeague } from '@/hooks/league'
import { DraftArgs } from '@/types'

interface Props {
  leagueId: string;
  initialDraft?: DraftArgs;
  onSelect: (draft: DraftArgs | null) => void;
}

const DraftSelect: React.FC<Props> = ({ leagueId, initialDraft, onSelect }) => {
  const { league: { drafts } } = useLeague(leagueId)
  const [selectedDraft, setSelectedDraft] = useState<DraftArgs | null>(initialDraft || null)

  useEffect(() => { onSelect(selectedDraft) }, [selectedDraft])

  return (
    <div className="flex gap-1">
      <select
        className="select select-bordered w-full"
        value={selectedDraft?.id}
        onChange={(e) => {
          const draft = drafts.find((d) => d.id === e.target.value)
          setSelectedDraft(draft || null)
        }}
      >
        <option value="">Select Draft</option>
        {drafts.map((draft) => (
          <option key={draft.id} value={draft.id}>
            {draft.year}
          </option>
        ))}
      </select>
    </div>
  )
}

export default DraftSelect
