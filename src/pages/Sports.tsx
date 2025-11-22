import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import API_BASE_URL from '../config'
import { sportNameToSlug } from '../utils/seo'
import FacilityFilters from '../components/FacilityFilters'

interface Sport {
  sport: string
  facility_count: number
}

const SPORT_ICONS: Record<string, string> = {
  'tenis': '🎾',
  'fotbal': '⚽',
  'baschet': '🏀',
  'volei': '🏐',
  'handbal': '🤾',
  'badminton': '🏸',
  'squash': '🏓',
  'ping-pong': '🏓',
  'atletism': '🏃',
  'inot': '🏊',
  'fitness': '💪',
  'box': '🥊',
  'karate': '🥋',
  'judo': '🥋',
  'dans': '💃'
}

const SPORT_NAMES: Record<string, string> = {
  'tenis': 'Tenis',
  'fotbal': 'Fotbal',
  'baschet': 'Baschet',
  'volei': 'Volei',
  'handbal': 'Handbal',
  'badminton': 'Badminton',
  'squash': 'Squash',
  'ping-pong': 'Ping Pong',
  'atletism': 'Atletism',
  'inot': 'Înot',
  'fitness': 'Fitness',
  'box': 'Box',
  'karate': 'Karate',
  'judo': 'Judo',
  'dans': 'Dans'
}

function Sports() {
  const [searchParams] = useSearchParams()
  const [sports, setSports] = useState<Sport[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCity, setSelectedCity] = useState(searchParams.get('city') || '')
  const [selectedSport, setSelectedSport] = useState(searchParams.get('sport') || '')
  const [selectedType, setSelectedType] = useState(searchParams.get('type') || '')

  useEffect(() => {
    fetchSports()
  }, [])

  const fetchSports = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/sports`)
      const data = await response.json()
      if (data.success) {
        setSports(data.data)
      }
    } catch (err) {
      console.error('Error fetching sports:', err)
    } finally {
      setLoading(false)
    }
  }

  const getSportIcon = (sport: string) => {
    return SPORT_ICONS[sport.toLowerCase()] || '🏃'
  }

  const getSportName = (sport: string) => {
    return SPORT_NAMES[sport.toLowerCase()] || sport.charAt(0).toUpperCase() + sport.slice(1)
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
        }}>Sporturi</h1>

        <FacilityFilters
          selectedCity={selectedCity}
          selectedSport={selectedSport}
          selectedType={selectedType}
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
        ) : sports.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            color: '#64748b'
          }}>
            Nu există sporturi disponibile momentan.
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '1.5rem'
          }}>
            {sports.map((sport) => (
              <Link
                key={sport.sport}
                to={`/sport/${sportNameToSlug(sport.sport)}`}
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
                    fontSize: '4rem',
                    marginBottom: '1rem'
                  }}>{getSportIcon(sport.sport)}</div>
                  <h3 style={{
                    margin: 0,
                    fontSize: '1.5rem',
                    color: '#1e3c72',
                    marginBottom: '0.5rem',
                    fontWeight: 'bold'
                  }}>{getSportName(sport.sport)}</h3>
                  <p style={{
                    margin: 0,
                    color: '#10b981',
                    fontWeight: 'bold',
                    fontSize: '1.1rem'
                  }}>{sport.facility_count} {sport.facility_count === 1 ? 'facilitate' : 'facilități'}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Sports

