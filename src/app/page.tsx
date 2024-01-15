'use client'

import Image from 'next/image'

const Home = () => (
  <main className="">
    <div className="flex flex-col items-center mt-16">
      <h1 className="text-5xl font-bold">Hello!</h1>
      <p className="mt-4">
        {' Welcome to the best fantasy draft site. Enjoy this AI generated logo.'}
      </p>
      <div className="flex items-center justify-center mt-12">
        <Image
          src="/drafter.png"
          alt="Next.js Logo"
          width={500}
          height={500}
          priority
        />
      </div>
    </div>
  </main>
)

export default Home
