'use client'

import { useState } from 'react'
import { useTeams } from '@/hooks/team'
import Table, { TableColumn } from '@/components/Table'
import { DraftTeamArgs } from '@/types'
import { getDraftTeamData } from '@/utils/draft'
import { useLeague } from '@/hooks/league'
import ResultsImportModal from './ResultsImportModal'

interface Props {
  leagueId: string;
}

const finishMap: { [key: number]: string } = {
  1: '🥇',
  2: '🥈',
  3: '🥉'
}

const HistoryTab: React.FC<Props> = ({ leagueId }) => {
  const { draftTeams } = useTeams(leagueId)
  const { isCommissioner } = useLeague(leagueId)
  const [resultsModalOpen, setResultsModalOpen] = useState(false)
  const data = draftTeams
    .filter((dt) => dt.seasonFinish !== null)
    ?.sort((a, b) => ((a.seasonFinish || 99) < (b.seasonFinish || 99) ? 1 : -1))
    ?.sort((a, b) => (a.draft.year < b.draft.year ? 1 : -1))

  const columns: TableColumn<DraftTeamArgs>[] = [
    {
      header: 'Year',
      value: ({ draft }) => draft?.year || ''
    },
    {
      header: 'Team',
      value: ({ team }) => team?.name || '',
      renderedValue: ({ team, seasonFinish }) => (
        <>
          {`${team.name} `}
          {seasonFinish && seasonFinish in finishMap ? finishMap[seasonFinish] : ''}
        </>
      )
    },
    {
      header: 'Finish',
      value: (draftTeam) => draftTeam.seasonFinish
    },
    {
      header: 'Wins',
      value: (draftTeam) => getDraftTeamData(draftTeam, 'Wins')
    },
    {
      header: 'Losses',
      value: (draftTeam) => getDraftTeamData(draftTeam, 'Losses')
    },
    {
      header: 'Ties',
      value: (draftTeam) => getDraftTeamData(draftTeam, 'Ties')
    },
    {
      header: 'Pct',
      value: (draftTeam) => getDraftTeamData(draftTeam, 'Pct')
    },
    {
      header: 'AVG',
      value: (draftTeam) => getDraftTeamData(draftTeam, 'AVG')
    },
    {
      header: 'R',
      value: (draftTeam) => getDraftTeamData(draftTeam, 'R')
    },
    {
      header: 'HR',
      value: (draftTeam) => getDraftTeamData(draftTeam, 'HR')
    },
    {
      header: 'RBI',
      value: (draftTeam) => getDraftTeamData(draftTeam, 'RBI')
    },
    {
      header: 'SB',
      value: (draftTeam) => getDraftTeamData(draftTeam, 'SB')
    },
    {
      header: 'K',
      value: (draftTeam) => getDraftTeamData(draftTeam, 'K')
    },
    {
      header: 'W',
      value: (draftTeam) => getDraftTeamData(draftTeam, 'W')
    },
    {
      header: 'SV',
      value: (draftTeam) => getDraftTeamData(draftTeam, 'SV')
    },
    {
      header: 'ERA',
      value: (draftTeam) => getDraftTeamData(draftTeam, 'ERA')
    },
    {
      header: 'WHIP',
      value: (draftTeam) => getDraftTeamData(draftTeam, 'WHIP')
    },
    {
      header: 'Moves',
      value: (draftTeam) => getDraftTeamData(draftTeam, 'Moves')
    },
  ]

  return (
    <div className="flex flex-col items-center mt-8 gap-2">
      {isCommissioner && (
        <div className="w-full">
          <button
            className="btn btn-sm"
            onClick={() => setResultsModalOpen(true)}
          >
            📤 Import
          </button>
        </div>
      )}
      <div className="w-full">
        <Table data={data} columns={columns} xs />
      </div>
      {resultsModalOpen && (
        <ResultsImportModal leagueId={leagueId} onClose={() => setResultsModalOpen(false)} />
      )}
    </div>
  )
}

export default HistoryTab
