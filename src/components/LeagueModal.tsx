import { useForm } from 'react-hook-form'
import { League } from '@prisma/client'
import { useSessionUser } from '@/hooks/user'
import { useAddLeague, useUpdateLeague } from '@/hooks/league'
import Modal from '@/components/Modal'
import Form from '@/components/Form'
import TextInput from '@/components/TextInput'

const mutationOptions = {
  showAlertOnError: true,
  showAlertOnSuccess: true,
  errorMessage: undefined,
}

interface FormProps {
  setOpen: (open: boolean) => void;
  league?: Partial<League> | null | undefined
}

const LeagueModal: React.FC<FormProps> = ({ setOpen, league = null }) => {
  const { user } = useSessionUser()
  const { addObject: addLeague, isLoading: isAdding } = useAddLeague(mutationOptions)
  const { updateObject: updateLeague, isLoading: isUpdating } = useUpdateLeague(mutationOptions)

  const form = useForm({
    mode: 'onChange',
    defaultValues: { name: league?.name || '' },
  })
  const isLoading = isAdding || isUpdating

  const onSubmit = async (data: { [x: string]: unknown }) => {
    const { name } = data

    const res = league
      ? await updateLeague({ id: league.id, name: name as string })
      : await addLeague({ name: name as string, sport: 'baseball' }) // TODO add multi sport

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
