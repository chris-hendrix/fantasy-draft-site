'use client'

import { useTeams } from '@/hooks/team'
import Table, { TableColumn } from '@/components/Table'
import { DraftTeamArgs } from '@/types'
import { getDraftTeamData, getMedal } from '@/utils/draft'

interface Props {
  leagueId: string;
}

const StatsTable: React.FC<Props> = ({ leagueId }) => {
  const { statDraftTeams } = useTeams(leagueId)

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
          {getMedal(seasonFinish)}
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
    <Table data={statDraftTeams} columns={columns} xs />
  )
}

export default StatsTable
