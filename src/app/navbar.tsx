'use client'

import { useEffect, useState, useRef, ReactNode } from 'react'
import Link from 'next/link'
import { useSessionUser } from '@/hooks/user'
import Avatar from '@/components/Avatar'
import CreateLeagueButton from '@/components/CreateLeagueButton'
import CredentialsModal from '@/components/CredentialsModal'
import { useSignOut } from '@/hooks/session'
import { useAlert } from '@/hooks/app'

import Menu from '@/icons/Menu'

interface DropdownProps {
  children: ReactNode;
}

const Dropdown: React.FC<DropdownProps> = ({ children }) => (
  <div className="absolute right-0 mt-3 p-2 shadow menu menu-compact bg-base-200 rounded-box w-52 text-primary z-50">
    {children}
  </div>
)

const UserDropdown: React.FC = () => {
  const { user, isLoading } = useSessionUser()
  const { signOut, isSuccess: isSignOutSuccess } = useSignOut()
  const { showAlert } = useAlert()
  const [signupOpen, setSignupOpen] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const closeDropdownOnOutsideClick = (e: MouseEvent) => {
      ref.current && !ref.current.contains(e.target as Node) && setDropdownOpen(false)
    }
    document.addEventListener('mousedown', closeDropdownOnOutsideClick)
    return () => {
      document.removeEventListener('mousedown', closeDropdownOnOutsideClick)
    }
  }, [])

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
      <div id="dropdown" className="relative group inline-block" ref={ref}>
        <button
          id="menu-button"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="btn btn-ghost avatar"
        >
          <Menu />
          <Avatar user={user} />
        </button>
        {dropdownOpen && (
          <Dropdown>
            <ul className="" onClick={() => setDropdownOpen(false)}>
              {renderUserLinks()}
              <div className="divider" />
              <li><Link href="/">🏠 Home</Link></li>
              <li><Link href="/users">👥 Users</Link></li>
              <li><Link href="/leagues">🏆 Leagues</Link></li>
            </ul>
          </Dropdown>
        )}
      </div>
      {signupOpen && <CredentialsModal setOpen={setSignupOpen} signUp />}
      {loginOpen && <CredentialsModal setOpen={setLoginOpen} />}
    </>

  )
}

const MainNavbar: React.FC = () => (
  <div className="navbar bg-primary text-primary-content">
    <div className="navbar-start">
      <a className="btn btn-ghost text-xl">daisyUI</a>
    </div>
    <div className="navbar-end">
      <CreateLeagueButton />
      <UserDropdown />
    </div>
  </div>
)

const LeagueNavbar: React.FC = () => {
  const { user } = useSessionUser()
  const commissionerLeagues = user?.commissioners?.map((c) => c.league)
  const defaultLeague = commissionerLeagues?.[0]
  return (
    <div className="navbar bg-base-200">
      <div className="dropdown flex-1">
        <label tabIndex={0} className="btn btn-ghost lg:hidden">
          {defaultLeague ? defaultLeague.name : 'Select league'}
        </label>
        <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
          {commissionerLeagues?.map((league) => (<li key={league?.id}><a>{league?.name}</a></li>))}
        </ul>
      </div>
    </div>
  )
}

const Navbar: React.FC = () => {
  const { user } = useSessionUser()
  return (
    <div>
      <MainNavbar />
      {user && user?.commissioners?.length && <LeagueNavbar />}
    </div>
  )
}

export default Navbar
