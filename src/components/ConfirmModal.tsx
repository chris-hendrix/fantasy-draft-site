import Modal from '@/components/Modal'

interface Props {
  children: React.ReactNode;
  onClose: () => void;
  onConfirm: () => void;
  title?: string
  disabled?: boolean
}

const ConfirmModal: React.FC<Props> = ({ children, onClose, onConfirm, title = 'Confirm', disabled }) => (
  <Modal title={title} onClose={onClose}>
    {children}
    <div className="flex justify-end mt-2">
      <button onClick={onConfirm} className="btn btn-primary w-32 mr-2" disabled={disabled}>
        Confirm
      </button>
      <button onClick={onClose} className="btn w-32" disabled={disabled}>
        Cancel
      </button>
    </div>
  </Modal>
)

export default ConfirmModal
