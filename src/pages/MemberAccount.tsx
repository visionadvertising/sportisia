import { FormEvent, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import API_BASE_URL from '../config'
import { SportAvatar } from '../components/SportAvatar'
import {
  AccountCard,
  AccountField,
  AccountHomeLink,
  AccountPageLayout,
  AccountTabs,
  accountActionButton,
  accountInputStyle
} from '../components/account/AccountPageLayout'
import {
  authHeaders,
  clearUserSession,
  isMemberSession,
  readSessionUser,
  type SessionUser,
  writeSessionUser
} from '../utils/memberSession'
import { sportAvatarSeed } from '../utils/sportAvatars'
import { colors } from '../ui/theme'

export default function MemberAccount() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(readSessionUser())
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('profil')
  const [passwordMessage, setPasswordMessage] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [avatarBusy, setAvatarBusy] = useState(false)
  const [avatarError, setAvatarError] = useState('')
  const [avatarCacheKey, setAvatarCacheKey] = useState(0)
  const avatarInputRef = useRef<HTMLInputElement>(null)

  const persistProfile = (data: SessionUser) => {
    const user: SessionUser = { ...data, accountKind: 'member' }
    setProfile(user)
    writeSessionUser(user)
  }

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    if (!isMemberSession()) {
      navigate('/login/membru?next=/cont', { replace: true })
      return
    }

    fetch(`${API_BASE_URL}/member/me`, { headers: authHeaders() })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) persistProfile(data.data)
      })
      .finally(() => setLoading(false))
  }, [navigate])

  const displayAvatarUrl =
    profile?.avatarUrl && avatarCacheKey
      ? `${profile.avatarUrl}${profile.avatarUrl.includes('?') ? '&' : '?'}v=${avatarCacheKey}`
      : profile?.avatarUrl

  const handleAvatarPick = async (file: File | undefined) => {
    if (!file) return
    setAvatarError('')
    if (!/^image\/(jpeg|png|webp)$/i.test(file.type)) {
      setAvatarError('Folosește JPG, PNG sau WebP.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError('Imaginea poate avea maximum 5MB.')
      return
    }
    setAvatarBusy(true)
    try {
      const body = new FormData()
      body.append('avatar', file)
      const response = await fetch(`${API_BASE_URL}/member/avatar`, {
        method: 'POST',
        headers: authHeaders(),
        body
      })
      const data = await response.json()
      if (!data.success) {
        setAvatarError(data.error || 'Nu am putut încărca poza')
        return
      }
      if (profile) {
        persistProfile({ ...profile, avatarUrl: data.data.avatarUrl })
        setAvatarCacheKey(Date.now())
      }
    } catch {
      setAvatarError('Eroare de rețea')
    } finally {
      setAvatarBusy(false)
      if (avatarInputRef.current) avatarInputRef.current.value = ''
    }
  }

  const removeAvatar = async () => {
    setAvatarError('')
    setAvatarBusy(true)
    try {
      const response = await fetch(`${API_BASE_URL}/member/avatar`, {
        method: 'DELETE',
        headers: authHeaders()
      })
      const data = await response.json()
      if (!data.success) {
        setAvatarError(data.error || 'Nu am putut șterge poza')
        return
      }
      if (profile) {
        persistProfile({ ...profile, avatarUrl: null })
        setAvatarCacheKey(0)
      }
    } catch {
      setAvatarError('Eroare de rețea')
    } finally {
      setAvatarBusy(false)
    }
  }

  const handlePassword = async (event: FormEvent) => {
    event.preventDefault()
    setPasswordError('')
    setPasswordMessage('')
    setChangingPassword(true)
    try {
      const response = await fetch(`${API_BASE_URL}/member/change-password`, {
        method: 'POST',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword })
      })
      const data = await response.json()
      if (!data.success) {
        setPasswordError(data.error || 'Nu am putut actualiza parola')
        return
      }
      setPasswordMessage('Parola a fost actualizată.')
      setCurrentPassword('')
      setNewPassword('')
    } catch {
      setPasswordError('Eroare de rețea')
    } finally {
      setChangingPassword(false)
    }
  }

  const logout = () => {
    clearUserSession()
    navigate('/')
  }

  if (loading) {
    return (
      <div style={{ minHeight: '50vh', display: 'grid', placeItems: 'center', color: '#64748b' }}>
        Se încarcă...
      </div>
    )
  }

  const displayName =
    [profile?.firstName, profile?.lastName].filter(Boolean).join(' ') || profile?.username || 'Cont sportiv'

  return (
    <AccountPageLayout
      eyebrow="Membru comunitate"
      title={displayName}
      subtitle={profile?.email}
      avatarSeed={sportAvatarSeed(profile)}
      avatarUrl={displayAvatarUrl}
      isMobile={isMobile}
      actions={
        <>
          <Link to="/salvate" style={accountActionButton('primary')}>
            Favorite
          </Link>
          <AccountHomeLink isMobile={isMobile} />
          <button type="button" onClick={logout} style={accountActionButton('danger')}>
            Ieșire
          </button>
        </>
      }
    >
      <AccountTabs
        isMobile={isMobile}
        active={tab}
        onChange={setTab}
        tabs={[
          { id: 'profil', label: 'Profil' },
          { id: 'parola', label: 'Parolă' }
        ]}
      />

      {tab === 'profil' ? (
        <AccountCard>
          <div
            style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: isMobile ? 'flex-start' : 'center',
              gap: '1.1rem',
              marginBottom: '1.5rem',
              paddingBottom: '1.35rem',
              borderBottom: `1px solid ${colors.fieldLine}`
            }}
          >
            <SportAvatar
              seed={sportAvatarSeed(profile)}
              customUrl={displayAvatarUrl}
              size={isMobile ? 64 : 72}
              ring
              alt=""
            />
            <div style={{ minWidth: 0 }}>
              <p style={{ margin: 0, fontWeight: 700, color: colors.ink, fontSize: '0.95rem' }}>Poză profil</p>
              <p style={{ margin: '0.35rem 0 0.75rem', color: colors.muted, fontSize: '0.875rem', lineHeight: 1.45 }}>
                Poți încărca o fotografie. Dacă nu, primești un avatar amuzant generat automat pentru contul tău.
              </p>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                style={{ display: 'none' }}
                onChange={(event) => handleAvatarPick(event.target.files?.[0])}
              />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                <button
                  type="button"
                  disabled={avatarBusy}
                  onClick={() => avatarInputRef.current?.click()}
                  style={{
                    ...accountActionButton('primary'),
                    border: 'none',
                    opacity: avatarBusy ? 0.7 : 1
                  }}
                >
                  {avatarBusy ? 'Se procesează...' : profile?.avatarUrl ? 'Schimbă poza' : 'Încarcă poză'}
                </button>
                {profile?.avatarUrl ? (
                  <button
                    type="button"
                    disabled={avatarBusy}
                    onClick={removeAvatar}
                    style={{
                      padding: '0.6rem 1.05rem',
                      borderRadius: '10px',
                      background: colors.page,
                      color: '#b91c1c',
                      border: `1px solid #fecaca`,
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      cursor: avatarBusy ? 'default' : 'pointer',
                      opacity: avatarBusy ? 0.7 : 1
                    }}
                  >
                    Avatar sport implicit
                  </button>
                ) : null}
              </div>
              {avatarError ? (
                <p style={{ margin: '0.5rem 0 0', color: '#dc2626', fontSize: '0.875rem' }}>{avatarError}</p>
              ) : null}
            </div>
          </div>
          <dl
            style={{
              margin: 0,
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, minmax(0, 1fr))',
              gap: '1.25rem 2rem'
            }}
          >
            <div>
              <dt style={dtStyle}>Utilizator</dt>
              <dd style={ddStyle}>{profile?.username}</dd>
            </div>
            <div>
              <dt style={dtStyle}>Email</dt>
              <dd style={ddStyle}>{profile?.email}</dd>
            </div>
          </dl>
        </AccountCard>
      ) : (
        <AccountCard>
          <form
            onSubmit={handlePassword}
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, minmax(0, 1fr))',
              gap: '0.85rem 1.25rem',
              alignItems: 'start'
            }}
          >
            <AccountField label="Parola curentă">
              <input
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                required
                style={accountInputStyle}
              />
            </AccountField>
            <AccountField label="Parola nouă">
              <input
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                required
                minLength={9}
                style={accountInputStyle}
              />
            </AccountField>
            <div style={{ gridColumn: isMobile ? '1' : '1 / -1' }}>
              {passwordError ? <p style={{ margin: 0, color: '#dc2626', fontSize: '0.9rem' }}>{passwordError}</p> : null}
              {passwordMessage ? <p style={{ margin: '0.35rem 0 0', color: '#059669', fontSize: '0.9rem' }}>{passwordMessage}</p> : null}
              <button
                type="submit"
                disabled={changingPassword}
                style={{
                  ...accountActionButton('primary'),
                  marginTop: '0.75rem',
                  width: 'fit-content',
                  border: 'none',
                  opacity: changingPassword ? 0.7 : 1
                }}
              >
                {changingPassword ? 'Se salvează...' : 'Salvează parola'}
              </button>
            </div>
          </form>
        </AccountCard>
      )}
    </AccountPageLayout>
  )
}

const dtStyle = {
  margin: 0,
  fontSize: '0.78rem',
  fontWeight: 700,
  letterSpacing: '0.06em',
  textTransform: 'uppercase' as const,
  color: '#94a3b8'
}

const ddStyle = {
  margin: '0.25rem 0 0',
  fontSize: '1.05rem',
  color: '#0f172a',
  fontWeight: 600
}
