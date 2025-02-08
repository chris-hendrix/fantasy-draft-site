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

  const createColumn = (columnName: string, sortOrder: 'desc' | 'asc' = 'desc') => ({
    header: columnName,
    value: (draftTeam: DraftTeamArgs) => getDraftTeamData(draftTeam, columnName),
    renderedValue: (draftTeam: DraftTeamArgs) => renderValue(draftTeam, columnName, sortOrder)
  })

  const columns: TableColumn<DraftTeamArgs>[] = [
    {
      header: 'Year',
      value: ({ draft }) => draft?.year || ''
    },
    {
      header: 'Team',
      value: ({ team }) => team?.name || '',
    },
    createColumn('Rank', 'asc'),
    createColumn('Wins'),
    createColumn('Losses', 'desc'),
    createColumn('Ties'),
    createColumn('Pct'),
    createColumn('AVG'),
    createColumn('R'),
    createColumn('HR'),
    createColumn('RBI'),
    createColumn('SB'),
    createColumn('K'),
    createColumn('W'),
    createColumn('SV'),
    createColumn('ERA', 'asc'),
    createColumn('WHIP', 'asc'),
    createColumn('Moves', 'desc'),
  ]

  return (
    <Table data={statDraftTeams} columns={columns} xs enableSort />
  )
}

export default StatsTable
