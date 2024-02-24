'use client'

import React, { useState } from 'react'
import { useDrafts } from '@/hooks/draft'
import Table, { TableColumn } from '@/components/Table'
import { DraftArgs, DraftTeamArgs } from '@/types'
import { formatDatetime } from '@/utils/date'
import { getDraftTeamData, getMedal } from '@/utils/draft'
import { useLeague } from '@/hooks/league'
import { useRouter } from 'next/navigation'
import { useCurrentDraftId } from '@/hooks/app'
import DraftModal from './DraftModal'

interface Props {
  leagueId: string;
}

const DraftsTable: React.FC<Props> = ({ leagueId }) => {
  const router = useRouter()
  const { setCurrentDraftId } = useCurrentDraftId()
  const { drafts, isLoading } = useDrafts(leagueId)
  const { isCommissioner } = useLeague(leagueId)
  const [modalOpen, setModalOpen] = useState(false)

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

  const handleLinkClick = (draftId: string, hash: string) => {
    setCurrentDraftId(draftId)
    router.push(`#${hash}`)
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
      header: 'Keepers',
      value: ({ keeperCount }) => keeperCount
    },
    {
      header: 'Dues',
      value: ({ dues }) => dues
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
    },
    {
      header: 'Links',
      renderedValue: ({ id }) => (
        <div className="flex gap-1">
          <button onClick={() => handleLinkClick(id, 'draft')} className="badge badge-primary">
            Draft
          </button>

          <button className="badge badge-secondary">Keepers</button>
        </div>
      )
    },
  ]

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
      <Table columns={columns} data={drafts || []} isLoading={isLoading} />
      {modalOpen && <DraftModal onClose={() => setModalOpen(false)} />}
    </div>

  )
}

export default DraftsTable
