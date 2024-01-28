'use client'

import { useDraft } from '@/hooks/draft'
import { PlayerArgs } from '@/types'
import { getPlayersByPosition } from '@/utils/draft'
import Table, { TableColumn } from '@/components/Table'

interface Props {
  draftId: string,
  teamId: string,
}

type PositionRecord = { position: string, players: PlayerArgs[] }

const PositionsTable: React.FC<Props> = ({ draftId, teamId }) => {
  const { draft } = useDraft(draftId)
  const team = draft?.draftTeams.find((dt) => dt.teamId === teamId)?.team
  const draftPicks = draft?.draftPicks?.filter((dp) => dp.teamId === teamId) || []
  const teamPlayers = draftPicks.flatMap((dp) => (dp.player ? [dp.player] : []))
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
    <div>
      {team && (
        <label className="text-xs w-fit p-0.5" >
          {team.name}
        </label>
      )}
      <Table columns={columns} data={data} xs minHeight={'0px'} />
    </div>
  )
}

export default PositionsTable
