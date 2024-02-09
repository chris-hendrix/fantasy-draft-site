'use client'

import { useTeams } from '@/hooks/team'
import Table, { TableColumn } from '@/components/Table'
import { DraftTeamArgs } from '@/types'
import { getDraftTeamData, getMedal } from '@/utils/draft'
import { getTopValues } from '@/utils/array'

interface Props {
  leagueId: string;
}

const StatsTable: React.FC<Props> = ({ leagueId }) => {
  const { statDraftTeams } = useTeams(leagueId)

  const renderValue = (draftTeam: DraftTeamArgs, columnName: string, sortOrder: 'desc' | 'asc' = 'desc') => {
    const topValues = getTopValues<DraftTeamArgs>(
      statDraftTeams,
      (dt: DraftTeamArgs) => getDraftTeamData(dt, columnName),
      { sortOrder }
    )
    const value = getDraftTeamData(draftTeam, columnName)
    const position = topValues.findIndex((v) => v === value) + 1
    const medal = getMedal(position)

    return (
      <div
        className="w-full text-center"
      >
        {value}
        {medal && ` ${medal}`}
      </div>
    )
  }

  const columns: TableColumn<DraftTeamArgs>[] = [
    {
      header: 'Year',
      value: ({ draft }) => draft?.year || ''
    },
    {
      header: 'Team',
      value: ({ team }) => team?.name || '',
    },
    {
      header: 'Finish',
      value: (draftTeam) => getDraftTeamData(draftTeam, 'Rank'),
      renderedValue: (draftTeam) => renderValue(draftTeam, 'Rank', 'asc')
    },
    {
      header: 'Wins',
      value: (draftTeam) => getDraftTeamData(draftTeam, 'Wins'),
      renderedValue: (draftTeam) => renderValue(draftTeam, 'Wins')
    },
    {
      header: 'Losses',
      value: (draftTeam) => getDraftTeamData(draftTeam, 'Losses'),
      renderedValue: (draftTeam) => renderValue(draftTeam, 'Losses', 'desc')
    },
    {
      header: 'Ties',
      value: (draftTeam) => getDraftTeamData(draftTeam, 'Ties'),
      renderedValue: (draftTeam) => renderValue(draftTeam, 'Ties')
    },
    {
      header: 'Pct',
      value: (draftTeam) => getDraftTeamData(draftTeam, 'Pct'),
      renderedValue: (draftTeam) => renderValue(draftTeam, 'Pct')
    },
    {
      header: 'AVG',
      value: (draftTeam) => getDraftTeamData(draftTeam, 'AVG'),
      renderedValue: (draftTeam) => renderValue(draftTeam, 'AVG'),
    },
    {
      header: 'R',
      value: (draftTeam) => getDraftTeamData(draftTeam, 'R'),
      renderedValue: (draftTeam) => renderValue(draftTeam, 'R')
    },
    {
      header: 'HR',
      value: (draftTeam) => getDraftTeamData(draftTeam, 'HR'),
      renderedValue: (draftTeam) => renderValue(draftTeam, 'HR'),
    },
    {
      header: 'RBI',
      value: (draftTeam) => getDraftTeamData(draftTeam, 'RBI'),
      renderedValue: (draftTeam) => renderValue(draftTeam, 'RBI'),
    },
    {
      header: 'SB',
      value: (draftTeam) => getDraftTeamData(draftTeam, 'SB'),
      renderedValue: (draftTeam) => renderValue(draftTeam, 'SB'),
    },
    {
      header: 'K',
      value: (draftTeam) => getDraftTeamData(draftTeam, 'K'),
      renderedValue: (draftTeam) => renderValue(draftTeam, 'K'),
    },
    {
      header: 'W',
      value: (draftTeam) => getDraftTeamData(draftTeam, 'W'),
      renderedValue: (draftTeam) => renderValue(draftTeam, 'W'),
    },
    {
      header: 'SV',
      value: (draftTeam) => getDraftTeamData(draftTeam, 'SV'),
      renderedValue: (draftTeam) => renderValue(draftTeam, 'SV'),
    },
    {
      header: 'ERA',
      value: (draftTeam) => getDraftTeamData(draftTeam, 'ERA'),
      renderedValue: (draftTeam) => renderValue(draftTeam, 'ERA', 'asc'),
    },
    {
      header: 'WHIP',
      value: (draftTeam) => getDraftTeamData(draftTeam, 'WHIP'),
      renderedValue: (draftTeam) => renderValue(draftTeam, 'WHIP', 'asc'),
    },
    {
      header: 'Moves',
      value: (draftTeam) => getDraftTeamData(draftTeam, 'Moves'),
      renderedValue: (draftTeam) => renderValue(draftTeam, 'Moves', 'desc'),
    },
  ]

  return (
    <Table data={statDraftTeams} columns={columns} xs />
  )
}

export default StatsTable
