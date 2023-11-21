import React, { useState } from 'react'

interface Props {
  onSearch: (value: string) => void;
  placeholder?: string;
}

const Search: React.FC<Props> = ({ onSearch, placeholder = 'Search...' }) => {
  const [search, setSearch] = useState('')

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch(search)
    }
  }

  const handleClear = () => {
    setSearch('')
    onSearch('')
  }

  return (
    <div className="mb-4 flex items-center">
      <div className="relative flex-1">
        <input
          type="text"
          className="input input-bordered w-full"
          placeholder={placeholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <div className="absolute top-1/2 transform -translate-y-1/2 right-2 opacity-50">
          {search === '' ? <div>🔍</div> : <div className="cursor-pointer" onClick={handleClear}>✖️</div>}
        </div>
      </div>
      <button onClick={() => onSearch(search)} className="btn ml-2">
        Search
      </button>
    </div>
  )
}

export default Search
