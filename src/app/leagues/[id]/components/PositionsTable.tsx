'use client'

import { PlayerArgs } from '@/types'
import { getPlayersByPosition } from '@/utils/draft'
import Table, { TableColumn } from '@/components/Table'
import { useDraftPicks } from '@/hooks/draftPick'

interface Props {
  draftId: string,
  teamId: string,
}

type PositionRecord = { position: string, players: PlayerArgs[] }

const PositionsTable: React.FC<Props> = ({ draftId, teamId }) => {
  const { draft: { draftPicks } } = useDraftPicks(draftId)
  const teamPicks = draftPicks?.filter((dp) => dp.teamId === teamId) || []
  const teamPlayers = teamPicks.flatMap((dp) => (dp.player ? [dp.player] : []))
  const positionMap = getPlayersByPosition(teamPlayers)

  const data = Object.keys(positionMap).map((position) => ({
    position,
    players: positionMap[position]
  }))

  const columns: TableColumn<PositionRecord>[] = [
    {
      header: 'Pos',
      value: ({ position }) => position
    },
    {
      header: 'Picks',
      renderedValue: ({ players }) => (
        <>
          {players.map((player) => (
            <div key={player.id} className="badge badge-xs badge-primary" />
          ))}
        </>
      )
    }
  ]

  return (
    <div className="text-neutral-content">
      <Table columns={columns} data={data} xs minHeight={'0px'} />
    </div>
  )
}

export default PositionsTable
