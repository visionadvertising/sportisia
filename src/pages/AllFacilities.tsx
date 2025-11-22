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
  }, [city, sport, facilityType])

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
      background: '#ffffff',
      padding: isMobile ? '2rem 1rem' : '3rem 2rem'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        <h1 style={{
          fontSize: isMobile ? '1.75rem' : '2.75rem',
          color: '#0f172a',
          marginBottom: isMobile ? '1.5rem' : '2.5rem',
          textAlign: 'left',
          fontWeight: '700',
          lineHeight: '1.1',
          padding: isMobile ? '0' : '0',
          letterSpacing: '-0.03em'
        }}>{getPageTitle()}</h1>

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
  )
}

export default AllFacilities
