'use client'

import { useState } from 'react'

export interface TabOption {
  label: string;
  value: string | number;
}

interface Props {
  tabOptions: TabOption[];
  onSelect: (result: { selectedOption: TabOption, selectedValue: string | number }) => void
  initialOption?: TabOption
}

const TabSelect: React.FC<Props> = ({ tabOptions, onSelect, initialOption }) => {
  const defaultIndex = tabOptions.findIndex((to) => to.value === initialOption?.value) || 0
  const [tabIndex, setTabIndex] = useState(Math.max(defaultIndex, 0))

  const handleTabClick = (index: number) => {
    setTabIndex(index)
    const selectedOption = tabOptions[index]
    onSelect({ selectedOption, selectedValue: selectedOption.value })
  }

  return (
    <div className="w-full">
      <div role="tablist" className="tabs tabs-lg tabs-boxed">
        {tabOptions.map((tabOption, i) => (
          <a
            key={tabOption.value}
            onClick={() => handleTabClick(i)}
            role="tab"
            className={`tab ${tabIndex === i ? 'tab-active' : ''}`}
          >
            {tabOption.label}
          </a>
        ))}
      </div>
    </div>
  )
}

export default TabSelect
