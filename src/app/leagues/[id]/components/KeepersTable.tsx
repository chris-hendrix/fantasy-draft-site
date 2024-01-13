'use client'

import { useEffect, useState, ReactNode } from 'react'
import { KeeperArgs } from '@/types'
import Table, { TableColumn } from '@/components/Table'
import { getPlayerName } from '@/utils/draft'
import { useDraftData } from '@/hooks/draft'
import { useGetKeepers } from '@/hooks/keeper'
import PlayerAutocomplete from './PlayerAutocomplete'

interface Props {
  draftId: string;
  teamId?: string;
  edit?: boolean;
  notes?: string | ReactNode;
  onKeepersChange: (keepers: KeeperArgs[]) => void
}

const KeepersTable: React.FC<Props> = ({
  draftId, teamId, edit = false, notes, onKeepersChange
}) => {
  const { rounds, isCommissioner, players } = useDraftData(draftId)
  const { data: keepers } = useGetKeepers(
    {
      where: { draftId, ...(teamId ? { teamId } : {}) },
      include: { team: true, player: true },
      orderBy: [{ team: { name: 'asc' } }, { id: 'asc' }],
      getPreviousPick: true
    },
    { skip: !draftId }
  )
  const [editKeepers, setEditKeepers] = useState<KeeperArgs[]>([])
  const [editKeeperId, setEditKeeperId] = useState<string | null>(null)

  useEffect(() => { keepers?.length && setEditKeepers(keepers) }, [keepers])
  useEffect(() => { onKeepersChange(editKeepers) }, [editKeepers])

  const handleEdit = async (
    keeperId: string,
    data: { newPlayerId?: string, newRound?: number, newKeeps?: number }
  ) => {
    const { newPlayerId, newRound, newKeeps } = data
    const newPlayer = players.find((p) => p.id === newPlayerId)
    setEditKeepers((prevKeepers) => prevKeepers.map((keeper) => {
      if (keeper.id === keeperId) {
        return {
          ...keeper,
          ...(newPlayerId !== undefined ? { playerId: newPlayerId || null } : {}),
          ...(newPlayerId !== undefined ? { player: newPlayer || null } : {}),
          ...(newRound !== undefined ? { round: newRound || null } : {}),
          ...(newKeeps !== undefined ? { keeps: newKeeps || null } : {})
        }
      }
      return keeper
    }))
  }

  const handleRoundInputBlur = async () => {
    if (!editKeeperId) return
    setEditKeeperId(null)
  }

  const columns: TableColumn<KeeperArgs>[] = [
    { header: 'Team', value: ({ team }) => team?.name },
    {
      header: 'Player',
      value: ({ player }) => player && getPlayerName(player),
      cellStyle: { maxWidth: '256px', width: '256px', minHeight: '41px' },
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
          onSelection={(playerId) => { handleEdit(String(id), { newPlayerId: playerId }) }}
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
      cellStyle: { maxWidth: '64px', width: '64px' },
      renderedValue: ({ id, round }) => {
        if (!edit || !isCommissioner) return <>{round}</>
        return (
          <input
            type="number"
            className="input input-bordered input-xs w-full text-xs"
            placeholder="Round"
            value={round || ''}
            onChange={(e) => handleEdit(id, { newRound: Number(e.target.value) })}
            onBlur={handleRoundInputBlur}
          />
        )
      }
    },
    {
      header: 'Keeps',
      value: ({ keeps }) => keeps,
      hidden: Boolean(teamId),
      cellStyle: { maxWidth: '64px', width: '64px' },
      renderedValue: ({ id, keeps }) => {
        if (!edit || !isCommissioner) return <>{keeps}</>
        return (
          <input
            type="number"
            className="input input-bordered input-xs w-full text-xs"
            placeholder="Keeps"
            value={keeps || ''}
            onChange={(e) => handleEdit(id, { newKeeps: Number(e.target.value) })}
            onBlur={handleRoundInputBlur}
          />
        )
      }
    },
    {
      header: 'Previous draft',
      value: ({ playerId }) => {
        const { previousDraftInfo } = players?.find((p) => p.id === playerId) || {}
        if (!previousDraftInfo) return ''
        const { draftPick: { team }, round } = previousDraftInfo
        if (!team || !round) return ''
        return `Rd ${round} by ${team?.name}`
      }
    },
  ]

  if (!editKeepers?.length || !rounds) return null

  return (
    <>
      <Table
        columns={columns}
        data={editKeepers}
        xs
        maxItemsPerPage={300}
        minHeight="300px"
        notes={notes}
      />
    </>
  )
}

export default KeepersTable
