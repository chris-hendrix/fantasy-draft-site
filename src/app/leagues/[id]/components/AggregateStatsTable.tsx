'use client'

import { useTeams } from '@/hooks/team'
import Table, { TableColumn } from '@/components/Table'
import { Prisma } from '@prisma/client'

const PLAYOFF_TEAMS = 4 // TODO

const AGGREGATE_FIELDS = [
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

interface Props {
  leagueId: string;
  average?: boolean
}

type AggregateRecord = { [key: string]: string | number }

const AggregateStatsTable: React.FC<Props> = ({ leagueId, average }) => {
  const { statDraftTeams } = useTeams(leagueId)

  const teamSeasons: { [key: string]: number } = statDraftTeams
    .reduce((counts, { team: { name } }) => {
      const updatedCounts = { ...counts }
      updatedCounts[name] = (counts[name] || 0) + 1
      return updatedCounts
    }, {} as { [key: string]: number })

  const teamChampionships: { [key: string]: number } = statDraftTeams
    .reduce((counts, { team: { name }, seasonFinish }) => {
      const updatedCounts = { ...counts }
      updatedCounts[name] = (counts[name] || 0) + Number((seasonFinish || 99) === 1)
      return updatedCounts
    }, {} as { [key: string]: number })

  const teamPlayoffs: { [key: string]: number } = statDraftTeams
    .reduce((counts, { team: { name }, seasonFinish }) => {
      const updatedCounts = { ...counts }
      updatedCounts[name] = (counts[name] || 0) + Number((seasonFinish || 99) <= PLAYOFF_TEAMS)
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
    updatedAggData[teamName] = aggData[teamName] || AGGREGATE_FIELDS.reduce((dt, field) => ({
      ...dt, [field.name]: 0
    }), {})

    updatedAggData[teamName].Seasons = seasons
    updatedAggData[teamName].Championships = teamChampionships?.[teamName]
    updatedAggData[teamName].Playoffs = teamPlayoffs?.[teamName]

    AGGREGATE_FIELDS.forEach((field) => {
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

  const getValue = (record: AggregateRecord, columnName: string, isAverage: boolean = false) => {
    const field = AGGREGATE_FIELDS.find((f) => f.name === columnName)
    if (!record?.[columnName]) return ''
    if (!field) return record[columnName]
    const value = Number(record?.[columnName])
    if (field.operation === 'avg') return value.toFixed(3)
    const seasons = Number(record?.Seasons)
    if (isAverage && average) return (value / seasons).toFixed(0)
    return value
  }

  const createColumn = (columnName: string) => ({
    header: columnName,
    value: (record: AggregateRecord) => getValue(record, columnName),
  })
  const data = Object.keys(aggregatedData).map((k) => ({ teamName: k, ...aggregatedData[k] }))
  const averageData = data.map((record) => {
    const newRecord: AggregateRecord = { ...record }
    Object.keys(newRecord).forEach((fieldName) => {
      newRecord[fieldName] = getValue(record, fieldName, true)
    })
    return newRecord
  })

  const columns: TableColumn<AggregateRecord>[] = [
    {
      header: 'Team',
      value: (record) => record?.teamName || '',
    },
    {
      header: 'Seasons',
      value: (record) => record?.Seasons || 0,
    },
    {
      header: 'Ships',
      value: (record) => record?.Championships || 0,
    },
    {
      header: 'Playoffs',
      value: (record) => record?.Playoffs || 0,
    },
    createColumn('Wins'),
    createColumn('Losses'),
    createColumn('Ties'),
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
    createColumn('R'),
    createColumn('HR'),
    createColumn('RBI'),
    createColumn('K'),
    createColumn('W'),
    createColumn('SV'),
    createColumn('ERA'),
    createColumn('WHIP'),
    createColumn('Moves'),
  ]

  return (
    <Table columns={columns} data={average ? averageData : data} xs />
  )
}

export default AggregateStatsTable
