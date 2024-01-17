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

import Menu from '@/icons/Menu'

const UserDropdown: React.FC = () => {
  const { user, isLoading } = useSessionUser()
  const { signOut, isSuccess: isSignOutSuccess } = useSignOut()
  const { showAlert } = useAlert()
  const [signupOpen, setSignupOpen] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)

  useEffect(() => { isSignOutSuccess && showAlert({ successMessage: 'Successfully logged out' }) }, [isSignOutSuccess])

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
          {!isLoading && user && (
            <div>
              <li><Link href="/profile">👤 Profile</Link></li>
              <li><a onClick={() => signOut()}>⬅️ Log out</a></li>
            </div>
          )}
          {!isLoading && !user && (
            <div>
              <li><a onClick={() => setLoginOpen(true)}>Log in</a></li>
              <li><a onClick={() => setSignupOpen(true)} >Sign up</a></li>
            </div>
          )}
          <div className="divider" />
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
          <div className="btn btn-ghost text-primary-content">
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
  const { inviteTeams } = useInviteTeams()
  const { leagues } = useUserLeagues()
  const pathname = usePathname()
  const [inviteModalOpen, setInviteModalOpen] = useState(false)
  const invitesCount = inviteTeams?.length
  const defaultLeague = leagues?.[0]
  const isHome = pathname === '/'

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
          <UserDropdown />
        </div>
      </div>
      {invitesCount > 0 && isHome && (
        <div className="bg-accent p-2 text-center text-accent-content shadow-md">
          {`You have ${invitesCount} league invite(s) `}
          <a className="link" onClick={() => setInviteModalOpen(true)}>
            View
          </a>
        </div>
      )}
      {defaultLeague && isHome && (
        <div className="bg-accent p-2 text-center text-accent-content shadow-md">
          {'Go to your league '}
          <Link className="link" href={`/leagues/${defaultLeague.id}`}>
            {defaultLeague.name}
          </Link>
        </div>
      )}
      {inviteModalOpen && <InviteModal onClose={() => setInviteModalOpen(false)} />}
    </>
  )
}

export default Navbar
