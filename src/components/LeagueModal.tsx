import { useForm } from 'react-hook-form'
import { useSessionUser } from '@/hooks/user'
import { useAddLeague } from '@/hooks/league'
import Modal from '@/components/Modal'
import Form from '@/components/Form'
import TextInput from '@/components/TextInput'

interface FormProps {
  setOpen: (open: boolean) => void;
}

const LeagueModal: React.FC<FormProps> = ({ setOpen }) => {
  const { user } = useSessionUser()
  const { addLeague, isLoading } = useAddLeague({
    showAlertOnError: true,
    showAlertOnSuccess: true,
    errorMessage: undefined,
  })
  const form = useForm({ mode: 'onChange' })

  const onSubmit = async (data: { [x: string]: unknown }) => {
    const { name } = data
    const res = await addLeague({ name: name as string, sport: 'baseball' }) // TODO add multi sport
    if ('error' in res) return
    setOpen(false)
  }

  if (!user) return <></>

  return (
    <Modal title={'Create league'} setOpen={setOpen}>
      <Form
        form={form}
        onSubmit={onSubmit}
        onCancel={() => setOpen(false)}
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
