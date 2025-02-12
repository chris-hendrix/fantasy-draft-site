'use client'

import { useState } from 'react'
import { useGetUserQuery } from '@/store'
import NotFound from '@/app/not-found'
import Profile from '@/components/Profile'
import { useParams } from 'next/navigation'
import ResetPasswordModal from '@/components/ResetPasswordModal'
import { useSessionUser } from '@/hooks/user'

const UsersProfilePage: React.FC = () => {
  const { id } = useParams()
  const { user: sessionUser } = useSessionUser()
  const { data: user, isLoading } = useGetUserQuery(id as string)
  const [resetPasswordModal, setPasswordModal] = useState(false)

  if (!user && !isLoading) return <NotFound />
  if (!user) return <></>

  return (
    <main className="w-full px-6 py-4 max-w-screen-sm">
      <Profile user={user} />
      {sessionUser?.admin && (
        <button
          type="button"
          className="btn btn-primary mt-4"
          onClick={() => setPasswordModal(true)}
        >
          Reset Password
        </button>
      )}
      {resetPasswordModal && (
        <ResetPasswordModal user={user} onClose={() => setPasswordModal(false)} />
      )}
    </main>
  )
}

export default UsersProfilePage
