import { useForm } from 'react-hook-form'
import { LeagueArgs, TeamArgs } from '@/types'
import { useSessionUser } from '@/hooks/user'
import { useAddTeam, useUpdateTeam } from '@/hooks/team'
import Modal from '@/components/Modal'
import Form from '@/components/Form'
import TextInput from '@/components/TextInput'

interface FormProps {
  league: Partial<LeagueArgs>
  onClose: () => void;
  team?: Partial<TeamArgs> | null | undefined
  invite?: boolean
}

const TeamModal: React.FC<FormProps> = ({ league, onClose, team = null }) => {
  const { user } = useSessionUser()
  const { addObject: addTeam, isLoading: isAdding } = useAddTeam()
  const { updateObject: updateTeam, isLoading: isUpdating } = useUpdateTeam()
  const teamUser = team?.teamUsers?.[0] // first one for now
  const inviteEmail = teamUser?.inviteEmail
  const teamUserId = teamUser?.userId

  const form = useForm({
    mode: 'onChange',
    defaultValues: { name: team?.name || '', email: inviteEmail },
  })
  const isLoading = isAdding || isUpdating

  const onSubmit = async (data: { [x: string]: unknown }) => {
    const { name, email } = data

    const res = team
      ? await updateTeam({
        id: team.id,
        name: String(name),
        oldInviteEmail: String(inviteEmail),
        newInviteEmail: String(email)
      })
      : await addTeam({
        name: name as string,
        leagueId: league.id,
        inviteEmail: email as string,
      })

    if ('error' in res) return
    onClose()
  }

  if (!user) return <></>

  return (
    <Modal title={'Invite team'} onClose={onClose}>
      <Form
        form={form}
        onSubmit={onSubmit}
        onCancel={onClose}
        isSubmitting={isLoading}
      >
        <TextInput
          name="name" form={form} disabled={isLoading}
          required
          validate={(value: string) => value.length > 1 || 'Too short'}
        />
        {!teamUserId && <TextInput name="email" form={form} disabled={isLoading} labelOverride="Invite email" />}
      </Form>
    </Modal>
  )
}

export default TeamModal
