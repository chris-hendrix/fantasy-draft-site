'use client'

import { League } from '@prisma/client'
import { useGetTeams, useAddTeam } from '@/hooks/team'

interface Props {
  league: Partial<League>;
}

const TeamsTab: React.FC<Props> = ({ league }) => {
  const { data: teams } = useGetTeams({ where: { leagueId: league?.id } }, { skip: !league?.id })
  const { addObject: addTeam } = useAddTeam()

  const handleAddTeam = async () => {
    await addTeam({ leagueId: league.id, name: 'test' })
  }

  return (
    <div className="flex flex-col items-center mt-8">
      Teams
      {teams?.map((team) => <div key={team.id}>{team.name}</div>)}
      <button className="btn btn-primary" onClick={handleAddTeam}>Add team</button>
    </div>
  )
}

export default TeamsTab
