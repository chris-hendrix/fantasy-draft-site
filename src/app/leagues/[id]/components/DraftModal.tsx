import { useForm } from 'react-hook-form'
import { useLeague } from '@/hooks/league'
import { useDraft } from '@/hooks/draft'
import { useSessionUser } from '@/hooks/user'
import Modal from '@/components/Modal'
import Form from '@/components/Form'
import TextInput from '@/components/TextInput'
import { DEFAULT_ROUNDS, DEFAULT_KEEPER_COUNT } from '@/utils/draft'

interface FormProps {
  onClose: () => void;
  draftId?: string;
}

const DraftModal: React.FC<FormProps> = ({ onClose, draftId }) => {
  const { user } = useSessionUser()
  const { league, latestDraft } = useLeague()
  const {
    draft,
    addDraft,
    isAdding,
    updateDraft,
    isUpdating
  } = useDraft(draftId || '', { skip: !draftId })

  const defaultRounds = league?.defaultRounds || DEFAULT_ROUNDS
  const defaultKeeperCount = league?.defaultKeeperCount || DEFAULT_KEEPER_COUNT
  const defaultYear = latestDraft ? latestDraft.year + 1 : new Date().getFullYear()

  const form = useForm({
    mode: 'onChange',
    defaultValues: {
      year: draft?.year || defaultYear,
      rounds: draft?.rounds || defaultRounds,
      keeperCount: draft?.keeperCount || defaultKeeperCount,
      dues: draft?.dues || 0
    },
  })
  const isLoading = isAdding || isUpdating

  const onSubmit = async (data: { [x: string]: any }) => {
    const res = draftId
      ? await updateDraft({ id: draftId, ...data })
      : await addDraft({ ...data })
    if ('error' in res) return
    onClose()
  }

  if (!user) return <></>

  return (
    <Modal title={draftId ? 'Edit draft' : 'Create draft'} onClose={onClose}>
      <Form
        form={form}
        onSubmit={onSubmit}
        onCancel={onClose}
        isSubmitting={isLoading}
      >
        <TextInput
          name="year" typeOverride="number" labelOverride="Year"
          form={form} disabled={isLoading} required
        />
        <TextInput
          name="rounds" typeOverride="number" labelOverride="Rounds"
          form={form} disabled={isLoading} required
        />
        <TextInput
          name="keeperCount" typeOverride="number" labelOverride="Keepers"
          form={form} disabled={isLoading} required
        />
        <TextInput
          name="dues" typeOverride="number" labelOverride="Dues"
          form={form} disabled={isLoading} required
        />
      </Form>
    </Modal>
  )
}

export default DraftModal
