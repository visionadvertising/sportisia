import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
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
  'equipment_shop': 'Magazine Articole Sportive'
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
  // Check if we have city/:sport/:type or just :sport/:type format
  const hasCity = !!params.city
  const citySlug = params.city || ''
  const sportSlug = params.sport || ''
  const typeSlug = params.type || ''

  // If we have city param, it's a city. Otherwise, sport param might be the sport (without city)
  let city = ''
  let sportName = '' // For display
  let sportSlugValue = '' // For dropdown value (slug)
  
  if (hasCity) {
    // Format: /:city/:sport/:type or /:city/:type
    city = citySlug ? citySlugToName(citySlug) : ''
    sportName = sportSlug ? sportSlugToName(sportSlug) : ''
    sportSlugValue = sportSlug || '' // Keep slug for dropdown
  } else {
    // Format: /:sport/:type (sport without city)
    sportName = sportSlug ? sportSlugToName(sportSlug) : ''
    sportSlugValue = sportSlug || '' // Keep slug for dropdown
  }
  
  const facilityType = typeSlug ? slugToFacilityType(typeSlug) : ''

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
          'equipment_shop': '/magazine-articole'
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
          'equipment_shop': '/magazine-articole'
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
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '2rem',
        textAlign: 'center',
        color: 'white'
      }}>
        <h1>Pagina nu a fost găsită</h1>
        <Link to="/" style={{ color: 'white', textDecoration: 'underline' }}>
          Înapoi la Home
        </Link>
      </div>
    )
  }

  // Show city selector only if we don't have a city in URL
  const showCitySelector = !city

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
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '2rem'
          }}>
            {facilities.map((facility) => (
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
        )}
      </div>
    </div>
  )
}

export default SEOFacilityPage

