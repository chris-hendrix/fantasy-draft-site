import React, { useState } from 'react'

interface Props {
  label: string;
  value: boolean;
  setValue: (value: boolean) => void;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

const Toggle: React.FC<Props> = ({ label, value, setValue, size = 'md' }) => {
  const [checked, setChecked] = useState(value)

  const toggleSize = `toggle-${size}`
  const textSize = `text-${size}`

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
