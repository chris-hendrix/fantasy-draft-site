'use client'

import React, { useState } from 'react'
import { useTeams, useUserTeam } from '@/hooks/team'
import { useLeague } from '@/hooks/league'
import TeamModal from '@/app/leagues/[id]/components/TeamModal'
import ConfirmModal from '@/components/ConfirmModal'
import Table, { TableColumn } from '@/components/Table'
import Card from '@/components/Card'
import { TeamArgs } from '@/types'
import { formatDate } from '@/utils/date'
import InviteTeamModal from '@/components/InviteTeamModal'

interface Props {
  leagueId: string;
}

const TeamsTab: React.FC<Props> = ({ leagueId }) => {
  const { teams, deleteTeam, updateTeam, refetch, isLoading } = useTeams(leagueId)
  const { team: userTeam } = useUserTeam(leagueId)
  const { isCommissioner } = useLeague()
  const [modalOpen, setModalOpen] = useState(false)
  const [teamToDelete, setTeamToDelete] = useState<TeamArgs | null>(null)
  const [teamToEdit, setTeamToEdit] = useState<TeamArgs | null>(null)
  const [teamToArchive, setTeamToArchive] = useState<TeamArgs | null>(null)

  const handleArchiveTeam = async () => {
    if (!teamToArchive) return
    const res = await updateTeam({
      id: teamToArchive.id,
      archivedAt: teamToArchive.archivedAt ? null : new Date()
    })
    if ('error' in res) return
    setTeamToArchive(null)
  }

  const handleDeleteTeam = async () => {
    if (!teamToDelete) return
    const res = await deleteTeam(teamToDelete.id)
    if ('error' in res) return
    setTeamToDelete(null)
  }

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
        return <div className="flex gap-4">
          {users.map((u) => (
            <span key={u.id} >
              ✅ {u.name || u.email}
            </span>
          ))}
          {inviteEmails.map((email) => <span key={email}>⚠️ {email}</span>)}
        </div>
      }
    },
    {
      renderedValue: ((team) => isCommissioner && <>
        <button className="btn btn-ghost btn-square btn-sm" onClick={() => setTeamToEdit(team)}>✏️</button>
        <button className="btn btn-ghost btn-square btn-sm" onClick={() => setTeamToArchive(team)}>🗄️</button>
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
      >
        ✉️ Invite team
      </button>}
      <Table
        columns={columns}
        data={teams || []}
        rowStyle={(team: TeamArgs) => (!team?.archivedAt ? {} : {
          className: 'bg-gray-700 italic text-gray-500'
        })}
        isLoading={isLoading}
      />
      {modalOpen && (
        <InviteTeamModal
          leagueId={leagueId}
          onClose={() => { setModalOpen(false); refetch() }}
        />
      )}
      {teamToEdit && (
        <TeamModal
          teamId={teamToEdit.id}
          onClose={() => {
            setTeamToEdit(null)
            refetch()
          }} />
      )}
      {teamToArchive && (
        <ConfirmModal
          onClose={() => setTeamToArchive(null)}
          onConfirm={handleArchiveTeam}
        >
          {`Are you sure you want to ${teamToArchive.archivedAt ? 'unarchive' : 'archive'} ${teamToArchive.name}?`}
        </ConfirmModal>
      )}
      {teamToDelete && (
        <ConfirmModal
          onClose={() => setTeamToDelete(null)}
          onConfirm={handleDeleteTeam}
        >
          Are you sure you want to delete this team? This cannot be undone.
        </ConfirmModal>
      )}
    </div>
  )
}

export default TeamsTab
