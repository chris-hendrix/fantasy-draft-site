'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useGetLeagues } from '@/hooks/league'
import LeagueCard from '@/components/LeagueCard'
import Search from '@/components/Search'

const LOAD_INCREMENT = 5

const LeaguesPage: React.FC = () => {
  const [loadedUserCount, setLoadedUserCount] = useState(2 * LOAD_INCREMENT)
  const [visibleCount, setVisibleCount] = useState(LOAD_INCREMENT)
  const [search, setSearch] = useState('')

  const { data: leagues } = useGetLeagues({
    skip: 0,
    take: loadedUserCount,
    include: { teams: true, commissioners: { include: { user: true } } },
    ...(!search ? {} : { where: { name: { search: search.split(/\s+/).join(' & ') } } })
  })

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
      <Search onSearch={setSearch} />
      {leagues.slice(0, visibleCount).map((league) => (
        <Link key={league.id} href={`/leagues/${league.id}`}>
          <LeagueCard league={league} />
        </Link>
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

export default LeaguesPage
