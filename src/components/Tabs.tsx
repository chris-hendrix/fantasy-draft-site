'use client'

import { useState, useEffect } from 'react'

interface Tab {
  name: string;
  component?: React.ReactNode;
  hash?: string;
  default?: boolean
}

interface TabsProps {
  tabs: Tab[];
  onAdd?: () => void
  width?: number | string
}

const Tabs: React.FC<TabsProps> = ({ tabs, onAdd, width = 'full' }) => {
  const defaultIndex = tabs.findIndex((t) => t.default)
  const [tabIndex, setTabIndex] = useState(Math.max(defaultIndex, 0))

  useEffect(() => {
    const currentHash = window.location.hash.replace('#', '')
    const allTabsHaveHash = tabs.every((tab) => tab.hash !== undefined)
    const selectedIndex = tabs.findIndex((tab) => tab?.hash === currentHash)
    if (allTabsHaveHash && selectedIndex !== -1) setTabIndex(selectedIndex)
  }, [])

  const handleTabClick = (index: number) => {
    setTabIndex(index)
    if (tabs[index].hash) {
      window.location.hash = tabs[index].hash as string
    }
  }

  return (
    <div className="w-full">
      <div role="tablist" className="tabs tabs-lg tabs-boxed" style={{ width }}>
        {tabs.map((tab, i) => (
          <a
            key={tab.name}
            onClick={() => handleTabClick(i)}
            role="tab"
            className={`tab ${tabIndex === i ? 'tab-active' : ''}`}
          >
            {tab.name}
          </a>
        ))}
        {onAdd && <a role="tab" className="tab" onClick={onAdd}>+</a>}
      </div>
      {tabs[tabIndex]?.component}
    </div>
  )
}

export default Tabs
