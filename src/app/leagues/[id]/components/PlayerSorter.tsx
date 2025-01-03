'use client'

import { useState, useEffect } from 'react'
import { PlayerArgs } from '@/types'
import { isHitterPlayer, isPitcherPlayer } from '@/utils/draft'

export type PlayerSortOption = {
  key: string,
  order: 'asc' | 'desc',
  filter?: (player: PlayerArgs) => boolean
}

interface Props {
  onSortChange: (sortOptions: PlayerSortOption | null) => void
}

const stats: PlayerSortOption[] = [
  { key: 'Rank', order: 'asc' },
  { key: 'ADP', order: 'asc' },
  { key: 'AVG', order: 'desc', filter: isHitterPlayer },
  { key: 'R', order: 'desc', filter: isHitterPlayer },
  { key: 'HR', order: 'desc', filter: isHitterPlayer },
  { key: 'RBI', order: 'desc', filter: isHitterPlayer },
  { key: 'SB', order: 'desc', filter: isHitterPlayer },
  { key: 'W', order: 'desc', filter: isPitcherPlayer },
  { key: 'SV', order: 'desc', filter: isPitcherPlayer },
  { key: 'K9', order: 'desc', filter: isPitcherPlayer },
  { key: 'ERA', order: 'asc', filter: isPitcherPlayer },
  { key: 'WHIP', order: 'asc', filter: isPitcherPlayer }
]

const PlayerSorter: React.FC<Props> = ({ onSortChange }) => {
  const [sortOption, setSortOption] = useState<PlayerSortOption | null>(null)

  useEffect(() => { onSortChange(sortOption) }, [sortOption?.key])

  const StatSelect = () => (
    <select
      className="select select-bordered select-xs"
      value={sortOption?.key || ''}
      onChange={(e) => {
        const key = e.target.value
        const option = stats.find((stat) => stat.key === key) || null
        setSortOption(option)
      }}
    >
      <option value="">None</option>
      {stats.map((stat) => (
        <option key={stat.key} value={stat.key}>
          {`${stat.key}${stat.order === 'asc' ? ' ↑' : ' ↓'}`}
        </option>
      ))}
    </select>
  )

  return (
    <div className="p-1">
      <label className="text-xs w-fit">
        Sort
      </label>
      <div className="w-full p-1 flex gap-1">
        <StatSelect />
      </div>
    </div>
  )
}

export default PlayerSorter
