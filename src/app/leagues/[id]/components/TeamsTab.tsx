'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { League } from '@prisma/client'
import { useGetTeams, useDeleteTeam, useUserTeam } from '@/hooks/team'
import { useUserLeagues } from '@/hooks/league'
import TeamModal from '@/components/TeamModal'
import Table, { TableColumn } from '@/components/Table'
import Card from '@/components/Card'
import { TeamArgs } from '@/types'
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
  const { team: userTeam } = useUserTeam(league.id as string)
  const { deleteObject: deleteTeam } = useDeleteTeam()
  const { isCommissioner } = useUserLeagues(league.id)
  const [modalOpen, setModalOpen] = useState(false)
  const [editTeam, setEditTeam] = useState<TeamArgs | null>(null)

  const columns: TableColumn<TeamArgs>[] = [
    {
      name: 'Name',
      value: (team) => team.name
    },
    {
      name: 'User(s)',
      renderedValue: (team) => {
        const users = team.teamUsers
          .filter((tu) => Boolean(tu.user))
          .map((tu) => tu.user)
        const inviteEmails = team.teamUsers
          .filter((tu) => !tu.inviteDeclinedAt && !tu.userId)
          .map((tu) => tu.inviteEmail)
        return <>
          {users.map((u) => <div
            key={u.id}
            className="badge cursor-pointer"
          >
            ✅ <Link href={`/users/${u.id}`}>{u.name || u.email}</Link>
          </div>)}
          {inviteEmails.map((e) => <div key={e} className="badge">⚠️ {e}</div>)}
        </>
      }
    },
    {
      renderedValue: ((team) => isCommissioner && <>
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
