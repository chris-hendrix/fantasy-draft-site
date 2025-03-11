'use client'

import { PlayerArgs } from '@/types'
import { getPlayerData } from '@/utils/draft'
import Modal from '@/components/Modal'
import { useDraftPicks } from '@/hooks/draftPick'
import React from 'react'
import Image from 'next/image'

interface Props {
  player: PlayerArgs;
  onClose: () => void;
  setPlayerToBeDrafted?: (player: PlayerArgs) => void;
  goToNextPlayer?: () => void;
  goToPreviousPlayer?: () => void;
}

const PlayerData = ({
  header,
  children
}: {
  header: React.ReactNode,
  children: React.ReactNode
}) => (
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
  const photoUrl = getPlayerData(player, 'PhotoURL')

  const DraftStatus = () => {
    const draftedByTeamName = player.draftPicks?.[0]?.team?.name
    const draftedRound = getDraftedRound(player)
    if (draftedRound && !draftedByTeamName) {
      return (
        <div className="text text-gray-500">
          Drafted in <b>Round {draftedRound}</b>
        </div>
      )
    }
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

  const PlayerHeader = () => (
    <div className="flex justify-between bg-gray-700 p-4 rounded-lg items-center">
      <div className="flex flex-col gap-4">
        <PlayerData header={(
          <div className="flex items-center gap-2">
            {/* TODO save button */}
            {getPlayerData(player, 'PlayerInfo')}
          </div>
        )}>
          <DraftStatus />
        </PlayerData>
      </div>
      {photoUrl && (
        <div className="avatar">
          <div className="relative rounded-full w-16 h-16 bg-neutral-content">
            <Image
              src={photoUrl}
              alt={photoUrl}
              fill
            />
          </div>
        </div>
      )}
    </div>

  )

  return (
    <Modal title={getPlayerData(player, 'PlayerInfo')} size="md" onClose={onClose}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          {goToPreviousPlayer && (
            <div className="btn btn-primary" onClick={goToPreviousPlayer}>
              {'<'}
            </div>
          )}
          <div className="flex flex-col gap-4">
            <PlayerHeader />
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
          {goToNextPlayer && (
            <div className="btn btn-primary" onClick={goToNextPlayer}>
              {'>'}
            </div>
          )}
        </div>
        <div className="flex flex gap-2 justify-end">
          {setPlayerToBeDrafted && canDraft(player) && (
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
