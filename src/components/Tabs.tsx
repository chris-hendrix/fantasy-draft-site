import { useState, useEffect } from 'react'
import { useCurrentHash } from '@/hooks/app'

interface Tab {
  name: string;
  component?: React.ReactNode;
  hash?: string;
  default?: boolean;
}

interface TabsProps {
  tabs: Tab[];
  onAdd?: () => void;
  width?: number | string;
}

const Tabs: React.FC<TabsProps> = ({ tabs, onAdd, width = 'full' }) => {
  const defaultIndex = tabs.findIndex((t) => t.default)
  const [tabIndex, setTabIndex] = useState(Math.max(defaultIndex, 0))
  const { currentHash, setCurrentHash } = useCurrentHash()

  useEffect(() => {
    const selectedIndex = tabs.findIndex((tab) => tab.hash === currentHash)
    if (selectedIndex !== -1) setTabIndex(selectedIndex)
  }, [currentHash, tabs])

  const handleTabClick = (index: number) => {
    setTabIndex(index)
    if (tabs[index].hash) {
      setCurrentHash(tabs[index].hash || null)
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
