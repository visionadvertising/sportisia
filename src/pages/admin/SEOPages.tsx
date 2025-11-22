import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from './AdminLayout'
import API_BASE_URL from '../../config'
import { ROMANIAN_CITIES } from '../../data/romanian-cities'
import { cityNameToSlug, sportNameToSlug, facilityTypeToSlug } from '../../utils/seo'

interface SEOPage {
  id?: number
  url: string
  meta_title?: string
  meta_description?: string
  h1_title?: string
  description?: string
  created_at?: string
  updated_at?: string
}

const KNOWN_SPORTS = ['tenis', 'fotbal', 'baschet', 'volei', 'handbal', 'badminton', 'squash', 'ping-pong', 'atletism', 'inot', 'fitness', 'box', 'karate', 'judo', 'dans']

const FACILITY_TYPES = [
  { value: 'field', label: 'Terenuri', slug: 'terenuri' },
  { value: 'coach', label: 'Antrenori', slug: 'antrenori' },
  { value: 'repair_shop', label: 'Magazine Reparații', slug: 'magazine-reparatii' },
  { value: 'equipment_shop', label: 'Magazine Articole', slug: 'magazine-articole' }
]

function SEOPages() {
  const [allPages, setAllPages] = useState<SEOPage[]>([])
  const [seoPagesMap, setSeoPagesMap] = useState<Record<string, SEOPage>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    generateAllCombinations()
    fetchSEOPages()
  }, [])

  const generateAllCombinations = () => {
    const combinations: SEOPage[] = []

    // 1. /toate (no filters)
    combinations.push({ url: '/toate' })

    // 2. /:city
    ROMANIAN_CITIES.forEach(city => {
      const citySlug = cityNameToSlug(city.city)
      combinations.push({ url: `/${citySlug}` })
    })

    // 3. /:sport
    KNOWN_SPORTS.forEach(sport => {
      const sportSlug = sportNameToSlug(sport)
      combinations.push({ url: `/${sportSlug}` })
    })

    // 4. /:type
    FACILITY_TYPES.forEach(type => {
      combinations.push({ url: `/${type.slug}` })
    })

    // 5. /:city/:sport
    ROMANIAN_CITIES.forEach(city => {
      KNOWN_SPORTS.forEach(sport => {
        const citySlug = cityNameToSlug(city.city)
        const sportSlug = sportNameToSlug(sport)
        combinations.push({ url: `/${citySlug}/${sportSlug}` })
      })
    })

    // 6. /:city/:type
    ROMANIAN_CITIES.forEach(city => {
      FACILITY_TYPES.forEach(type => {
        const citySlug = cityNameToSlug(city.city)
        combinations.push({ url: `/${citySlug}/${type.slug}` })
      })
    })

    // 7. /:sport/:type
    KNOWN_SPORTS.forEach(sport => {
      FACILITY_TYPES.forEach(type => {
        const sportSlug = sportNameToSlug(sport)
        combinations.push({ url: `/${sportSlug}/${type.slug}` })
      })
    })

    // 8. /:city/:sport/:type
    ROMANIAN_CITIES.forEach(city => {
      KNOWN_SPORTS.forEach(sport => {
        FACILITY_TYPES.forEach(type => {
          const citySlug = cityNameToSlug(city.city)
          const sportSlug = sportNameToSlug(sport)
          combinations.push({ url: `/${citySlug}/${sportSlug}/${type.slug}` })
        })
      })
    })

    setAllPages(combinations)
  }

  const fetchSEOPages = async () => {
    try {
      setLoading(true)
      const adminToken = localStorage.getItem('admin')
      if (!adminToken) {
        setError('Nu sunteți autentificat')
        return
      }

      const response = await fetch(`${API_BASE_URL}/admin/seo-pages`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      })

      const data = await response.json()
      if (data.success) {
        // Create a map of URL -> SEO data
        const map: Record<string, SEOPage> = {}
        if (data.data) {
          data.data.forEach((page: SEOPage) => {
            map[page.url] = page
          })
        }
        setSeoPagesMap(map)
      } else {
        setError(data.error || 'Eroare la încărcarea paginilor SEO')
      }
    } catch (err: any) {
      setError(err.message || 'Eroare la încărcarea paginilor SEO')
    } finally {
      setLoading(false)
    }
  }

  const getPageWithSEO = (url: string): SEOPage => {
    const seoData = seoPagesMap[url]
    if (seoData) {
      return { ...seoData, url }
    }
    return { url }
  }

  const handleDelete = async (url: string) => {
    const page = seoPagesMap[url]
    if (!page || !page.id) {
      return // Can't delete if it doesn't exist in DB
    }

    if (!confirm('Sunteți sigur că doriți să ștergeți datele SEO pentru această pagină?')) {
      return
    }

    try {
      const adminToken = localStorage.getItem('admin')
      const response = await fetch(`${API_BASE_URL}/admin/seo-pages/${page.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      })

      const data = await response.json()
      if (data.success) {
        fetchSEOPages()
      } else {
        alert(data.error || 'Eroare la ștergerea paginii SEO')
      }
    } catch (err: any) {
      alert(err.message || 'Eroare la ștergerea paginii SEO')
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <p>Se încarcă...</p>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div style={{ padding: '2rem', background: '#f9fafb', minHeight: '100vh' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem'
          }}>
            <div>
              <h1 style={{
                fontSize: '2rem',
                fontWeight: '700',
                color: '#0f172a',
                margin: '0 0 0.5rem 0'
              }}>
                Pagini SEO
              </h1>
              <p style={{
                color: '#64748b',
                fontSize: '0.9375rem',
                margin: 0
              }}>
                {allPages.length} combinații de filtre disponibile
              </p>
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

          <div style={{
            background: 'white',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '1rem',
              background: '#f8fafc',
              borderBottom: '2px solid #e2e8f0',
              display: 'flex',
              gap: '1rem',
              alignItems: 'center'
            }}>
              <input
                type="text"
                placeholder="Caută după URL..."
                id="search-input"
                style={{
                  flex: 1,
                  padding: '0.625rem 1rem',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '0.9375rem',
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
                onChange={(e) => {
                  const searchTerm = e.target.value.toLowerCase()
                  const rows = document.querySelectorAll('tbody tr')
                  rows.forEach(row => {
                    const url = row.querySelector('td:first-child code')?.textContent?.toLowerCase() || ''
                    if (url.includes(searchTerm)) {
                      (row as HTMLElement).style.display = ''
                    } else {
                      (row as HTMLElement).style.display = 'none'
                    }
                  })
                }}
              />
            </div>
            <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse'
              }}>
                <thead style={{ position: 'sticky', top: 0, background: '#f8fafc', zIndex: 10 }}>
                  <tr style={{
                    borderBottom: '2px solid #e2e8f0'
                  }}>
                    <th style={{
                      padding: '1rem',
                      textAlign: 'left',
                      fontWeight: '600',
                      color: '#0f172a',
                      fontSize: '0.875rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>URL</th>
                    <th style={{
                      padding: '1rem',
                      textAlign: 'left',
                      fontWeight: '600',
                      color: '#0f172a',
                      fontSize: '0.875rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>Meta Title</th>
                    <th style={{
                      padding: '1rem',
                      textAlign: 'left',
                      fontWeight: '600',
                      color: '#0f172a',
                      fontSize: '0.875rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>H1 Title</th>
                    <th style={{
                      padding: '1rem',
                      textAlign: 'left',
                      fontWeight: '600',
                      color: '#0f172a',
                      fontSize: '0.875rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>Status</th>
                    <th style={{
                      padding: '1rem',
                      textAlign: 'left',
                      fontWeight: '600',
                      color: '#0f172a',
                      fontSize: '0.875rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>Acțiuni</th>
                  </tr>
                </thead>
                <tbody>
                  {allPages.map((page, index) => {
                    const pageWithSEO = getPageWithSEO(page.url)
                    const hasSEO = !!seoPagesMap[page.url]
                    return (
                      <tr
                        key={page.url}
                        style={{
                          borderBottom: '1px solid #f1f5f9',
                          transition: 'background 0.15s',
                          background: hasSEO ? 'white' : '#fef3c7'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = hasSEO ? '#f8fafc' : '#fde68a'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = hasSEO ? 'white' : '#fef3c7'
                        }}
                      >
                        <td style={{
                          padding: '1rem',
                          color: '#0f172a',
                          fontWeight: '500',
                          fontSize: '0.9375rem'
                        }}>
                          <code style={{
                            background: '#f1f5f9',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.875rem',
                            color: '#10b981'
                          }}>{page.url}</code>
                        </td>
                        <td style={{
                          padding: '1rem',
                          color: '#64748b',
                          fontSize: '0.9375rem',
                          maxWidth: '300px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {pageWithSEO.meta_title || <span style={{ color: '#cbd5e1', fontStyle: 'italic' }}>Nesetat</span>}
                        </td>
                        <td style={{
                          padding: '1rem',
                          color: '#64748b',
                          fontSize: '0.9375rem',
                          maxWidth: '300px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {pageWithSEO.h1_title || <span style={{ color: '#cbd5e1', fontStyle: 'italic' }}>Nesetat</span>}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          {hasSEO ? (
                            <span style={{
                              padding: '0.25rem 0.75rem',
                              background: '#d1fae5',
                              color: '#065f46',
                              borderRadius: '12px',
                              fontSize: '0.8125rem',
                              fontWeight: '500'
                            }}>
                              Configurat
                            </span>
                          ) : (
                            <span style={{
                              padding: '0.25rem 0.75rem',
                              background: '#fef3c7',
                              color: '#92400e',
                              borderRadius: '12px',
                              fontSize: '0.8125rem',
                              fontWeight: '500'
                            }}>
                              Neconfigurat
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <div style={{
                            display: 'flex',
                            gap: '0.5rem',
                            alignItems: 'center'
                          }}>
                            <Link
                              to={`/admin/seo-pages/edit?url=${encodeURIComponent(page.url)}`}
                              style={{
                                padding: '0.5rem 1rem',
                                background: '#10b981',
                                color: 'white',
                                textDecoration: 'none',
                                borderRadius: '6px',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                transition: 'all 0.2s ease'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#059669'
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = '#10b981'
                              }}
                            >
                              {hasSEO ? 'Editează' : 'Configurează'}
                            </Link>
                            {hasSEO && (
                              <button
                                onClick={() => handleDelete(page.url)}
                                style={{
                                  padding: '0.5rem 1rem',
                                  background: '#ef4444',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '6px',
                                  fontSize: '0.875rem',
                                  fontWeight: '500',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = '#dc2626'
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = '#ef4444'
                                }}
                              >
                                Șterge
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default SEOPages
