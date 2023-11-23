'use client'

import { useState } from 'react'
import { League } from '@prisma/client'
import { useGetTeams } from '@/hooks/team'
import TeamModal from '@/components/TeamModal'

interface Props {
  league: Partial<League>;
}

const TeamsTab: React.FC<Props> = ({ league }) => {
  const { data: teams } = useGetTeams({
    where: { leagueId: league?.id },
    include: { teamUsers: true }
  }, { skip: !league?.id })
  const [modalOpen, setModalOpen] = useState(false)

  console.log({ teams })

  return (
    <div className="flex flex-col items-center mt-8">
      Teams
      {teams?.map((team) => <div key={team.id}>{team.name}</div>)}
      <button className="btn btn-primary" onClick={() => setModalOpen(true)}>Add team</button>
      {modalOpen && <TeamModal league={league} setOpen={setModalOpen} />}
    </div>
  )
}

export default TeamsTab
