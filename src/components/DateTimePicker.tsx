import React, { useState } from 'react'
import { toLocaleISOString } from '@/utils/date'

interface DateTimePickerProps {
  initialDate?: Date;
  onChange: (date: Date) => void;
}

const DateTimePicker: React.FC<DateTimePickerProps> = ({ initialDate = new Date(), onChange }) => {
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
      />
    </div>
  )
}

export default DateTimePicker
