import React, { useState } from 'react'
import { toLocaleISOString } from '@/utils/date'

interface DateTimePickerProps {
  initialDate?: Date;
  onChange: (date: Date) => void;
  disabled?: boolean
}

const DateTimePicker: React.FC<DateTimePickerProps> = ({
  initialDate = new Date(), onChange, disabled = false
}) => {
  const [date, setDate] = useState<Date>(initialDate)

  return (
    <div>
      <input
        className="input input-bordered"
        type="datetime-local"
        value={toLocaleISOString(date)}
        onChange={(e) => {
          const newDate = new Date(e.target.value)
          setDate(newDate)
          onChange(newDate)
        }}
        disabled={disabled}
      />
    </div>
  )
}

export default DateTimePicker
