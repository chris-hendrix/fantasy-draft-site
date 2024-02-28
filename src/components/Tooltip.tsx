import React, { useState, ReactNode } from 'react'

interface TooltipProps {
  text: ReactNode;
  children: ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ children, text }) => {
  const [isHovering, setIsHovering] = useState<boolean>(false)

  return (
    <div className="cursor-pointer" onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
      {isHovering && (
        <div className="absolute menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-neutral rounded-box w-200 text-xs font-normal">
          {text}
        </div>
      )}
      {children}
    </div>
  )
}

export default Tooltip
