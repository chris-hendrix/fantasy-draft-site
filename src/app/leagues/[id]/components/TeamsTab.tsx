'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { League } from '@prisma/client'
import { useGetTeams, useDeleteTeam, useUserTeam } from '@/hooks/team'
import { useLeagueData } from '@/hooks/league'
import TeamModal from '@/components/TeamModal'
import ConfirmModal from '@/components/ConfirmModal'
import Table, { TableColumn } from '@/components/Table'
import Card from '@/components/Card'
import { TeamArgs } from '@/types'
import { formatDate } from '@/utils/date'
import InviteTeamModal from '@/components/InviteTeamModal'

interface Props {
  league: League;
}

const TeamsTab: React.FC<Props> = ({ league }) => {
  const { data: teams, refetch } = useGetTeams({
    where: { leagueId: league?.id },
    include: { teamUsers: { include: { user: true } } },
    orderBy: { name: 'asc' }
  }, { skip: !league?.id })
  const { team: userTeam } = useUserTeam(league.id as string)
  const { deleteObject: deleteTeam } = useDeleteTeam()
  const { isCommissioner } = useLeagueData()
  const [modalOpen, setModalOpen] = useState(false)
  const [teamToDelete, setTeamToDelete] = useState<TeamArgs | null>(null)
  const [teamToEdit, setTeamToEdit] = useState<TeamArgs | null>(null)

  const columns: TableColumn<TeamArgs>[] = [
    {
      header: 'Name',
      value: (team) => team.name
    },
    {
      header: 'User(s)',
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
            ✅&nbsp;<Link href={`/users/${u.id}`}>{u.name || u.email}</Link>
          </div>)}
          {inviteEmails.map((e) => <div key={e} className="badge">⚠️ {e}</div>)}
        </>
      }
    },
    {
      renderedValue: ((team) => isCommissioner && <>
        <button className="btn btn-ghost btn-square btn-sm" onClick={() => setTeamToEdit(team)}>✏️</button>
        <button className="btn btn-ghost btn-square btn-sm" onClick={() => setTeamToDelete(team)}>🗑️</button>
      </>)
    }
  ]

  return (
    <div className="flex flex-col items-start mt-8">
      {userTeam && <>
        <Card
          header={userTeam.name}
          buttons={<button
            className="btn btn-square btn-sm btn-ghost"
            onClick={() => setTeamToEdit(userTeam)}
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
      {modalOpen && (
        <InviteTeamModal
          leagueId={league.id}
          onClose={() => { setModalOpen(false); refetch() }}
        />
      )}
      {teamToEdit && <TeamModal
        league={league}
        team={teamToEdit}
        onClose={() => {
          setTeamToEdit(null)
          refetch()
        }} />}
      {teamToDelete && <ConfirmModal
        onClose={() => setTeamToDelete(null)}
        onConfirm={async () => {
          const res = await deleteTeam(teamToDelete.id)
          if ('error' in res) return
          setTeamToDelete(null)
        }}
      >
        Are you sure you want to delete this team? This cannot be undone.
      </ConfirmModal>}
    </div>
  )
}

export default TeamsTab
