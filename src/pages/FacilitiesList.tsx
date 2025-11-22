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
  county?: string
}

const FACILITY_TYPE_LABELS: Record<string, string> = {
  'field': 'Terenuri Sportive',
  'coach': 'Antrenori',
  'repair_shop': 'Magazine Reparații',
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
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    fetchFacilities()
  }, [selectedCity, selectedSport, type])

  const fetchFacilities = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ type, status: 'active' })
      if (selectedCity) params.append('city', selectedCity)
      if (selectedSport && type === 'field') params.append('sport', selectedSport)

      const response = await fetch(`${API_BASE_URL}/facilities?${params}`)
      const data = await response.json()
      if (data.success) {
        const filtered = data.data.filter((facility: Facility) => facility.facility_type === type)
        setFacilities(filtered)
        
        if (data.data.length !== filtered.length) {
          console.warn(`[FacilitiesList] Filtered out ${data.data.length - filtered.length} facilities with wrong type. Expected: ${type}`)
        }
      }
    } catch (err) {
      console.error('Error fetching facilities:', err)
    } finally {
      setLoading(false)
    }
  }

  const getEmptyMessage = () => {
    if (selectedCity && selectedSport) {
      return `Momentan nu sunt ${title.toLowerCase()} pentru ${SPORT_NAMES[selectedSport]?.toLowerCase() || selectedSport} în ${selectedCity}.`
    } else if (selectedCity) {
      return `Momentan nu sunt ${title.toLowerCase()} în ${selectedCity}.`
    } else if (selectedSport) {
      return `Momentan nu sunt ${title.toLowerCase()} pentru ${SPORT_NAMES[selectedSport]?.toLowerCase() || selectedSport}.`
    }
    return `Momentan nu sunt ${title.toLowerCase()} disponibile.`
  }

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
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'flex-start' : 'center',
          gap: isMobile ? '1.5rem' : '2rem'
        }}>
          <h1 style={{
            fontSize: isMobile ? '2rem' : '3rem',
            color: 'white',
            margin: 0,
            fontWeight: '700',
            lineHeight: '1.2',
            letterSpacing: '-0.02em',
            flex: 1,
            textAlign: isMobile ? 'center' : 'left'
          }}>{title}</h1>
          <Link
            to="/register"
            style={{
              padding: isMobile ? '0.875rem 1.5rem' : '0.75rem 2rem',
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: isMobile ? '0.9375rem' : '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              width: isMobile ? '100%' : 'auto',
              justifyContent: 'center',
              minHeight: isMobile ? '44px' : 'auto',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)'
            }}
            onMouseEnter={(e) => {
              if (!isMobile) {
                e.currentTarget.style.background = '#059669'
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(16, 185, 129, 0.3)'
                e.currentTarget.style.transform = 'translateY(-1px)'
              }
            }}
            onMouseLeave={(e) => {
              if (!isMobile) {
                e.currentTarget.style.background = '#10b981'
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(16, 185, 129, 0.2)'
                e.currentTarget.style.transform = 'translateY(0)'
              }
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 4v12M4 10h12"/>
            </svg>
            Adaugă {type === 'field' ? 'Teren' : type === 'coach' ? 'Antrenor' : type === 'repair_shop' ? 'Magazin' : 'Magazin'}
          </Link>
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
            selectedCity={selectedCity}
            selectedSport={selectedSport}
            selectedType={type}
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
              margin: '0 auto',
              border: '1px solid #f1f5f9'
            }}>
              <div style={{
                width: isMobile ? '64px' : '80px',
                height: isMobile ? '64px' : '80px',
                margin: '0 auto 1.5rem',
                borderRadius: '50%',
                background: '#f0fdf4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width={isMobile ? '32' : '40'} height={isMobile ? '32' : '40'} viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                </svg>
              </div>
              <h2 style={{
                fontSize: isMobile ? '1.25rem' : '1.8rem',
                color: '#0f172a',
                marginBottom: isMobile ? '0.75rem' : '1rem',
                fontWeight: '600'
              }}>Nu am găsit rezultate</h2>
              <p style={{
                fontSize: isMobile ? '0.9375rem' : '1.2rem',
                marginBottom: isMobile ? '1.5rem' : '2rem',
                lineHeight: '1.6',
                color: '#64748b',
                padding: isMobile ? '0 0.5rem' : '0'
              }}>
                {getEmptyMessage()}
              </p>
              <p style={{
                fontSize: isMobile ? '0.875rem' : '1rem',
                marginBottom: isMobile ? '1.5rem' : '2rem',
                color: '#64748b',
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
                  if (!isMobile) {
                    e.currentTarget.style.background = '#059669'
                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(16, 185, 129, 0.3)'
                    e.currentTarget.style.transform = 'translateY(-1px)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isMobile) {
                    e.currentTarget.style.background = '#10b981'
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(16, 185, 129, 0.2)'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }
                }}
              >
                Înregistrează-te acum
              </Link>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile 
                ? '1fr' 
                : 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: isMobile ? '1.5rem' : '2rem'
            }}>
              {facilities.map((facility) => (
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
                  <div style={{ 
                    padding: isMobile ? '1.25rem' : '1.75rem'
                  }}>
                    <h3 style={{
                      margin: '0 0 0.75rem 0',
                      fontSize: isMobile ? '1.125rem' : '1.375rem',
                      color: '#0f172a',
                      fontWeight: '700',
                      lineHeight: '1.3'
                    }}>{facility.name}</h3>
                    
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginBottom: '0.5rem',
                      color: '#64748b',
                      fontSize: isMobile ? '0.875rem' : '0.9375rem'
                    }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                        <circle cx="12" cy="10" r="3"/>
                      </svg>
                      <span>{facility.city}{facility.county ? `, ${facility.county}` : ''}{facility.location ? ` • ${facility.location}` : ''}</span>
                    </div>

                    {facility.sport && (
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginBottom: '0.75rem',
                        padding: '0.375rem 0.75rem',
                        background: '#f0fdf4',
                        borderRadius: '6px',
                        fontSize: isMobile ? '0.8125rem' : '0.875rem',
                        fontWeight: '500',
                        color: '#059669'
                      }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
                          <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
                          <path d="M4 22h16"/>
                          <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
                          <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
                          <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
                        </svg>
                        <span>{SPORT_NAMES[facility.sport] || facility.sport}</span>
                      </div>
                    )}

                    {(facility.price_per_hour || facility.price_per_lesson) && (
                      <div style={{
                        marginTop: '1rem',
                        paddingTop: '1rem',
                        borderTop: '1px solid #e2e8f0'
                      }}>
                        <p style={{
                          margin: 0,
                          color: '#0f172a',
                          fontSize: isMobile ? '1rem' : '1.125rem',
                          fontWeight: '700'
                        }}>
                          De la {facility.price_per_hour ? `${facility.price_per_hour} RON/oră` : facility.price_per_lesson ? `${facility.price_per_lesson} RON/lecție` : ''}
                        </p>
                      </div>
                    )}

                    {facility.specialization && (
                      <p style={{
                        margin: '0.75rem 0 0 0',
                        color: '#64748b',
                        fontSize: isMobile ? '0.8125rem' : '0.875rem',
                        lineHeight: '1.5'
                      }}>Specializare: {facility.specialization}</p>
                    )}

                    {facility.description && (
                      <p style={{
                        margin: '0.75rem 0 0 0',
                        color: '#64748b',
                        fontSize: isMobile ? '0.8125rem' : '0.875rem',
                        lineHeight: '1.5',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>{facility.description}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default FacilitiesList
