'use client'

import { useGetLeague } from '@/hooks/league'
import NotFound from '@/app/not-found'

interface Props {
  params: { id: string }
}

const UsersProfilePage: React.FC<Props> = ({ params }) => {
  const { data: league, isLoading } = useGetLeague(params.id)

  if (!league && !isLoading) return <NotFound />
  if (!league) return <></>

  return (
    <main className="w-full px-6 py-4 max-w-screen-sm">
      <div>
        <h3>{league.name}</h3>
        <p>TODO</p>
      </div>
    </main>
  )
}

export default UsersProfilePage
