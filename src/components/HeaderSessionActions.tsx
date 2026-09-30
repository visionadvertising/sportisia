import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { HeartIcon } from './icons/HeartIcon'
import { SportAvatar } from './SportAvatar'
import { AUTH_EVENT, hasUserSession, isMemberSession, readSessionUser } from '../utils/memberSession'
import { sportAvatarSeed } from '../utils/sportAvatars'

type HeaderSessionActionsProps = {
  isMobile: boolean
  onNavigate?: () => void
}

const iconButton: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '40px',
  height: '40px',
  borderRadius: '10px',
  border: '1.5px solid #e2e8f0',
  background: 'white',
  color: '#0f172a',
  textDecoration: 'none',
  transition: 'all 0.2s'
}

export function useHeaderSession() {
  const [member, setMember] = useState(isMemberSession())
  const [loggedIn, setLoggedIn] = useState(hasUserSession())

  useEffect(() => {
    const sync = () => {
      setMember(isMemberSession())
      setLoggedIn(hasUserSession())
    }
    sync()
    window.addEventListener(AUTH_EVENT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(AUTH_EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  return { member, loggedIn, user: readSessionUser() }
}

function ActionsWrap({ isMobile, children }: { isMobile: boolean; children: ReactNode }) {
  return (
    <div
      style={{
        marginLeft: isMobile ? '0' : '1.5rem',
        paddingLeft: isMobile ? '0' : '1.5rem',
        borderLeft: isMobile ? 'none' : '1px solid #e2e8f0',
        display: 'flex',
        gap: '0.75rem',
        alignItems: 'center'
      }}
    >
      {children}
    </div>
  )
}

export default function HeaderSessionActions({ isMobile, onNavigate }: HeaderSessionActionsProps) {
  const { member, loggedIn, user } = useHeaderSession()
  const avatarSeed = sportAvatarSeed(user)

  if (loggedIn) {
    return (
      <ActionsWrap isMobile={isMobile}>
        {member ? (
          <Link
            to="/salvate"
            onClick={onNavigate}
            aria-label="Facilități favorite"
            title="Favorite"
            style={{ ...iconButton, color: '#e11d48', borderColor: '#fecdd3' }}
          >
            <HeartIcon size={20} color="#e11d48" />
          </Link>
        ) : null}
        <Link
          to={member ? '/cont' : '/dashboard'}
          onClick={onNavigate}
          aria-label={member ? 'Cont sportiv' : 'Panou business'}
          title={member ? 'Cont' : 'Dashboard'}
          style={{
            ...iconButton,
            width: '40px',
            height: '40px',
            padding: '3px',
            overflow: 'hidden',
            borderColor: '#cbd5e1',
            boxSizing: 'border-box'
          }}
        >
          <SportAvatar
            seed={avatarSeed}
            customUrl={user?.avatarUrl}
            size={32}
            alt={member ? 'Cont sportiv' : 'Panou business'}
          />
        </Link>
      </ActionsWrap>
    )
  }

  return (
    <ActionsWrap isMobile={isMobile}>
      <Link
        to="/register"
        onClick={onNavigate}
        style={{
          textDecoration: 'none',
          color: 'white',
          fontWeight: '600',
          fontSize: '0.9375rem',
          padding: '0.625rem 1.25rem',
          borderRadius: '8px',
          background: '#10b981',
          boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)'
        }}
      >
        Înregistrare
      </Link>
      <Link
        to="/login"
        onClick={onNavigate}
        style={{
          textDecoration: 'none',
          color: '#0f172a',
          fontWeight: '600',
          fontSize: '0.9375rem',
          padding: '0.625rem 1.25rem',
          borderRadius: '8px',
          background: 'white',
          border: '1.5px solid #e2e8f0'
        }}
      >
        Login
      </Link>
    </ActionsWrap>
  )
}
