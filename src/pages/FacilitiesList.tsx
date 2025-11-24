import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import API_BASE_URL from '../config'
import FacilityFilters from '../components/FacilityFilters'

// Helper function to create SEO-friendly slug
function createSlug(name: string, city: string): string {
  const text = `${name} ${city}`
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

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
  sportsFields?: Array<{
    sport_type: string
    field_name?: string
    price_per_hour?: number
  }>
  gallery?: string | string[]
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

  // Generate page title with city if selected
  const getPageTitle = () => {
    if (selectedCity) {
      return `${title} în ${selectedCity}`
    }
    return title
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
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <h1 style={{
            fontSize: isMobile ? '2rem' : '3rem',
            color: 'white',
            marginBottom: isMobile ? '1.5rem' : '2rem',
            fontWeight: '700',
            lineHeight: '1.2',
            padding: isMobile ? '0 0.5rem' : '0',
            letterSpacing: '-0.02em'
          }}>{getPageTitle()}</h1>
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
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
                gap: '1.5rem',
                maxWidth: '600px',
                margin: '0 auto'
              }}>
                <Link
                  to="/sugereaza"
                  style={{
                    padding: isMobile ? '1.5rem 1.75rem' : '2rem 2.5rem',
                    background: '#6366f1',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    fontWeight: '600',
                    fontSize: isMobile ? '1.125rem' : '1.25rem',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 6px rgba(99, 102, 241, 0.2)',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#4f46e5'
                    e.currentTarget.style.boxShadow = '0 6px 12px rgba(99, 102, 241, 0.3)'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#6366f1'
                    e.currentTarget.style.boxShadow = '0 4px 6px rgba(99, 102, 241, 0.2)'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '0.25rem' }}>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                  <div style={{ fontSize: isMobile ? '1.125rem' : '1.25rem', fontWeight: '600', marginBottom: '0.25rem' }}>Sugerează</div>
                  <div style={{ fontSize: '0.875rem', opacity: 0.9, fontWeight: '400', lineHeight: '1.5' }}>
                    Ajută-ne să descoperim facilități noi
                  </div>
                </Link>
                <Link
                  to={`/register?type=${type}${selectedCity ? `&city=${encodeURIComponent(selectedCity)}` : ''}${selectedSport ? `&sport=${encodeURIComponent(selectedSport)}` : ''}`}
                  style={{
                    padding: isMobile ? '1.5rem 1.75rem' : '2rem 2.5rem',
                    background: '#10b981',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    fontWeight: '600',
                    fontSize: isMobile ? '1.125rem' : '1.25rem',
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
                  <div style={{ fontSize: isMobile ? '1.125rem' : '1.25rem', fontWeight: '600', marginBottom: '0.25rem' }}>Înregistrează</div>
                  <div style={{ fontSize: '0.875rem', opacity: 0.9, fontWeight: '400', lineHeight: '1.5' }}>
                    Adaugă propria ta facilitate
                  </div>
                </Link>
              </div>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile 
                ? '1fr' 
                : 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: isMobile ? '1.5rem' : '2rem'
            }}>
              {facilities.map((facility) => {
                // Generate SEO-friendly URL
                const facilityUrl = facility.facility_type === 'field' 
                  ? `/baza-sportiva/${createSlug(facility.name, facility.city)}`
                  : `/facility/${facility.id}`
                
                // Get first image from gallery or use image_url/logo_url
                let displayImage = facility.image_url || facility.logo_url
                if (facility.gallery) {
                  const gallery = typeof facility.gallery === 'string' 
                    ? (() => { try { return JSON.parse(facility.gallery) } catch { return [] } })()
                    : facility.gallery
                  if (Array.isArray(gallery) && gallery.length > 0) {
                    displayImage = gallery[0]
                  }
                }
                
                // Get sports from sportsFields for sports bases
                const sports = facility.facility_type === 'field' && facility.sportsFields
                  ? facility.sportsFields.map(f => f.sport_type).filter(Boolean)
                  : facility.sport ? [facility.sport] : []
                
                // Get price from sportsFields or legacy price_per_hour
                const price = facility.facility_type === 'field' && facility.sportsFields && facility.sportsFields.length > 0
                  ? facility.sportsFields
                      .map(f => f.price_per_hour)
                      .filter(p => p && p > 0)
                      .sort((a, b) => (a || 0) - (b || 0))[0]
                  : facility.price_per_hour
                
                return (
                <Link
                  key={facility.id}
                  to={facilityUrl}
                  style={{
                    background: 'white',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)',
                    border: '1px solid #e2e8f0',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer',
                    textDecoration: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%'
                  }}
                  onMouseEnter={(e) => {
                    if (!isMobile) {
                      e.currentTarget.style.transform = 'translateY(-4px)'
                      e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1), 0 4px 10px rgba(0,0,0,0.05)'
                      e.currentTarget.style.borderColor = '#cbd5e1'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isMobile) {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)'
                      e.currentTarget.style.borderColor = '#e2e8f0'
                    }
                  }}
                >
                  {/* Image Section */}
                  <div style={{
                    width: '100%',
                    height: isMobile ? '180px' : '200px',
                    position: 'relative',
                    overflow: 'hidden',
                    background: displayImage 
                      ? `url(${displayImage}) center/cover`
                      : 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}>
                    {!displayImage && (
                      <div style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#10b981',
                        opacity: 0.3
                      }}>
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                          <circle cx="8.5" cy="8.5" r="1.5"></circle>
                          <polyline points="21 15 16 10 5 21"></polyline>
                        </svg>
                      </div>
                    )}
                    {/* Price Badge - Top Right */}
                    {(price || facility.price_per_lesson) && (
                      <div style={{
                        position: 'absolute',
                        top: '0.75rem',
                        right: '0.75rem',
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(10px)',
                        padding: '0.5rem 0.875rem',
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.375rem'
                      }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5">
                          <line x1="12" y1="1" x2="12" y2="23"></line>
                          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                        </svg>
                        <span style={{
                          color: '#0f172a',
                          fontSize: '0.875rem',
                          fontWeight: '700'
                        }}>
                          {price ? `${price} RON` : facility.price_per_lesson ? `${facility.price_per_lesson} RON` : ''}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content Section */}
                  <div style={{ 
                    padding: isMobile ? '1.25rem' : '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                    gap: '0.75rem'
                  }}>
                    {/* Title */}
                    <h3 style={{
                      margin: 0,
                      fontSize: isMobile ? '1.125rem' : '1.25rem',
                      color: '#0f172a',
                      fontWeight: '700',
                      lineHeight: '1.4',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>{facility.name}</h3>
                    
                    {/* Location */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.5rem',
                      color: '#64748b',
                      fontSize: '0.8125rem',
                      lineHeight: '1.5'
                    }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                        <circle cx="12" cy="10" r="3"/>
                      </svg>
                      <span style={{ flex: 1 }}>
                        {facility.city}{facility.county ? `, ${facility.county}` : ''}
                        {facility.location && (
                          <span style={{ display: 'block', marginTop: '0.125rem', opacity: 0.8 }}>
                            {facility.location}
                          </span>
                        )}
                      </span>
                    </div>

                    {/* Sports Tags */}
                    {sports.length > 0 && (
                      <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '0.5rem',
                        marginTop: '0.25rem'
                      }}>
                        {sports.slice(0, 3).map((sport, idx) => (
                          <div
                            key={idx}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.375rem',
                              padding: '0.375rem 0.625rem',
                              background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              color: '#059669',
                              border: '1px solid rgba(16, 185, 129, 0.2)'
                            }}
                          >
                            <span>{SPORT_NAMES[sport] || sport}</span>
                          </div>
                        ))}
                        {sports.length > 3 && (
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '0.375rem 0.625rem',
                            background: '#f8fafc',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            color: '#64748b',
                            border: '1px solid #e2e8f0'
                          }}>
                            +{sports.length - 3}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Description - Only if exists */}
                    {facility.description && (
                      <p style={{
                        margin: 0,
                        color: '#64748b',
                        fontSize: '0.8125rem',
                        lineHeight: '1.6',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        marginTop: 'auto',
                        paddingTop: '0.75rem',
                        borderTop: '1px solid #f1f5f9'
                      }}>{facility.description}</p>
                    )}

                    {/* Specialization - Only for coaches */}
                    {facility.specialization && facility.facility_type === 'coach' && (
                      <div style={{
                        marginTop: 'auto',
                        paddingTop: '0.75rem',
                        borderTop: '1px solid #f1f5f9',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                          <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                        <span style={{
                          color: '#64748b',
                          fontSize: '0.8125rem',
                          fontWeight: '500'
                        }}>{facility.specialization}</span>
                      </div>
                    )}
                  </div>
                </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default FacilitiesList
