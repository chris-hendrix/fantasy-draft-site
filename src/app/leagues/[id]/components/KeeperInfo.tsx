'use client'

import { useDraft } from '@/hooks/draft'
import { getPlayerName, getRound } from '@/utils/draft'
import { getItemsInEqualColumns } from '@/utils/array'
import { DraftPickArgs } from '@/types'
import ReactMarkdown from 'react-markdown'

interface Props {
  draftId: string;
}

const KeeperInfo: React.FC<Props> = ({ draftId }) => {
  const {
    draft: { draftPicks, keepers, year },
    teamsCount,
    isSessionTeam,
    isLoading: isPreviousDraftLoading
  } = useDraft(draftId, { previousYear: true })
  const { draft: { keeperEntryNote }, isLoading: isDraftLoading } = useDraft(draftId)
  const teamKeepers = keepers?.filter((k) => isSessionTeam(k.teamId))
  const teamDraftPicks = draftPicks?.filter((dp) => isSessionTeam(dp.teamId))
  const teamDraftPickCols = teamDraftPicks &&
    getItemsInEqualColumns<DraftPickArgs>(teamDraftPicks, 3) // 2d array

  const isLoading = isPreviousDraftLoading || isDraftLoading

  if (isLoading) {
    return (
      <div className="skeleton w-full h-[200px]" />
    )
  }

  if (!isLoading && !teamDraftPickCols) return null

  return (
    <div className="text-xs lg:flex gap-3">
      <div className="card flex flex-col items-center bg-base-300 p-4 flex-grow">
        <h2 className="font-bold mb-2">Commissioner Note</h2>
        <div className="w-full whitespace-pre-line">
          <ReactMarkdown>{keeperEntryNote}</ReactMarkdown>
        </div>
      </div>
      <div className="card flex flex-col items-center bg-base-300 p-4">
        <h2 className="font-bold mb-2">{`Your ${year} Keepers`}</h2>
        <div>
          {teamKeepers?.map((k) => (
            <div key={k.id}>
              {`Rd ${k.round} - ${getPlayerName(k.player) || ''} - ${k.keeps} kps`}
            </div>
          ))}
        </div>
      </div>
      <div className="card flex flex-col items-center bg-base-300 p-4">
        <h2 className="font-bold mb-2">Your {`${year} Draft`}</h2>
        <div className="text-xs flex flex-col lg:flex-row gap-2">
          {teamDraftPickCols?.map((col, i) => (
            <div key={`$col-${i}`}>
              {col.map((dp) => (
                <div key={dp.id}>
                  {`Rd ${getRound(dp.overall, teamsCount)} - ${getPlayerName(dp.player) || ''}`}
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
