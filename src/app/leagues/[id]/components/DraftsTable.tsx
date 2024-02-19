'use client'

import React from 'react'
import { useDrafts } from '@/hooks/draft'
import Table, { TableColumn } from '@/components/Table'
import { DraftArgs, DraftTeamArgs } from '@/types'
import { formatDatetime } from '@/utils/date'
import { getDraftTeamData, getMedal } from '@/utils/draft'

interface Props {
  leagueId: string;
}

const DraftsTable: React.FC<Props> = ({ leagueId }) => {
  const { drafts, isLoading } = useDrafts(leagueId)

  const renderDraftTeam = (draftTeam: DraftTeamArgs) => {
    const wins = getDraftTeamData(draftTeam, 'Wins')
    const losses = getDraftTeamData(draftTeam, 'Losses')
    const ties = getDraftTeamData(draftTeam, 'Ties')
    return (
      <div key={draftTeam.id}>
        {getMedal(draftTeam.seasonFinish)} {draftTeam.team.name}
        <span className="italic text-xs ml-2 text-gray-500">{`(${wins} - ${losses} - ${ties})`}</span>
      </div>
    )
  }

  const columns: TableColumn<DraftArgs>[] = [
    {
      header: 'Year',
      value: ({ year }) => year
    },
    {
      header: 'Teams',
      value: ({ draftTeams }) => draftTeams.length
    },
    {
      header: 'Rounds',
      value: ({ rounds }) => rounds
    },
    {
      header: 'Info',
      renderedValue: ({ draftTime, draftTeams }) => {
        const draftTimeText = draftTime && `Draft time: ${formatDatetime(draftTime)}`
        const winners = draftTeams
          .filter((dt) => dt.seasonFinish && dt.seasonFinish <= 3)
          .sort((a, b) => ((a.seasonFinish || 0) < (b.seasonFinish || 0) ? -1 : 1))

        if (winners.length) {
          return (
            <>{winners.map((dt) => renderDraftTeam(dt))}</>
          )
        }
        return (
          <>
            {draftTimeText}
          </>
        )
      }
    }
  ]

  return (
    <Table columns={columns} data={drafts || []} isLoading={isLoading} />
  )
}

export default DraftsTable
