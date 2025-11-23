import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import API_BASE_URL from '../config'

interface TimeSlot {
  day: string
  startTime: string
  endTime: string
  status: 'open' | 'closed' | 'not_specified'
  price: number | null
}

interface SportsField {
  id?: number
  fieldName: string
  sportType: string
  description: string
  features: {
    hasParking: boolean
    hasShower: boolean
    hasChangingRoom: boolean
    hasAirConditioning: boolean
    hasLighting: boolean
    hasWiFi: boolean
    hasBar: boolean
    hasFirstAid: boolean
    hasEquipmentRental: boolean
    hasLocker: boolean
    hasTowelService: boolean
    hasWaterFountain: boolean
    hasSeating: boolean
    hasScoreboard: boolean
    hasSoundSystem: boolean
    hasHeating: boolean
    hasCover: boolean
    hasGrass: boolean
    hasArtificialGrass: boolean
    hasIndoor: boolean
    hasOutdoor: boolean
  }
  slotSize: number
  timeSlots: TimeSlot[]
}

interface Facility {
  id: number
  facility_type: string
  name: string
  city: string
  county?: string
  location?: string
  location_not_specified?: boolean
  map_coordinates?: string
  contact_person?: string
  phone: string
  phones?: string
  whatsapp?: string
  whatsapps?: string
  email: string
  emails?: string
  description?: string
  logo_url?: string
  social_media?: string
  gallery?: string
  website?: string
  opening_hours?: string
  status: string
  sportsFields?: SportsField[]
}

const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Luni' },
  { key: 'tuesday', label: 'Marți' },
  { key: 'wednesday', label: 'Miercuri' },
  { key: 'thursday', label: 'Joi' },
  { key: 'friday', label: 'Vineri' },
  { key: 'saturday', label: 'Sâmbătă' },
  { key: 'sunday', label: 'Duminică' }
]

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

