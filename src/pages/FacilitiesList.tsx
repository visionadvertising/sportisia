import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import API_BASE_URL from '../config'
import { ROMANIAN_CITIES } from '../data/romanian-cities'

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
  const [searchParams, setSearchParams] = useSearchParams()
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCity, setSelectedCity] = useState(searchParams.get('city') || '')
  const [selectedSport, setSelectedSport] = useState(searchParams.get('sport') || '')

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
    const newParams = new URLSearchParams(searchParams)
    if (city) {
      newParams.set('city', city)
    } else {
      newParams.delete('city')
    }
    setSearchParams(newParams)
  }

  const handleSportChange = (sport: string) => {
    setSelectedSport(sport)
    const newParams = new URLSearchParams(searchParams)
    if (sport) {
      newParams.set('sport', sport)
    } else {
      newParams.delete('sport')
    }
    setSearchParams(newParams)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <h1 style={{
          fontSize: '3rem',
          color: 'white',
          marginBottom: '2rem',
          textAlign: 'center'
        }}>{title}</h1>

        {/* Search Box */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '2rem',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
          marginBottom: '2rem'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: type === 'field' ? 'repeat(2, 1fr)' : '1fr',
            gap: '1rem'
          }}>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: '#333',
                fontWeight: '500'
              }}>Oraș</label>
              <select
                value={selectedCity}
                onChange={(e) => handleCityChange(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="">Toate orașele</option>
                {ROMANIAN_CITIES.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
            {type === 'field' && (
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  color: '#333',
                  fontWeight: '500'
                }}>Sport</label>
                <select
                  value={selectedSport}
                  onChange={(e) => handleSportChange(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="">Toate sporturile</option>
                  <option value="tenis">Tenis</option>
                  <option value="fotbal">Fotbal</option>
                  <option value="baschet">Baschet</option>
                  <option value="volei">Volei</option>
                  <option value="handbal">Handbal</option>
                  <option value="badminton">Badminton</option>
                  <option value="squash">Squash</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            color: 'white'
          }}>
            Se încarcă...
          </div>
        ) : facilities.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            background: 'white',
            borderRadius: '12px',
            color: '#666'
          }}>
            <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>
              Nu există facilități disponibile pentru criteriile selectate.
            </p>
            <Link
              to="/register"
              style={{
                padding: '0.75rem 2rem',
                background: '#10b981',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '8px',
                display: 'inline-block',
                fontWeight: 'bold'
              }}
            >
              Adaugă prima facilitate
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

