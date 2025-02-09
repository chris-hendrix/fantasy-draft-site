import { useState } from 'react'
import Modal from '@/components/Modal'
import { useAlert } from '@/hooks/app'
import { User } from '@prisma/client'
import ConfirmModal from './ConfirmModal'

interface FormProps {
  user: User
  onClose: () => void;
}

const ResetPasswordModal: React.FC<FormProps> = ({ user, onClose }) => {
  const [confirmModal, setConfirmModal] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const { showAlert } = useAlert()

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(newPassword)
    showAlert({ successMessage: 'Password copied to clipboard' })
  }

  const handleUpdatePassword = async () => {
    const response = await fetch('/api/auth/password-reset', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId: user.id })
    })
    const data = await response.json()
    setNewPassword(data.password)
    showAlert({ successMessage: 'Password reset successfully' })
    setConfirmModal(false)
  }

  const PasswordField = () => (
    <div className="form-control w-full">
      <label className="label">
        <span className="label-text">New Password</span>
      </label>
      <div className="flex items-center">
        <input
          type="text"
          placeholder="New Password"
          className="input input-bordered w-full"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          disabled
        />
        <button
          type="button"
          className="btn btn-square btn-secondary ml-2"
          onClick={handleCopyToClipboard}
          disabled={!newPassword}
        >
          📋
        </button>
      </div>
    </div>
  )

  if (confirmModal) {
    return (
      <ConfirmModal
        onConfirm={handleUpdatePassword}
        onClose={onClose}
      >
        {`Are you sure you want to reset ${user.name}'s password?`}
      </ConfirmModal>
    )
  }

  return (
    <Modal title={'Reset password'} onClose={onClose}>
      <div className="flex flex-col gap-4">
        <PasswordField />
        <div className="flex gap-2">
          <button type="submit" className="btn btn-primary" onClick={() => setConfirmModal(true)}>
            Reset Password
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default ResetPasswordModal
