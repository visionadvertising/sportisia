import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import API_BASE_URL from '../config'
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
  'field': 'Teren Sportiv',
  'coach': 'Antrenor',
  'repair_shop': 'Magazin Reparații',
  'equipment_shop': 'Magazin Articole Sportive'
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

type FacilityType = 'field' | 'coach' | 'repair_shop' | 'equipment_shop'

interface FacilitiesListProps {
  type: FacilityType
  title: string
}

function FacilitiesList({ type, title }: FacilitiesListProps) {
  const navigate = useNavigate()
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCity, setSelectedCity] = useState('')
  const [selectedSport, setSelectedSport] = useState('')

  useEffect(() => {
    fetchFacilities()
  }, [selectedCity, selectedSport])

  const fetchFacilities = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ type, status: 'active' })
      if (selectedCity) params.append('city', selectedCity)
      if (selectedSport && type === 'field') params.append('sport', selectedSport)

      const response = await fetch(`${API_BASE_URL}/facilities?${params}`)
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

  const handleCityChange = (city: string) => {
    setSelectedCity(city)
    if (city) {
      const url = generateFacilityURL(city, selectedSport || null, type)
      navigate(url)
    } else {
      // Navigate back to base page
      const baseUrls: Record<string, string> = {
        'field': '/terenuri',
        'coach': '/antrenori',
        'repair_shop': '/magazine-reparatii',
        'equipment_shop': '/magazine-articole'
      }
      navigate(baseUrls[type] || '/')
    }
  }

  const handleSportChange = (sport: string) => {
    setSelectedSport(sport)
    if (sport && selectedCity) {
      const url = generateFacilityURL(selectedCity, sport, type)
      navigate(url)
    } else if (!sport && selectedCity) {
      // Remove sport from URL
      const url = generateFacilityURL(selectedCity, null, type)
      navigate(url)
    }
  }

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
        }}>{title}</h1>

        <FacilityFilters
          selectedCity={selectedCity}
          selectedSport={selectedSport}
          selectedType={type}
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
              {selectedCity && selectedSport
                ? `Momentan nu sunt ${title.toLowerCase()} pentru ${selectedSport.toLowerCase()} în ${selectedCity}.`
                : selectedCity
                ? `Momentan nu sunt ${title.toLowerCase()} în ${selectedCity}.`
                : `Momentan nu sunt ${title.toLowerCase()} disponibile pentru criteriile selectate.`}
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

export default FacilitiesList

