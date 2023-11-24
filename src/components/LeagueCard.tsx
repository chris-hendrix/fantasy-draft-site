import { useState } from 'react'
import { LeagueWithRelationships } from '@/types'
import { formatDate } from '@/utils/date'
import { useUserLeagues } from '@/hooks/league'
import LeagueModal from '@/components/LeagueModal'
import Card from '@/components/Card'

interface LeagueCardProps {
  league: Partial<LeagueWithRelationships>
}

const LeagueCard: React.FC<LeagueCardProps> = ({ league }) => {
  const [modalOpen, setModalOpen] = useState(false)
  const { isCommissioner, teamCount } = useUserLeagues(league.id)

  const commissionerNames = league?.commissioners?.map((commissioner) => commissioner.user.email).join(', ') || ''

  return (
    <>
      <Card
        header={league.name}
        buttons={isCommissioner && <button
          className="btn btn-square btn-sm"
          onClick={() => setModalOpen(true)}
        >
          ✏️
        </button>
        }
      >
        <p >{`Sport: ${league.sport}`}</p>
        <p >{`Commissioners: ${commissionerNames}`}</p>
        <p >{`Created on ${formatDate(String(league.createdAt))}`}</p>
        <p >{`Teams: ${teamCount}`}</p>
      </Card>
      {modalOpen && <LeagueModal league={league} onClose={() => setModalOpen(false)} />}
    </>
  )
}

export default LeagueCard
