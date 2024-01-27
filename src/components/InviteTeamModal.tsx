import { useForm } from 'react-hook-form'
import { useSessionUser } from '@/hooks/user'
import { useAddTeam } from '@/hooks/team'
import Modal from '@/components/Modal'
import Form from '@/components/Form'
import TextInput from '@/components/TextInput'

interface FormProps {
  leagueId: string
  onClose: () => void;
}

const InviteTeamModal: React.FC<FormProps> = ({ leagueId, onClose }) => {
  const { user } = useSessionUser()
  const { addObject: addTeam, isLoading } = useAddTeam()

  const form = useForm({
    mode: 'onChange',
    defaultValues: { name: '', email: '' },
  })

  const onSubmit = async (data: { [x: string]: unknown }) => {
    const { name, email } = data

    const res = await addTeam({
      name: name as string,
      leagueId,
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
        <TextInput name="email" form={form} disabled={isLoading} labelOverride="Invite email" />
      </Form>
    </Modal>
  )
}

export default InviteTeamModal
