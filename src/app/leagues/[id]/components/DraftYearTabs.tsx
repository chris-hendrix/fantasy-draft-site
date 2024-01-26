'use client'

import React, { useEffect } from 'react'
import TabSelect from '@/components/TabSelect'
import { useCurrentDraftId } from '@/hooks/app'
import { useLeagueData } from '@/hooks/league'

interface Props {
  leagueId: string;
}

const DraftYearTabs: React.FC<Props> = ({ leagueId }) => {
  const { data: { drafts }, isSuccess, defaultDraftId } = useLeagueData(leagueId)
  const { currentDraftId, setCurrentDraftId } = useCurrentDraftId()
  const currentDraft = drafts?.find((d) => d.id === currentDraftId)
  const currentOption = currentDraft && { value: currentDraft.id, label: String(currentDraft.year) }

  useEffect(() => {
    if (!currentDraftId && defaultDraftId) {
      setCurrentDraftId(defaultDraftId)
    }
  }, [isSuccess])

  const handleSelect = ({ selectedValue }: { selectedValue: string | number }) => {
    setCurrentDraftId(String(selectedValue))
  }

  const tabOptions = drafts?.map((d) => ({ value: d.id, label: String(d.year) }))

  if (!tabOptions) return null

  return <TabSelect
    tabOptions={tabOptions}
    initialOption={currentOption}
    onSelect={handleSelect}
  />
}

export default DraftYearTabs
