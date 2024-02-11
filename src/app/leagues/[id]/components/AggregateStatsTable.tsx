'use client'

import { useTeams } from '@/hooks/team'
import Table, { TableColumn } from '@/components/Table'
import { Prisma } from '@prisma/client'

interface Props {
  leagueId: string;
}

type AggregateRecord = { [key: string]: string | number }

const AggregateStatsTable: React.FC<Props> = ({ leagueId }) => {
  const { statDraftTeams } = useTeams(leagueId)

  const teamSeasons: { [key: string]: number } = statDraftTeams
    .reduce((counts, { team: { name } }) => {
      const updatedCounts = { ...counts }
      updatedCounts[name] = (counts[name] || 0) + 1
      return updatedCounts
    }, {} as { [key: string]: number })

  type AggregatedData = {
    [key: string]: {
      [key: string]: number;
    };
  }

  const aggregatedData: AggregatedData = statDraftTeams?.reduce((aggData: AggregatedData, obj) => {
    if (!statDraftTeams?.length) return {}
    const teamName = obj.team.name
    const seasons = teamSeasons[teamName]
    const updatedAggData = { ...aggData }

    // Add numeric fields from seasonData
    const numericFields = [
      { name: 'K', operation: 'sum' },
      { name: 'R', operation: 'sum' },
      { name: 'W', operation: 'sum' },
      { name: 'GB', operation: 'sum' },
      { name: 'HR', operation: 'sum' },
      { name: 'SB', operation: 'sum' },
      { name: 'SV', operation: 'sum' },
      { name: 'AVG', operation: 'avg' },
      { name: 'ERA', operation: 'avg' },
      { name: 'Pct', operation: 'avg' },
      { name: 'RBI', operation: 'sum' },
      { name: 'WHIP', operation: 'avg' },
      { name: 'Wins', operation: 'sum' },
      { name: 'Moves', operation: 'sum' },
      { name: 'Losses', operation: 'sum' },
      { name: 'Ties', operation: 'sum' },
      { name: 'RegRank', operation: 'sum' }
    ]

    updatedAggData[teamName] = aggData[teamName] || numericFields.reduce((dt, field) => ({
      ...dt, [field.name]: 0
    }), {})

    updatedAggData[teamName].Seasons = seasons

    numericFields.forEach((field) => {
      const seasonData = obj?.seasonData as Prisma.JsonObject
      if (typeof seasonData?.[field.name] === 'number') {
        const value = updatedAggData[teamName][field.name]
        if (field.operation === 'sum') {
          updatedAggData[teamName][field.name] = value + Number(seasonData?.[field.name])
        } else if (field.operation === 'avg' && seasons > 0) {
          updatedAggData[teamName][field.name] = value +
            Number(seasonData?.[field.name]) / seasons
        }
      }
    })

    return updatedAggData
  }, {})

  console.log(aggregatedData)

  const data = Object.keys(aggregatedData).map((k) => ({ teamName: k, ...aggregatedData[k] }))

  const columns: TableColumn<AggregateRecord>[] = [
    {
      header: 'Team',
      value: (record) => record?.teamName || '',
    },
    {
      header: 'Seasons',
      value: (record) => record?.Seasons || '',
    },
    {
      header: 'Wins',
      value: (record) => record?.Wins
    },
    {
      header: 'Losses',
      value: (record) => record?.Losses
    },
    {
      header: 'Ties',
      value: (record) => record?.Ties
    },
    {
      header: 'Pct',
      value: (record) => {
        const wins = Number(record?.Wins)
        const losses = Number(record?.Losses)
        const ties = Number(record?.Ties)
        const total = wins + losses + ties
        if (total === 0) return ''
        return Number((wins + 0.5 * ties) / total).toFixed(3)
      }
    },
    {
      header: 'AVG',
      value: (record) => Number(record?.AVG || 0).toFixed(3)
    },
    {
      header: 'R',
      value: (record) => record?.R
    },
    {
      header: 'HR',
      value: (record) => record?.HR
    },
    {
      header: 'RBI',
      value: (record) => record?.RBI
    },
    {
      header: 'K',
      value: (record) => record?.K
    },
    {
      header: 'W',
      value: (record) => record?.W
    },
    {
      header: 'SV',
      value: (record) => record?.SV
    },
    {
      header: 'ERA',
      value: (record) => Number(record?.ERA || 0).toFixed(3)
    },
    {
      header: 'WHIP',
      value: (record) => Number(record?.WHIP || 0).toFixed(3)
    },
    {
      header: 'Moves',
      value: (record) => record?.Moves
    },
  ]

  return (
    <Table columns={columns} data={data} xs />
  )
}

export default AggregateStatsTable
