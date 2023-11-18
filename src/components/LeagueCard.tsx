import { useState } from 'react'
import { League } from '@prisma/client'
import { formatDate } from '@/lib/date'
import LeagueModal from '@/components/LeagueModal'

interface LeagueCardProps {
  league: Partial<League>
  canEdit?: boolean
}

const LeagueCard: React.FC<LeagueCardProps> = ({ league, canEdit }) => {
  const [modalOpen, setModalOpen] = useState(false)
  return (
    <>
      <div className="flex items-center text-center md:text-left justify-between bg-base-200 rounded-box p-4 mt-4 w-full relative">
        {canEdit && (
          <button
            className="absolute top-2 right-2 text-gray-500"
            onClick={() => setModalOpen(true)}
          >
            <span className="btn btn-square btn-sm" role="img" aria-label="Edit">
              ✏️
            </span>
          </button>
        )}
        <div className="flex items-center">
          <div>
            <h3 className="text-2xl font-medium">{league?.name}</h3>
            <p className="text-gray-500">{`Sport: ${league.sport}`}</p>
            <p className="text-gray-500">{`Created on ${formatDate(String(league.createdAt))}`}</p>
          </div>
        </div>
      </div>
      {modalOpen && <LeagueModal setOpen={setModalOpen} />}
    </>
  )
}

export default LeagueCard
