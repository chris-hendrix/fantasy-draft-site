'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { League } from '@prisma/client'
import { useGetLeagues } from '@/hooks/league'
import { formatDate } from '@/lib/date'

const LOAD_INCREMENT = 5

const LeagueCard: React.FC<{ league: Partial<League> }> = ({ league }) => (
  <Link href={`/leagues/${league.id}`}>
    <div className="flex items-center text-center md:text-left justify-between bg-base-200 rounded-box p-4 mt-4 w-full">
      <div className="flex items-center">
        <div>
          <h3 className="text-2xl font-medium">{league?.name}</h3>
          <p className="text-gray-500">{`Sport: ${league.sport}`}</p>
          <p className="text-gray-500">{`Created on ${formatDate(String(league.createdAt))}`}</p>
        </div>
      </div>
    </div>
  </Link>
)

const Users: React.FC = () => {
  const [loadedUserCount, setLoadedUserCount] = useState(2 * LOAD_INCREMENT)
  const [visibleCount, setVisibleCount] = useState(LOAD_INCREMENT)

  const { data: leagues } = useGetLeagues({ skip: 0, take: loadedUserCount })

  useEffect(() => {
    // cache the next results and scroll to bottom
    setLoadedUserCount(visibleCount + LOAD_INCREMENT)
    scrollToBottom()
  }, [visibleCount])

  const scrollToBottom = () => window.scrollTo({
    top: document.body.scrollHeight,
    behavior: 'smooth',
  })

  if (!leagues) return <></>

  return (
    <main className="px-6 py-4 w-full max-w-[800px]">
      {leagues.slice(0, visibleCount).map((league) => (
        <LeagueCard key={league.id} league={league} />
      ))}
      {visibleCount < leagues.length && (
        <div className="flex justify-center mt-4">
          <button
            className="btn btn-primary btn-wide"
            onClick={() => {
              setVisibleCount(visibleCount + LOAD_INCREMENT)
            }}
          >
            Load More
          </button>
        </div>
      )}
    </main>
  )
}

export default Users
