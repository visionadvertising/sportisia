import { FormEvent, useEffect, useState, type CSSProperties } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import API_BASE_URL from '../config'
import { siteContainer, siteHorizontalPadding } from '../ui/theme'
import { notifyAuthChange } from '../utils/memberSession'
import { clearMemberSavedCache, refreshMemberSavedIds } from '../utils/savedFacilities'

type FocusField = 'first' | 'last' | 'email' | 'pass' | ''

export default function RegisterMember() {
  const navigate = useNavigate()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [focused, setFocused] = useState<FocusField>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768)

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const fieldStyle = (name: FocusField): CSSProperties => ({
    width: '100%',
    boxSizing: 'border-box',
    marginTop: '0.4rem',
    padding: '0.85rem 0.95rem',
    border: `1px solid ${focused === name ? '#10b981' : '#e2e8f0'}`,
    borderRadius: '12px',
    fontSize: '1rem',
    outline: 'none',
    background: '#f8fafc',
    color: '#0f172a',
    fontFamily: 'inherit',
    boxShadow: focused === name ? '0 0 0 3px rgba(16, 185, 129, 0.15)' : 'none'
  })

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`${API_BASE_URL}/member/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, password })
      })
      const data = await response.json()
      if (!data.success) {
        setError(data.error || 'Nu am putut crea contul')
        return
      }
      localStorage.setItem('user', JSON.stringify(data.user))
      if (data.token) localStorage.setItem('userToken', data.token)
      clearMemberSavedCache()
      await refreshMemberSavedIds()
      notifyAuthChange()
      navigate('/cont')
    } catch {
      setError('Eroare la conectarea la server')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 180px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 55%, #0f172a 100%)',
        paddingTop: isMobile ? '2.5rem' : '3rem',
        paddingBottom: isMobile ? '2.5rem' : '3rem',
        ...siteHorizontalPadding(isMobile)
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 18% 22%, rgba(16, 185, 129, 0.18) 0%, transparent 42%), radial-gradient(circle at 82% 78%, rgba(99, 102, 241, 0.12) 0%, transparent 40%)',
          pointerEvents: 'none'
        }}
      />

      <div style={{ ...siteContainer(), position: 'relative', zIndex: 1 }}>
      <div
        style={{
          width: '100%',
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1.05fr',
          gap: isMobile ? '1.25rem' : '0',
          borderRadius: '22px',
          overflow: 'hidden',
          boxShadow: '0 28px 70px rgba(0, 0, 0, 0.35)',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}
      >
        <aside
          style={{
            padding: isMobile ? '1.75rem 1.5rem 1.25rem' : '2.5rem 2rem',
            background: 'linear-gradient(160deg, rgba(16, 185, 129, 0.22) 0%, rgba(15, 23, 42, 0.92) 55%)',
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}
        >
          <Link
            to="/register"
            style={{
              color: 'rgba(255,255,255,0.85)',
              fontWeight: 600,
              fontSize: '0.88rem',
              textDecoration: 'none',
              marginBottom: '1.25rem',
              width: 'fit-content'
            }}
          >
            ← Alt tip de cont
          </Link>
          <p
            style={{
              margin: '0 0 0.5rem',
              color: '#6ee7b7',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              fontSize: '0.72rem'
            }}
          >
            Membru comunitate
          </p>
          <h1
            style={{
              margin: 0,
              fontSize: isMobile ? '1.65rem' : '2rem',
              letterSpacing: '-0.03em',
              lineHeight: 1.15
            }}
          >
            Cont sportiv
          </h1>
          {!isMobile ? (
            <p style={{ margin: '0.75rem 0 0', color: 'rgba(255,255,255,0.72)', lineHeight: 1.5, fontSize: '0.95rem' }}>
              Favorite și setări personale.
            </p>
          ) : null}
        </aside>

        <div
          style={{
            background: 'white',
            padding: isMobile ? '1.5rem 1.35rem 1.75rem' : '2.25rem 2rem 2rem'
          }}
        >
          {error ? (
            <div
              style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#991b1b',
                padding: '0.8rem 0.9rem',
                borderRadius: '12px',
                marginBottom: '1rem',
                fontSize: '0.92rem'
              }}
            >
              {error}
            </div>
          ) : null}

          <form onSubmit={handleSubmit}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                gap: '0.85rem'
              }}
            >
              <label style={label}>
                Prenume
                <input
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  onFocus={() => setFocused('first')}
                  onBlur={() => setFocused('')}
                  autoComplete="given-name"
                  style={fieldStyle('first')}
                />
              </label>
              <label style={label}>
                Nume
                <input
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  onFocus={() => setFocused('last')}
                  onBlur={() => setFocused('')}
                  autoComplete="family-name"
                  style={fieldStyle('last')}
                />
              </label>
            </div>

            <label style={{ ...label, marginTop: '0.85rem', display: 'block' }}>
              Email *
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                onFocus={() => setFocused('email')}
                onBlur={() => setFocused('')}
                autoComplete="email"
                style={fieldStyle('email')}
              />
            </label>

            <label style={{ ...label, marginTop: '0.85rem', display: 'block' }}>
              Parolă *
              <span style={{ position: 'relative', display: 'block', marginTop: '0.4rem' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  onFocus={() => setFocused('pass')}
                  onBlur={() => setFocused('')}
                  autoComplete="new-password"
                  style={{ ...fieldStyle('pass'), marginTop: 0, paddingRight: '4.5rem' }}
                />
                <button type="button" onClick={() => setShowPassword((value) => !value)} style={toggle}>
                  {showPassword ? 'Ascunde' : 'Arată'}
                </button>
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              style={{
                ...submit,
                opacity: loading ? 0.75 : 1,
                cursor: loading ? 'wait' : 'pointer'
              }}
            >
              {loading ? 'Se creează...' : 'Creează cont'}
            </button>
          </form>

          <p style={{ textAlign: 'center', margin: '1.1rem 0 0', color: '#64748b', fontSize: '0.92rem' }}>
            Ai deja cont?{' '}
            <Link to="/login/membru" style={{ color: '#059669', fontWeight: 700, textDecoration: 'none' }}>
              Autentifică-te
            </Link>
          </p>
        </div>
      </div>
      </div>
    </div>
  )
}

const label: CSSProperties = {
  display: 'block',
  color: '#0f172a',
  fontWeight: 700,
  fontSize: '0.9rem'
}

const toggle: CSSProperties = {
  position: 'absolute',
  right: '0.75rem',
  top: '50%',
  transform: 'translateY(-50%)',
  border: 0,
  background: 'transparent',
  color: '#059669',
  fontWeight: 700,
  cursor: 'pointer',
  fontFamily: 'inherit',
  fontSize: '0.85rem'
}

const submit: CSSProperties = {
  width: '100%',
  marginTop: '1.15rem',
  padding: '0.9rem 1rem',
  background: '#10b981',
  color: 'white',
  border: 'none',
  borderRadius: '999px',
  fontSize: '1rem',
  fontWeight: 700,
  fontFamily: 'inherit'
}
