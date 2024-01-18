import React from 'react'

interface Props {
  header?: React.ReactNode | string;
  buttons?: React.ReactNode;
  children: React.ReactNode;
}

const Card: React.FC<Props> = ({ header, buttons, children }) => (
  <div className="flex items-center text-center md:text-left justify-between bg-base-300 rounded-box p-4 mt-4 w-full relative">
    {buttons && (
      <div className="absolute top-2 right-2 text-gray-500">
        {buttons}
      </div>
    )}
    <div className="flex items-center">
      <div>
        <h3 className="text-2xl font-medium mb-1">{header}</h3>
        {children}
      </div>
    </div>
  </div>

)

export default Card
