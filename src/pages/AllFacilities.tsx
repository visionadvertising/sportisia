import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import API_BASE_URL from '../config'
import { citySlugToName, sportSlugToName, slugToFacilityType } from '../utils/seo'
import FacilityFilters from '../components/FacilityFilters'

interface Facility {
  id: number
  facility_type: string
  name: string
  city: string
  location: string
  phone: string
  email: string
  description?: string
  image_url?: string
  logo_url?: string
  sport?: string
  price_per_hour?: number
  price_per_lesson?: number
  specialization?: string
  services_offered?: string
  products_categories?: string
}

const FACILITY_TYPE_LABELS: Record<string, string> = {
  'field': 'Terenuri Sportive',
  'coach': 'Antrenori',
  'repair_shop': 'Magazine Reparații',
  'equipment_shop': 'Magazine Articole Sportive'
}

const FACILITY_TYPE_ICONS: Record<string, string> = {
  'field': '🏟️',
  'coach': '👨‍🏫',
  'repair_shop': '🔧',
  'equipment_shop': '🛍️'
}

const SPORT_NAMES: Record<string, string> = {
  'tenis': 'Tenis',
  'fotbal': 'Fotbal',
  'baschet': 'Baschet',
  'volei': 'Volei',
  'handbal': 'Handbal',
  'badminton': 'Badminton',
  'squash': 'Squash'
}

// List of known sport slugs
const KNOWN_SPORTS = ['tenis', 'fotbal', 'baschet', 'volei', 'handbal', 'badminton', 'squash', 'ping-pong', 'atletism', 'inot', 'fitness', 'box', 'karate', 'judo', 'dans']

// List of facility type slugs
const FACILITY_TYPE_SLUGS = ['terenuri', 'antrenori', 'magazine-reparatii', 'magazine-articole']

