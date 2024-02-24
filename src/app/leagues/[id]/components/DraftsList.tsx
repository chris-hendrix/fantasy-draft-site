'use client'

import React, { useState } from 'react'
import { useDrafts } from '@/hooks/draft'
import { useLeague } from '@/hooks/league'
import DraftModal from './DraftModal'
import DraftCard from './DraftCard'

interface Props {
  leagueId: string;
}

const DraftsList: React.FC<Props> = ({ leagueId }) => {
  const { drafts } = useDrafts(leagueId)
  const { isCommissioner } = useLeague(leagueId)
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <div>
      {isCommissioner && (
        <button
          className="btn btn-sm btn-primary mb-2"
          onClick={() => setModalOpen(true)}
        >
          ➕ Add draft
        </button>
      )}
      {drafts?.map((d) => <DraftCard key={d.id} draft={d} />)}
      {modalOpen && <DraftModal onClose={() => setModalOpen(false)} />}
    </div>

  )
}

export default DraftsList
