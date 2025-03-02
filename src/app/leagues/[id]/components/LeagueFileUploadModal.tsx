import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useLeagueFiles } from '@/hooks/leagueFile'
import { useSessionUser } from '@/hooks/user'
import { LeagueFileArgs, DraftArgs } from '@/types'
import { LeagueFileCategory } from '@prisma/client'
import Modal from '@/components/Modal'
import Form from '@/components/Form'
import { useAlert } from '@/hooks/app'
import DraftSelect from './DraftSelect'

interface FormProps {
  leagueId: string;
  onClose: () => void;
  leagueFile?: LeagueFileArgs
}

export const LEAGUE_FILE_CATEGORIES = [
  { enum: LeagueFileCategory.other, name: 'Other' },
  { enum: LeagueFileCategory.league_image, name: 'League Image' },
  { enum: LeagueFileCategory.keepers, name: 'Keepers' },
  { enum: LeagueFileCategory.backup, name: 'Backup' },
]

const LeagueFileUploadModal: React.FC<FormProps> = ({ leagueId, onClose, leagueFile }) => {
  const { user } = useSessionUser()
  const { showAlert } = useAlert()
  const [file, setFile] = useState<File | null>(null)
  const [category, setCategory] = useState<LeagueFileCategory | null>(leagueFile?.category || null)
  const [draft, setDraft] = useState<DraftArgs | null>(leagueFile?.draft || null)

  const {
    addLeagueFile,
    updateLeagueFile,
    invalidateLeagueFiles,
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
      draftId: draft?.id,
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
      invalidateLeagueFiles()
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
    <Modal title={leagueFile ? 'Edit league file' : 'Upload league file'} onClose={onClose}>
      <Form
        form={form}
        onSubmit={onSubmit}
        onCancel={onClose}
        isSubmitting={isMutating}
      >
        <div className="mb-4">
          <label className="block mb-2 font-bold">
            Category
          </label>
          <select
            className="select select-bordered w-full mb-2"
            value={category as LeagueFileCategory}
            onChange={(e) => setCategory(e.target.value as LeagueFileCategory)}>
            {LEAGUE_FILE_CATEGORIES.map((c) => (
              <option key={c.enum} value={c.enum}>
                {c.name}
              </option>
            ))}
          </select>
          <label className="block mb-2 font-bold">
            Draft
          </label>
          <DraftSelect
            leagueId={leagueId}
            onSelect={setDraft}
            initialDraft={draft}
          />
        </div>
        {!leagueFile && <UploadButton />}
      </Form>
    </Modal>
  )
}

export default LeagueFileUploadModal
