'use client'

import { usePreviousDraftData, useDraftData } from '@/hooks/draft'
import { getPlayerName, getRound } from '@/utils/draft'
import { getItemsInEqualColumns } from '@/utils/array'
import { DraftPickArgs } from '@/types'
import ReactMarkdown from 'react-markdown'

interface Props {
  draftId: string;
}

const KeeperInfo: React.FC<Props> = ({ draftId }) => {
  const { draftPicks, keepers, teamsCount, year, sessionTeam } = usePreviousDraftData(draftId)
  const { keeperEntryNote } = useDraftData(draftId)
  const teamKeepers = keepers?.filter((k) => k.teamId === sessionTeam?.id)
  const teamDraftPicks = draftPicks?.filter((dp) => dp.teamId === sessionTeam?.id)
  const teamDraftPickCols = teamDraftPicks &&
    getItemsInEqualColumns<DraftPickArgs>(teamDraftPicks, 3) // 2d array

  if (!draftPicks || !keepers) return null

  return (
    <div className="text-xs flex gap-3">
      <div className="card flex flex-col items-center bg-base-200 p-4 flex-grow">
        <h2 className="font-bold mb-2">Commissioner Note</h2>
        <div className="w-full whitespace-pre-line">
          <ReactMarkdown>{keeperEntryNote}</ReactMarkdown>
        </div>
      </div>
      <div className="card flex flex-col items-center bg-base-200 p-4">
        <h2 className="font-bold mb-2">{`${year} Keepers`}</h2>
        <div>
          {teamKeepers.map((k) => (
            <div key={k.id}>
              {`Rd ${k.round} - ${getPlayerName(k.player)}`}
            </div>
          ))}
        </div>
      </div>
      <div className="card flex flex-col items-center bg-base-200 p-4">
        <h2 className="font-bold mb-2">{`${year} Draft`}</h2>
        <div className="text-xs flex gap-2">
          {teamDraftPickCols.map((col, i) => (
            <div key={`$col-${i}`}>
              {col.map((dp) => (
                <div key={dp.id}>
                  {`Rd ${getRound(dp.overall, teamsCount)} - ${getPlayerName(dp.player)}`}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default KeeperInfo
