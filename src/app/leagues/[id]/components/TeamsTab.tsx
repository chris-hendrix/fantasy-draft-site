'use client'

import { useState } from 'react'
import { League } from '@prisma/client'
import { useGetTeams } from '@/hooks/team'
import TeamModal from '@/components/TeamModal'
import Table, { TableColumn } from '@/components/Table'
import { TeamWithRelationships } from '@/types'

interface Props {
  league: Partial<League>;
}

const TeamsTab: React.FC<Props> = ({ league }) => {
  const { data: teams } = useGetTeams({
    where: { leagueId: league?.id },
    include: { teamUsers: true }
  }, { skip: !league?.id })
  const [modalOpen, setModalOpen] = useState(false)
  const [editTeam, setEditTeam] = useState<TeamWithRelationships | null>(null)

  const columns: TableColumn<TeamWithRelationships>[] = [
    { name: 'Name', value: ((team) => team.name) },
    {
      name: 'Invites',
      value: ((team) => team.teamUsers.map((tu) => tu.inviteEmail).join(','))
    },
    {
      renderedValue: ((team) => <button className="btn btn-square btn-sm" onClick={() => setEditTeam(team)}>✏️</button>)
    }
  ]

  return (
    <div className="flex flex-col items-center mt-8">
      Teams
      <button className="btn btn-primary" onClick={() => setModalOpen(true)}>Add team</button>
      {teams?.length && <Table columns={columns} data={teams} />}
      {modalOpen && <TeamModal league={league} onClose={() => setModalOpen(false)} />}
      {editTeam && <TeamModal league={league} team={editTeam} onClose={() => setEditTeam(null)} />}
    </div>
  )
}

export default TeamsTab
