'use client'

import { useState, ReactNode } from 'react'
import { KeeperArgs } from '@/types'
import Table, { TableColumn } from '@/components/Table'
import { getPlayerName } from '@/utils/draft'
import { useDraftData } from '@/hooks/draft'
import { useGetKeepers, useUpdateKeeper } from '@/hooks/keeper'
import PlayerAutocomplete from './PlayerAutocomplete'

interface Props {
  draftId: string;
  teamId?: string;
  edit?: boolean;
  notes?: string | ReactNode;
}

const KeepersTable: React.FC<Props> = ({ draftId, teamId, edit = false, notes }) => {
  const { rounds, isCommissioner } = useDraftData(draftId)
  const { data: keepers } = useGetKeepers(
    {
      where: { draftId, ...(teamId ? { teamId } : {}) },
      include: { team: true, player: true },
      orderBy: [{ team: { name: 'asc' } }, { id: 'asc' }],
      getPreviousPick: true
    },
    { skip: !draftId }
  )
  const { updateObject: updateKeeper } = useUpdateKeeper({ errorMessage: 'Invalid keeper' })
  const [editKeeperId, setEditKeeperId] = useState<string | null>(null)
  const [editRound, setEditRound] = useState<number | null>(null)
  const [editKeeps, setEditKeeps] = useState<number | null>(null)

  const handlePlayerSelection = async (
    keeperId: string,
    newPlayerId: string | null
  ) => {
    await updateKeeper({ id: keeperId, playerId: newPlayerId || null })
  }

  const handleRoundInputBlur = async () => {
    if (!editKeeperId) return
    await updateKeeper({ id: editKeeperId, round: editRound || null, keeps: editKeeps || null })
    setEditKeeperId(null)
    setEditKeeps(null)
    setEditRound(null)
  }

  const columns: TableColumn<KeeperArgs>[] = [
    { header: 'Team', value: ({ team }) => team?.name },
    {
      header: 'Player',
      value: ({ player }) => player && getPlayerName(player),
      renderedValue: ({ id, player }) => {
        if (!edit || !(isCommissioner || teamId)) return player && <div className="">{getPlayerName(player)}</div>
        if (editKeeperId !== id) {
          return <div
            className="input input-xs input-bordered w-full cursor-pointer bg-base-200"
            onClick={() => setEditKeeperId(id || null)}
          >
            {player ? getPlayerName(player) : ''}
          </div>
        }
        return draftId && <PlayerAutocomplete
          draftId={draftId}
          onSelection={(newPlayerId) => {
            handlePlayerSelection(String(id), newPlayerId)
          }}
          size="xs"
          initialId={player?.id}
          excludeIds={keepers
            ?.filter((k) => k.playerId && k.playerId !== player?.id)
            ?.map((k) => k.playerId || '') || []
          }
        />
      },
    },
    {
      header: 'Round',
      value: ({ round }) => round,
      hidden: Boolean(teamId),
      renderedValue: ({ id, round, keeps }) => {
        if (!edit || !isCommissioner) return <>{round}</>
        if (editKeeperId !== id) {
          return (
            <div
              className="input input-xs input-bordered w-full cursor-pointer bg-base-200"
              onClick={() => {
                setEditKeeperId(id || null)
                setEditRound(round)
                setEditKeeps(keeps)
              }}
            >
              {round || ''}
            </div>
          )
        }
        return (
          <input
            type="number"
            className="input input-bordered input-xs w-full text-xs"
            placeholder="Round"
            value={editRound || ''}
            onChange={(e) => setEditRound(Number(e.target.value))}
            onBlur={handleRoundInputBlur}
          />
        )
      }
    },
    {
      header: 'Keeps',
      value: ({ keeps }) => keeps,
      hidden: Boolean(teamId),
      renderedValue: ({ id, keeps, round }) => {
        if (!edit || !isCommissioner) return <>{keeps}</>
        if (editKeeperId !== id) {
          return (
            <div
              className="input input-xs input-bordered w-full cursor-pointer bg-base-200"
              onClick={() => {
                setEditKeeperId(id || null)
                setEditRound(round)
                setEditKeeps(keeps)
              }}
            >
              {keeps || ''}
            </div>
          )
        }
        return (
          <input
            type="number"
            className="input input-bordered input-xs w-full text-xs"
            placeholder="Keeps"
            value={editKeeps || ''}
            onChange={(e) => setEditKeeps(Number(e.target.value))}
            onBlur={handleRoundInputBlur}
          />
        )
      }
    },
    {
      header: 'Previous draft',
      value: ({ previousDraftInfo }) => {
        if (!previousDraftInfo) return ''
        const { draftPick: { team }, round } = previousDraftInfo
        if (!team || !round) return ''
        return `Rd ${round} by ${team?.name}`
      }
    },
  ]

  if (!keepers?.length || !rounds) return null

  return (
    <>
      <Table
        columns={columns}
        data={keepers}
        xs
        maxItemsPerPage={300}
        minHeight="300px"
        notes={notes}
      />
    </>
  )
}

export default KeepersTable
