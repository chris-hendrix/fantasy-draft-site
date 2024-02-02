import React from 'react'
import ReactMarkdown, { Components } from 'react-markdown'

interface MarkdownProps {
  markdownText: string;
}

const Markdown: React.FC<MarkdownProps> = ({ markdownText }) => {
  const components: Components = {
    h1: ({ children }) => <div className="text-4xl">{children}</div>,
    h2: ({ children }) => <div className="text-3xl">{children}</div>,
    h3: ({ children }) => <div className="text-2xl">{children}</div>,
    h4: ({ children }) => <div className="text-xl">{children}</div>,
    li: ({ children }) => <li className="text-base">{children}</li>,
    ul: ({ children }) => <ul className="list-disc ml-8">{children}</ul>,
    ol: ({ children }) => <ol className="list-decimal ml-8">{children}</ol>,
    p: ({ children }) => <p className="text-base">{children}</p>
  }

  return (
    <ReactMarkdown components={components}>
      {markdownText}
    </ReactMarkdown>
  )
}

export default Markdown
