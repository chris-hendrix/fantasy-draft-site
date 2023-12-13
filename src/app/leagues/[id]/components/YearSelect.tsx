'use client'

import React, { useEffect, useState, ChangeEvent } from 'react'

interface Props {
  onYearChange: (year: number) => void
  endYear?: number
  startYear?: number
  initialSelection?: number
  yearsToExclude?: number[]
}

const YearSelect: React.FC<Props> = ({
  onYearChange,
  endYear = new Date().getFullYear() + 1,
  startYear = new Date().getFullYear() - 20,
  initialSelection = new Date().getFullYear(),
  yearsToExclude = []
}) => {
  const [selectedYear, setSelectedYear] = useState<number>(initialSelection)

  const years = Array.from(
    { length: endYear - startYear },
    (_, index) => endYear - index
  ).filter((year) => !yearsToExclude.includes(year))

  useEffect(() => { onYearChange(selectedYear) }, [selectedYear])

  return (
    <select
      className="select select-bordered w-24"
      value={selectedYear || ''}
      onChange={(e: ChangeEvent<HTMLSelectElement>) => (
        setSelectedYear(parseInt(e.target.value, 10))
      )}
    >
      <option disabled value="">
        Select year
      </option>
      {years.map((y) => (
        <option key={y} value={y}>
          {y}
        </option>
      ))}
    </select>
  )
}

export default YearSelect
