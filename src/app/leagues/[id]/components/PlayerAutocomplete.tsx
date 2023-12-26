'use client'

import { useGetPlayers } from '@/hooks/player'
import { getPlayerData } from '@/utils/draft'
import Autocomplete from '@/components/Autocomplete'

interface Props {
  draftId: string;
  onSelection: (playerId: string) => void
  size?: 'xs' | 'sm'
  initialId?: string
  excludeIds?: string[]
}

const PlayerAutocomplete: React.FC<Props> = ({
  draftId,
  onSelection,
  size = 'sm',
  initialId,
  excludeIds = []
}) => {
  const { data: players } = useGetPlayers(
    { where: { draftId } },
    { skip: !draftId }
  )

  const options = players?.filter((p) => !excludeIds.includes(p.id)).map((player) => ({
    label: getPlayerData(player, 'PlayerInfo'),
    value: player.id
  }))

  return (
    <Autocomplete
      options={options || []}
      onSelection={(option) => onSelection(option?.value as string)}
      size={size}
      initialValue={initialId}
    />
  )
}

export default PlayerAutocomplete
