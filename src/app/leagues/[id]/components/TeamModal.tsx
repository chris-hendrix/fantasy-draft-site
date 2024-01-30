import { useEffect, useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { useSessionUser } from '@/hooks/user'
import { useTeam } from '@/hooks/team'
import Modal from '@/components/Modal'
import Form from '@/components/Form'
import ConfirmModal from '@/components/ConfirmModal'
import TextInput from '@/components/TextInput'
import { useLeague } from '@/hooks/league'
import { TeamUserArgs } from '@/types'

interface FormProps {
  teamId: string
  onClose: () => void;
}

const TEAM_USER_LIMIT = 5
const TeamModal: React.FC<FormProps> = ({ teamId, onClose }) => {
  const { user } = useSessionUser()
  const { isCommissioner } = useLeague()
  const { team, isLoading, updateTeam, isUpdating } = useTeam(teamId)
  const [teamUserToDelete, setTeamUserToDelete] = useState<TeamUserArgs | null>(null)
  const [invitesEnabled, setInvitesEnabled] = useState(false)
  const acceptedTeamUsers = team?.teamUsers?.filter((tu) => tu.userId)
  const invitedTeamUsers = team?.teamUsers?.filter((tu) => !tu.userId)

  const form = useForm({ mode: 'onChange' })
  const fieldArray = useFieldArray({ control: form.control, name: 'inviteEmails' })

  useEffect(() => {
    if (isLoading) return
    form.reset({
      name: team?.name || '',
      inviteEmails: invitedTeamUsers?.map((tu) => tu.inviteEmail) || [],
    })
  }, [isLoading])

  useEffect(() => {
    if (invitesEnabled && !invitedTeamUsers?.length) {
      fieldArray.append('')
    }
    if (!invitesEnabled) {
      form.reset({
        name: team?.name || '',
        inviteEmails: invitedTeamUsers?.map((tu) => tu.inviteEmail) || [],
      })
    }
  }, [invitesEnabled])

  const handleDeleteTeamUser = async () => {
    if (!teamUserToDelete) return
    const res = await updateTeam({
      id: teamId,
      teamUsers: { deleteMany: { id: teamUserToDelete.id } }
    })
    if ('error' in res) return
    setTeamUserToDelete(null)
  }

  const onSubmit = async (data: { [x: string]: any }) => {
    const { name, inviteEmails } = data

    const res = await updateTeam({
      id: teamId,
      name: String(name),
      inviteEmails: invitesEnabled ? (inviteEmails || []) : undefined
    })

    if ('error' in res) return
    onClose()
  }

  if (!user || isLoading) return <></>

  if (teamUserToDelete) {
    const { user: userToDelete, team: teamToDelete } = teamUserToDelete
    return <ConfirmModal
      onConfirm={handleDeleteTeamUser}
      onClose={() => setTeamUserToDelete(null)}
    >
      {`Remove ${userToDelete.name || userToDelete.email} from ${teamToDelete.name}?`}
    </ConfirmModal >
  }

  return (
    <Modal title={'Edit team'} onClose={onClose}>
      <Form
        form={form}
        onSubmit={onSubmit}
        onCancel={onClose}
        isSubmitting={isLoading}
      >
        {acceptedTeamUsers?.length > 0 && (
          <div className="mb-6">
            <label htmlFor="email" className="block mb-2 font-bold">
              Users
            </label>
            {acceptedTeamUsers.map((tu) => (
              <div key={tu.id} className="flex gap-2 items-center" >
                <span>✅ {tu.user.name || tu.user.email}</span>
                {isCommissioner && (
                  <button
                    type="button"
                    className="btn btn-ghost btn-square btn-sm"
                    onClick={() => setTeamUserToDelete(tu)}
                  >🗑️
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
        <TextInput
          name="name" form={form} disabled={isUpdating}
          required
          validate={(value: string) => value.length > 1 || 'Too short'}
        />
        {isCommissioner && invitesEnabled && fieldArray.fields.map((item, index) => (
          <div key={item.id}>
            <TextInput
              name={`inviteEmails[${index}]`}
              labelOverride={`Invite email ${index + 1}`}
              form={form}
              typeOverride="email"
              disabled={isUpdating}
            />
            <div className="flex gap-1 -mt-4 justify-end">
              <button
                disabled={index !== fieldArray.fields.length - 1 || index === TEAM_USER_LIMIT}
                className="btn btn-xs btn-ghost"
                onClick={() => fieldArray.append('')}>
                ➕
              </button>
              <button
                disabled={!acceptedTeamUsers?.length && index === 0}
                className="btn btn-xs btn-ghost"
                onClick={() => fieldArray.remove(index)}
              >
                ➖
              </button>
            </div>
          </div>
        ))}
        {isCommissioner && (
          <div className="mb-2">
            <button
              className="btn btn-sm btn-secondary mb-2 w-24"
              type="button"
              onClick={() => setInvitesEnabled(!invitesEnabled)}
            >
              {invitesEnabled ? 'Cancel' : '✉️ Invites'}
            </button>
          </div>
        )}
      </Form>
    </Modal>
  )
}

export default TeamModal
