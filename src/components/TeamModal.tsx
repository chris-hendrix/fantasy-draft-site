import { useForm } from 'react-hook-form'
import { League, Team } from '@prisma/client'
import { useSessionUser } from '@/hooks/user'
import { useAddTeam, useUpdateTeam } from '@/hooks/team'
import Modal from '@/components/Modal'
import Form from '@/components/Form'
import TextInput from '@/components/TextInput'

interface FormProps {
  league: Partial<League>
  setOpen: (open: boolean) => void;
  team?: Partial<Team> | null | undefined
}

const TeamModal: React.FC<FormProps> = ({ league, setOpen, team = null }) => {
  const { user } = useSessionUser()
  const { addObject: addTeam, isLoading: isAdding } = useAddTeam()
  const { updateObject: updateTeam, isLoading: isUpdating } = useUpdateTeam()

  const form = useForm({
    mode: 'onChange',
    defaultValues: { name: team?.name || '' },
  })
  const isLoading = isAdding || isUpdating

  const onSubmit = async (data: { [x: string]: unknown }) => {
    const { name, email } = data

    const res = team
      ? await updateTeam({ id: team.id, name: name as string })
      : await addTeam({
        name: name as string,
        leagueId: league.id,
        inviteEmail: email as string,
      })

    if ('error' in res) return
    setOpen(false)
  }

  if (!user) return <></>

  return (
    <Modal title={'Invite team'} setOpen={setOpen}>
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
        <TextInput name="email" form={form} disabled={isLoading} labelOverride="Invite email" />
      </Form>
    </Modal>
  )
}

export default TeamModal
