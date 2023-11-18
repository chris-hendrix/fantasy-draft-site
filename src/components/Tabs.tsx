'use client'

import { useState, useEffect } from 'react'

interface Tab {
  name: string;
  component: React.ReactNode;
  hash?: string;
}

interface TabsProps {
  tabs: Tab[];
}

const Tabs: React.FC<TabsProps> = ({ tabs }) => {
  const [tabIndex, setTabIndex] = useState(0)

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
    <div role="tablist" className="tabs tabs-lg tabs-boxed">
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
    </div>
  )
}

export default Tabs
