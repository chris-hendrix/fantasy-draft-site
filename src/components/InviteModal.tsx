import { useInviteTeams, useUpdateTeam } from '@/hooks/team'
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
  const { updateObject: updateTeam } = useUpdateTeam()

  const handleUpdate = async (team: TeamArgs, decline = false) => {
    if (decline) {
      await updateTeam({ id: team.id, declineEmail: user.email })
      return
    }
    await updateTeam({ id: team.id, acceptEmail: user.email })
  }

  const columns: TableColumn<TeamArgs>[] = [
    {
      name: 'League',
      value: ((team) => team.league.name)
    },
    {
      name: 'Team',
      value: ((team) => team.name)
    },
    {
      name: 'Sport',
      value: ((team) => team.league.sport)
    },
    {
      renderedValue: ((team) => <>
        <button className="btn btn-ghost btn-square btn-sm" onClick={() => handleUpdate(team)} >✅</button>
        <button className="btn btn-ghost btn-square btn-sm" onClick={() => handleUpdate(team, true)}>❌</button>
      </>)
    }
  ]

  return (
    <Modal title={'League invites'} onClose={onClose}>
      {inviteTeams?.length > 0 && <Table columns={columns} data={inviteTeams} />}
    </Modal>
  )
}

export default InviteModal
