'use client'

import { useTeams } from '@/hooks/team'
import Table, { TableColumn } from '@/components/Table'
import { Prisma } from '@prisma/client'
import { getMedal } from '@/utils/draft'
import { getTopValues } from '@/utils/array'

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

type AggregateRecord = { [key: string]: string | number | null }

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

    updatedAggData[teamName].Seasons = seasons || 0
    updatedAggData[teamName].Championships = teamChampionships?.[teamName] || 0
    updatedAggData[teamName].Playoffs = teamPlayoffs?.[teamName] || 0

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
    if (!(columnName in record)) return null
    if (!field) return Number(record[columnName])
    const value = Number(record?.[columnName])
    if (field.operation === 'avg') return value
    const seasons = Number(record?.Seasons)
    if (isAverage && average) return (value / seasons)
    return value
  }

  const totalData = Object.keys(aggregatedData).map((k) => ({ teamName: k, ...aggregatedData[k] }))
  const averageData = totalData.map((record) => {
    const newRecord: AggregateRecord = { ...record }
    Object.keys(newRecord).forEach((fieldName) => {
      const value = newRecord[fieldName]
      newRecord[fieldName] = typeof value === 'number' ? getValue(record, fieldName, true) : value
    })
    return newRecord
  })
  const data = average ? averageData : totalData
  data?.sort((a, b) => (String(a.teamName) < String(b.teamName) ? -1 : 1))

  const formatValue = (value: number | null, columnName: string) => {
    const field = AGGREGATE_FIELDS.find((f) => f.name === columnName)
    if (!field) return value === null ? '' : value.toFixed(0)
    if (field.operation === 'avg') return value?.toFixed(3) || ''
    return value?.toFixed(0) || ''
  }

  const renderValue = (record: AggregateRecord, columnName: string, sortOrder: 'desc' | 'asc' = 'desc') => {
    const topValues = getTopValues<AggregateRecord>(
      data,
      (r: AggregateRecord) => Number(getValue(r, columnName)),
      { sortOrder }
    )

    const value = getValue(record, columnName)
    const position = topValues.findIndex((v) => v === value) + 1
    const medal = value ? getMedal(position) : ''

    return (
      <div
        className="w-full text-center"
      >
        {formatValue(value, columnName)}
        {medal && ` ${medal}`}
      </div>
    )
  }

  const createColumn = (columnName: string, sortOrder: 'desc' | 'asc' = 'desc') => ({
    header: columnName,
    value: (record: AggregateRecord) => getValue(record, columnName),
    renderedValue: (record: AggregateRecord) => renderValue(record, columnName, sortOrder)
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
      ...createColumn('Championships'),
      header: 'Ships',
    },
    {
      ...createColumn('Playoffs'),
    },
    createColumn('Wins'),
    createColumn('Losses'),
    createColumn('Ties'),
    createColumn('Pct'),
    createColumn('R'),
    createColumn('HR'),
    createColumn('RBI'),
    createColumn('K'),
    createColumn('W'),
    createColumn('SV'),
    createColumn('ERA', 'desc'),
    createColumn('WHIP', 'desc'),
    createColumn('Moves'),
  ]

  return (
    <Table columns={columns} data={data} xs />
  )
}

export default AggregateStatsTable
