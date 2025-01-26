import React, { useState } from 'react'
import classNames from 'classnames'

interface Props {
  label: string;
  value: boolean;
  setValue: (value: boolean) => void;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

const Toggle: React.FC<Props> = ({ label, value, setValue, size = 'md' }) => {
  const [checked, setChecked] = useState(value)

  const toggleSize = classNames({
    'toggle-xs': size === 'xs',
    'toggle-sm': size === 'sm',
    'toggle-md': size === 'md',
    'toggle-lg': size === 'lg',
  })

  const textSize = classNames({
    'text-xs': size === 'xs',
    'text-sm': size === 'sm',
    'text-md': size === 'md',
    'text-lg': size === 'lg',
  })

  return (
    <div className="form-control ml-auto">
      <label className="label cursor-pointer">
        <span className={`label-text ${textSize} mr-2`}>{label}</span>
        <input
          type="checkbox"
          className={`toggle toggle-primary ${toggleSize}`}
          checked={checked}
          onChange={() => {
            setChecked(!checked)
            setValue(!checked)
          }}
        />
      </label>
    </div>
  )
}

export default Toggle
