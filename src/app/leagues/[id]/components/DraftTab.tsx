'use client'

import React from 'react'
import { useCurrentDraftId } from '@/hooks/app'
import DraftPage from './DraftPage'
import DraftYearTabs from './DraftYearTabs'

interface Props {
  leagueId: string;
}

const DraftTab: React.FC<Props> = ({ leagueId }) => {
  const { currentDraftId } = useCurrentDraftId()
  return (
    <div className="flex flex-col items-center mt-8 mb-2">
      <DraftYearTabs leagueId={leagueId} />
      {currentDraftId && <DraftPage draftId={currentDraftId} />}
    </div>
  )
}

export default DraftTab
