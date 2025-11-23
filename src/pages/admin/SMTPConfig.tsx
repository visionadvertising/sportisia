import { useState, useEffect } from 'react'
import API_BASE_URL from '../../config'

interface SMTPConfig {
  host: string
  port: string
  secure: boolean
  user: string
  password: string
  from: string
}

function SMTPConfig() {
  const [config, setConfig] = useState<SMTPConfig>({
    host: '',
    port: '587',
    secure: false,
    user: '',
    password: '',
    from: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [testEmail, setTestEmail] = useState('')

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    setLoading(true)
    setError('')
    try {
      const adminToken = localStorage.getItem('admin')
      if (!adminToken) {
        setError('Nu sunteți autentificat')
        setLoading(false)
        return
      }

      const response = await fetch(`${API_BASE_URL}/admin/smtp-config`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      if (data.success) {
        setConfig({
          host: data.data.host || '',
          port: data.data.port || '587',
          secure: data.data.secure === 'true' || false,
          user: data.data.user || '',
          password: data.data.password || '',
          from: data.data.from || data.data.user || ''
        })
      } else {
        setError(data.error || 'Eroare la încărcarea configurației SMTP')
      }
    } catch (err: any) {
      console.error('Error loading SMTP config:', err)
      setError(err.message || 'Eroare la încărcarea configurației SMTP')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setSuccess('')
    
    try {
      const adminToken = localStorage.getItem('admin')
      if (!adminToken) {
        setError('Nu sunteți autentificat')
        setSaving(false)
        return
      }

      if (!config.host || !config.port || !config.user || !config.password) {
        setError('Toate câmpurile sunt obligatorii (Host, Port, User, Password)')
        setSaving(false)
        return
      }

      const response = await fetch(`${API_BASE_URL}/admin/smtp-config`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(config)
      })

      const data = await response.json()
      if (data.success) {
        setSuccess('Configurația SMTP a fost salvată cu succes')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(data.error || 'Eroare la salvarea configurației SMTP')
        setTimeout(() => setError(''), 5000)
      }
    } catch (err: any) {
      console.error('Error saving SMTP config:', err)
      setError('Eroare la conectarea la server')
      setTimeout(() => setError(''), 5000)
    } finally {
      setSaving(false)
    }
  }

  const handleTest = async () => {
    if (!testEmail || !testEmail.includes('@')) {
      setError('Te rugăm să introduci un email valid pentru test')
      return
    }

    setTesting(true)
    setError('')
    setSuccess('')
    
    try {
      const adminToken = localStorage.getItem('admin')
      if (!adminToken) {
        setError('Nu sunteți autentificat')
        setTesting(false)
        return
      }

      const response = await fetch(`${API_BASE_URL}/admin/smtp-test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ testEmail })
      })

      const data = await response.json()
      if (data.success) {
        setSuccess('Email de test trimis cu succes! Verifică inbox-ul.')
        setTimeout(() => setSuccess(''), 5000)
      } else {
        setError(data.error || 'Eroare la trimiterea email-ului de test')
        setTimeout(() => setError(''), 5000)
      }
    } catch (err: any) {
      console.error('Error testing SMTP:', err)
      setError('Eroare la conectarea la server')
      setTimeout(() => setError(''), 5000)
    } finally {
      setTesting(false)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Se încarcă...</p>
      </div>
    )
  }

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '600', marginBottom: '0.5rem', color: '#0f172a' }}>
          Configurare SMTP
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.9375rem' }}>
          Configurează setările SMTP pentru trimiterea de email-uri (credențiale după înregistrare, notificări, etc.)
        </p>
      </div>

      {error && (
        <div style={{
          padding: '1rem',
          background: '#fee2e2',
          color: '#dc2626',
          borderRadius: '8px',
          marginBottom: '1.5rem'
        }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{
          padding: '1rem',
          background: '#d1fae5',
          color: '#059669',
          borderRadius: '8px',
          marginBottom: '1.5rem'
        }}>
          {success}
        </div>
      )}

      <div style={{
        background: 'white',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        padding: '2rem'
      }}>
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem', color: '#0f172a' }}>
            Setări SMTP
          </h2>
          
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#0f172a', fontSize: '0.875rem' }}>
                SMTP Host *
              </label>
              <input
                type="text"
                value={config.host}
                onChange={(e) => setConfig({ ...config, host: e.target.value })}
                placeholder="Ex: smtp.gmail.com"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '0.875rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#0f172a', fontSize: '0.875rem' }}>
                SMTP Port *
              </label>
              <input
                type="text"
                value={config.port}
                onChange={(e) => setConfig({ ...config, port: e.target.value })}
                placeholder="Ex: 587 (TLS) sau 465 (SSL)"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '0.875rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: '600', color: '#0f172a', fontSize: '0.875rem' }}>
                <input
                  type="checkbox"
                  checked={config.secure}
                  onChange={(e) => setConfig({ ...config, secure: e.target.checked })}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                SSL/TLS Secure (folosește pentru port 465)
              </label>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#0f172a', fontSize: '0.875rem' }}>
                SMTP User (Email) *
              </label>
              <input
                type="email"
                value={config.user}
                onChange={(e) => setConfig({ ...config, user: e.target.value, from: e.target.value })}
                placeholder="Ex: noreply@sportisia.ro"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '0.875rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#0f172a', fontSize: '0.875rem' }}>
                SMTP Password *
              </label>
              <input
                type="password"
                value={config.password}
                onChange={(e) => setConfig({ ...config, password: e.target.value })}
                placeholder="Parola pentru contul SMTP"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '0.875rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#0f172a', fontSize: '0.875rem' }}>
                From Email (adresa expeditorului)
              </label>
              <input
                type="email"
                value={config.from}
                onChange={(e) => setConfig({ ...config, from: e.target.value })}
                placeholder="Ex: noreply@sportisia.ro"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '0.875rem'
                }}
              />
              <p style={{ marginTop: '0.5rem', color: '#64748b', fontSize: '0.75rem' }}>
                Dacă este lăsat gol, se va folosi SMTP User
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: '0.75rem 2rem',
              background: saving ? '#94a3b8' : '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: saving ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
          >
            {saving ? 'Se salvează...' : 'Salvează Configurația'}
          </button>
        </div>

        <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid #e2e8f0' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem', color: '#0f172a' }}>
            Testare Configurație
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1rem' }}>
            Trimite un email de test pentru a verifica dacă configurația SMTP funcționează corect.
          </p>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#0f172a', fontSize: '0.875rem' }}>
                Email de test
              </label>
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="exemplu@email.com"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '0.875rem'
                }}
              />
            </div>
            <button
              onClick={handleTest}
              disabled={testing || !testEmail}
              style={{
                padding: '0.75rem 2rem',
                background: testing || !testEmail ? '#94a3b8' : '#0f172a',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: testing || !testEmail ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem',
                fontWeight: '600',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap'
              }}
            >
              {testing ? 'Se trimite...' : 'Trimite Email de Test'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SMTPConfig

