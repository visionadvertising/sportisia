import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import AdminLayout from './AdminLayout'
import API_BASE_URL from '../../config'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import {
  parseURLToFilters,
  getFacilityCount,
  generateSEOTitle,
  generateSEODescription,
  generateH1Title,
  generateDescription
} from '../../utils/seoContentGenerator'

function SEOPageEdit() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const urlParam = searchParams.get('url')
  const isNew = id === 'new' || id === 'edit'
  const isEditByUrl = !!urlParam
  
  const [loading, setLoading] = useState(!isNew || isEditByUrl)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    url: '',
    meta_title: '',
    meta_description: '',
    h1_title: '',
    description: ''
  })

  // Memorez modules și formats pentru ReactQuill
  const quillModules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link'],
      [{ 'color': [] }, { 'background': [] }],
      ['clean']
    ]
  }), [])

  const quillFormats = useMemo(() => [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'link',
    'color', 'background'
  ], [])

  useEffect(() => {
    if (isEditByUrl && urlParam) {
      setFormData(prev => ({ ...prev, url: decodeURIComponent(urlParam) }))
      fetchSEOPageByUrl()
    } else if (!isNew && id) {
      fetchSEOPage()
    } else if (isNew && !urlParam) {
      setLoading(false)
    }
  }, [id, urlParam, isNew, isEditByUrl])

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
        const url = data.data.url || ''
        // Actualizez numărul de facilități automat
        const filters = parseURLToFilters(url)
        const count = await getFacilityCount(filters, API_BASE_URL)
        
        // Actualizez Meta Title și Meta Description cu numărul actualizat
        let metaTitle = data.data.meta_title || ''
        let metaDescription = data.data.meta_description || ''
        let description = data.data.description || ''
        
        // Dacă conținutul a fost generat automat (conține număr), actualizez numărul
        if (metaTitle && count > 0) {
          metaTitle = generateSEOTitle(filters, count)
        }
        if (metaDescription && count > 0) {
          metaDescription = generateSEODescription(filters, count)
        }
        if (description && count > 0) {
          description = generateDescription(filters, count, url)
        }
        
        setFormData({
          url,
          meta_title: metaTitle,
          meta_description: metaDescription,
          h1_title: data.data.h1_title || '',
          description
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

  const fetchSEOPageByUrl = async () => {
    try {
      setLoading(true)
      const adminToken = localStorage.getItem('admin')
      if (!adminToken || !urlParam) {
        setError('Nu sunteți autentificat sau URL lipsă')
        return
      }

      const decodedUrl = decodeURIComponent(urlParam)
      const response = await fetch(`${API_BASE_URL}/seo-pages?url=${encodeURIComponent(decodedUrl)}`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      })

      const data = await response.json()
      if (data.success && data.data) {
        // Actualizez numărul de facilități automat
        const filters = parseURLToFilters(decodedUrl)
        const count = await getFacilityCount(filters, API_BASE_URL)
        
        // Actualizez Meta Title și Meta Description cu numărul actualizat
        let metaTitle = data.data.meta_title || ''
        let metaDescription = data.data.meta_description || ''
        let description = data.data.description || ''
        
        // Dacă conținutul a fost generat automat (conține număr), actualizez numărul
        if (metaTitle && count > 0) {
          metaTitle = generateSEOTitle(filters, count)
        }
        if (metaDescription && count > 0) {
          metaDescription = generateSEODescription(filters, count)
        }
        if (description && count > 0) {
          description = generateDescription(filters, count, decodedUrl)
        }
        
        setFormData({
          url: data.data.url || decodedUrl,
          meta_title: metaTitle,
          meta_description: metaDescription,
          h1_title: data.data.h1_title || '',
          description
        })
      } else {
        // Page doesn't exist yet, generate SEO content automatically
        const filters = parseURLToFilters(decodedUrl)
        const count = await getFacilityCount(filters, API_BASE_URL)
        
        const autoTitle = generateSEOTitle(filters, count)
        const autoDescription = generateSEODescription(filters, count)
        const autoH1 = generateH1Title(filters)
        const autoFullDescription = generateDescription(filters, count, decodedUrl)
        
        setFormData({
          url: decodedUrl,
          meta_title: autoTitle,
          meta_description: autoDescription,
          h1_title: autoH1,
          description: autoFullDescription
        })
      }
    } catch (err: any) {
      setError(err.message || 'Eroare la încărcarea paginii SEO')
    } finally {
      setLoading(false)
    }
  }

  const handleAutoFill = async () => {
    if (!formData.url) {
      alert('URL-ul este obligatoriu pentru auto-completare')
      return
    }

    try {
      const filters = parseURLToFilters(formData.url)
      const count = await getFacilityCount(filters, API_BASE_URL)
      
      setFormData(prev => ({
        ...prev,
        meta_title: generateSEOTitle(filters, count),
        meta_description: generateSEODescription(filters, count),
        h1_title: generateH1Title(filters),
        description: generateDescription(filters, count, formData.url)
      }))
    } catch (err: any) {
      alert('Eroare la generarea conținutului SEO: ' + err.message)
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

      if (!formData.url) {
        setError('URL-ul este obligatoriu')
        setSaving(false)
        return
      }

      // First, try to get existing page by URL
      const checkResponse = await fetch(`${API_BASE_URL}/seo-pages?url=${encodeURIComponent(formData.url)}`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      })

      const checkData = await checkResponse.json()
      let existingId = null
      if (checkData.success && checkData.data) {
        existingId = checkData.data.id
      }

      const url = existingId
        ? `${API_BASE_URL}/admin/seo-pages/${existingId}`
        : `${API_BASE_URL}/admin/seo-pages`
      
      const method = existingId ? 'PUT' : 'POST'

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
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem'
          }}>
            <h1 style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: '#0f172a',
              margin: 0
            }}>
              {isNew && !isEditByUrl ? 'Adaugă pagină SEO' : 'Editează pagină SEO'}
            </h1>
            {formData.url && (
              <button
                type="button"
                onClick={handleAutoFill}
                style={{
                  padding: '0.625rem 1.25rem',
                  background: '#6366f1',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.9375rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 4px rgba(99, 102, 241, 0.2)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#4f46e5'
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(99, 102, 241, 0.3)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#6366f1'
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(99, 102, 241, 0.2)'
                }}
              >
                🔄 Auto-completează SEO
              </button>
            )}
          </div>
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
              placeholder="Descoperă cele mai bune terenuri de fotbal din România. Explorează terenuri de fotbal pentru antrenamente și meciuri."
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
              Descriere (2-3 paragrafe, 400-500 cuvinte, cu link-uri interne)
            </label>
            <div style={{
              border: '1.5px solid #e2e8f0',
              borderRadius: '8px',
              overflow: 'hidden',
              transition: 'all 0.2s ease'
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#10b981'
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)'
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#e2e8f0'
              e.currentTarget.style.boxShadow = 'none'
            }}
            >
              <ReactQuill
                theme="snow"
                value={formData.description}
                onChange={(value) => setFormData({ ...formData, description: value })}
                modules={quillModules}
                formats={quillFormats}
                style={{
                  background: 'white',
                  minHeight: '300px'
                }}
                placeholder="Scrie descrierea aici. Poți adăuga link-uri interne folosind butonul de link din toolbar. Folosește link-uri relative (ex: /iasi/tenis/antrenori) pentru link-uri interne."
              />
            </div>
            <p style={{
              marginTop: '0.5rem',
              fontSize: '0.875rem',
              color: '#64748b'
            }}>
              Folosește link-uri interne către alte pagini relevante (ex: /iasi/tenis/antrenori). Prima paragrafă va fi afișată ca preview.
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

