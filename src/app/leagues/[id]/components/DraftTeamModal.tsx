'use client'

import { PlayerArgs } from '@/types'
import { getPlayersByPosition, getPlayerData, isHitterPlayer, isPitcherPlayer } from '@/utils/draft'
import Table, { TableColumn } from '@/components/Table'
import { useDraftPicks } from '@/hooks/draftPick'
import Modal from '@/components/Modal'

interface Props {
  draftId: string;
  teamId: string;
  onClose: () => void;
  goToNextTeam: () => void;
  goToPreviousTeam: () => void;
}

type PositionRecord = { position: string; players: PlayerArgs[] }

const DraftTeamModal: React.FC<Props> = ({
  draftId,
  teamId,
  onClose,
  goToPreviousTeam,
  goToNextTeam
}) => {
  const { draftPicks } = useDraftPicks(draftId)
  const team = draftPicks?.find((dp) => dp.teamId === teamId)?.team
  const teamPicks = draftPicks?.filter((dp) => dp.teamId === teamId) || []
  const teamPlayers = teamPicks.flatMap((dp) => (dp.player ? [dp.player] : []))
  const positionMap = getPlayersByPosition(teamPlayers)
  const totalPlayers = teamPlayers.length
  const totalHitters = teamPlayers.filter(isHitterPlayer).length
  const totalPitchers = teamPlayers.filter(isPitcherPlayer).length

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
            <div key={player.id} className="badge badge-neutral badge-sm">
              <a
                key={getPlayerData(player, 'Name')}
                className="link"
                href={getPlayerData(player, 'Link')}
                target="_blank"
                rel="noopener noreferrer"
              >
                {getPlayerData(player, 'Name')} ↗️
              </a>
            </div>
          ))}
        </div>
      ),
    },
  ]

  return (
    <Modal title={`${team?.name}`} size="sm" onClose={onClose}>
      < div className="flex flex-col gap-4">
        <div className="flex items-center">
          <div className="btn" onClick={goToPreviousTeam}>
            {'<'}
          </div>
          <div className="flex-grow mx-4">
            <div className="text-neutral-content">
              <Table columns={columns}
                data={data}
                xs
                minHeight={'0px'}
              />
            </div>
            <div className="flex gap-2 text-sm justify-center mt-4">
              <div className="badge badge-primary">Total: {totalPlayers}</div>
              <div className="badge badge-primary">Hitters: {totalHitters}</div>
              <div className="badge badge-primary">Pitchers: {totalPitchers}</div>
            </div>
          </div>
          <div className="btn" onClick={goToNextTeam}>
            {'>'}
          </div>
        </div>
        <div className="flex flex gap-2 justify-end">
          <button type="button" className="btn w-24" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </Modal >
  )
}

export default DraftTeamModal
