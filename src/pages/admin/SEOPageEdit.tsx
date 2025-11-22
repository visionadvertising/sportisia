import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import AdminLayout from './AdminLayout'
import API_BASE_URL from '../../config'

function SEOPageEdit() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isNew = id === 'new'
  
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    url: '',
    meta_title: '',
    meta_description: '',
    h1_title: '',
    description: ''
  })

  useEffect(() => {
    if (!isNew) {
      fetchSEOPage()
    }
  }, [id])

  const fetchSEOPage = async () => {
    try {
      setLoading(true)
      const adminToken = localStorage.getItem('admin')
      if (!adminToken) {
        setError('Nu sunteți autentificat')
        return
      }

      const response = await fetch(`${API_BASE_URL}/admin/seo-pages/${id}`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      })

      const data = await response.json()
      if (data.success) {
        setFormData({
          url: data.data.url || '',
          meta_title: data.data.meta_title || '',
          meta_description: data.data.meta_description || '',
          h1_title: data.data.h1_title || '',
          description: data.data.description || ''
        })
      } else {
        setError(data.error || 'Eroare la încărcarea paginii SEO')
      }
    } catch (err: any) {
      setError(err.message || 'Eroare la încărcarea paginii SEO')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      const adminToken = localStorage.getItem('admin')
      if (!adminToken) {
        setError('Nu sunteți autentificat')
        return
      }

      const url = isNew 
        ? `${API_BASE_URL}/admin/seo-pages`
        : `${API_BASE_URL}/admin/seo-pages/${id}`
      
      const method = isNew ? 'POST' : 'PUT'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()
      if (data.success) {
        navigate('/admin/seo-pages')
      } else {
        setError(data.error || 'Eroare la salvarea paginii SEO')
      }
    } catch (err: any) {
      setError(err.message || 'Eroare la salvarea paginii SEO')
    } finally {
      setSaving(false)
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
    <AdminLayout>
      <div style={{ padding: '2rem', background: '#f9fafb', minHeight: '100vh' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem' }}>
          <button
            onClick={() => navigate('/admin/seo-pages')}
            style={{
              padding: '0.5rem 1rem',
              background: 'transparent',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              color: '#64748b',
              cursor: 'pointer',
              fontSize: '0.875rem',
              marginBottom: '1rem',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#10b981'
              e.currentTarget.style.color = '#10b981'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e2e8f0'
              e.currentTarget.style.color = '#64748b'
            }}
          >
            ← Înapoi la listă
          </button>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: '700',
            color: '#0f172a',
            margin: 0
          }}>
            {isNew ? 'Adaugă pagină SEO' : 'Editează pagină SEO'}
          </h1>
        </div>

        {error && (
          <div style={{
            padding: '1rem',
            background: '#fee2e2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            color: '#991b1b',
            marginBottom: '1.5rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{
          background: 'white',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '2rem'
        }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '600',
              color: '#0f172a',
              fontSize: '0.9375rem'
            }}>
              URL
            </label>
            <input
              type="text"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              disabled={!isNew}
              required
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: '1.5px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '0.9375rem',
                color: '#0f172a',
                background: isNew ? 'white' : '#f8fafc',
                cursor: isNew ? 'text' : 'not-allowed',
                outline: 'none',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => {
                if (isNew) {
                  e.target.style.borderColor = '#10b981'
                  e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)'
                }
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0'
                e.target.style.boxShadow = 'none'
              }}
              placeholder="/fotbal/terenuri"
            />
            {!isNew && (
              <p style={{
                marginTop: '0.5rem',
                fontSize: '0.875rem',
                color: '#64748b'
              }}>
                URL-ul nu poate fi modificat după creare.
              </p>
            )}
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '600',
              color: '#0f172a',
              fontSize: '0.9375rem'
            }}>
              Meta Title
            </label>
            <input
              type="text"
              value={formData.meta_title}
              onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
              maxLength={255}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: '1.5px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '0.9375rem',
                color: '#0f172a',
                outline: 'none',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#10b981'
                e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0'
                e.target.style.boxShadow = 'none'
              }}
              placeholder="Terenuri Fotbal - Găsește terenuri de fotbal în România"
            />
            <p style={{
              marginTop: '0.5rem',
              fontSize: '0.875rem',
              color: '#64748b'
            }}>
              {formData.meta_title.length}/255 caractere
            </p>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '600',
              color: '#0f172a',
              fontSize: '0.9375rem'
            }}>
              Meta Description
            </label>
            <textarea
              value={formData.meta_description}
              onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
              rows={3}
              maxLength={500}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: '1.5px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '0.9375rem',
                color: '#0f172a',
                outline: 'none',
                resize: 'vertical',
                fontFamily: 'inherit',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#10b981'
                e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0'
                e.target.style.boxShadow = 'none'
              }}
              placeholder="Descoperă cele mai bune terenuri de fotbal din România. Rezervă online terenuri de fotbal pentru antrenamente și meciuri."
            />
            <p style={{
              marginTop: '0.5rem',
              fontSize: '0.875rem',
              color: '#64748b'
            }}>
              {formData.meta_description.length}/500 caractere
            </p>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '600',
              color: '#0f172a',
              fontSize: '0.9375rem'
            }}>
              H1 Title (Titlul paginii)
            </label>
            <input
              type="text"
              value={formData.h1_title}
              onChange={(e) => setFormData({ ...formData, h1_title: e.target.value })}
              maxLength={255}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: '1.5px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '0.9375rem',
                color: '#0f172a',
                outline: 'none',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#10b981'
                e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0'
                e.target.style.boxShadow = 'none'
              }}
              placeholder="Terenuri Sportive - Fotbal"
            />
            <p style={{
              marginTop: '0.5rem',
              fontSize: '0.875rem',
              color: '#64748b'
            }}>
              {formData.h1_title.length}/255 caractere
            </p>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '600',
              color: '#0f172a',
              fontSize: '0.9375rem'
            }}>
              Descriere (2-3 rânduri vizibile, cu expand)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={8}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: '1.5px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '0.9375rem',
                color: '#0f172a',
                outline: 'none',
                resize: 'vertical',
                fontFamily: 'inherit',
                lineHeight: '1.7',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#10b981'
                e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0'
                e.target.style.boxShadow = 'none'
              }}
              placeholder="Descoperă cele mai bune terenuri de fotbal din România. Rezervă online terenuri de fotbal pentru antrenamente și meciuri. Găsește terenuri cu iluminat, vestiare și parcare."
            />
            <p style={{
              marginTop: '0.5rem',
              fontSize: '0.875rem',
              color: '#64748b'
            }}>
              Prima linie va fi afișată ca preview. Folosiți linii noi pentru a separa paragrafele.
            </p>
          </div>

          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'flex-end'
          }}>
            <button
              type="button"
              onClick={() => navigate('/admin/seo-pages')}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'white',
                border: '1.5px solid #e2e8f0',
                borderRadius: '8px',
                color: '#64748b',
                fontWeight: '600',
                fontSize: '0.9375rem',
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
            <button
              type="submit"
              disabled={saving}
              style={{
                padding: '0.75rem 1.5rem',
                background: saving ? '#94a3b8' : '#10b981',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                fontWeight: '600',
                fontSize: '0.9375rem',
                cursor: saving ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: saving ? 'none' : '0 2px 4px rgba(16, 185, 129, 0.2)'
              }}
              onMouseEnter={(e) => {
                if (!saving) {
                  e.currentTarget.style.background = '#059669'
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(16, 185, 129, 0.3)'
                }
              }}
              onMouseLeave={(e) => {
                if (!saving) {
                  e.currentTarget.style.background = '#10b981'
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(16, 185, 129, 0.2)'
                }
              }}
            >
              {saving ? 'Se salvează...' : 'Salvează'}
            </button>
          </div>
        </form>
      </div>
    </div>
    </AdminLayout>
  )
}

export default SEOPageEdit

