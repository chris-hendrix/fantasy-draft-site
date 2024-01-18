import React from 'react'

interface Props {
  children: React.ReactNode;
  onClose: () => void;
  title?: string;
  width?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

const sizes = {
  xs: ' max-w-screen-xs',
  sm: ' max-w-screen-sm',
  md: ' max-w-screen-md',
  lg: ' max-w-screen-lg',
  xl: ' max-w-screen-xl',
}

const Modal: React.FC<Props> = ({ children, onClose, title = '', size = 'sm' }) => (
  <div className="modal modal-open">
    <div className={`modal-box ${sizes[size]}`}>
      <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onClick={onClose}>✕</button>
      <h3 className="font-bold text-lg">{title}</h3>
      <div className="mt-4">{children}</div>
    </div>
  </div>
)

export default Modal
