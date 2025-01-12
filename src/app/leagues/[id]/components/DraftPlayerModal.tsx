'use client'

import { PlayerArgs } from '@/types'
import { getPlayerData } from '@/utils/draft'
import Modal from '@/components/Modal'

interface Props {
  player: PlayerArgs;
  onClose: () => void;
  setPlayerToBeDrafted: (player: PlayerArgs) => void;
  goToNextPlayer: () => void;
  goToPreviousPlayer: () => void;
  canDraft: (player: PlayerArgs) => boolean;
}

const DraftPlayerModal: React.FC<Props> = ({
  player,
  onClose,
  setPlayerToBeDrafted,
  goToPreviousPlayer,
  goToNextPlayer,
  canDraft
}) => {
  const PlayerData = ({ dataKey }: { dataKey: string }) => (
    <div className="flex flex-col gap-1">
      <div className="font-bold">{dataKey}</div>
      <div>{getPlayerData(player, dataKey)}</div>
    </div>
  )
  return (
    <Modal title={getPlayerData(player, 'PlayerInfo')} size="sm" onClose={onClose}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center">
          <div className="btn" onClick={goToPreviousPlayer}>
            {'<'}
          </div>
          <div className="flex flex-col gap-4">
            <PlayerData dataKey="Projections" />
            <PlayerData dataKey="Notes" />
          </div>
          <div className="btn" onClick={goToNextPlayer}>
            {'>'}
          </div>
        </div>
        <div className="flex flex gap-2 justify-end">
          {canDraft(player) && (
            <button
              type="button"
              className="btn btn-primary w-24"
              onClick={() => {
                setPlayerToBeDrafted(player)
                onClose()
              }}
            >
              Draft
            </button>
          )}
          <button type="button" className="btn btn-secondary w-24" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default DraftPlayerModal
