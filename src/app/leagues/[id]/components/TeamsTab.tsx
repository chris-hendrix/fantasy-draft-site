'use client'

import { useState } from 'react'
import { League } from '@prisma/client'
import { useGetTeams, useDeleteTeam } from '@/hooks/team'
import { useUserLeagues } from '@/hooks/league'
import TeamModal from '@/components/TeamModal'
import Table, { TableColumn } from '@/components/Table'
import { TeamWithRelationships } from '@/types'

interface Props {
  league: Partial<League>;
}

const TeamsTab: React.FC<Props> = ({ league }) => {
  const { data: teams, refetch } = useGetTeams({
    where: { leagueId: league?.id },
    include: {
      teamUsers: {
        where: { OR: [{ userId: { not: 'null' } }, { inviteDeclinedAt: { equals: 'null' } }] },
        include: { user: true }
      }
    }
  }, { skip: !league?.id })
  const { deleteObject: deleteTeam } = useDeleteTeam()
  const { isCommissioner } = useUserLeagues(league.id)
  const [modalOpen, setModalOpen] = useState(false)
  const [editTeam, setEditTeam] = useState<TeamWithRelationships | null>(null)

  const columns: TableColumn<TeamWithRelationships>[] = [
    {
      name: 'Name',
      value: (team) => team.name
    },
    {
      name: 'User(s)',
      value: (team) => {
        const userNames = team.teamUsers
          .filter((tu) => Boolean(tu.user))
          .map((tu) => tu.user.name || tu.user.email).join(',')
        if (userNames) return userNames
        const inviteEmails = team.teamUsers.map((tu) => tu.inviteEmail).join(',')
        return `Invited: ${inviteEmails}`
      }
    },
    {
      renderedValue: ((team) => <>
        <button className="btn btn-ghost btn-square btn-sm" onClick={() => setEditTeam(team)}>✏️</button>
        <button className="btn btn-ghost btn-square btn-sm" onClick={() => deleteTeam(team.id)}>🗑️</button>
      </>)
    }
  ]

  return (
    <div className="flex flex-col items-start mt-8">
      {isCommissioner && <button
        className="btn btn-sm mb-2"
        onClick={() => setModalOpen(true)}
      >✉️ Invite team
      </button>}
      {teams?.length > 0 && <Table columns={columns} data={teams} />}
      {modalOpen && <TeamModal
        invite
        league={league}
        onClose={() => {
          setModalOpen(false)
          refetch()
        }} />}
      {editTeam && <TeamModal
        league={league}
        team={editTeam}
        onClose={() => {
          setEditTeam(null)
          refetch()
        }} />}
    </div>
  )
}

export default TeamsTab
