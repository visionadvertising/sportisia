import { useState, type CSSProperties, type FormEvent } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import API_BASE_URL from '../config'
import { notifyAuthChange } from '../utils/memberSession'
import { clearMemberSavedCache, refreshMemberSavedIds } from '../utils/savedFacilities'

type LoginProps = {
  accountKind: 'member' | 'business'
}

function Login({ accountKind }: LoginProps) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const isMemberFlow = accountKind === 'member'
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [focused, setFocused] = useState<'user' | 'pass' | ''>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      })

      const data = await response.json()

      if (data.success) {
        const kind = data.user?.accountKind === 'member' ? 'member' : 'business'
        if (isMemberFlow && kind !== 'member') {
          setError('Acest cont este de administrator facilitate. Alege login pentru administrator.')
          return
        }
        if (!isMemberFlow && kind === 'member') {
          setError('Acest cont este de membru comunitate. Alege login pentru membri.')
          return
        }

        localStorage.setItem('user', JSON.stringify(data.user))
        if (data.token) localStorage.setItem('userToken', data.token)
        clearMemberSavedCache()
        if (kind === 'member') {
          await refreshMemberSavedIds()
        }
        notifyAuthChange()
        const next = searchParams.get('next')
        if (next && next.startsWith('/')) {
          navigate(next)
        } else if (kind === 'member') {
          navigate('/cont')
        } else {
          navigate('/dashboard')
        }
        return
      }

      const adminResponse = await fetch(`${API_BASE_URL}/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      })
      const adminData = await adminResponse.json()

      if (adminData.success) {
        localStorage.setItem('admin', JSON.stringify(adminData.admin))
        if (adminData.token) localStorage.setItem('adminToken', adminData.token)
        navigate('/admin')
        return
      }

      setError(data.error || adminData.error || 'Credențiale invalide')
    } catch (err) {
      setError('Eroare la conectarea la server')
      console.error('Login error:', err)
    } finally {
      setLoading(false)
    }
  }

  const fieldStyle = (name: 'user' | 'pass'): CSSProperties => ({
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

  return (
    <div style={{
      minHeight: 'calc(100vh - 180px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 55%, #0f172a 100%)',
      padding: '3rem 1rem'
    }}>
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(circle at 20% 20%, rgba(16, 185, 129, 0.16) 0%, transparent 42%), radial-gradient(circle at 80% 80%, rgba(99, 102, 241, 0.12) 0%, transparent 40%)',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'relative',
        background: 'white',
        border: '1px solid #eef2f6',
        borderRadius: '20px',
        padding: '2rem 1.5rem',
        maxWidth: '440px',
        width: '100%',
        boxShadow: '0 24px 60px rgba(15, 23, 42, 0.28)'
      }}>
        <p style={{ margin: '0 0 0.45rem', color: '#059669', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', fontSize: '0.75rem', textAlign: 'center' }}>Sportisia</p>
        <h1 style={{ margin: 0, fontSize: '1.85rem', color: '#0f172a', textAlign: 'center', letterSpacing: '-0.03em' }}>
          {isMemberFlow ? 'Login membru comunitate' : 'Login administrator facilitate'}
        </h1>
        <p style={{ color: '#64748b', textAlign: 'center', margin: '0.55rem 0 1.5rem', lineHeight: 1.5 }}>
          {isMemberFlow
            ? 'Intră în contul tău de sportiv pentru favorite și setări personale.'
            : 'Intră în panoul de administrare al facilității tale.'}
        </p>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '0.8rem 0.9rem', borderRadius: '12px', marginBottom: '1rem', fontSize: '0.92rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label style={label}>
            Utilizator sau email
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onFocus={() => setFocused('user')}
              onBlur={() => setFocused('')}
              autoComplete="username"
              required
              style={fieldStyle('user')}
            />
          </label>

          <label style={{ ...label, marginTop: '0.9rem' }}>
            Parolă
            <span style={{ position: 'relative', display: 'block', marginTop: '0.4rem' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocused('pass')}
                onBlur={() => setFocused('')}
                autoComplete="current-password"
                required
                style={{ ...fieldStyle('pass'), marginTop: 0, paddingRight: '4.5rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                style={toggle}
              >
                {showPassword ? 'Ascunde' : 'Arată'}
              </button>
            </span>
          </label>

          <button type="submit" disabled={loading} style={{ ...submit, opacity: loading ? 0.7 : 1, cursor: loading ? 'wait' : 'pointer' }}>
            {loading ? 'Se conectează...' : 'Conectează-te'}
          </button>

          <p style={{ textAlign: 'center', margin: '1rem 0 0', color: '#64748b', fontSize: '0.92rem', lineHeight: 1.5 }}>
            <Link to="/login" style={{ color: '#059669', fontWeight: 700, textDecoration: 'none' }}>
              ← Alt tip de cont
            </Link>
            {' · '}
            <Link to="/register" style={{ color: '#059669', fontWeight: 700, textDecoration: 'none' }}>
              Înregistrare
            </Link>
          </p>
        </form>
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

export default Login
