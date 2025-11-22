import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import API_BASE_URL from '../config'
import { ROMANIAN_CITIES } from '../data/romanian-cities'
import { generateFacilityURL } from '../utils/seo'

interface City {
  city: string
  facility_count: number
}

function Cities() {
  const [cities, setCities] = useState<City[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCity, setSelectedCity] = useState('')

  useEffect(() => {
    fetchCities()
  }, [])

  const fetchCities = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/cities`)
      const data = await response.json()
      if (data.success) {
        setCities(data.data)
      }
    } catch (err) {
      console.error('Error fetching cities:', err)
    } finally {
      setLoading(false)
    }
  }

  // Combine database cities with Romanian cities list
  const allCities = [...new Set([...cities.map(c => c.city), ...ROMANIAN_CITIES])]
    .map(city => {
      const dbCity = cities.find(c => c.city === city)
      return {
        city,
        facility_count: dbCity?.facility_count || 0
      }
    })
    .sort((a, b) => {
      // Sort by facility count first, then alphabetically
      if (b.facility_count !== a.facility_count) {
        return b.facility_count - a.facility_count
      }
      return a.city.localeCompare(b.city, 'ro')
    })

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
          marginBottom: '1rem',
          textAlign: 'center'
        }}>Orașe</h1>

        {/* City Selector Dropdown */}
        <div style={{
          maxWidth: '500px',
          margin: '0 auto 2rem',
          background: 'white',
          borderRadius: '12px',
          padding: '1rem',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
        }}>
          <label style={{
            display: 'block',
            marginBottom: '0.5rem',
            color: '#333',
            fontWeight: '500'
          }}>Caută oraș:</label>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
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
            <option value="">Selectează un oraș</option>
            {ROMANIAN_CITIES.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
          {selectedCity && (
            <Link
              to={generateFacilityURL(selectedCity, null, 'field')}
              style={{
                display: 'block',
                marginTop: '1rem',
                padding: '0.75rem',
                background: '#10b981',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '8px',
                textAlign: 'center',
                fontWeight: 'bold'
              }}
            >
              Vezi facilități în {selectedCity}
            </Link>
          )}
        </div>

        {loading ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            color: 'white'
          }}>
            Se încarcă...
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '1.5rem'
          }}>
            {allCities.map((cityData) => (
              <Link
                key={cityData.city}
                to={generateFacilityURL(cityData.city, null, 'field')}
                style={{
                  textDecoration: 'none',
                  color: 'inherit'
                }}
              >
                <div style={{
                  background: 'white',
                  borderRadius: '16px',
                  padding: '2rem',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)'
                  e.currentTarget.style.boxShadow = '0 15px 40px rgba(0,0,0,0.3)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.2)'
                }}
                >
                  <div style={{
                    fontSize: '3rem',
                    marginBottom: '1rem'
                  }}>🏙️</div>
                  <h3 style={{
                    margin: 0,
                    fontSize: '1.5rem',
                    color: '#1e3c72',
                    marginBottom: '0.5rem',
                    fontWeight: 'bold'
                  }}>{cityData.city}</h3>
                  <p style={{
                    margin: 0,
                    color: '#10b981',
                    fontWeight: 'bold',
                    fontSize: '1.1rem'
                  }}>{cityData.facility_count} {cityData.facility_count === 1 ? 'facilitate' : 'facilități'}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Cities

