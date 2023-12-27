'use client'

import { useState } from 'react'
import { KeeperArgs } from '@/types'
import Table, { TableColumn } from '@/components/Table'
import { getPlayerName, getPlayerData, formatRoundPick } from '@/utils/draft'
import { useDraftTeams } from '@/hooks/team'
import { useGetKeepers, useUpdateKeeper } from '@/hooks/keeper'
import { useUserDraft } from '@/hooks/draft'
import PlayerAutocomplete from './PlayerAutocomplete'

interface Props {
  draftId: string;
}

const KeepersTable: React.FC<Props> = ({ draftId }) => {
  const { isCommissioner } = useUserDraft(draftId)
  const { teamsCount } = useDraftTeams(draftId)
  const { data: keepers } = useGetKeepers(
    {
      where: { draftId },
      include: { team: true, player: true },
      orderBy: { team: { name: 'asc' } }
    },
    { skip: !draftId }
  )
  const { updateObject: updateKeeper } = useUpdateKeeper()
  const [editPickId, setEditPickId] = useState<string | null>(null)

  const handleSelection = async (
    keeperId: string,
    newPlayerId: string | null
  ) => {
    await updateKeeper({ id: keeperId, playerId: newPlayerId || null })
  }

  const columns: TableColumn<KeeperArgs>[] = [
    { name: 'Team', value: ({ team }) => team?.name },
    {
      name: 'Player',
      value: ({ player }) => player && getPlayerName(player),
      renderedValue: ({ id, player }) => {
        if (!isCommissioner) return player && <div className="">{getPlayerName(player)}</div>
        if (editPickId !== id) {
          return <div
            className="input input-xs input-bordered w-full cursor-pointer bg-base-200"
            onClick={() => setEditPickId(id || null)}
          >
            {player ? getPlayerName(player) : ''}
          </div>
        }
        return draftId && <PlayerAutocomplete
          draftId={draftId}
          onSelection={(newPlayerId) => {
            handleSelection(String(id), newPlayerId)
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
      name: 'ADP',
      value: ({ player }) => (
        player
          ? formatRoundPick(Number(getPlayerData(player, 'ADP')), teamsCount)
          : ''
      )
    },
  ]

  if (!keepers?.length) return null

  return (
    <>
      <Table columns={columns} data={keepers} xs maxItemsPerPage={300} />
    </>
  )
}

export default KeepersTable
