'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useParams } from 'next/navigation'
import { useSessionUser } from '@/hooks/user'
import { useUserLeagues } from '@/hooks/league'
import Avatar from '@/components/Avatar'
import Dropdown from '@/components/Dropdown'
import LeagueModal from '@/components/LeagueModal'
import CredentialsModal from '@/components/CredentialsModal'
import { useSignOut } from '@/hooks/session'
import { useAlert } from '@/hooks/app'
import InviteModal from '@/components/InviteModal'
import { useInviteTeams } from '@/hooks/team'
import { VERCEL_ENV } from '@/config'
import Menu from '@/icons/Menu'
import Banner from './banner'

const UserDropdown: React.FC = () => {
  const { user, isLoading } = useSessionUser()
  const { signOut, isSuccess: isSignOutSuccess } = useSignOut()
  const { showAlert } = useAlert()
  const [signupOpen, setSignupOpen] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)

  useEffect(() => { isSignOutSuccess && showAlert({ successMessage: 'Successfully logged out' }) }, [isSignOutSuccess])

  console.log('UserDropdown render - loginOpen:', loginOpen, 'signupOpen:', signupOpen)

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
          {!isLoading && user && <li><Link href="/profile">👤 Profile</Link></li>}
          {!isLoading && user && <li><a onClick={() => signOut()}>⬅️ Log out</a></li>}
          {!isLoading && !user && <li><a onClick={() => setLoginOpen(true)}>Log in</a></li>}
          {!isLoading && !user && <li><a onClick={() => setSignupOpen(true)}>Sign up</a></li>}
          <li><hr className="my-2" /></li>
          <li><Link href="/">🏠 Home</Link></li>
          <li><Link href="/users">👥 Users</Link></li>
          <li><Link href="/leagues">🏆 Leagues</Link></li>
        </Dropdown>
      </div>
      {signupOpen && <CredentialsModal onClose={() => setSignupOpen(false)} signUp />}
      {loginOpen && <CredentialsModal onClose={() => setLoginOpen(false)} />}
    </>

  )
}

const LeagueDropdown: React.FC = () => {
  const { id } = useParams()
  const { leagues } = useUserLeagues()
  const { inviteTeams } = useInviteTeams()
  const [leagueModalOpen, setLeagueModalOpen] = useState(false)
  const [inviteModalOpen, setInviteModalOpen] = useState(false)
  const pathname = usePathname()
  const selectedLeague = pathname.startsWith('/leagues') && id && leagues?.find((league) => league.id === id)

  return (
    <>
      <Dropdown
        label={
          <div id="leagues-btn" className="btn btn-ghost text-primary-content">
            {selectedLeague ? selectedLeague.name : 'My Leagues'} 🔽
          </div>
        }
      >
        {leagues?.length > 0 && <h2 className="font-bold mb-1">Leagues</h2>}
        {leagues?.map((league) => (
          <li key={league?.id}>
            <Link href={`/leagues/${league.id}`}>
              {league.sport === 'baseball' ? '⚾' : '🏈'} {league?.name}
            </Link>
          </li>
        ))}
        {leagues?.length ? <div className="divider" /> : null}
        <li><a onClick={() => setLeagueModalOpen(true)}>➕ Create league</a></li>
        {inviteTeams?.length > 0 && <li><a onClick={() => setInviteModalOpen(true)}>
          📨 League invites
        </a></li>}
      </Dropdown>
      {leagueModalOpen && <LeagueModal onClose={() => setLeagueModalOpen(false)} />}
      {inviteModalOpen && <InviteModal onClose={() => setInviteModalOpen(false)} />}
    </>
  )
}

const Navbar: React.FC = () => {
  const { user } = useSessionUser()

  return (
    <>
      <div className="navbar bg-primary">
        <div className="navbar-start">
          {user && <LeagueDropdown />}
        </div>
        <div className="navbar-center">
          <Link href="/" className="btn btn-ghost text-xl text-primary-content">
            <div className="border-white border-2 shadow-lg">
              <Image
                src="/drafter-banner.svg"
                alt="Drafter Logo"
                width={180}
                height={75}
                priority
              />
            </div>
          </Link>
        </div>
        <div className="navbar-end">
          {VERCEL_ENV !== 'production' && <div className="badge badge-error badge-lg">{VERCEL_ENV}</div>}
          <UserDropdown />
        </div>
      </div>
      <Banner />
    </>
  )
}

export default Navbar
