import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useLeagueFiles } from '@/hooks/leagueFile'
import { useSessionUser } from '@/hooks/user'
import { LeagueFileArgs } from '@/types'
import { LeagueFileCategory } from '@prisma/client'
import Modal from '@/components/Modal'
import Form from '@/components/Form'
import TextInput from '@/components/TextInput'
import { useAlert } from '@/hooks/app'

interface FormProps {
  leagueId: string;
  onClose: () => void;
  leagueFile?: LeagueFileArgs
}

const LEAGUE_FILE_CATEGORIES = {
  other: 'Other',
  deadline_rosters: 'deadline_rosters',
  backup: 'backup',
}

const LeagueFileUploadModal: React.FC<FormProps> = ({ leagueId, onClose, leagueFile }) => {
  const { user } = useSessionUser()
  const { showAlert } = useAlert()
  const [file, setFile] = useState<File | null>(null)
  const [category, setCategory] = useState<LeagueFileCategory | null>(null)
  const {
    addLeagueFile,
    updateLeagueFile,
    isMutating,
  } = useLeagueFiles(leagueId)
  const metadata: any = leagueFile?.file?.metadata

  const form = useForm({
    mode: 'onChange',
    defaultValues: {
      title: metadata?.title || '',
      description: metadata?.description || ''
    },
  })

  const onSubmit = async (data: { [x: string]: unknown }) => {
    const { title, description } = data

    const leagueFileData = {
      leagueId,
      category: category || LeagueFileCategory.other,
      metadata: {
        title: title && String(title),
        description: description ? String(description) : null,
      }
    }

    if (leagueFile) {
      await updateLeagueFile({
        leagueFileId: leagueFile.id,
        file: file || undefined,
        ...leagueFileData
      })
    } else {
      if (!file) {
        showAlert({ errorMessage: 'Please select a file' })
        return
      }
      await addLeagueFile({ file, ...leagueFileData })
    }
    onClose()
  }

  const UploadButton = () => (
    <div>
      <input
        type="file"
        className="hidden"
        id="fileInput"
        onChange={(e) => setFile(e.target?.files?.[0] || null)}
      />
      <label htmlFor="fileInput">
        <div className="btn btn-primary">
          Select file
        </div>
        {file && <span className="ml-2">{file.name}</span>}
      </label>
    </div>
  )

  if (!user) return <></>

  return (
    <Modal title={leagueFile ? 'Edit league' : 'Create league'} onClose={onClose}>
      <Form
        form={form}
        onSubmit={onSubmit}
        onCancel={onClose}
        isSubmitting={isMutating}
      >
        <TextInput
          name="title" form={form} disabled={isMutating}
          required validate={(value: string) => value.length > 4 || 'Too short'}
        />
        <TextInput
          name="description" labelOverride="League URL" form={form} disabled={isMutating}
          required validate={(value: string) => value.length > 4 || 'Too short'}
        />
        <div className="mb-4">
          <label className="block mb-2 font-bold">
            Category
          </label>
          <select
            className="select select-bordered w-full mb-2"
            onChange={(e) => setCategory(e.target.value as LeagueFileCategory)}>
            {Object.entries(LEAGUE_FILE_CATEGORIES).map(([key, value]) => (
              <option key={key} value={key}>{value}</option>
            ))}
          </select>
        </div>
        <UploadButton />
      </Form>
    </Modal>
  )
}

export default LeagueFileUploadModal
