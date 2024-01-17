'use client'

import Image from 'next/image'

const Home = () => (
  <main className="">
    <div className="flex flex-col items-center mt-16">
      <h1 className="text-5xl font-bold">Hello!</h1>
      <div className="max-w-xl mt-4">
        Enjoy this AI generated logo of a baseball sitting in an office chair next to&nbsp;
        a desk that has merged with the floor and some baseball bat looking rolling pins&nbsp;
        in the background!
      </div>
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
