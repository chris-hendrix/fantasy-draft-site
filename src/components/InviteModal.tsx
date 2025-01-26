import { useInviteTeams, useUpdateTeam, useInvalidateTeams } from '@/hooks/team'
import { useInvalidateLeagues } from '@/hooks/league'
import Modal from '@/components/Modal'
import Table, { TableColumn } from '@/components/Table'
import { TeamArgs } from '@/types'
import { useSessionUser } from '@/hooks/user'

interface FormProps {
  onClose: () => void;
}

const InviteModal: React.FC<FormProps> = ({ onClose }) => {
  const { user } = useSessionUser()
  const { inviteTeams } = useInviteTeams()
  const { updateObject: updateTeam, isLoading } = useUpdateTeam()
  const { invalidateObjects: invalidateTeams } = useInvalidateTeams()
  const { invalidateObjects: invalidateLeagues } = useInvalidateLeagues()

  const handleUpdate = async (team: TeamArgs, decline = false) => {
    if (decline) {
      await updateTeam({ id: team.id, declineEmail: user.email })
    } else {
      await updateTeam({ id: team.id, acceptEmail: user.email })
    }
    invalidateTeams()
    invalidateLeagues()
  }

  const columns: TableColumn<TeamArgs>[] = [
    {
      header: 'League',
      value: ((team) => team.league.name)
    },
    {
      header: 'Team',
      value: ((team) => team.name)
    },
    {
      header: 'Sport',
      value: ((team) => team.league.sport)
    },
    {
      renderedValue: ((team) => <>
        <button
          id="btn-accept-invite"
          className="btn btn-ghost btn-square btn-sm"
          onClick={() => handleUpdate(team)}
          disabled={isLoading}
        >
          ✅
        </button>
        <button
          className="btn btn-ghost btn-square btn-sm"
          onClick={() => handleUpdate(team, true)}
          disabled={isLoading}
        >
          ❌
        </button>
      </>)
    }
  ]

  return (
    <Modal title={'League invites'} onClose={onClose}>
      <Table columns={columns} data={inviteTeams} />
    </Modal>
  )
}

export default InviteModal
