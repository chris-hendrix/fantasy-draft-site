'use client'

import React, { useEffect, useRef, useCallback } from 'react'

interface DropdownProps {
  label: React.ReactNode;
  children: React.ReactNode;
}

const Dropdown: React.FC<DropdownProps> = ({ label, children }) => {
  const dropdown = useRef<HTMLDivElement | null>(null)

  // closed dropdown on click
  const handleClick = () => {
    dropdown?.current?.classList.toggle('dropdown-open')
    const activeElement = document?.activeElement as HTMLElement || null
    activeElement?.blur()
  }

  // Close dropdown when clicking outside
  const handleCloseDropdown = useCallback(
    (event: MouseEvent) => {
      if (dropdown.current && !dropdown.current.contains(event.target as Node)) {
        dropdown.current.classList.remove('dropdown-open')
      }
    },
    [dropdown]
  )

  // add handle click to all components
  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {
        onClick: (e: React.MouseEvent<HTMLAnchorElement>) => {
          handleClick()
          if (child.props.onClick) child.props.onClick(e)
        },
      } as React.HTMLAttributes<HTMLAnchorElement>)
    }
    return child
  })

  useEffect(() => {
    document.addEventListener('click', handleCloseDropdown)
    return () => { document.removeEventListener('click', handleCloseDropdown) }
  }, [handleCloseDropdown])

  return (
    <div className={'dropdown'} ref={dropdown}>
      <label tabIndex={0} onClick={handleClick}>
        {label}
      </label>
      <ul className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-200 rounded-box w-52">
        {childrenWithProps}
      </ul>
    </div>
  )
}

export default Dropdown
