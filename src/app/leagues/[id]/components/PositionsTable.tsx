'use client'

import { useDraft } from '@/hooks/draft'
import { getPlayersByPosition } from '@/utils/draft'

interface Props {
  draftId: string,
  teamId: string,
}

const PositionsTable: React.FC<Props> = ({ draftId, teamId }) => {
  const { draft } = useDraft(draftId)
  const draftPicks = draft?.draftPicks?.filter((dp) => dp.teamId === teamId)
  const players = draftPicks.flatMap((dp) => (dp.player ? [dp.player] : []))

  console.log(getPlayersByPosition(players))

  return (
    <div>
      <div>{draftId}</div>
      <div>{teamId}</div>
    </div>
  )
}

export default PositionsTable
