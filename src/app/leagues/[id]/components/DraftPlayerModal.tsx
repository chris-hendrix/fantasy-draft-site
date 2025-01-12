'use client'

import { PlayerArgs } from '@/types'
import { getPlayerData } from '@/utils/draft'
import Modal from '@/components/Modal'
import { useDraftPicks } from '@/hooks/draftPick'
import React from 'react'

interface Props {
  player: PlayerArgs;
  onClose: () => void;
  setPlayerToBeDrafted: (player: PlayerArgs) => void;
  goToNextPlayer: () => void;
  goToPreviousPlayer: () => void;
}

const PlayerData = ({ header, children }: { header: string, children: React.ReactNode }) => (
  <div className="flex flex-col gap-1">
    <div className="font-bold">{header}</div>
    <div>{children}</div>
  </div>
)

const DraftPlayerModal: React.FC<Props> = ({
  player,
  onClose,
  setPlayerToBeDrafted,
  goToPreviousPlayer,
  goToNextPlayer,
}) => {
  const { canDraft, getDraftedRound } = useDraftPicks(player.draftId)
  const draftedByTeamName = player.draftPicks?.[0]?.team?.name
  const draftedRound = getDraftedRound(player)

  return (
    <Modal title={getPlayerData(player, 'PlayerInfo')} size="sm" onClose={onClose}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center">
          <div className="btn" onClick={goToPreviousPlayer}>
            {'<'}
          </div>
          <div className="flex flex-col gap-4">
            <PlayerData header="Draft status">
              {draftedByTeamName ? `Drafted by ${draftedByTeamName} in round ${draftedRound}` : 'Available'}
            </PlayerData>
            <PlayerData header="Projections">
              {getPlayerData(player, 'Projections')}
            </PlayerData>
            <PlayerData header="Notes">
              {getPlayerData(player, 'Notes')}
            </PlayerData>
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
