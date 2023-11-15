'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { useSessionUser } from '@/hooks/user'
import Avatar from '@/components/Avatar'
import LeagueDropdown from '@/components/LeagueDropdown'
import CredentialsModal from '@/components/CredentialsModal'
import { useSignOut } from '@/hooks/session'
import { useAlert } from '@/hooks/app'

import Menu from '@/icons/Menu'

const Dropdown: React.FC = () => {
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
          <div className="absolute right-0 mt-3 p-2 shadow menu menu-compact bg-base-200 rounded-box w-52 text-primary z-50">
            <ul className="" onClick={() => setDropdownOpen(false)}>
              {renderUserLinks()}
              <div className="divider" />
              <li><Link href="/">🏠 Home</Link></li>
              <li><Link href="/users">👥 Users</Link></li>
              <li><Link href="/leagues">🏆 Leagues</Link></li>
            </ul>
          </div>
        )}
      </div>
      {signupOpen && <CredentialsModal setOpen={setSignupOpen} signUp />}
      {loginOpen && <CredentialsModal setOpen={setLoginOpen} />}
    </>

  )
}

const Navbar: React.FC = () => (
  <div className="navbar bg-primary text-primary-content">
    <div className="navbar-start">
      <LeagueDropdown />
    </div>
    <div className="navbar-center text-xl font-medium">
      <Link href="/">Next.js Boilerplate</Link>
    </div>
    <div className="navbar-end">
      <Dropdown />
    </div>
  </div>
)

export default Navbar
