'use client'

import { useGetUserQuery } from '@/store'
import NotFound from '@/app/not-found'
import Profile from '@/components/Profile'
import { useParams } from 'next/navigation'

const UsersProfilePage: React.FC = () => {
  const { id } = useParams()
  const { data: user, isLoading } = useGetUserQuery(id as string)

  if (!user && !isLoading) return <NotFound />
  if (!user) return <></>

  return (
    <main className="w-full px-6 py-4 max-w-screen-sm">
      <Profile user={user} />
    </main>
  )
}

export default UsersProfilePage
