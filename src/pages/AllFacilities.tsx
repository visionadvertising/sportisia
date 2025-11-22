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
      background: '#f8fafc',
      padding: '1.5rem 1rem'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          color: '#1e293b',
          marginBottom: '1.5rem',
          textAlign: 'center',
          fontWeight: '700'
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
            padding: '3rem',
            color: '#64748b'
          }}>
            Se încarcă...
          </div>
        ) : facilities.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            background: 'white',
            borderRadius: '12px',
            color: '#666',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            <div style={{
              fontSize: '4rem',
              marginBottom: '1rem'
            }}>🔍</div>
            <h2 style={{
              fontSize: '1.8rem',
              color: '#333',
              marginBottom: '1rem'
            }}>Nu am găsit rezultate</h2>
            <p style={{
              fontSize: '1.2rem',
              marginBottom: '2rem',
              lineHeight: '1.6'
            }}>
              {getEmptyMessage()}
            </p>
            <p style={{
              fontSize: '1rem',
              marginBottom: '2rem',
              color: '#666'
            }}>
              Ai o facilitate sau serviciu sportiv? Înregistrează-te și ajută comunitatea să te găsească!
            </p>
            <Link
              to="/register"
              style={{
                padding: '1rem 2.5rem',
                background: '#10b981',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '8px',
                display: 'inline-block',
                fontWeight: 'bold',
                fontSize: '1.1rem',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#059669'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#10b981'
              }}
            >
              Înregistrează-te acum
            </Link>
          </div>
        ) : (
          <div>
            {Object.entries(facilitiesByType).map(([type, typeFacilities]) => (
              <div key={type} style={{ marginBottom: '3rem' }}>
                <h2 style={{
                  fontSize: '1.75rem',
                  color: '#1e293b',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontWeight: '600'
                }}>
                  <span>{FACILITY_TYPE_ICONS[type]}</span>
                  {FACILITY_TYPE_LABELS[type]} ({typeFacilities.length})
                </h2>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                  gap: '2rem'
                }}>
                  {typeFacilities.map((facility) => (
                    <div
                      key={facility.id}
                      style={{
                        background: 'white',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)'
                        e.currentTarget.style.boxShadow = '0 8px 12px rgba(0,0,0,0.15)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)'
                      }}
                    >
                      {(facility.image_url || facility.logo_url) && (
                        <div style={{
                          width: '100%',
                          height: '200px',
                          background: `url(${facility.image_url || facility.logo_url}) center/cover`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center'
                        }} />
                      )}
                      <div style={{ padding: '1.5rem' }}>
                        <h3 style={{
                          margin: '0 0 0.5rem 0',
                          fontSize: '1.3rem',
                          color: '#333'
                        }}>{facility.name}</h3>
                        <p style={{
                          margin: '0 0 0.5rem 0',
                          color: '#666',
                          fontSize: '0.9rem'
                        }}>📍 {facility.city}, {facility.location}</p>
                        {facility.sport && (
                          <p style={{
                            margin: '0 0 0.5rem 0',
                            color: '#10b981',
                            fontWeight: 'bold'
                          }}>🎾 {SPORT_NAMES[facility.sport] || facility.sport}</p>
                        )}
                        {facility.price_per_hour && (
                          <p style={{
                            margin: '0 0 1rem 0',
                            color: '#333',
                            fontSize: '1.1rem',
                            fontWeight: 'bold'
                          }}>De la {facility.price_per_hour} RON/oră</p>
                        )}
                        {facility.price_per_lesson && (
                          <p style={{
                            margin: '0 0 1rem 0',
                            color: '#333',
                            fontSize: '1.1rem',
                            fontWeight: 'bold'
                          }}>De la {facility.price_per_lesson} RON/lecție</p>
                        )}
                        {facility.specialization && (
                          <p style={{
                            margin: '0 0 1rem 0',
                            color: '#666',
                            fontSize: '0.9rem'
                          }}>Specializare: {facility.specialization}</p>
                        )}
                        {facility.description && (
                          <p style={{
                            margin: 0,
                            color: '#666',
                            fontSize: '0.9rem',
                            lineHeight: '1.5'
                          }}>{facility.description.substring(0, 100)}...</p>
                        )}
                      </div>
                    </div>
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
