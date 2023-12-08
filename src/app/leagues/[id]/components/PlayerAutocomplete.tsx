'use client'

import { useGetPlayers } from '@/hooks/player'
import { getPlayerData } from '@/utils/draft'
import Autocomplete from '@/components/Autocomplete'

interface Props {
  leagueId: string;
  year: number;
  onSelection: (playerId: string) => void
  size?: 'xs' | 'sm' | 'md' | 'lg'
}

const PlayerAutocomplete: React.FC<Props> = ({ leagueId, year, onSelection, size = 'sm' }) => {
  const { data: players } = useGetPlayers(
    { where: { leagueId, year } },
    { skip: !leagueId }
  )

  const options = players?.map((player) => ({
    label: getPlayerData(player, 'PlayerInfo'),
    value: player.id
  }))

  return (
    <Autocomplete
      options={options || []}
      onSelection={(option) => onSelection(option?.value as string)}
      size={size}
    />
  )
}

export default PlayerAutocomplete
