import { useState } from 'react'
import { User } from '@prisma/client'
import { useForm } from 'react-hook-form'
import { useSessionUser } from '@/hooks/user'
import { useAddLeague } from '@/hooks/league'
import Modal from '@/components/Modal'
import Form from '@/components/Form'
import TextInput from '@/components/TextInput'

interface FormProps {
  user: Partial<User>;
  setOpen: (open: boolean) => void;
}

const CreateLeagueModal: React.FC<FormProps> = ({ user, setOpen }) => {
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

const CreateLeagueButton: React.FC = () => {
  const { user } = useSessionUser()
  const [modalOpen, setModalOpen] = useState(false)

  if (!user?.admin) return <></> // TODO open up for all users at some point

  return (
    <>
      <button className="btn btn-secondary btn-sm" onClick={() => setModalOpen(true)}>Create league</button>
      {modalOpen && user && <CreateLeagueModal user={user} setOpen={setModalOpen} />}
    </>

  )
}

export default CreateLeagueButton
