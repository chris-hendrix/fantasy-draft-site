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

  const link = getPlayerData(player, 'Link')

  const DraftStatus = () => {
    const draftedByTeamName = player.draftPicks?.[0]?.team?.name
    const draftedRound = getDraftedRound(player)
    if (draftedByTeamName) {
      return (
        <div className="text text-danger text-gray-500">
          Drafted by <b>{draftedByTeamName}</b> in <b>Round {draftedRound}</b>
        </div>
      )
    }
    return (
      <div className="text text-success font-bold">
        Available
      </div>
    )
  }

  return (
    <Modal title={getPlayerData(player, 'PlayerInfo')} size="md" onClose={onClose}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center">
          <div className="btn" onClick={goToPreviousPlayer}>
            {'<'}
          </div>
          <div className="flex flex-col gap-4">
            <PlayerData header="Draft status">
              <DraftStatus />
            </PlayerData>
            <PlayerData header="Projections">
              {getPlayerData(player, 'Projections')}
            </PlayerData>
            <PlayerData header="Notes">
              {getPlayerData(player, 'Notes') || 'No notes available'}
            </PlayerData>
            {link && (
              <a className="link link-primary" href={link} target="_blank" rel="noopener noreferrer">
                Link ↗️
              </a>
            )}
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
          <button type="button" className="btn w-24" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default DraftPlayerModal