function SportsBasePublic() {
  const { slug } = useParams<{ slug: string }>()
  const [facility, setFacility] = useState<Facility | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (slug) {
      fetchFacility()
    }
  }, [slug])

  const fetchFacility = async () => {
    try {
      console.log(`[Frontend] Fetching facility with slug: "${slug}"`)
      const response = await fetch(`${API_BASE_URL}/facilities/${encodeURIComponent(slug)}`)
      const data = await response.json()
      
      console.log(`[Frontend] Response:`, data)
      
      if (data.success && data.data) {
        // Backend returns data in data.data
        const facilityData = data.data
        // Parse JSON fields
        const facilityData = data.facility
        if (facilityData.phones && typeof facilityData.phones === 'string') {
          try {
            facilityData.phones = JSON.parse(facilityData.phones)
          } catch (e) {
            facilityData.phones = [facilityData.phones]
          }
        }
        if (facilityData.whatsapps && typeof facilityData.whatsapps === 'string') {
          try {
            facilityData.whatsapps = JSON.parse(facilityData.whatsapps)
          } catch (e) {
            facilityData.whatsapps = [facilityData.whatsapps]
          }
        }
        if (facilityData.emails && typeof facilityData.emails === 'string') {
          try {
            facilityData.emails = JSON.parse(facilityData.emails)
          } catch (e) {
            facilityData.emails = [facilityData.emails]
          }
        }
        if (facilityData.social_media && typeof facilityData.social_media === 'string') {
          try {
            facilityData.social_media = JSON.parse(facilityData.social_media)
          } catch (e) {
            facilityData.social_media = {}
          }
        }
        if (facilityData.gallery && typeof facilityData.gallery === 'string') {
          try {
            facilityData.gallery = JSON.parse(facilityData.gallery)
          } catch (e) {
            facilityData.gallery = []
          }
        }
        if (facilityData.map_coordinates && typeof facilityData.map_coordinates === 'string') {
          try {
            facilityData.map_coordinates = JSON.parse(facilityData.map_coordinates)
          } catch (e) {
            facilityData.map_coordinates = null
          }
        }
        
        setFacility(facilityData)
      } else if (data.success && data.facility) {
        // Backend returns data in data.facility (backward compatibility)
        const facilityData = data.facility
        // Parse JSON fields
        if (facilityData.phones && typeof facilityData.phones === 'string') {
          try {
            facilityData.phones = JSON.parse(facilityData.phones)
          } catch (e) {
            facilityData.phones = [facilityData.phones]
          }
        }
        if (facilityData.whatsapps && typeof facilityData.whatsapps === 'string') {
          try {
            facilityData.whatsapps = JSON.parse(facilityData.whatsapps)
          } catch (e) {
            facilityData.whatsapps = [facilityData.whatsapps]
          }
        }
        if (facilityData.emails && typeof facilityData.emails === 'string') {
          try {
            facilityData.emails = JSON.parse(facilityData.emails)
          } catch (e) {
            facilityData.emails = [facilityData.emails]
          }
        }
        if (facilityData.social_media && typeof facilityData.social_media === 'string') {
          try {
            facilityData.social_media = JSON.parse(facilityData.social_media)
          } catch (e) {
            facilityData.social_media = {}
          }
        }
        if (facilityData.gallery && typeof facilityData.gallery === 'string') {
          try {
            facilityData.gallery = JSON.parse(facilityData.gallery)
          } catch (e) {
            facilityData.gallery = []
          }
        }
        if (facilityData.map_coordinates && typeof facilityData.map_coordinates === 'string') {
          try {
            facilityData.map_coordinates = JSON.parse(facilityData.map_coordinates)
          } catch (e) {
            facilityData.map_coordinates = null
          }
        }
        setFacility(facilityData)
      } else {
        console.error(`[Frontend] Facility not found. Response:`, data)
        setError(data.error || 'Baza sportivă nu a fost găsită')
      }
    } catch (err) {
      setError('Eroare la încărcarea datelor')
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (time: string) => {
    return time.substring(0, 5)
  }

  const getDaySlots = (day: string, timeSlots: TimeSlot[]) => {
    return timeSlots.filter(slot => slot.day === day)
  }

  const formatOpeningHours = (timeSlots: TimeSlot[]) => {
    const daySlots = DAYS_OF_WEEK.map(day => {
      const slots = getDaySlots(day.key, timeSlots)
      if (slots.length === 0) return null
      
      const openSlots = slots.filter(s => s.status === 'open')
      if (openSlots.length === 0) return { day: day.label, hours: 'Închis' }
      
      const hours = openSlots.map(s => `${formatTime(s.startTime)} - ${formatTime(s.endTime)}`).join(', ')
      return { day: day.label, hours }
    }).filter(Boolean)
    
    return daySlots
  }

  const getFeatureLabels = (features: SportsField['features']) => {
    const labels: string[] = []
    if (features.hasParking) labels.push('Parcare')
    if (features.hasShower) labels.push('Dusuri')
    if (features.hasChangingRoom) labels.push('Vestiar')
    if (features.hasAirConditioning) labels.push('Aer condiționat')
    if (features.hasLighting) labels.push('Iluminat')
    if (features.hasWiFi) labels.push('WiFi')
    if (features.hasBar) labels.push('Bar')
    if (features.hasFirstAid) labels.push('Prim ajutor')
    if (features.hasEquipmentRental) labels.push('Închiriere echipament')
    if (features.hasLocker) labels.push('Dulapuri')
    if (features.hasTowelService) labels.push('Serviciu prosoape')
    if (features.hasWaterFountain) labels.push('Fântână apă')
    if (features.hasSeating) labels.push('Locuri de așezat')
    if (features.hasScoreboard) labels.push('Tablou de scor')
    if (features.hasSoundSystem) labels.push('Sistem audio')
    if (features.hasHeating) labels.push('Încălzire')
    if (features.hasCover) labels.push('Acoperit')
    if (features.hasGrass) labels.push('Iarbă naturală')
    if (features.hasArtificialGrass) labels.push('Iarbă artificială')
    if (features.hasIndoor) labels.push('Interior')
    if (features.hasOutdoor) labels.push('Exterior')
    return labels
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f8fafc'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #e2e8f0',
            borderTopColor: '#10b981',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <p style={{ color: '#64748b' }}>Se încarcă...</p>
        </div>
      </div>
    )
  }

  if (error || !facility) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f8fafc',
        padding: '2rem'
      }}>
        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          textAlign: 'center',
          maxWidth: '500px'
        }}>
          <h2 style={{ color: '#ef4444', marginBottom: '1rem' }}>Eroare</h2>
          <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
            {error || 'Baza sportivă nu a fost găsită'}
          </p>
          <Link
            to="/"
            style={{
              padding: '0.75rem 1.5rem',
              background: '#10b981',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              display: 'inline-block'
            }}
          >
            Înapoi la Home
          </Link>
        </div>
      </div>
    )
  }

  const phones = facility.phones || (facility.phone ? [facility.phone] : [])
  const whatsapps = facility.whatsapps || (facility.whatsapp ? [facility.whatsapp] : [])
  const emails = facility.emails || (facility.email ? [facility.email] : [])
  const gallery = facility.gallery || []
  const socialMedia = facility.social_media || {}
  const mapCoords = facility.map_coordinates || null

  // Get first gallery image or default
  const heroImage = gallery.length > 0 ? gallery[0] : 'https://via.placeholder.com/1200x400?text=Baza+Sportiva'

  return (
    <div style={{
      minHeight: '100vh',
      background: 'white',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Hero Section */}
      <div style={{
        position: 'relative',
        height: isMobile ? '300px' : '500px',
        backgroundImage: `url(${heroImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.6))'
        }} />
        <div style={{
          position: 'relative',
          zIndex: 1,
          textAlign: 'center',
          color: 'white',
          padding: isMobile ? '1rem' : '2rem',
          maxWidth: '1200px',
          width: '100%'
        }}>
          <h1 style={{
            fontSize: isMobile ? '2rem' : '3.5rem',
            fontWeight: '700',
            marginBottom: '1rem',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            {facility.name}
          </h1>
          {facility.location && (
            <div style={{
              fontSize: isMobile ? '1rem' : '1.25rem',
              marginTop: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <span>{facility.location}</span>
            </div>
          )}
          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            marginTop: '2rem',
            flexWrap: 'wrap'
          }}>
            {phones.length > 0 && (
              <a
                href={`tel:${phones[0]}`}
                style={{
                  padding: '0.875rem 2rem',
                  background: '#10b981',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#059669'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#10b981'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
                Sună
              </a>
            )}
            {emails.length > 0 && (
              <a
                href={`mailto:${emails[0]}`}
                style={{
                  padding: '0.875rem 2rem',
                  background: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  border: '2px solid white',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.3)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.2)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                Trimite email
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: isMobile ? '2rem 1rem' : '3rem 2rem'
      }}>
        {/* Location and Opening Hours */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
          gap: '2rem',
          marginBottom: '3rem'
        }}>
          {/* Map */}
          <div>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              marginBottom: '1rem',
              color: '#0f172a'
            }}>
              Locație și program
            </h2>
            {mapCoords && (
              <div style={{
                width: '100%',
                height: '400px',
                borderRadius: '12px',
                overflow: 'hidden',
                border: '1px solid #e2e8f0',
                marginBottom: '1rem'
              }}>
                <iframe
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  style={{ border: 0 }}
                  src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6d-s6U4lR3wJ0&q=${mapCoords.lat},${mapCoords.lng}`}
                  allowFullScreen
                />
              </div>
            )}
            {facility.location && (
              <p style={{
                color: '#64748b',
                fontSize: '0.875rem',
                marginTop: '0.5rem'
              }}>
                {facility.location}
              </p>
            )}
          </div>

          {/* Opening Hours */}
          <div>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              marginBottom: '1rem',
              color: '#0f172a'
            }}>
              Program
            </h2>
            {facility.sportsFields && facility.sportsFields.length > 0 ? (
              <div style={{
                background: '#f8fafc',
                padding: '1.5rem',
                borderRadius: '12px',
                border: '1px solid #e2e8f0'
              }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse'
                }}>
                  <tbody>
                    {DAYS_OF_WEEK.map(day => {
                      const field = facility.sportsFields?.[0] // Use first field for opening hours
                      if (!field) return null
                      const slots = getDaySlots(day.key, field.timeSlots || [])
                      const openSlots = slots.filter(s => s.status === 'open')
                      
                      let hours = 'Închis'
                      if (openSlots.length > 0) {
                        hours = openSlots.map(s => `${formatTime(s.startTime)} - ${formatTime(s.endTime)}`).join(', ')
                      }
                      
                      return (
                        <tr key={day.key} style={{
                          borderBottom: '1px solid #e2e8f0'
                        }}>
                          <td style={{
                            padding: '0.75rem 0',
                            fontWeight: '600',
                            color: '#0f172a',
                            width: '30%'
                          }}>
                            {day.label}
                          </td>
                          <td style={{
                            padding: '0.75rem 0',
                            color: '#64748b'
                          }}>
                            {hours}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{
                background: '#f8fafc',
                padding: '2rem',
                borderRadius: '12px',
                textAlign: 'center',
                color: '#64748b'
              }}>
                Programul nu este disponibil
              </div>
            )}
          </div>
        </div>

        {/* Contact Section */}
        <div style={{
          background: '#f8fafc',
          padding: '2rem',
          borderRadius: '12px',
          marginBottom: '3rem'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            marginBottom: '1.5rem',
            color: '#0f172a'
          }}>
            Contact
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
            gap: '1.5rem'
          }}>
            {facility.contact_person && (
              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.5rem'
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  <strong style={{ color: '#0f172a' }}>Persoană de contact</strong>
                </div>
                <p style={{ color: '#64748b', margin: 0 }}>{facility.contact_person}</p>
              </div>
            )}
            {phones.length > 0 && (
              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.5rem'
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                  <strong style={{ color: '#0f172a' }}>Telefon</strong>
                </div>
                {phones.map((phone, idx) => (
                  <a
                    key={idx}
                    href={`tel:${phone}`}
                    style={{
                      color: '#10b981',
                      textDecoration: 'none',
                      display: 'block',
                      marginBottom: '0.25rem'
                    }}
                  >
                    {phone}
                  </a>
                ))}
              </div>
            )}
            {emails.length > 0 && (
              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.5rem'
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                  <strong style={{ color: '#0f172a' }}>Email</strong>
                </div>
                {emails.map((email, idx) => (
                  <a
                    key={idx}
                    href={`mailto:${email}`}
                    style={{
                      color: '#10b981',
                      textDecoration: 'none',
                      display: 'block',
                      marginBottom: '0.25rem'
                    }}
                  >
                    {email}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {facility.description && (
          <div style={{
            marginBottom: '3rem'
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              marginBottom: '1rem',
              color: '#0f172a'
            }}>
              Despre
            </h2>
            <p style={{
              color: '#64748b',
              lineHeight: '1.8',
              fontSize: '1rem'
            }}>
              {facility.description}
            </p>
          </div>
        )}

        {/* Sports Fields */}
        {facility.sportsFields && facility.sportsFields.length > 0 && (
          <div style={{ marginBottom: '3rem' }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              marginBottom: '1.5rem',
              color: '#0f172a'
            }}>
              Terenuri disponibile
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
              gap: '1.5rem'
            }}>
              {facility.sportsFields.map((field, idx) => (
                <div
                  key={idx}
                  style={{
                    background: '#f8fafc',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0'
                  }}
                >
                  <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: '600',
                    marginBottom: '0.75rem',
                    color: '#0f172a'
                  }}>
                    {field.fieldName}
                  </h3>
                  <div style={{
                    display: 'inline-block',
                    padding: '0.375rem 0.75rem',
                    background: '#10b981',
                    color: 'white',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    marginBottom: '1rem'
                  }}>
                    {field.sportType}
                  </div>
                  {field.description && (
                    <p style={{
                      color: '#64748b',
                      marginBottom: '1rem',
                      lineHeight: '1.6'
                    }}>
                      {field.description}
                    </p>
                  )}
                  {getFeatureLabels(field.features).length > 0 && (
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '0.5rem',
                      marginBottom: '1rem'
                    }}>
                      {getFeatureLabels(field.features).map((label, labelIdx) => (
                        <span
                          key={labelIdx}
                          style={{
                            padding: '0.375rem 0.75rem',
                            background: 'white',
                            color: '#64748b',
                            borderRadius: '6px',
                            fontSize: '0.8125rem',
                            border: '1px solid #e2e8f0'
                          }}
                        >
                          {label}
                        </span>
                      ))}
                    </div>
                  )}
                  {field.timeSlots && field.timeSlots.length > 0 && (
                    <div>
                      <strong style={{
                        display: 'block',
                        marginBottom: '0.5rem',
                        color: '#0f172a',
                        fontSize: '0.875rem'
                      }}>
                        Prețuri:
                      </strong>
                      <div style={{
                        fontSize: '0.875rem',
                        color: '#64748b'
                      }}>
                        {field.timeSlots
                          .filter(s => s.status === 'open' && s.price)
                          .map((slot, slotIdx) => (
                            <div key={slotIdx} style={{ marginBottom: '0.25rem' }}>
                              {formatTime(slot.startTime)} - {formatTime(slot.endTime)}: {slot.price} lei/slot
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Gallery */}
        {gallery.length > 0 && (
          <div style={{ marginBottom: '3rem' }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              marginBottom: '1.5rem',
              color: '#0f172a'
            }}>
              Galerie
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
              gap: '1rem'
            }}>
              {gallery.map((image: string, idx: number) => (
                <img
                  key={idx}
                  src={image}
                  alt={`Galerie ${idx + 1}`}
                  style={{
                    width: '100%',
                    height: '200px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    cursor: 'pointer',
                    transition: 'transform 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)'
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Social Media */}
        {(socialMedia.facebook || socialMedia.instagram || socialMedia.x || socialMedia.tiktok || socialMedia.youtube || socialMedia.linkedin) && (
          <div>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              marginBottom: '1rem',
              color: '#0f172a'
            }}>
              Rețele sociale
            </h2>
            <div style={{
              display: 'flex',
              gap: '1rem',
              flexWrap: 'wrap'
            }}>
              {socialMedia.facebook && (
                <a
                  href={socialMedia.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: '#1877f2',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  Facebook
                </a>
              )}
              {socialMedia.instagram && (
                <a
                  href={socialMedia.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: 'linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  Instagram
                </a>
              )}
              {socialMedia.x && (
                <a
                  href={socialMedia.x}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: '#000000',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  X (Twitter)
                </a>
              )}
              {socialMedia.tiktok && (
                <a
                  href={socialMedia.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: '#000000',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  TikTok
                </a>
              )}
              {socialMedia.youtube && (
                <a
                  href={socialMedia.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: '#ff0000',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  YouTube
                </a>
              )}
              {socialMedia.linkedin && (
                <a
                  href={socialMedia.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: '#0077b5',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  LinkedIn
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SportsBasePublic

