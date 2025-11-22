import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import API_BASE_URL from '../config'

function Login() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
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
        // Salvează user în localStorage
        localStorage.setItem('user', JSON.stringify(data.user))
        // Redirect la dashboard
        navigate('/dashboard')
      } else {
        setError(data.error || 'Credențiale invalide')
      }
    } catch (err) {
      setError('Eroare la conectarea la server')
      console.error('Login error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '3rem',
        maxWidth: '500px',
        width: '100%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          color: '#1e3c72',
          marginBottom: '0.5rem',
          textAlign: 'center'
        }}>Autentificare</h1>
        <p style={{
          color: '#666',
          textAlign: 'center',
          marginBottom: '2rem'
        }}>Conectează-te pentru a gestiona facilitatea ta</p>

        {error && (
          <div style={{
            background: '#fee2e2',
            border: '1px solid #ef4444',
            color: '#991b1b',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '2rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: '#333',
              fontWeight: '500'
            }}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '1rem',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: '#333',
              fontWeight: '500'
            }}>Parolă</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '1rem',
                outline: 'none'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '1rem',
              background: loading ? '#9ca3af' : '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginBottom: '1rem'
            }}
          >
            {loading ? 'Se conectează...' : 'Conectează-te'}
          </button>

          <div style={{ textAlign: 'center' }}>
            <Link
              to="/register"
              style={{
                color: '#10b981',
                textDecoration: 'none',
                fontWeight: '500'
              }}
            >
              Nu ai cont? Înregistrează-te
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login

