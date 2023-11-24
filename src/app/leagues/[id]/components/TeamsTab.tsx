'use client'

import React, { useState } from 'react'
import { League } from '@prisma/client'
import { useGetTeams, useDeleteTeam } from '@/hooks/team'
import { useUserLeagues } from '@/hooks/league'
import TeamModal from '@/components/TeamModal'
import Table, { TableColumn } from '@/components/Table'
import Card from '@/components/Card'
import { TeamWithRelationships } from '@/types'
import { formatDate } from '@/utils/date'

interface Props {
  league: Partial<League>;
}

const TeamsTab: React.FC<Props> = ({ league }) => {
  const { data: teams, refetch } = useGetTeams({
    where: { leagueId: league?.id },
    include: { teamUsers: { include: { user: true } } },
    orderBy: { name: 'asc' }
  }, { skip: !league?.id })
  const { deleteObject: deleteTeam } = useDeleteTeam()
  const { isCommissioner, team: userTeam } = useUserLeagues(league.id) // TODO userTeam
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
          .map((tu) => `✅ ${tu.user.name || tu.user.email}`)
        const inviteEmails = team.teamUsers
          .filter((tu) => !tu.inviteDeclinedAt && !tu.userId)
          .map((tu) => `⚠️ ${tu.inviteEmail}`)
        return [...userNames, ...inviteEmails].join(', ')
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
      {userTeam && <>
        <Card
          header={userTeam.name}
          buttons={<button
            className="btn btn-square btn-sm"
            onClick={() => setEditTeam(userTeam)}
          >✏️
          </button>}
        >
          <p >{`Created on ${formatDate(String(userTeam.createdAt))}`}</p>
        </Card>
        <div className="divider" />
      </>}
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
