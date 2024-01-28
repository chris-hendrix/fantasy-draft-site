import { useForm } from 'react-hook-form'
import { useLeague } from '@/hooks/league'
import { useSessionUser } from '@/hooks/user'
import Modal from '@/components/Modal'
import Form from '@/components/Form'
import TextInput from '@/components/TextInput'

interface FormProps {
  onClose: () => void;
  leagueId?: string
}

const LeagueModal: React.FC<FormProps> = ({ onClose, leagueId }) => {
  const { user } = useSessionUser()
  const { league, addLeague, isAdding, updateLeague, isUpdating } = useLeague()

  const form = useForm({
    mode: 'onChange',
    defaultValues: { name: league?.name || '' },
  })
  const isLoading = isAdding || isUpdating

  const onSubmit = async (data: { [x: string]: unknown }) => {
    const { name } = data

    const res = leagueId
      ? await updateLeague({ id: leagueId, name: name as string })
      : await addLeague({ name: name as string, sport: 'baseball' }) // TODO add multi sport

    if ('error' in res) return
    onClose()
  }

  if (!user) return <></>

  return (
    <Modal title={'Create league'} onClose={onClose}>
      <Form
        form={form}
        onSubmit={onSubmit}
        onCancel={onClose}
        isSubmitting={isLoading}
      >
        <TextInput
          name="name" form={form} disabled={isLoading}
          required validate={(value: string) => value.length > 4 || 'Too short'}
        />
      </Form>
    </Modal>
  )
}

export default LeagueModal
