import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUserLeagues } from '@/hooks/league'
import { useInviteTeams } from '@/hooks/team'
import { useCountdown } from '@/hooks/datetime'
import InviteModal from '../components/InviteModal'

const Banner: React.FC = () => {
  const [inviteModalOpen, setInviteModalOpen] = useState(false)
  const pathname = usePathname()
  const isHome = pathname === '/'

  const { inviteTeams } = useInviteTeams()
  const { defaultLeague } = useUserLeagues()
  const latestDraft = defaultLeague?.latestDraft
  const countdown = useCountdown(latestDraft?.draftTime ? new Date(latestDraft.draftTime) : null)

  const getMessage = () => {
    // home page with invite
    if (inviteTeams?.length && isHome) {
      return (
        <>
          {`You have ${inviteTeams.length} league invite(s) `}
          <a className="link" onClick={() => setInviteModalOpen(true)}>
            View
          </a>
        </>
      )
    }

    // home page without invite
    if (isHome && defaultLeague) {
      return (
        <>
          {'Go to your league '}
          <Link className="link" href={`/leagues/${defaultLeague.id}`}>
            {defaultLeague.name}
          </Link>
        </>
      )
    }

    // league page with scheduled draft
    if (latestDraft?.draftTime && new Date(latestDraft.draftTime) > new Date()) {
      return (
        <>
          {`Your draft starts in ${countdown}!`}
        </>
      )
    }

    // default
    return null
  }

  const message = getMessage()
  if (!message) return null

  return (
    <>
      <div className="bg-accent p-2 text-center text-accent-content shadow-md">
        {message}
      </div>
      {inviteModalOpen && <InviteModal onClose={() => setInviteModalOpen(false)} />}
    </>

  )
}

export default Banner
