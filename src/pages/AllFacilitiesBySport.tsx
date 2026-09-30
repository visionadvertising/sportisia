import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import API_BASE_URL from '../config'
import { sportSlugToName } from '../utils/seo'
import FacilityFilters from '../components/FacilityFilters'
import { card, colors, column, contentBand, hero, heroOverlay, heroTitle, pageShell, primaryButton, secondaryButton } from '../ui/theme'

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
  'equipment_shop': 'Magazine Articole Sportive',
  sports_recovery: 'Recuperare sportivă'
}

const FACILITY_TYPE_ICONS: Record<string, string> = {
  'field': '🏟️',
  'coach': '👨‍🏫',
  'repair_shop': '🔧',
  'equipment_shop': '🛍️',
  sports_recovery: '🩺'
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

function AllFacilitiesBySport() {
  const params = useParams<{ sport?: string; cityOrSport?: string }>()
  // Support both /sport/:sport and /:sport formats
  const sportSlug = params.sport || params.cityOrSport || ''
  const sport = sportSlug ? sportSlugToName(sportSlug) : '' // For display
  const sportSlugValue = sportSlug || '' // For filters (keep as slug)
  
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (sport) {
      fetchFacilities()
    }
  }, [sport])

  const fetchFacilities = async () => {
    setLoading(true)
    try {
      // Fetch all facility types for this sport
      const types = ['field', 'coach', 'repair_shop', 'equipment_shop', 'sports_recovery']
      const allFacilities: Facility[] = []

      for (const type of types) {
        const params = new URLSearchParams({ 
          type, 
          status: 'active',
          sport: sport.toLowerCase()
        })
        const response = await fetch(`${API_BASE_URL}/facilities?${params}`)
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

  if (!sport) {
    return (
      <div style={pageShell}>
        <header style={hero}>
          <div style={heroOverlay} />
          <div style={column}>
            <h1 style={heroTitle}>Sport invalid</h1>
            <Link to="/" style={{ ...primaryButton, marginTop: '1.25rem' }}>Înapoi la Home</Link>
          </div>
        </header>
      </div>
    )
  }

  return (
    <div style={pageShell}>
      <header style={hero}>
        <div style={heroOverlay} />
        <div style={column}>
          <h1 style={heroTitle}>Toate facilitățile pentru {sport}</h1>
        </div>
      </header>
      <div style={contentBand}>
      <div style={column}>

        <FacilityFilters
          selectedCity=""
          selectedSport={sportSlugValue}
          selectedType=""
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
              Momentan nu sunt facilități disponibile pentru {sport.toLowerCase()}.
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
              </div>
            ))}
          </div>
        )}
      </div>
      </div>
    </div>
  )
}

export default AllFacilitiesBySport

