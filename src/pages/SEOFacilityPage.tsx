import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link, Navigate } from 'react-router-dom'
import API_BASE_URL from '../config'
import { 
  citySlugToName, 
  sportSlugToName,
  sportNameToSlug,
  slugToFacilityType,
  generateFacilityURL,
  generateSportURL
} from '../utils/seo'
import FacilityFilters from '../components/FacilityFilters'
import { card, colors, column, contentBand, hero, heroOverlay, heroTitle, pageShell, primaryButton, secondaryButton } from '../ui/theme'

// List of known sport slugs
const KNOWN_SPORTS = ['tenis', 'fotbal', 'baschet', 'volei', 'handbal', 'badminton', 'squash', 'ping-pong', 'atletism', 'inot', 'fitness', 'box', 'karate', 'judo', 'dans']

// List of facility type slugs
const FACILITY_TYPE_SLUGS = ['terenuri', 'antrenori', 'magazine-reparatii', 'magazine-articole', 'recuperare-sportiva']

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

const FACILITY_TYPE_TITLES: Record<string, string> = {
  'field': 'Terenuri Sportive',
  'coach': 'Antrenori',
  'repair_shop': 'Magazine Reparații Articole Sportive',
  equipment_shop: 'Magazine Articole Sportive',
  sports_recovery: 'Recuperare sportivă'
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

function SEOFacilityPage() {
  const params = useParams<{ city?: string; sport?: string; type?: string }>()
  const navigate = useNavigate()
  
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCity, setSelectedCity] = useState('')
  const [selectedSport, setSelectedSport] = useState('')

  // Parse URL parameters
  // URL formats:
  // - /:city/:sport/:type (e.g., /baia-mare/fotbal/terenuri)
  // - /:city/:type (e.g., /baia-mare/terenuri)
  // - /:sport/:type (e.g., /fotbal/terenuri)
  
  const citySlug = params.city || ''
  const sportSlug = params.sport || ''
  const typeSlug = params.type || ''

  // Determine what we have based on what params exist
  // If we have city param, first segment is city
  // If we have sport param, it could be second segment (after city) or first segment (no city)
  // If we have type param, it's always the last segment
  
  // Check if we have /:city/:type format but the second param is actually a sport
  // In this case, React Router matched /:city/:type but we need to redirect to /:city/:sport
  if (citySlug && typeSlug && !sportSlug) {
    // Check if typeSlug is actually a sport (not a facility type)
    if (KNOWN_SPORTS.includes(typeSlug.toLowerCase()) && !FACILITY_TYPE_SLUGS.includes(typeSlug.toLowerCase())) {
      // It's a sport, redirect to /:city/:sport
      return <Navigate to={`/${citySlug}/${typeSlug}`} replace />
    }
  }
  
  let city = ''
  let sportName = '' // For display
  let sportSlugValue = '' // For dropdown value (slug)
  let facilityType = ''
  
  if (citySlug) {
    // We have a city - first segment
    city = citySlugToName(citySlug)
    
    if (sportSlug && typeSlug) {
      // Format: /:city/:sport/:type
      // BUT: Check if sportSlug is actually a facility type (not a sport)
      // This handles cases like /iasi/antrenori/terenuri where "antrenori" is a type, not a sport
      if (FACILITY_TYPE_SLUGS.includes(sportSlug.toLowerCase())) {
        // The second param is actually a facility type, not a sport
        // Check if the third param is also a facility type (invalid URL like /iasi/antrenori/terenuri)
        // If so, use the third param as the type, otherwise use the second param
        if (FACILITY_TYPE_SLUGS.includes(typeSlug.toLowerCase())) {
          // Both are facility types - use the third one and redirect
          return <Navigate to={`/${citySlug}/${typeSlug}`} replace />
        } else {
          // Second is facility type, third is something else - use second and redirect
          return <Navigate to={`/${citySlug}/${sportSlug}`} replace />
        }
      } else {
        // It's a real sport
        sportName = sportSlugToName(sportSlug)
        sportSlugValue = sportSlug
        facilityType = slugToFacilityType(typeSlug)
      }
    } else if (typeSlug && !sportSlug) {
      // Format: /:city/:type
      facilityType = slugToFacilityType(typeSlug)
    } else if (sportSlug && !typeSlug) {
      // Format: /:city/:sport (handled by AllFacilitiesByCityAndSport)
      // BUT: Check if sportSlug is actually a facility type
      if (FACILITY_TYPE_SLUGS.includes(sportSlug.toLowerCase())) {
        // It's a facility type, redirect to /:city/:type
        return <Navigate to={`/${citySlug}/${sportSlug}`} replace />
      }
      sportName = sportSlugToName(sportSlug)
      sportSlugValue = sportSlug
    }
  } else if (sportSlug) {
    // No city, but we have sport - first segment is sport
    sportName = sportSlugToName(sportSlug)
    sportSlugValue = sportSlug
    
    if (typeSlug) {
      // Format: /:sport/:type
      facilityType = slugToFacilityType(typeSlug)
    }
  }

  useEffect(() => {
    if (facilityType) {
      if (city) {
        setSelectedCity(city)
      }
      if (sportSlugValue) {
        setSelectedSport(sportSlugValue) // Use slug, not name
      }
      fetchFacilities()
    }
  }, [city, sportSlugValue, facilityType])

  const fetchFacilities = async () => {
    setLoading(true)
    try {
      const queryParams = new URLSearchParams({ type: facilityType, status: 'active' })
      if (city) queryParams.append('city', city)
      if (sportSlugValue && (facilityType === 'field' || facilityType === 'coach')) {
        // Use slug directly for API
        queryParams.append('sport', sportSlugValue)
      }

      const response = await fetch(`${API_BASE_URL}/facilities?${queryParams}`)
      const data = await response.json()
      if (data.success) {
        setFacilities(data.data)
      }
    } catch (err) {
      console.error('Error fetching facilities:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCityChange = (newCity: string) => {
    setSelectedCity(newCity)
    if (newCity) {
      if (sportSlugValue) {
        const url = generateFacilityURL(newCity, sportSlugValue, facilityType)
        navigate(url)
      } else {
        const url = generateFacilityURL(newCity, null, facilityType)
        navigate(url)
      }
    } else {
      // Navigate to sport-only URL if we have sport
      if (sportSlugValue) {
        const url = generateSportURL(sportSlugValue, facilityType)
        navigate(url)
      } else {
        // Navigate to base page
        const baseUrls: Record<string, string> = {
          'field': '/terenuri',
          'coach': '/antrenori',
          'repair_shop': '/magazine-reparatii',
          equipment_shop: '/magazine-articole',
          sports_recovery: '/recuperare-sportiva'
        }
        navigate(baseUrls[facilityType] || '/')
      }
    }
  }

  const handleSportChange = (newSport: string) => {
    setSelectedSport(newSport) // newSport is already a slug from dropdown
    if (newSport) {
      if (city) {
        const url = generateFacilityURL(city, newSport, facilityType)
        navigate(url)
      } else {
        const url = generateSportURL(newSport, facilityType)
        navigate(url)
      }
    } else {
      // Remove sport from URL
      if (city) {
        const url = generateFacilityURL(city, null, facilityType)
        navigate(url)
      } else {
        // Navigate to base page
        const baseUrls: Record<string, string> = {
          'field': '/terenuri',
          'coach': '/antrenori',
          'repair_shop': '/magazine-reparatii',
          equipment_shop: '/magazine-articole',
          sports_recovery: '/recuperare-sportiva'
        }
        navigate(baseUrls[facilityType] || '/')
      }
    }
  }

  const getPageTitle = () => {
    if (sportName && city) {
      return `${FACILITY_TYPE_TITLES[facilityType]} - ${sportName} în ${city}`
    } else if (city) {
      return `${FACILITY_TYPE_TITLES[facilityType]} în ${city}`
    } else if (sportName) {
      return `${FACILITY_TYPE_TITLES[facilityType]} - ${sportName}`
    }
    return FACILITY_TYPE_TITLES[facilityType] || 'Facilități'
  }

  const getEmptyMessage = () => {
    if (sportName && city) {
      return `Momentan nu sunt ${FACILITY_TYPE_TITLES[facilityType].toLowerCase()} pentru ${sportName.toLowerCase()} în ${city}.`
    } else if (city) {
      return `Momentan nu sunt ${FACILITY_TYPE_TITLES[facilityType].toLowerCase()} în ${city}.`
    } else if (sportName) {
      return `Momentan nu sunt ${FACILITY_TYPE_TITLES[facilityType].toLowerCase()} pentru ${sportName.toLowerCase()}.`
    }
    return `Momentan nu sunt ${FACILITY_TYPE_TITLES[facilityType].toLowerCase()} disponibile.`
  }

  if (!facilityType) {
    return (
      <div style={pageShell}>
        <header style={hero}>
          <div style={heroOverlay} />
          <div style={column}>
            <h1 style={heroTitle}>Pagina nu a fost găsită</h1>
            <Link to="/" style={{ ...primaryButton, marginTop: '1.25rem' }}>Înapoi la Home</Link>
          </div>
        </header>
      </div>
    )
  }

  // Show city selector only if we don't have a city in URL
  const showCitySelector = !city

  return (
    <div style={pageShell}>
      <header style={hero}>
        <div style={heroOverlay} />
        <div style={column}>
          <h1 style={heroTitle}>{getPageTitle()}</h1>
        </div>
      </header>
      <div style={contentBand}>
      <div style={column}>

        <FacilityFilters
          selectedCity={city}
          selectedSport={sportSlugValue}
          selectedType={facilityType}
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
            ...card,
            color: colors.muted,
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
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '1.5rem',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              <Link
                to="/sugereaza"
                style={{
                  padding: '2rem 2.5rem',
                  ...secondaryButton,
                  background: colors.ink,
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  fontWeight: '600',
                  fontSize: '1.25rem',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 6px rgba(15, 23, 42, 0.16)',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.slate
                  e.currentTarget.style.boxShadow = '0 6px 12px rgba(15, 23, 42, 0.2)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = colors.ink
                  e.currentTarget.style.boxShadow = '0 4px 6px rgba(15, 23, 42, 0.16)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '0.25rem' }}>
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                <div style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.25rem' }}>Sugerează</div>
                <div style={{ fontSize: '0.875rem', opacity: 0.9, fontWeight: '400', lineHeight: '1.5' }}>
                  Ajută-ne să descoperim facilități noi
                </div>
              </Link>
              <Link
                to="/register"
                style={{
                  padding: '2rem 2.5rem',
                  ...primaryButton,
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  fontWeight: '600',
                  fontSize: '1.25rem',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 6px rgba(16, 185, 129, 0.2)',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#059669'
                  e.currentTarget.style.boxShadow = '0 6px 12px rgba(16, 185, 129, 0.3)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#10b981'
                  e.currentTarget.style.boxShadow = '0 4px 6px rgba(16, 185, 129, 0.2)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '0.25rem' }}>
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="8.5" cy="7" r="4"></circle>
                  <line x1="20" y1="8" x2="20" y2="14"></line>
                  <line x1="23" y1="11" x2="17" y2="11"></line>
                </svg>
                <div style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.25rem' }}>Înregistrează</div>
                <div style={{ fontSize: '0.875rem', opacity: 0.9, fontWeight: '400', lineHeight: '1.5' }}>
                  Adaugă propria ta facilitate
                </div>
              </Link>
            </div>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '2rem'
          }}>
            {facilities.map((facility) => (
              <div
                key={facility.id}
                style={{
                  ...card,
                  overflow: 'hidden',
                  cursor: 'pointer'
                }}
              >
              {(facility.image_url || facility.logo_url) && (
                <img src={facility.image_url || facility.logo_url} alt="" loading="lazy" style={{ width: '100%', height: '200px', objectFit: 'cover', display: 'block' }} />
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
        )}
      </div>
      </div>
    </div>
  )
}

export default SEOFacilityPage

