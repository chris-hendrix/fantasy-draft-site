import React, { useState } from 'react'

interface Props {
  onSearch: (value: string) => void;
  label?: string;
}

const SearchFilter: React.FC<Props> = ({ onSearch, label = 'Search' }) => {
  const [search, setSearch] = useState('')

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    onSearch(e.target.value)
  }

  return (
    <div className="p-1">
      <label className="text-xs w-fit">
        {label}
      </label>
      <div className="w-full p-1">
        <input
          type="text"
          className="input input-xs input-bordered w-full text-xs"
          placeholder={`${label}...`}
          value={search}
          onChange={handleSearch}
        />
      </div>
    </div>
  )
}

export default SearchFilter
