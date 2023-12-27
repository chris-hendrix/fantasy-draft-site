'use client'

import { useState, ChangeEvent } from 'react'
import { KeeperArgs } from '@/types'
import Table, { TableColumn } from '@/components/Table'
import { getPlayerName, getPlayerData, formatRoundPick } from '@/utils/draft'
import { useDraftData, useUserDraft } from '@/hooks/draft'
import { useGetKeepers, useUpdateKeeper, useCalculateKeeperRound } from '@/hooks/keeper'
import PlayerAutocomplete from './PlayerAutocomplete'

interface Props {
  draftId: string;
}

const KeepersTable: React.FC<Props> = ({ draftId }) => {
  const { isCommissioner } = useUserDraft(draftId)
  const { teamsCount, rounds } = useDraftData(draftId)
  const { data: keepers } = useGetKeepers(
    {
      where: { draftId },
      include: { team: true, player: true },
      orderBy: [{ team: { name: 'asc' } }, { id: 'asc' }]
    },
    { skip: !draftId }
  )
  const { updateObject: updateKeeper } = useUpdateKeeper()
  const { calculateKeeperRound } = useCalculateKeeperRound(draftId)
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
    { name: 'Team', value: ({ team }) => team?.name },
    {
      name: 'Player',
      value: ({ player }) => player && getPlayerName(player),
      renderedValue: ({ id, player }) => {
        if (!isCommissioner) return player && <div className="">{getPlayerName(player)}</div>
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
      name: 'Round',
      value: ({ round }) => round,
      renderedValue: ({ id, round }) => {
        if (!isCommissioner) return <>{round}</>
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
      name: 'Calculated round',
      value: ({ player }) => (
        player
          ? calculateKeeperRound(player.name)
          : ''
      )
    },
    {
      name: 'ADP',
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
      <Table columns={columns} data={keepers} xs maxItemsPerPage={300} />
    </>
  )
}

export default KeepersTable
