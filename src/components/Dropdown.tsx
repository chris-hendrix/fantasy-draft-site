'use client'

import React from 'react'

interface DropdownProps {
  label: React.ReactNode;
  children: React.ReactNode;
  align?: string;
}

const Dropdown: React.FC<DropdownProps> = ({ label, children, align = 'left-0' }) => {
  return (
    <div className={'dropdown'}>
      <label tabIndex={0} className="cursor-pointer">
        {label}
      </label>
      <ul
        tabIndex={0}
        className={`absolute ${align} menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-neutral rounded-box w-52`}
      >
        {children}
      </ul>
    </div>
  )
}

export default Dropdown
