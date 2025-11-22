import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import API_BASE_URL from '../config'
import { ROMANIAN_COUNTIES } from '../data/romanian-counties'
import { ROMANIAN_CITIES } from '../data/romanian-cities'

function SuggestFacility() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  
  const [formData, setFormData] = useState({
    name: '',
    county: '',
    city: '',
    address: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Validare
    if (!formData.name.trim()) {
      setError('Denumirea este obligatorie')
      setLoading(false)
      return
    }
    if (!formData.county) {
      setError('Județul este obligatoriu')
      setLoading(false)
      return
    }
    if (!formData.city.trim()) {
      setError('Orașul este obligatoriu')
      setLoading(false)
      return
    }
    if (!formData.address.trim()) {
      setError('Adresa este obligatorie')
      setLoading(false)
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/suggestions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()
      if (data.success) {
        setSuccess(true)
        setTimeout(() => {
          navigate('/')
        }, 2000)
      } else {
        setError(data.error || 'Eroare la trimiterea sugestiei')
      }
    } catch (err: any) {
      setError(err.message || 'Eroare la trimiterea sugestiei')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (success) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
        padding: isMobile ? '2rem 1rem' : '3rem 2rem'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: isMobile ? '2rem 1.5rem' : '3rem',
          maxWidth: '500px',
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            fontSize: '4rem',
            marginBottom: '1rem'
          }}>✅</div>
          <h2 style={{
            fontSize: isMobile ? '1.5rem' : '2rem',
            color: '#0f172a',
            marginBottom: '1rem',
            fontWeight: '700'
          }}>
            Sugestie trimisă cu succes!
          </h2>
          <p style={{
            fontSize: isMobile ? '0.9375rem' : '1.0625rem',
            color: '#64748b',
            marginBottom: '2rem',
            lineHeight: '1.6'
          }}>
            Mulțumim pentru sugestie! Administratorii vor verifica și adăuga detaliile în curând.
          </p>
          <p style={{
            fontSize: '0.875rem',
            color: '#94a3b8'
          }}>
            Vei fi redirecționat în curând...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#fafafa',
      padding: isMobile ? '2rem 1rem' : '5rem 2rem'
    }}>
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '16px',
        padding: isMobile ? '2rem 1.5rem' : '3rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        <h1 style={{
          fontSize: isMobile ? '1.75rem' : '2.5rem',
          fontWeight: '700',
          color: '#0f172a',
          marginBottom: '0.5rem',
          textAlign: 'center'
        }}>
          Sugerează o facilitate
        </h1>
        <p style={{
          fontSize: isMobile ? '0.9375rem' : '1.0625rem',
          color: '#64748b',
          marginBottom: '2.5rem',
          textAlign: 'center',
          lineHeight: '1.6'
        }}>
          Completează formularul simplificat și administratorii vor adăuga restul detaliilor.
        </p>

        {error && (
          <div style={{
            padding: '1rem',
            background: '#fee2e2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            color: '#991b1b',
            marginBottom: '1.5rem',
            fontSize: '0.9375rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '2rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.9375rem',
              fontWeight: '600',
              color: '#0f172a',
              marginBottom: '0.75rem'
            }}>
              Denumire *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Ex: Teren de fotbal Central"
              required
              style={{
                width: '100%',
                padding: isMobile ? '0.875rem 1rem' : '1rem 1.25rem',
                border: '1.5px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: isMobile ? '16px' : '1.0625rem',
                lineHeight: '1.5',
                color: '#0f172a',
                background: '#ffffff',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#6366f1'
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.2)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0'
                e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)'
              }}
            />
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.9375rem',
              fontWeight: '600',
              color: '#0f172a',
              marginBottom: '0.75rem'
            }}>
              Județ *
            </label>
            <select
              value={formData.county}
              onChange={(e) => handleChange('county', e.target.value)}
              required
              style={{
                width: '100%',
                padding: isMobile ? '0.875rem 1rem' : '1rem 1.25rem',
                border: '1.5px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: isMobile ? '16px' : '1.0625rem',
                lineHeight: '1.5',
                color: '#0f172a',
                background: '#ffffff',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#6366f1'
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.2)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0'
                e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)'
              }}
            >
              <option value="">Selectează județul</option>
              {ROMANIAN_COUNTIES.map(county => (
                <option key={county} value={county}>{county}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.9375rem',
              fontWeight: '600',
              color: '#0f172a',
              marginBottom: '0.75rem'
            }}>
              Oraș *
            </label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => handleChange('city', e.target.value)}
              placeholder="Ex: București"
              required
              style={{
                width: '100%',
                padding: isMobile ? '0.875rem 1rem' : '1rem 1.25rem',
                border: '1.5px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: isMobile ? '16px' : '1.0625rem',
                lineHeight: '1.5',
                color: '#0f172a',
                background: '#ffffff',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#6366f1'
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.2)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0'
                e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)'
              }}
            />
          </div>

          <div style={{ marginBottom: '2.5rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.9375rem',
              fontWeight: '600',
              color: '#0f172a',
              marginBottom: '0.75rem'
            }}>
              Adresă completă *
            </label>
            <textarea
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="Ex: Strada Principală, Nr. 10"
              required
              rows={3}
              style={{
                width: '100%',
                padding: isMobile ? '0.875rem 1rem' : '1rem 1.25rem',
                border: '1.5px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: isMobile ? '16px' : '1.0625rem',
                lineHeight: '1.5',
                color: '#0f172a',
                background: '#ffffff',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                resize: 'vertical',
                fontFamily: 'inherit',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#6366f1'
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.2)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0'
                e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)'
              }}
            />
          </div>

          <div style={{
            display: 'flex',
            gap: '1rem',
            flexWrap: 'wrap'
          }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                minWidth: '200px',
                padding: isMobile ? '0.875rem 1.5rem' : '1rem 2rem',
                background: loading ? '#94a3b8' : '#6366f1',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: isMobile ? '0.9375rem' : '1.0625rem',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: loading ? 'none' : '0 2px 4px rgba(99, 102, 241, 0.2)'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.background = '#4f46e5'
                  e.currentTarget.style.transform = 'translateY(-1px)'
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(99, 102, 241, 0.3)'
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.background = '#6366f1'
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(99, 102, 241, 0.2)'
                }
              }}
            >
              {loading ? 'Se trimite...' : 'Trimite sugestia'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              style={{
                padding: isMobile ? '0.875rem 1.5rem' : '1rem 2rem',
                background: 'transparent',
                color: '#64748b',
                border: '1.5px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: isMobile ? '0.9375rem' : '1.0625rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#cbd5e1'
                e.currentTarget.style.color = '#0f172a'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0'
                e.currentTarget.style.color = '#64748b'
              }}
            >
              Anulează
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SuggestFacility

