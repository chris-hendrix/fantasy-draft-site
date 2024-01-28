import { useState } from 'react'
import { LeagueArgs } from '@/types'
import { formatDate } from '@/utils/date'
import { useLeagueData } from '@/hooks/league'
import LeagueModal from '@/components/LeagueModal'
import Card from '@/components/Card'

interface LeagueCardProps {
  league: Partial<LeagueArgs>
}

const LeagueCard: React.FC<LeagueCardProps> = ({ league }) => {
  const [modalOpen, setModalOpen] = useState(false)
  const { isCommissioner } = useLeagueData()
  const teamCount = league.teams?.filter((t) => !t.archivedAt).length

  const commissionerNames = league?.commissioners?.map((commissioner) => commissioner.user.email).join(', ') || ''

  return (
    <>
      <Card
        header={league.name}
        buttons={isCommissioner && <button
          className="btn btn-square btn-sm btn-ghost"
          onClick={() => setModalOpen(true)}
        >
          ✏️
        </button>
        }
      >
        <p >{`Sport: ${league.sport}`}</p>
        <p >{`Commissioners: ${commissionerNames}`}</p>
        <p >{`Created on ${formatDate(String(league.createdAt))}`}</p>
        {teamCount && <p >{`Active teams: ${teamCount}`}</p>}
      </Card>
      {modalOpen && <LeagueModal league={league} onClose={() => setModalOpen(false)} />}
    </>
  )
}

export default LeagueCard
