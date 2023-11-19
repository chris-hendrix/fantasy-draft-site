'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useParams } from 'next/navigation'
import { useSessionUser } from '@/hooks/user'
import { useUserLeagues } from '@/hooks/league'
import Avatar from '@/components/Avatar'
import Dropdown from '@/components/Dropdown'
import LeagueModal from '@/components/LeagueModal'
import CredentialsModal from '@/components/CredentialsModal'
import { useSignOut } from '@/hooks/session'
import { useAlert } from '@/hooks/app'

import Menu from '@/icons/Menu'

const UserDropdown: React.FC = () => {
  const { user, isLoading } = useSessionUser()
  const { signOut, isSuccess: isSignOutSuccess } = useSignOut()
  const { showAlert } = useAlert()
  const [signupOpen, setSignupOpen] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)

  useEffect(() => { isSignOutSuccess && showAlert({ successMessage: 'Successfully logged out' }) }, [isSignOutSuccess])

  const renderUserLinks = () => {
    if (isLoading) return null
    if (user) {
      return <>
        <li><Link href="/profile">👤 Profile</Link></li>
        <li><a onClick={() => signOut()}>⬅️ Log out</a></li>
      </>
    }
    return <>
      <li><a onClick={() => setLoginOpen(true)}>Log in</a></li>
      <li><a onClick={() => setSignupOpen(true)} >Sign up</a></li>
    </>
  }

  return (
    <>
      <div id="dropdown" className="relative group inline-block">
        <Dropdown
          align="right-0"
          label={
            <button
              id="menu-button"
              className="btn btn-ghost avatar text-primary-content"
            >
              <Menu />
              <Avatar user={user} />
            </button>
          }>
          {renderUserLinks()}
          <div className="divider" />
          <li><Link href="/">🏠 Home</Link></li>
          <li><Link href="/users">👥 Users</Link></li>
          <li><Link href="/leagues">🏆 Leagues</Link></li>
        </Dropdown>
      </div>
      {signupOpen && <CredentialsModal setOpen={setSignupOpen} signUp />}
      {loginOpen && <CredentialsModal setOpen={setLoginOpen} />}
    </>

  )
}

const LeagueDropdown: React.FC = () => {
  const { user } = useSessionUser()
  const { commissionerLeagues } = useUserLeagues()
  const [modalOpen, setModalOpen] = useState(false)
  const pathname = usePathname()
  const { id } = useParams()

  const defaultLeague = commissionerLeagues?.[0]
  const selectedLeague = pathname.startsWith('/leagues') && id
    ? commissionerLeagues?.find((l) => l.id === id)
    : defaultLeague

  return (
    <>
      <Dropdown
        label={
          <div className="btn btn-ghost text-primary-content">
            {selectedLeague ? selectedLeague.name : 'League'} 🔽
          </div>
        }
      >
        {commissionerLeagues?.map((league) => (
          <li key={league?.id}>
            <Link href={`/leagues/${league.id}`}>{league?.name}</Link>
          </li>
        ))}
        <div className="divider" />
        <li><a onClick={() => setModalOpen(true)}>➕ Create league</a></li>
      </Dropdown>
      {modalOpen && user && <LeagueModal setOpen={setModalOpen} />}
    </>

  )
}

const Navbar: React.FC = () => {
  const { user } = useSessionUser()
  return (
    <div className="navbar bg-primary">
      <div className="navbar-start">
        <Link href="/" className="btn btn-ghost text-xl text-primary-content">Drafter</Link>
        {user && <LeagueDropdown />}
      </div>
      <div className="navbar-end">
        <UserDropdown />
      </div>
    </div>
  )
}

export default Navbar