function AllFacilities() {
  // Read URL parameters - support multiple formats
  const params = useParams<{ 
    param1?: string
    param2?: string
    param3?: string
  }>()
  
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [seoData, setSeoData] = useState<{
    meta_title?: string
    meta_description?: string
    h1_title?: string
    description?: string
  } | null>(null)
  const [descriptionExpanded, setDescriptionExpanded] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  
  // Parse URL to determine filters
  const param1 = params.param1 || ''
  const param2 = params.param2 || ''
  const param3 = params.param3 || ''
  
  let city = ''
  let sport = ''
  let facilityType = ''
  
  // Determine what each parameter represents
  // Priority: Check facility types first, then sports, then cities
  if (param1) {
    if (FACILITY_TYPE_SLUGS.includes(param1.toLowerCase())) {
      // param1 is a type (e.g., /terenuri, /antrenori)
      facilityType = slugToFacilityType(param1)
    } else if (KNOWN_SPORTS.includes(param1.toLowerCase())) {
      // param1 is a sport (e.g., /tenis, /fotbal)
      sport = param1
      
      if (param2 && FACILITY_TYPE_SLUGS.includes(param2.toLowerCase())) {
        // param2 is a type (e.g., /tenis/terenuri)
        facilityType = slugToFacilityType(param2)
      }
    } else {
      // param1 is likely a city (e.g., /iasi, /bucuresti)
      const cityName = citySlugToName(param1)
      city = cityName
      
      if (param2) {
        if (FACILITY_TYPE_SLUGS.includes(param2.toLowerCase())) {
          // param2 is a type (e.g., /iasi/terenuri)
          facilityType = slugToFacilityType(param2)
        } else if (KNOWN_SPORTS.includes(param2.toLowerCase())) {
          // param2 is a sport (e.g., /iasi/tenis)
          sport = param2
          
          if (param3 && FACILITY_TYPE_SLUGS.includes(param3.toLowerCase())) {
            // param3 is a type (e.g., /iasi/tenis/terenuri)
            facilityType = slugToFacilityType(param3)
          }
        }
      }
    }
  }

  useEffect(() => {
    fetchFacilities()
    fetchSeoData()
  }, [city, sport, facilityType])

  const fetchSeoData = async () => {
    try {
      // Generate URL from current filters
      const url = generateCurrentURL()
      const response = await fetch(`${API_BASE_URL}/seo-pages?url=${encodeURIComponent(url)}`)
      const data = await response.json()
      if (data.success && data.data) {
        setSeoData(data.data)
        // Update document title and meta description
        if (data.data.meta_title) {
          document.title = data.data.meta_title
        }
        if (data.data.meta_description) {
          const metaDesc = document.querySelector('meta[name="description"]')
          if (metaDesc) {
            metaDesc.setAttribute('content', data.data.meta_description)
          } else {
            const meta = document.createElement('meta')
            meta.name = 'description'
            meta.content = data.data.meta_description
            document.head.appendChild(meta)
          }
        }
      } else {
        // Reset to defaults
        document.title = getPageTitle()
        setSeoData(null)
      }
    } catch (err) {
      console.error('Error fetching SEO data:', err)
      setSeoData(null)
    }
  }

  const generateCurrentURL = () => {
    const parts: string[] = []
    if (city) {
      const citySlug = param1 || city.toLowerCase().replace(/\s+/g, '-')
      parts.push(citySlug)
    }
    if (sport) {
      parts.push(sport)
    }
    if (facilityType) {
      const typeSlug = facilityType === 'field' ? 'terenuri' : 
                       facilityType === 'coach' ? 'antrenori' :
                       facilityType === 'repair_shop' ? 'magazine-reparatii' :
                       'magazine-articole'
      parts.push(typeSlug)
    }
    return parts.length > 0 ? `/${parts.join('/')}` : '/toate'
  }

  const fetchFacilities = async () => {
    setLoading(true)
    try {
      // Determine which types to fetch
      const typesToFetch = facilityType 
        ? [facilityType] 
        : ['field', 'coach', 'repair_shop', 'equipment_shop']
      
      const allFacilities: Facility[] = []

      for (const type of typesToFetch) {
        const queryParams = new URLSearchParams({ 
          type, 
          status: 'active'
        })
        
        if (city) {
          queryParams.append('city', city)
        }
        
        if (sport && (type === 'field' || type === 'coach')) {
          queryParams.append('sport', sport)
        }
        
        const response = await fetch(`${API_BASE_URL}/facilities?${queryParams}`)
        const data = await response.json()
        if (data.success && data.data) {
          allFacilities.push(...data.data)
        }
      }

      setFacilities(allFacilities)
    } catch (err) {
      console.error('Error fetching facilities:', err)
    } finally {
      setLoading(false)
    }
  }

  // Group facilities by type
  const facilitiesByType = facilities.reduce((acc, facility) => {
    if (!acc[facility.facility_type]) {
      acc[facility.facility_type] = []
    }
    acc[facility.facility_type].push(facility)
    return acc
  }, {} as Record<string, Facility[]>)

  // Generate page title
  const getPageTitle = () => {
    if (seoData?.h1_title) {
      return seoData.h1_title
    }
    if (facilityType && sport && city) {
      return `${FACILITY_TYPE_LABELS[facilityType]} - ${SPORT_NAMES[sport] || sport} în ${city}`
    } else if (facilityType && city) {
      return `${FACILITY_TYPE_LABELS[facilityType]} în ${city}`
    } else if (facilityType && sport) {
      return `${FACILITY_TYPE_LABELS[facilityType]} - ${SPORT_NAMES[sport] || sport}`
    } else if (sport && city) {
      return `Toate facilitățile pentru ${SPORT_NAMES[sport] || sport} în ${city}`
    } else if (city) {
      return `Toate facilitățile în ${city}`
    } else if (sport) {
      return `Toate facilitățile pentru ${SPORT_NAMES[sport] || sport}`
    } else if (facilityType) {
      return FACILITY_TYPE_LABELS[facilityType]
    }
    return 'Toate facilitățile'
  }

  const getDescription = () => {
    return seoData?.description || ''
  }

  const getDescriptionPreview = () => {
    const desc = getDescription()
    if (!desc) return ''
    // Extract first paragraph from HTML
    const firstParagraphMatch = desc.match(/<p>(.*?)<\/p>/)
    if (firstParagraphMatch) {
      return firstParagraphMatch[1].replace(/<[^>]*>/g, '') // Remove HTML tags for preview
    }
    // Fallback: first 200 characters
    return desc.replace(/<[^>]*>/g, '').substring(0, 200)
  }

  const hasMoreContent = () => {
    const desc = getDescription()
    if (!desc) return false
    const paragraphs = desc.match(/<p>/g)
    return paragraphs && paragraphs.length > 1
  }

  // Get empty message
  const getEmptyMessage = () => {
    if (facilityType && sport && city) {
      return `Momentan nu sunt ${FACILITY_TYPE_LABELS[facilityType].toLowerCase()} pentru ${SPORT_NAMES[sport]?.toLowerCase() || sport} în ${city}.`
    } else if (facilityType && city) {
      return `Momentan nu sunt ${FACILITY_TYPE_LABELS[facilityType].toLowerCase()} în ${city}.`
    } else if (facilityType && sport) {
      return `Momentan nu sunt ${FACILITY_TYPE_LABELS[facilityType].toLowerCase()} pentru ${SPORT_NAMES[sport]?.toLowerCase() || sport}.`
    } else if (sport && city) {
      return `Momentan nu sunt facilități disponibile pentru ${SPORT_NAMES[sport]?.toLowerCase() || sport} în ${city}.`
    } else if (city) {
      return `Momentan nu sunt facilități disponibile în ${city}.`
    } else if (sport) {
      return `Momentan nu sunt facilități disponibile pentru ${SPORT_NAMES[sport]?.toLowerCase() || sport}.`
    } else if (facilityType) {
      return `Momentan nu sunt ${FACILITY_TYPE_LABELS[facilityType].toLowerCase()} disponibile.`
    }
    return 'Momentan nu sunt facilități disponibile.'
  }

  // Convert city name to slug for dropdown
  const citySlug = city ? param1 : ''
  // Convert sport slug to value for dropdown
  const sportValue = sport || ''
  // Convert facility type to value for dropdown
  const typeValue = facilityType || ''

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
      padding: 0
    }}>
      {/* Hero Section */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
        padding: isMobile ? '3rem 1rem 2rem' : '5rem 2rem 3rem',
        textAlign: 'center',
        color: 'white'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <h1 style={{
            fontSize: isMobile ? '2rem' : '3rem',
            color: 'white',
            marginBottom: isMobile ? '1.5rem' : '2rem',
            fontWeight: '700',
            lineHeight: '1.2',
            padding: isMobile ? '0 0.5rem' : '0',
            letterSpacing: '-0.02em'
          }}>{getPageTitle()}</h1>
          
          {/* SEO Description */}
          {getDescription() && (
            <div style={{
              maxWidth: '900px',
              margin: '0 auto',
              textAlign: 'left',
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              borderRadius: '12px',
              padding: isMobile ? '1.25rem' : '1.75rem',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <div 
                style={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontSize: isMobile ? '0.9375rem' : '1.0625rem',
                  lineHeight: '1.7'
                }}
                dangerouslySetInnerHTML={{
                  __html: descriptionExpanded ? getDescription() : `<p>${getDescriptionPreview()}...</p>`
                }}
              />
              {hasMoreContent() && (
                <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                  <button
                    onClick={() => setDescriptionExpanded(!descriptionExpanded)}
                    style={{
                      padding: '0.625rem 1.5rem',
                      background: 'rgba(16, 185, 129, 0.2)',
                      border: '1px solid rgba(16, 185, 129, 0.4)',
                      borderRadius: '8px',
                      color: '#10b981',
                      fontSize: isMobile ? '0.875rem' : '0.9375rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      backdropFilter: 'blur(10px)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(16, 185, 129, 0.3)'
                      e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.6)'
                      e.currentTarget.style.transform = 'translateY(-2px)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(16, 185, 129, 0.2)'
                      e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.4)'
                      e.currentTarget.style.transform = 'translateY(0)'
                    }}
                  >
                    {descriptionExpanded ? (
                      <>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 15l-6-6-6 6"/>
                        </svg>
                        Revenire
                      </>
                    ) : (
                      <>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M6 9l6 6 6-6"/>
                        </svg>
                        Continuă lectura
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div style={{
        background: '#ffffff',
        borderRadius: isMobile ? '24px 24px 0 0' : '32px 32px 0 0',
        padding: isMobile ? '2rem 1rem' : '3rem 2rem',
        marginTop: '-1px'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto'
        }}>

        <FacilityFilters
          selectedCity={city}
          selectedSport={sportValue}
          selectedType={typeValue}
          showTypeFilter={true}
        />

          {loading ? (
            <div style={{
              textAlign: 'center',
              padding: isMobile ? '2rem 1rem' : '3rem',
              color: '#64748b',
              fontSize: isMobile ? '0.9375rem' : '1rem'
            }}>
              Se încarcă...
            </div>
          ) : facilities.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: isMobile ? '2rem 1rem' : '3rem',
            background: 'white',
            borderRadius: isMobile ? '8px' : '12px',
            color: '#666',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            <div style={{
              fontSize: isMobile ? '3rem' : '4rem',
              marginBottom: isMobile ? '0.75rem' : '1rem'
            }}>🔍</div>
            <h2 style={{
              fontSize: isMobile ? '1.25rem' : '1.8rem',
              color: '#333',
              marginBottom: isMobile ? '0.75rem' : '1rem',
              fontWeight: '600'
            }}>Nu am găsit rezultate</h2>
            <p style={{
              fontSize: isMobile ? '0.9375rem' : '1.2rem',
              marginBottom: isMobile ? '1.5rem' : '2rem',
              lineHeight: '1.6',
              padding: isMobile ? '0 0.5rem' : '0'
            }}>
              {getEmptyMessage()}
            </p>
            <p style={{
              fontSize: isMobile ? '0.875rem' : '1rem',
              marginBottom: isMobile ? '1.5rem' : '2rem',
              color: '#666',
              padding: isMobile ? '0 0.5rem' : '0'
            }}>
              Ai o facilitate sau serviciu sportiv? Înregistrează-te și ajută comunitatea să te găsească!
            </p>
            <Link
              to="/register"
              style={{
                padding: isMobile ? '0.875rem 1.5rem' : '1rem 2.5rem',
                background: '#10b981',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '8px',
                display: 'inline-block',
                fontWeight: '600',
                fontSize: isMobile ? '0.9375rem' : '1.1rem',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#059669'
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(16, 185, 129, 0.3)'
                e.currentTarget.style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#10b981'
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(16, 185, 129, 0.2)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              Înregistrează-te acum
            </Link>
          </div>
          ) : (
            <div>
              {Object.entries(facilitiesByType).map(([type, typeFacilities]) => (
              <div key={type} style={{ marginBottom: isMobile ? '3rem' : '4rem' }}>
                <h2 style={{
                  fontSize: isMobile ? '1.5rem' : '2rem',
                  color: '#0f172a',
                  marginBottom: isMobile ? '1.5rem' : '2rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  fontWeight: '700',
                  flexWrap: 'wrap',
                  letterSpacing: '-0.02em'
                }}>
                  <span style={{ fontSize: isMobile ? '1.25rem' : '1.5rem' }}>{FACILITY_TYPE_ICONS[type]}</span>
                  <span>{FACILITY_TYPE_LABELS[type]} <span style={{ color: '#64748b', fontWeight: '500', fontSize: isMobile ? '1.125rem' : '1.375rem' }}>({typeFacilities.length})</span></span>
                </h2>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile 
                    ? '1fr' 
                    : 'repeat(auto-fill, minmax(320px, 1fr))',
                  gap: isMobile ? '1.5rem' : '2rem'
                }}>
                  {typeFacilities.map((facility) => (
                    <Link
                      key={facility.id}
                      to={`/facility/${facility.id}`}
                      style={{
                        background: 'white',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                        border: '1px solid #f1f5f9',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                        textDecoration: 'none',
                        display: 'block'
                      }}
                      onMouseEnter={(e) => {
                        if (!isMobile) {
                          e.currentTarget.style.transform = 'translateY(-6px)'
                          e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.12)'
                          e.currentTarget.style.borderColor = '#e2e8f0'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isMobile) {
                          e.currentTarget.style.transform = 'translateY(0)'
                          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)'
                          e.currentTarget.style.borderColor = '#f1f5f9'
                        }
                      }}
                    >
                      {(facility.image_url || facility.logo_url) && (
                        <div style={{
                          width: '100%',
                          height: isMobile ? '200px' : '220px',
                          background: `url(${facility.image_url || facility.logo_url}) center/cover`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          position: 'relative'
                        }} />
                      )}
                      <div style={{ padding: isMobile ? '1.25rem' : '1.75rem' }}>
                        <h3 style={{
                          margin: '0 0 0.75rem 0',
                          fontSize: isMobile ? '1.25rem' : '1.5rem',
                          color: '#0f172a',
                          fontWeight: '700',
                          lineHeight: '1.3',
                          letterSpacing: '-0.01em'
                        }}>{facility.name}</h3>
                        <p style={{
                          margin: '0 0 0.75rem 0',
                          color: '#64748b',
                          fontSize: isMobile ? '0.875rem' : '0.9375rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}>
                          <span style={{ fontSize: '1rem' }}>📍</span>
                          <span>{facility.city}{facility.location ? `, ${facility.location}` : ''}</span>
                        </p>
                        {facility.sport && (
                          <div style={{
                            margin: '0 0 1rem 0',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.375rem 0.75rem',
                            background: '#f0fdf4',
                            borderRadius: '6px',
                            color: '#10b981',
                            fontWeight: '600',
                            fontSize: isMobile ? '0.8125rem' : '0.875rem'
                          }}>
                            <span>🎾</span>
                            <span>{SPORT_NAMES[facility.sport] || facility.sport}</span>
                          </div>
                        )}
                        {(facility.price_per_hour || facility.price_per_lesson) && (
                          <div style={{
                            marginTop: '1rem',
                            paddingTop: '1rem',
                            borderTop: '1px solid #f1f5f9'
                          }}>
                            {facility.price_per_hour && (
                              <p style={{
                                margin: 0,
                                color: '#0f172a',
                                fontSize: isMobile ? '1.125rem' : '1.25rem',
                                fontWeight: '700'
                              }}>De la {facility.price_per_hour} RON/oră</p>
                            )}
                            {facility.price_per_lesson && (
                              <p style={{
                                margin: 0,
                                color: '#0f172a',
                                fontSize: isMobile ? '1.125rem' : '1.25rem',
                                fontWeight: '700'
                              }}>De la {facility.price_per_lesson} RON/lecție</p>
                            )}
                          </div>
                        )}
                        {facility.specialization && (
                          <p style={{
                            margin: '0 0 1rem 0',
                            color: '#64748b',
                            fontSize: isMobile ? '0.8125rem' : '0.9rem'
                          }}>Specializare: {facility.specialization}</p>
                        )}
                        {facility.description && (
                          <p style={{
                            margin: 0,
                            color: '#64748b',
                            fontSize: isMobile ? '0.8125rem' : '0.9rem',
                            lineHeight: '1.5',
                            display: '-webkit-box',
                            WebkitLineClamp: isMobile ? 2 : 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}>{facility.description}</p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AllFacilities
