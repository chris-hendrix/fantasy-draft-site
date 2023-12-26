'use client'

import React, { useEffect } from 'react'
import { useGetDrafts } from '@/hooks/draft'
import TabSelect from '@/components/TabSelect'

interface Props {
  leagueId: string;
  onSelect: (draftId: string) => void
}

const DraftYearTabs: React.FC<Props> = ({ leagueId, onSelect }) => {
  const { data: drafts, isSuccess } = useGetDrafts({
    where: { leagueId },
    orderBy: { year: 'desc' }
  })

  useEffect(() => drafts && onSelect(drafts[0].id), [isSuccess])

  const tabOptions = drafts?.map((d) => ({ value: d.id, label: String(d.year) }))

  if (!tabOptions) return null

  return <TabSelect
    tabOptions={tabOptions}
    onSelect={({ selectedValue }) => onSelect(String(selectedValue))}
  />
}

export default DraftYearTabs
