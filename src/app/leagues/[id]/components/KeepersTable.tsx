'use client'

import { useState, ChangeEvent } from 'react'
import { KeeperArgs } from '@/types'
import Table, { TableColumn } from '@/components/Table'
import { getPlayerName, getPlayerData, formatRoundPick } from '@/utils/draft'
import { useDraftData } from '@/hooks/draft'
import { useGetKeepers, useUpdateKeeper, useCalculatePreviousKeeper } from '@/hooks/keeper'
import PlayerAutocomplete from './PlayerAutocomplete'

interface Props {
  draftId: string;
  teamId?: string;
  edit?: boolean
}

const KeepersTable: React.FC<Props> = ({ draftId, teamId, edit = false }) => {
  const { teamsCount, rounds, isCommissioner } = useDraftData(draftId)
  const { data: keepers } = useGetKeepers(
    {
      where: { draftId, ...(teamId ? { teamId } : {}) },
      include: { team: true, player: true },
      orderBy: [{ team: { name: 'asc' } }, { id: 'asc' }]
    },
    { skip: !draftId }
  )
  const { updateObject: updateKeeper } = useUpdateKeeper()
  const { calculatePreviousKeeper } = useCalculatePreviousKeeper(draftId)
  const [editKeeperId, setEditKeeperId] = useState<string | null>(null)

  const handlePlayerSelection = async (
    keeperId: string,
    newPlayerId: string | null
  ) => {
    await updateKeeper({ id: keeperId, playerId: newPlayerId || null })
  }

  const handleRoundSelection = async (
    keeperId: string,
    newRound: number | null
  ) => {
    await updateKeeper({ id: keeperId, round: newRound || null })
  }

  const columns: TableColumn<KeeperArgs>[] = [
    { header: 'Team', value: ({ team }) => team?.name },
    {
      header: 'Player',
      value: ({ player }) => player && getPlayerName(player),
      renderedValue: ({ id, player }) => {
        if (!edit || !isCommissioner) return player && <div className="">{getPlayerName(player)}</div>
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
      renderedValue: ({ id, round }) => {
        if (!edit || !isCommissioner) return <>{round}</>
        if (editKeeperId !== id) {
          return <div
            className="input input-xs input-bordered w-full cursor-pointer bg-base-200"
            onClick={() => setEditKeeperId(id || null)}
          >
            {round || ''}
          </div>
        }
        return (
          <select
            className="select select-bordered select-xs w-full"
            value={round || ''}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => (
              handleRoundSelection(id, parseInt(e.target.value, 10))
            )}
          >
            <option disabled value="">
              Round
            </option>
            {Array.from({ length: rounds }).map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </select>
        )
      }
    },
    {
      header: (
        <>
          <span>Previous draft</span>
          <div
            className="tooltip tooltip-bottom text-xs max-w-[100px]"
            data-tip="Not guaranteed to be accurate"
            style={{ cursor: 'pointer' }}
          >
            <span className="indicator-item badge badge-xs badge-primary ml-1">i</span>
          </div>
        </>
      ),
      value: ({ player }) => {
        if (!player) return ''
        const { team, round } = calculatePreviousKeeper(player.name)
        return `Rd ${round} by ${team?.name}`
      }
    },
    {
      header: 'ADP',
      value: ({ player }) => (
        player
          ? formatRoundPick(Number(getPlayerData(player, 'ADP')), teamsCount)
          : ''
      )
    },
  ]

  if (!keepers?.length || !rounds) return null

  return (
    <>
      <Table columns={columns} data={keepers} xs maxItemsPerPage={300} minHeight="400px" />
    </>
  )
}

export default KeepersTable
