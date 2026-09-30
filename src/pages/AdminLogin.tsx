import { useState, type CSSProperties, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import API_BASE_URL from '../config'
import { colors, fieldLabel, focusedField, loginCard, loginGlow, loginShell, primaryButton } from '../ui/theme'

function AdminLogin() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [focused, setFocused] = useState<'user' | 'pass' | ''>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Debug: verifică dacă componenta se încarcă
  console.log('AdminLogin component loaded')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${API_BASE_URL}/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      })

      const data = await response.json()

      if (data.success) {
        // Salvează admin în localStorage
        localStorage.setItem('admin', JSON.stringify(data.admin))
        if (data.token) localStorage.setItem('adminToken', data.token)
        // Redirect la dashboard
        navigate('/admin')
      } else {
        setError(data.error || 'Credențiale invalide')
      }
    } catch (err) {
      setError('Eroare la conectarea la server')
      console.error('Admin login error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={loginShell}>
      <div style={loginGlow} />
      <div style={loginCard}>
        <p style={{ margin: '0 0 0.45rem', color: colors.greenDark, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', fontSize: '0.75rem', textAlign: 'center' }}>Sportisia</p>
        <h1 style={{ margin: 0, fontSize: '1.85rem', color: colors.ink, textAlign: 'center', letterSpacing: '-0.03em' }}>Admin</h1>
        <p style={{ color: colors.muted, textAlign: 'center', margin: '0.55rem 0 1.5rem', lineHeight: 1.5 }}>Conectează-te pentru a accesa panoul de administrare.</p>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '0.8rem 0.9rem', borderRadius: '12px', marginBottom: '1rem', fontSize: '0.92rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label style={fieldLabel}>
            Utilizator
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onFocus={() => setFocused('user')}
              onBlur={() => setFocused('')}
              autoComplete="username"
              required
              style={{ ...focusedField(focused === 'user'), marginTop: '0.4rem' }}
            />
          </label>

          <label style={{ ...fieldLabel, marginTop: '0.9rem' }}>
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
                style={{ ...focusedField(focused === 'pass'), marginTop: 0, paddingRight: '4.5rem' }}
              />
              <button type="button" onClick={() => setShowPassword((value) => !value)} style={toggle}>
                {showPassword ? 'Ascunde' : 'Arată'}
              </button>
            </span>
          </label>

          <button type="submit" disabled={loading} style={{ ...primaryButton, width: '100%', marginTop: '1.15rem', opacity: loading ? 0.7 : 1, cursor: loading ? 'wait' : 'pointer' }}>
            {loading ? 'Se conectează...' : 'Conectează-te'}
          </button>
        </form>
      </div>
    </div>
  )
}

const toggle: CSSProperties = {
  position: 'absolute',
  right: '0.75rem',
  top: '50%',
  transform: 'translateY(-50%)',
  border: 0,
  background: 'transparent',
  color: colors.greenDark,
  fontWeight: 700,
  cursor: 'pointer',
  fontFamily: 'inherit',
  fontSize: '0.85rem'
}

export default AdminLogin

