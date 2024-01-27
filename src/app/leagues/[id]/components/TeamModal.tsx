import { useEffect, useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { useSessionUser } from '@/hooks/user'
import { useTeam } from '@/hooks/team'
import Modal from '@/components/Modal'
import Form from '@/components/Form'
import TextInput from '@/components/TextInput'
import { useLeagueData } from '@/hooks/league'

interface FormProps {
  teamId: string
  onClose: () => void;
}

const TEAM_USER_LIMIT = 5
const TeamModal: React.FC<FormProps> = ({ teamId, onClose }) => {
  const { user } = useSessionUser()
  const { isCommissioner } = useLeagueData()
  const { team, isLoading, updateTeam, isUpdating } = useTeam(teamId)
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

  const onSubmit = async (data: { [x: string]: any }) => {
    const { name, inviteEmails } = data

    const res = await updateTeam({
      id: teamId,
      name: String(name),
      inviteEmails: invitesEnabled ? (inviteEmails || undefined) : undefined
    })

    if ('error' in res) return
    onClose()
  }

  if (!user || isLoading) return <></>

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
              <div key={tu.id} className="" >
                ✅&nbsp;{tu.user.name || tu.user.email}
              </div>
            ))}
          </div>
        )}
        <TextInput
          name="name" form={form} disabled={isUpdating}
          required
          validate={(value: string) => value.length > 1 || 'Too short'}
        />
        {invitesEnabled && fieldArray.fields.map((item, index) => (
          <div key={item.id}>
            <TextInput
              name={`inviteEmails[${index}]`}
              labelOverride={`Invite email ${index + 1}`}
              form={form}
              typeOverride="email"
              disabled={isUpdating}
            />
            <div className="flex gap-2 -mt-4 justify-end">
              <button
                disabled={index === TEAM_USER_LIMIT}
                className="btn btn-xs btn-primary"
                onClick={() => { fieldArray.append('') }}>
                ➕
              </button>
              <button
                disabled={index === 0}
                className="btn btn-xs btn-error"
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
              className="btn btn-xs btn-secondary mb-2 w-24"
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
