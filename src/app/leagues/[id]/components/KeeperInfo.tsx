'use client'

import { usePreviousDraftData } from '@/hooks/draft'
import { getPlayerName, getRound } from '@/utils/draft'

interface Props {
  draftId: string;
}

const KeeperInfo: React.FC<Props> = ({ draftId }) => {
  const { draftPicks, keepers, teamsCount, year, sessionTeam } = usePreviousDraftData(draftId)
  const teamDraftPicks = draftPicks?.filter((dp) => dp.teamId === sessionTeam?.id)
  const teamKeepers = keepers?.filter((k) => k.teamId === sessionTeam?.id)

  if (!draftPicks || !keepers) return null

  return (
    <div className="text-xs flex gap-1">
      <div>
        <h2 className="font-bold">{`${year} Draft`}</h2>
        {teamDraftPicks.map((dp) => (
          <div key={dp.id}>
            {`Rd ${getRound(dp.overall, teamsCount)} - ${getPlayerName(dp.player)}`}
          </div>
        ))}
      </div>
      <div>
        <h2 className="font-bold">{`${year} Keepers`}</h2>
        {teamKeepers.map((k) => (
          <div key={k.id}>
            {`Rd ${k.round} - ${getPlayerName(k.player)}`}
          </div>
        ))}
      </div>
    </div>
  )
}

export default KeeperInfo
