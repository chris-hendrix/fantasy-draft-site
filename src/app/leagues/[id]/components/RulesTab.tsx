'use client'

import { useState } from 'react'
import { useLeague } from '@/hooks/league'
import Markdown from '@/components/Markdown'
import Modal from '@/components/Modal'

interface Props {
  leagueId: string;
}

const RulesTab: React.FC<Props> = ({ leagueId }) => {
  const { league: { rules }, isCommissioner, updateLeague } = useLeague(leagueId)
  const [rulesModalOpen, setRulesModalOpen] = useState(false)
  const [editRules, setEditRules] = useState('')

  const handleSaveNote = async () => {
    const res = await updateLeague({ id: leagueId, rules: editRules })
    if ('error' in res) return
    setRulesModalOpen(false)
  }

  return (
    <div className="flex flex-col items-center mt-8 gap-2">
      {isCommissioner && (
        <div className="w-full">
          <button
            className="btn btn-sm w-32"
            onClick={() => {
              setRulesModalOpen(true)
              setEditRules(rules || '')
            }}
          >
            📝 Edit rules
          </button>
        </div>
      )}
      <div className="w-full p-3 whitespace-pre-line">
        <Markdown markdownText={rules || ''} />
      </div>
      {rulesModalOpen && (
        <Modal title="Edit league rules" onClose={() => setRulesModalOpen(false)} size="lg">
          <textarea
            className="textarea textarea-bordered w-full font-mono min-h-[600px] textarea-sm mt-2 mb-2"
            onChange={(e) => setEditRules(e.target.value)}
            placeholder="Add your note here"
            value={editRules}
          />
          <div className="text-xs">
            Supports&nbsp;
            <a className="link link-primary" href="https://www.markdownguide.org/cheat-sheet/" target="_blank">
              Markdown syntax
            </a>
          </div>
          <div className="flex justify-end mt-2">
            <button onClick={handleSaveNote} className="btn btn-secondary w-32 mr-2">
              Save
            </button>
            <button onClick={() => setRulesModalOpen(false)} className="btn w-32">
              Cancel
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default RulesTab
