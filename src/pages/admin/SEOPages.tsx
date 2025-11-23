import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from './AdminLayout'
import API_BASE_URL from '../../config'
import { ROMANIAN_CITIES } from '../../data/romanian-cities'
import { cityNameToSlug, sportNameToSlug, facilityTypeToSlug } from '../../utils/seo'

interface SEOPage {
  id?: number
  url: string
  category?: string // 'field', 'coach', 'repair_shop', 'equipment_shop'
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

const ITEMS_PER_PAGE = 50

function SEOPages() {
  const [allPages, setAllPages] = useState<SEOPage[]>([])
  const [seoPagesMap, setSeoPagesMap] = useState<Record<string, SEOPage>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('') // Filter by facility type
  const [availableCities, setAvailableCities] = useState<Array<{city: string, county?: string}>>(ROMANIAN_CITIES)

  useEffect(() => {
    // Generate initial combinations with ROMANIAN_CITIES immediately so page is not blank
    if (ROMANIAN_CITIES.length > 0) {
      const initialCombinations: SEOPage[] = []
      // Add basic combinations
      initialCombinations.push({ url: '/toate' })
      ROMANIAN_CITIES.forEach(city => {
        const citySlug = cityNameToSlug(city.city)
        initialCombinations.push({ url: `/${citySlug}` })
      })
      KNOWN_SPORTS.forEach(sport => {
        const sportSlug = sportNameToSlug(sport)
        initialCombinations.push({ url: `/${sportSlug}` })
      })
      FACILITY_TYPES.forEach(type => {
        initialCombinations.push({ url: `/${type.slug}`, category: type.value })
      })
      setAllPages(initialCombinations)
      setLoading(false) // Set loading to false so content is visible immediately
    }
    loadCities() // Load cities from API in background
  }, [])

  useEffect(() => {
    if (availableCities.length > 0) {
      generateAllCombinations()
      // Only fetch SEO pages if we don't have them yet
      if (Object.keys(seoPagesMap).length === 0) {
        fetchSEOPages()
      }
    }
  }, [availableCities, selectedCategory])

  const loadCities = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/cities`)
      const data = await response.json()
      if (data.success && data.data) {
        // Combine standard cities with approved cities from backend
        const backendCities = data.data.map((item: any) => ({
          city: item.city,
          county: item.county || null
        }))
        console.log('Cities loaded from API:', backendCities.map((c: any) => c.city))
        // Create a map to avoid duplicates
        const cityMap = new Map<string, {city: string, county?: string | null}>()
        // Add standard cities
        ROMANIAN_CITIES.forEach(c => {
          cityMap.set(c.city, c)
        })
        // Add API cities
        backendCities.forEach((c: {city: string, county?: string | null}) => {
          if (!cityMap.has(c.city)) {
            cityMap.set(c.city, c)
          }
        })
        const allCities = Array.from(cityMap.values()).sort((a, b) => a.city.localeCompare(b.city))
        console.log('All cities (combined):', allCities.map(c => c.city))
        setAvailableCities(allCities)
      } else {
        setAvailableCities(ROMANIAN_CITIES)
      }
    } catch (err) {
      console.error('Error loading cities:', err)
      setAvailableCities(ROMANIAN_CITIES)
    }
  }

  const generateAllCombinations = () => {
    const combinations: SEOPage[] = []
    
    // Use current availableCities or fallback to ROMANIAN_CITIES
    const citiesToUse = availableCities.length > 0 ? availableCities : ROMANIAN_CITIES

    // If a specific category is selected, only generate combinations for that category
    const typesToGenerate = selectedCategory 
      ? FACILITY_TYPES.filter(t => t.value === selectedCategory)
      : FACILITY_TYPES

    // 1. /toate (no filters) - only if no category filter
    if (!selectedCategory) {
      combinations.push({ url: '/toate' })
    }

    // 2. /:city
    console.log('Generating combinations for cities:', citiesToUse.map(c => c.city))
    citiesToUse.forEach(city => {
      const citySlug = cityNameToSlug(city.city)
      console.log(`City: ${city.city} -> Slug: ${citySlug}`)
      combinations.push({ url: `/${citySlug}` })
    })

    // 3. /:sport - only for categories that use sport (field, coach, equipment_shop)
    const sportCategories = ['field', 'coach', 'equipment_shop']
    if (!selectedCategory || sportCategories.includes(selectedCategory)) {
      KNOWN_SPORTS.forEach(sport => {
        const sportSlug = sportNameToSlug(sport)
        combinations.push({ url: `/${sportSlug}` })
      })
    }

    // 4. /:type
    typesToGenerate.forEach(type => {
      combinations.push({ url: `/${type.slug}`, category: type.value })
    })

    // 5. /:city/:sport - only for categories that use sport
    if (!selectedCategory || sportCategories.includes(selectedCategory)) {
      citiesToUse.forEach(city => {
        KNOWN_SPORTS.forEach(sport => {
          const citySlug = cityNameToSlug(city.city)
          const sportSlug = sportNameToSlug(sport)
          combinations.push({ url: `/${citySlug}/${sportSlug}` })
        })
      })
    }

    // 6. /:city/:type
    citiesToUse.forEach(city => {
      typesToGenerate.forEach(type => {
        const citySlug = cityNameToSlug(city.city)
        combinations.push({ url: `/${citySlug}/${type.slug}`, category: type.value })
      })
    })

    // 7. /:sport/:type - only for categories that use sport
    if (!selectedCategory || sportCategories.includes(selectedCategory)) {
      KNOWN_SPORTS.forEach(sport => {
        typesToGenerate.forEach(type => {
          if (sportCategories.includes(type.value)) {
            const sportSlug = sportNameToSlug(sport)
            combinations.push({ url: `/${sportSlug}/${type.slug}`, category: type.value })
          }
        })
      })
    }

    // 8. /:city/:sport/:type - only for categories that use sport
    if (!selectedCategory || sportCategories.includes(selectedCategory)) {
      citiesToUse.forEach(city => {
        KNOWN_SPORTS.forEach(sport => {
          typesToGenerate.forEach(type => {
            if (sportCategories.includes(type.value)) {
              const citySlug = cityNameToSlug(city.city)
              const sportSlug = sportNameToSlug(sport)
              combinations.push({ url: `/${citySlug}/${sportSlug}/${type.slug}`, category: type.value })
            }
          })
        })
      })
    }

    setAllPages(combinations)
    // If this is the initial load and we have combinations, set loading to false
    if (combinations.length > 0 && loading) {
      setLoading(false)
    }
  }

  const fetchSEOPages = async () => {
    try {
      // Don't set loading to true if we already have pages displayed
      const wasLoading = allPages.length === 0
      if (wasLoading) {
        setLoading(true)
      }
      setError('')
      const adminToken = localStorage.getItem('admin')
      if (!adminToken) {
        setError('Nu sunteți autentificat')
        if (wasLoading) {
          setLoading(false)
        }
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
      console.error('Error fetching SEO pages:', err)
      setError(err.message || 'Eroare la încărcarea paginilor SEO')
    } finally {
      // Only set loading to false if we set it to true
      if (allPages.length === 0) {
        setLoading(false)
      }
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

  const filteredPages = allPages.filter(page => 
    (!searchTerm || page.url.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (!selectedCategory || page.category === selectedCategory)
  )

  const totalPages = Math.ceil(filteredPages.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentPages = filteredPages.slice(startIndex, endIndex)

  useEffect(() => {
    if (searchTerm) {
      setCurrentPage(1)
    }
  }, [searchTerm])

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
                {filteredPages.length} combinații de filtre {searchTerm ? 'găsite' : 'disponibile'}
              </p>
            </div>
          </div>

          {/* Category Filter */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
            alignItems: 'center'
          }}>
            <div style={{ flex: '0 0 auto' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: '#0f172a',
                fontWeight: '600',
                fontSize: '0.875rem'
              }}>
                Filtrează după categorie:
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value)
                  setCurrentPage(1)
                }}
                style={{
                  padding: '0.625rem 1rem',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '0.9375rem',
                  outline: 'none',
                  background: '#ffffff',
                  color: '#0f172a',
                  cursor: 'pointer',
                  minWidth: '200px'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#10b981'
                  e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e2e8f0'
                  e.target.style.boxShadow = 'none'
                }}
              >
                <option value="">Toate categoriile</option>
                {FACILITY_TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
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
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
                  {currentPages.map((page, index) => {
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
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{
                padding: '1.5rem',
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '0.5rem',
                background: '#f8fafc'
              }}>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  style={{
                    padding: '0.5rem 1rem',
                    background: currentPage === 1 ? '#e2e8f0' : 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    color: currentPage === 1 ? '#94a3b8' : '#0f172a',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (currentPage !== 1) {
                      e.currentTarget.style.background = '#f1f5f9'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentPage !== 1) {
                      e.currentTarget.style.background = 'white'
                    }
                  }}
                >
                  ← Anterior
                </button>
                
                <div style={{
                  display: 'flex',
                  gap: '0.25rem',
                  alignItems: 'center'
                }}>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        style={{
                          padding: '0.5rem 0.75rem',
                          background: currentPage === pageNum ? '#10b981' : 'white',
                          border: '1px solid #e2e8f0',
                          borderRadius: '6px',
                          color: currentPage === pageNum ? 'white' : '#0f172a',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          fontWeight: currentPage === pageNum ? '600' : '500',
                          transition: 'all 0.2s ease',
                          minWidth: '40px'
                        }}
                        onMouseEnter={(e) => {
                          if (currentPage !== pageNum) {
                            e.currentTarget.style.background = '#f1f5f9'
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (currentPage !== pageNum) {
                            e.currentTarget.style.background = 'white'
                          }
                        }}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  style={{
                    padding: '0.5rem 1rem',
                    background: currentPage === totalPages ? '#e2e8f0' : 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    color: currentPage === totalPages ? '#94a3b8' : '#0f172a',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (currentPage !== totalPages) {
                      e.currentTarget.style.background = '#f1f5f9'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentPage !== totalPages) {
                      e.currentTarget.style.background = 'white'
                    }
                  }}
                >
                  Următor →
                </button>
                
                <span style={{
                  marginLeft: '1rem',
                  color: '#64748b',
                  fontSize: '0.875rem'
                }}>
                  Pagina {currentPage} din {totalPages}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default SEOPages
