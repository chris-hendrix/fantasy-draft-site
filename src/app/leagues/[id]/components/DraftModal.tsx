import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useLeague } from '@/hooks/league'
import { useDraft } from '@/hooks/draft'
import { useSessionUser } from '@/hooks/user'
import Modal from '@/components/Modal'
import Form from '@/components/Form'
import TextInput from '@/components/TextInput'
import DateTimePicker from '@/components/DateTimePicker'
import { getNearestFutureHalfHour } from '@/utils/date'
import { DraftArgs } from '@/types'

interface FormProps {
  onClose: () => void;
  draft?: Partial<DraftArgs>;
}

const DraftModal: React.FC<FormProps> = ({ onClose, draft }) => {
  const { user } = useSessionUser()
  const { league, latestDraft } = useLeague()
  const {
    addDraft,
    isAdding,
    updateDraft,
    isUpdating
  } = useDraft(draft?.id || '')
  const [draftTime, setDraftTime] = useState<Date | null>(null)

  const defaultYear = latestDraft ? latestDraft.year + 1 : new Date().getFullYear()

  const form = useForm({
    mode: 'onChange',
    defaultValues: {
      year: draft?.year || defaultYear,
      dues: draft?.dues || 0
    },
  })
  const isLoading = isAdding || isUpdating

  const onSubmit = async (data: { [x: string]: any }) => {
    const res = draft
      ? await updateDraft({ id: draft.id, draftTime, ...data })
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
    <Modal title={draft?.id ? 'Edit draft' : 'Create draft'} onClose={onClose}>
      <Form
        form={form}
        onSubmit={onSubmit}
        onCancel={onClose}
        isSubmitting={isLoading}
      >
        <TextInput
          name="year" typeOverride="number" labelOverride="Year"
          form={form} disabled={isLoading || Boolean(draft)} required={!draft}
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
