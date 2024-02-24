import { useState } from 'react'
import { DraftArgs, DraftTeamArgs } from '@/types'
import { formatDatetime } from '@/utils/date'
import { useLeague } from '@/hooks/league'
import Card from '@/components/Card'
import { getDraftTeamData, getMedal } from '@/utils/draft'
import DraftModal from './DraftModal'

interface Props {
  draft: DraftArgs
}

const DraftCard: React.FC<Props> = ({ draft }) => {
  const { rounds, draftTeams, draftTime } = draft
  const [modalOpen, setModalOpen] = useState(false)
  const { isCommissioner } = useLeague()
  const hasFutureDraftTime = draftTime && new Date(draftTime) > new Date()
  const teamCount = draftTeams?.length

  const renderWinners = () => {
    const renderDraftTeam = (draftTeam: DraftTeamArgs) => {
      const wins = getDraftTeamData(draftTeam, 'Wins')
      const losses = getDraftTeamData(draftTeam, 'Losses')
      const ties = getDraftTeamData(draftTeam, 'Ties')
      return (
        <div key={draftTeam.id}>
          {getMedal(draftTeam.seasonFinish)} {draftTeam.team.name}
          <span className="italic text-xs ml-2 text-gray-500">{`(${wins} - ${losses} - ${ties})`}</span>
        </div>
      )
    }
    const winners = draftTeams
      .filter((dt) => dt.seasonFinish && dt.seasonFinish <= 3)
      .sort((a, b) => ((a.seasonFinish || 0) < (b.seasonFinish || 0) ? -1 : 1))
    return (
      <>{winners.map((dt) => renderDraftTeam(dt))}</>
    )
  }

  return (
    <>
      <Card
        header={draft.year}
        buttons={isCommissioner && <button
          className="btn btn-square btn-sm btn-ghost"
          onClick={() => setModalOpen(true)}
        >
          ✏️
        </button>
        }
      >
        <div className="flex gap-3">
          <div className="w-48">
            {teamCount && <p>{`Teams: ${teamCount}`}</p>}
            {rounds && <p>{`Rounds: ${teamCount}`}</p>}
          </div>
          <div>
            {hasFutureDraftTime && <p>{`Draft time: ${formatDatetime(draftTime)}`}</p>}
            {renderWinners()}
          </div>
        </div>
      </Card >
      {modalOpen && <DraftModal draftId={draft.id} onClose={() => setModalOpen(false)} />
      }
    </>
  )
}

export default DraftCard
