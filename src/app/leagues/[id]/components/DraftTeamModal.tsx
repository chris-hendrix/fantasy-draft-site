'use client'

import { PlayerArgs } from '@/types'
import { getPlayersByPosition, getPlayerData } from '@/utils/draft'
import Table, { TableColumn } from '@/components/Table'
import { useDraftPicks } from '@/hooks/draftPick'
import Modal from '@/components/Modal'

interface Props {
  draftId: string;
  teamId: string;
  onClose: () => void;
}

type PositionRecord = { position: string; players: PlayerArgs[] }

const DraftTeamModal: React.FC<Props> = ({ draftId, teamId, onClose }) => {
  const { draftPicks } = useDraftPicks(draftId)
  const team = draftPicks?.find((dp) => dp.teamId === teamId)?.team
  const teamPicks = draftPicks?.filter((dp) => dp.teamId === teamId) || []
  const teamPlayers = teamPicks.flatMap((dp) => (dp.player ? [dp.player] : []))
  const positionMap = getPlayersByPosition(teamPlayers)

  const data = Object.keys(positionMap).map((position) => ({
    position,
    players: positionMap[position],
  }))

  const columns: TableColumn<PositionRecord>[] = [
    {
      header: 'Pos',
      value: ({ position }) => position,
    },
    {
      header: 'Picks',
      renderedValue: ({ players }) => (
        <div className="flex flex-wrap gap-1 py-1">
          {players.map((player) => (
            <div key={player.id} className="badge badge-primary badge-sm">
              <a
                key={getPlayerData(player, 'Name')}
                className="link"
                href={getPlayerData(player, 'Link')}
                target="_blank"
                rel="noopener noreferrer"
              >
                {getPlayerData(player, 'Name')}
              </a>
            </div>
          ))}
        </div>
      ),
    },
  ]

  return (
    <Modal title={`${team?.name} players`} size="sm" onClose={onClose}>
      <div className="text-neutral-content">
        <Table columns={columns}
          data={data}
          xs
          minHeight={'0px'}
        />
      </div>
    </Modal>
  )
}

export default DraftTeamModal
