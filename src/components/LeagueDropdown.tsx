import { useState } from 'react'
import { User, Sport } from '@prisma/client'
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
  const { addLeague, isLoading } = useAddLeague()
  const form = useForm({ mode: 'onChange' })

  const onSubmit = async (data: { [x: string]: unknown }) => {
    const { name, sport } = data
    const res = await addLeague({ name: name as string, sport: sport as Sport })
    if ('error' in res) return
    setOpen(false)
  }

  if (!user) return <></>
  return (
    <Modal setOpen={setOpen}>
      <Form
        form={form}
        onSubmit={onSubmit}
        onCancel={() => setOpen(false)}
        isSubmitting={isLoading}
      >
        <TextInput name="name" form={form} disabled={isLoading} validate={() => true} />
        <TextInput name="sport" form={form} disabled={isLoading} validate={() => true} />
      </Form>
    </Modal>
  )
}

const LeagueDropdown: React.FC = () => {
  const { user } = useSessionUser()
  const [modalOpen, setModalOpen] = useState(false)
  return (
    <>
      <button className="btn btn-secondary" onClick={() => setModalOpen(true)}>Create league</button>
      {modalOpen && user && <CreateLeagueModal user={user} setOpen={setModalOpen} />}
    </>

  )
}

export default LeagueDropdown
