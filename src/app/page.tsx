'use client'

import { redirect } from 'next/navigation'
import { useEffect } from 'react'
import Image from 'next/image'
import { useUserLeagues } from '@/hooks/league'

const Home = () => {
  const { defaultLeague } = useUserLeagues()

  useEffect(() => { defaultLeague && redirect(`leagues/${defaultLeague.id}`) }, [defaultLeague])

  return (
  <main className="">
    <div className="flex flex-col items-center mt-16">
      <h1 className="text-5xl font-bold">Hello!</h1>
      <p className="mt-4">This is a Next.js template with user authentication using next-auth.</p>
      <div className="flex items-center justify-center mt-12">
        <Image
          src="/next.svg"
          alt="Next.js Logo"
          width={180}
          height={37}
          priority
        />
      </div>
    </div>
  </main>
  )
}

export default Home
