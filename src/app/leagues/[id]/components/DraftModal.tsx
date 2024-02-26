import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useLeague } from '@/hooks/league'
import { useDraft } from '@/hooks/draft'
import { useSessionUser } from '@/hooks/user'
import Modal from '@/components/Modal'
import Form from '@/components/Form'
import TextInput from '@/components/TextInput'
import { DEFAULT_ROUNDS, DEFAULT_KEEPER_COUNT } from '@/utils/draft'
import DateTimePicker from '@/components/DateTimePicker'
import { getNearestFutureHalfHour } from '@/utils/date'

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
  const [draftTime, setDraftTime] = useState<Date | null>(null)

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
      ? await updateDraft({ id: draftId, draftTime, ...data })
      : await addDraft({ ...data, draftTime, leagueId: league.id })
    if ('error' in res) return
    onClose()
  }

  const handleToggleDraftTime = async () => {
    if (!draftTime) {
      setDraftTime(getNearestFutureHalfHour())
    } else {
      setDraftTime(null)
    }
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
        <label htmlFor="email" className="block mb-2 font-bold">
          {'Draft time'}
        </label>
        <div className="flex justify-between items-center">
          <DateTimePicker
            initialDate={draftTime || getNearestFutureHalfHour()}
            onChange={setDraftTime}
            disabled={!draftTime}
          />
          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text mr-2">Enable draft time</span>
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={Boolean(draftTime)}
                onChange={handleToggleDraftTime}
              />
            </label>
          </div>
        </div>
      </Form>
    </Modal>
  )
}

export default DraftModal
