import { useState, useEffect, type ReactNode } from 'react'
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom'
import API_BASE_URL from '../config'
import PublicMap from '../components/PublicMap'
import { slugify } from '../utils/seo'

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
  is_verified?: boolean | number
  can_claim?: boolean
  profile_tier?: 'recommended' | 'verified' | 'unverified'
  subscription_ends_at?: string | null
  sport?: string
  specialization?: string
  experience_years?: number
  price_per_lesson?: number
  certifications?: string
  languages?: string
  services_offered?: string
  brands_serviced?: string
  average_repair_time?: string
  repair_categories?: string[] | string
  products_categories?: string
  brands_available?: string
  delivery_available?: boolean | number
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

function SocialRow({ href, label, background, children }: { href: string; label: string; background: string; children: ReactNode }) {
  const text = href.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '')
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <div style={{
        width: '36px',
        height: '36px',
        borderRadius: '10px',
        background,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}>
        {children}
      </div>
      <div>
        <div style={{ color: '#0f172a', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.125rem' }}>{label}</div>
        <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500, wordBreak: 'break-all' }}>
          {text}
        </a>
      </div>
    </div>
  )
}

function SportsBasePublic() {
  const { slug, id } = useParams<{ slug?: string; id?: string }>()
  const facilityKey = id || slug || ''
  const navigate = useNavigate()
  const location = useLocation()
  const [facility, setFacility] = useState<Facility | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const sectionTitle = {
    fontSize: isMobile ? '1.25rem' : '1.5rem',
    fontWeight: 600,
    marginTop: 0,
    marginBottom: isMobile ? '1rem' : '1.5rem',
    color: '#0f172a',
    textAlign: isMobile ? 'center' as const : 'left' as const
  }
  const [resolvedCoords, setResolvedCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [mapZoom, setMapZoom] = useState(15)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (facilityKey) {
      fetchFacility()
    }
  }, [facilityKey])

  useEffect(() => {
    if (!facility) {
      setResolvedCoords(null)
      return
    }

    const raw = facility.map_coordinates
    let parsed: { lat?: number; lng?: number; lon?: number } | null = null
    if (raw && typeof raw === 'object') {
      parsed = raw as { lat?: number; lng?: number; lon?: number }
    } else if (typeof raw === 'string') {
      try {
        parsed = JSON.parse(raw)
      } catch {
        parsed = null
      }
    }
    const lat = Number(parsed?.lat)
    const lng = Number(parsed?.lng ?? parsed?.lon)
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      setResolvedCoords({ lat, lng })
      setMapZoom(facility.location ? 15 : 12)
      return
    }

    const hasAddress = Boolean(facility.location && facility.location.trim())
    const query = (hasAddress ? facility.location : facility.city || '').trim()
    if (!query) {
      setResolvedCoords(null)
      return
    }

    let cancelled = false
    const city = facility.city || ''
    fetch(`${API_BASE_URL}/geocode?q=${encodeURIComponent(query)}${city ? `&city=${encodeURIComponent(city)}` : ''}`)
      .then((response) => response.json())
      .then((data) => {
        if (cancelled) return
        const hit = Array.isArray(data) ? data[0] : null
        if (hit?.lat && hit?.lon) {
          setResolvedCoords({ lat: Number(hit.lat), lng: Number(hit.lon) })
          setMapZoom(hasAddress ? 15 : 12)
        }
      })
      .catch(() => {})

    return () => {
      cancelled = true
    }
  }, [facility])

  useEffect(() => {
    if (!facility || !location.pathname.startsWith('/facility/')) return
    const canonical = `/facility/${facility.id}/${slugify(facility.name)}`
    if (location.pathname !== canonical) {
      navigate(canonical, { replace: true })
    }
  }, [facility, location.pathname, navigate])

  const fetchFacility = async () => {
    try {
      console.log(`[Frontend] Fetching facility with slug: "${facilityKey}"`)
      const response = await fetch(`${API_BASE_URL}/facilities/${encodeURIComponent(facilityKey)}`)
      const data = await response.json()
      
      console.log(`[Frontend] Response:`, data)
      console.log(`[Frontend] sportsFields/sports_fields:`, data.data?.sportsFields || data.data?.sports_fields || data.facility?.sportsFields || data.facility?.sports_fields)
      console.log(`[Frontend] logo_url:`, data.data?.logo_url || data.facility?.logo_url)
      console.log(`[Frontend] gallery (raw):`, data.data?.gallery || data.facility?.gallery)
      
      let facilityData = null
      
      if (data.success && data.data) {
        // Backend returns data in data.data
        facilityData = data.data
      } else if (data.success && data.facility) {
        // Backend returns data in data.facility (backward compatibility)
        facilityData = data.facility
      }
      
      if (facilityData) {
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
        if (facilityData.repair_categories && typeof facilityData.repair_categories === 'string') {
          try {
            facilityData.repair_categories = JSON.parse(facilityData.repair_categories)
          } catch (e) {
            facilityData.repair_categories = []
          }
        }
        if (facilityData.sportsFields && typeof facilityData.sportsFields === 'string') {
          try {
            facilityData.sportsFields = JSON.parse(facilityData.sportsFields)
          } catch (e) {
            console.error('Error parsing sportsFields:', e)
            facilityData.sportsFields = []
          }
        }
        // Also check for sports_fields (snake_case from backend)
        if (facilityData.sports_fields && typeof facilityData.sports_fields === 'string') {
          try {
            facilityData.sportsFields = JSON.parse(facilityData.sports_fields)
          } catch (e) {
            console.error('Error parsing sports_fields:', e)
            facilityData.sportsFields = []
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
        if (facilityData.sportsFields && typeof facilityData.sportsFields === 'string') {
          try {
            facilityData.sportsFields = JSON.parse(facilityData.sportsFields)
          } catch (e) {
            console.error('Error parsing sportsFields:', e)
            facilityData.sportsFields = []
          }
        }
        // Also check for sports_fields (snake_case from backend)
        if (facilityData.sports_fields && typeof facilityData.sports_fields === 'string') {
          try {
            facilityData.sportsFields = JSON.parse(facilityData.sports_fields)
          } catch (e) {
            console.error('Error parsing sports_fields:', e)
            facilityData.sportsFields = []
          }
        }
        
        // Ensure sportsFields is an array
        if (!facilityData.sportsFields) {
          facilityData.sportsFields = []
        }
        
        // Parse timeSlots and features for each field if they're strings
        if (facilityData.sportsFields && Array.isArray(facilityData.sportsFields)) {
          facilityData.sportsFields = facilityData.sportsFields.map((field: any) => {
            // Map snake_case to camelCase if needed
            const mappedField = {
              id: field.id,
              fieldName: field.fieldName || field.field_name,
              sportType: field.sportType || field.sport_type,
              description: field.description || '',
              slotSize: field.slotSize || field.slot_size || 60,
              features: field.features || {},
              timeSlots: field.timeSlots || field.time_slots || []
            }
            
            // Parse features if it's a string
            if (typeof mappedField.features === 'string') {
              try {
                mappedField.features = JSON.parse(mappedField.features)
              } catch (e) {
                console.error('Error parsing features for field:', e)
                mappedField.features = {}
              }
            }
            
            // Parse timeSlots if it's a string
            if (typeof mappedField.timeSlots === 'string') {
              try {
                mappedField.timeSlots = JSON.parse(mappedField.timeSlots)
              } catch (e) {
                console.error('Error parsing timeSlots for field:', e)
                mappedField.timeSlots = []
              }
            }
            
            // Ensure timeSlots is an array
            if (!Array.isArray(mappedField.timeSlots)) {
              mappedField.timeSlots = []
            }
            
            console.log(`[Frontend] Parsed field:`, {
              fieldName: mappedField.fieldName,
              sportType: mappedField.sportType,
              timeSlotsCount: mappedField.timeSlots.length,
              hasFeatures: Object.keys(mappedField.features).length > 0
            })
            
            return mappedField
          })
        }
        
        console.log(`[Frontend] Final facility.sportsFields:`, facilityData.sportsFields)
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

  // Calculate slot duration in hours
  const getSlotDuration = (startTime: string, endTime: string): number => {
    const start = new Date(`2000-01-01T${startTime}:00`)
    const end = new Date(`2000-01-01T${endTime}:00`)
    if (end < start) {
      // Handle overnight slots
      end.setDate(end.getDate() + 1)
    }
    return (end.getTime() - start.getTime()) / (1000 * 60 * 60)
  }

  // Find main slot (longest duration) and secondary slots for a day
  const getMainAndSecondarySlots = (slots: TimeSlot[]) => {
    const openSlots = slots.filter(s => s.status === 'open')
    if (openSlots.length === 0) return { main: null, secondary: [] }
    
    // Calculate duration for each slot
    const slotsWithDuration = openSlots.map(slot => ({
      ...slot,
      duration: getSlotDuration(slot.startTime, slot.endTime)
    }))
    
    // Sort by duration descending
    slotsWithDuration.sort((a, b) => b.duration - a.duration)
    
    const main = slotsWithDuration[0]
    const secondary = slotsWithDuration.slice(1)
    
    return { main, secondary }
  }

  // Calculate blue intensity based on price (0-1 range, mapped to light blue to dark blue)
  const getBlueIntensity = (price: number | null, maxPrice: number): number => {
    if (!price || price === 0) return 0.3 // Light blue for no price
    // Normalize price to 0-1 range, then map to 0.4-1.0 for blue intensity
    const normalized = Math.min(price / maxPrice, 1)
    return 0.4 + (normalized * 0.6) // Range from 0.4 to 1.0
  }

  // Get max price from all slots for intensity calculation
  const getMaxPrice = (timeSlots: TimeSlot[]): number => {
    const prices = timeSlots
      .filter(s => s.status === 'open' && s.price !== null && s.price !== undefined && !s.isPriceUnspecified)
      .map(s => s.price as number)
    return prices.length > 0 ? Math.max(...prices) : 100 // Default max if no prices
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
          border: '1px solid #eef2f6',
          textAlign: 'center',
          maxWidth: '500px'
        }}>
          <h2 style={{ color: '#ef4444', marginBottom: '1rem' }}>Eroare</h2>
          <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
            {error || 'Profilul nu a fost găsit'}
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
  const gallery = Array.isArray(facility.gallery) ? facility.gallery : (facility.gallery || [])
  const socialMedia = facility.social_media || {}
  const logoUrl = facility.logo_url || null
  const isRecommended = facility.profile_tier === 'recommended'

  // Debug logging
  console.log('[Frontend] Facility data:', {
    logo_url: logoUrl,
    gallery: gallery,
    galleryType: typeof facility.gallery,
    galleryIsArray: Array.isArray(facility.gallery)
  })

  // Helper function to get full image URL
  const getImageUrl = (path: string | null | undefined): string | null => {
    if (!path) {
      console.log('[Frontend] getImageUrl: path is null/undefined')
      return null
    }
    console.log('[Frontend] getImageUrl: processing path:', path)
    // If already a full URL, return as is
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path
    }
    // If relative path starting with /uploads, ensure it's accessible
    // Backend serves /uploads statically, so we can use it directly
    if (path.startsWith('/uploads/')) {
      const fullUrl = path
      console.log('[Frontend] getImageUrl: returning full path:', fullUrl)
      return fullUrl
    }
    // If path doesn't start with /, prepend /uploads/ if it looks like a filename
    if (!path.startsWith('/')) {
      // If it's just a filename, assume it's in /uploads/gallery/ or /uploads/logos/
      const fullUrl = `/uploads/${path}`
      console.log('[Frontend] getImageUrl: prepended /uploads/, returning:', fullUrl)
      return fullUrl
    }
    // Otherwise return as is
    console.log('[Frontend] getImageUrl: returning path as is:', path)
    return path
  }

  // Get first gallery image or default
  // Get hero images: first 3 on desktop, first 1 on mobile
  const heroImages = isRecommended
    ? gallery.slice(0, isMobile ? 1 : 3).map(img => getImageUrl(img)).filter(Boolean)
    : []
  const hasHeroImages = heroImages.length > 0

  return (
    <div style={{
      minHeight: '100vh',
      background: 'white',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Hero Section */}
      <div style={{
        position: 'relative',
        height: hasHeroImages
          ? (isMobile ? '220px' : '320px')
          : logoUrl
            ? (isMobile ? '220px' : '280px')
            : (isMobile ? '140px' : '180px'),
        display: 'flex',
        overflow: 'hidden'
      }}>
        {hasHeroImages ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
            width: '100%',
            height: '100%',
            gap: '0'
          }}>
            {heroImages.map((imgUrl, idx) => (
              <div
                key={idx}
                style={{
                  backgroundImage: `url(${imgUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  width: '100%',
                  height: '100%'
                }}
              />
            ))}
          </div>
        ) : (
          <div style={{
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
          }} />
        )}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.6))'
        }} />
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1,
          textAlign: 'center',
          color: 'white',
          padding: isMobile ? '1rem' : '2rem',
          maxWidth: '1200px',
          margin: '0 auto',
          width: '100%'
        }}>
          {/* Logo */}
          {isRecommended && logoUrl && getImageUrl(logoUrl) && (
            <div style={{
              marginBottom: '1.5rem',
              display: 'flex',
              justifyContent: 'center',
              width: '100%'
            }}>
              <img
                src={getImageUrl(logoUrl) || ''}
                alt={`${facility.name} logo`}
                style={{
                  maxWidth: isMobile ? '120px' : '200px',
                  maxHeight: isMobile ? '120px' : '200px',
                  objectFit: 'contain',
                  background: 'rgba(255, 255, 255, 0.9)',
                  padding: '0.75rem',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
                }}
                onError={(e) => {
                  console.error('[Frontend] Failed to load logo:', logoUrl, '->', getImageUrl(logoUrl))
                  e.currentTarget.style.display = 'none'
                }}
                onLoad={() => {
                  console.log('[Frontend] Successfully loaded logo:', logoUrl, '->', getImageUrl(logoUrl))
                }}
              />
            </div>
          )}
          <div style={{ width: '100%' }}>
          <h1 style={{
            fontSize: isMobile ? '1.75rem' : '2.5rem',
            fontWeight: '700',
            marginBottom: '0.35rem',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            {facility.name}
          </h1>
          {(facility.location || facility.city) && (
            <div style={{
              fontSize: isMobile ? '1rem' : '1.25rem',
              marginTop: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <span>{facility.location || facility.city}</span>
            </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: isMobile ? '1.5rem 1rem' : '3rem 2rem',
        paddingBottom: isMobile ? '5.5rem' : '3rem'
      }}>
        {/* Location and Contact */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
          gridTemplateRows: isMobile ? 'auto auto' : 'auto',
          gap: isMobile ? '1.5rem' : '2rem',
          marginBottom: isMobile ? '2rem' : '3rem'
        }}>
          {/* Contact Section - First on mobile */}
          <div style={{
            gridRow: isMobile ? '1' : 'auto',
            display: 'flex',
            flexDirection: 'column',
            height: isMobile ? 'auto' : '100%'
          }}>
            <h2 style={sectionTitle}>
              Date de contact
            </h2>
              <div style={{
              background: 'white',
              padding: isMobile ? '1.25rem' : '1.5rem',
              borderRadius: '16px',
              border: '1px solid #eef2f6',
              height: isMobile ? 'auto' : '100%',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: isMobile ? '1.25rem' : '1.75rem',
                alignItems: 'stretch',
                textAlign: 'left',
                width: '100%'
              }}>
                {/* Contact Methods */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  alignItems: 'stretch',
                  width: '100%',
                  textAlign: 'left'
                }}>
                  {/* Phones - each with its own icon */}
                  {phones.map((phone, idx) => (
                    <div
                      key={`phone-${idx}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem'
                      }}
                    >
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        background: '#ecfdf5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                </div>
                      <div>
                        <div style={{ color: '#0f172a', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.125rem' }}>Telefon</div>
                        <a
                          href={`tel:${phone}`}
                          style={{
                color: '#64748b',
                            textDecoration: 'none',
                fontSize: '0.875rem',
                            transition: 'color 0.2s',
                            fontWeight: '500'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.color = '#10b981'}
                          onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
                        >
                          {phone}
                        </a>
          </div>
                    </div>
                  ))}
                  
                  {/* WhatsApp - each with its own icon */}
                  {whatsapps.map((whatsapp, idx) => (
                    <div
                      key={`whatsapp-${idx}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem'
                      }}
                    >
              <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        background: '#f0fdf4',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="#16a34a">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                        </svg>
                      </div>
                      <div>
                        <div style={{ color: '#0f172a', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.125rem' }}>WhatsApp</div>
                        <a
                          href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: '#64748b',
                            textDecoration: 'none',
                            fontSize: '0.875rem',
                            transition: 'color 0.2s',
                            fontWeight: '500'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.color = '#25D366'}
                          onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
                        >
                          {whatsapp}
                        </a>
                      </div>
                    </div>
                  ))}
                  
                  {/* Emails - each with its own icon */}
                  {emails.map((email, idx) => (
                    <div
                      key={`email-${idx}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem'
                      }}
                    >
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        background: '#eef2ff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                          <polyline points="22,6 12,13 2,6"></polyline>
                        </svg>
              </div>
                      <div>
                        <div style={{ color: '#0f172a', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.125rem' }}>Email</div>
                        <a
                          href={`mailto:${email}`}
                          style={{
                            color: '#64748b',
                            textDecoration: 'none',
                            fontSize: '0.875rem',
                            transition: 'color 0.2s',
                            fontWeight: '500'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.color = '#6366f1'}
                          onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
                        >
                          {email}
                        </a>
                      </div>
                    </div>
                  ))}
                  
                  {/* Website */}
                  {facility.website && (
              <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem'
                    }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        background: '#f5f3ff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="2" y1="12" x2="22" y2="12"></line>
                          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                        </svg>
              </div>
                      <div>
                        <div style={{ color: '#0f172a', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.125rem' }}>Website</div>
                        <a
                          href={facility.website.startsWith('http') ? facility.website : `https://${facility.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: '#64748b',
                            textDecoration: 'none',
                            fontSize: '0.875rem',
                            transition: 'color 0.2s',
                            fontWeight: '500'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.color = '#8b5cf6'}
                          onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
                        >
                          {facility.website.replace(/^https?:\/\//, '').replace(/^www\./, '')}
                        </a>
          </div>
                    </div>
                  )}
        </div>

                {/* Social Media */}
                {(socialMedia.facebook || socialMedia.instagram || socialMedia.x || socialMedia.tiktok || socialMedia.youtube || socialMedia.linkedin) && (
        <div style={{
                    paddingTop: '1.75rem', 
                    borderTop: '1px solid #e2e8f0',
                    marginTop: '0.5rem',
                    width: '100%',
                    textAlign: 'left'
                  }}>
                    <h3 style={{
                      color: '#0f172a',
                      fontSize: isMobile ? '1.25rem' : '1.5rem',
                      fontWeight: 600,
                      marginBottom: isMobile ? '1rem' : '1.5rem',
                      marginTop: 0,
                      textAlign: 'left'
                    }}>
                      Rețele sociale
                    </h3>
          <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem'
                    }}>
                      {socialMedia.facebook && (
                        <SocialRow href={socialMedia.facebook} label="Facebook" background="#eff6ff">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877f2">
                            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                          </svg>
                        </SocialRow>
                      )}
                      {socialMedia.instagram && (
                        <SocialRow href={socialMedia.instagram} label="Instagram" background="#fdf2f8">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#db2777" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                          </svg>
                        </SocialRow>
                      )}
                      {socialMedia.x && (
                        <SocialRow href={socialMedia.x} label="X" background="#f1f5f9">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="#0f172a">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                          </svg>
                        </SocialRow>
                      )}
                      {socialMedia.tiktok && (
                        <SocialRow href={socialMedia.tiktok} label="TikTok" background="#f1f5f9">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="#0f172a">
                            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"></path>
                          </svg>
                        </SocialRow>
                      )}
                      {socialMedia.youtube && (
                        <SocialRow href={socialMedia.youtube} label="YouTube" background="#fef2f2">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="#dc2626">
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"></path>
                          </svg>
                        </SocialRow>
                      )}
                      {socialMedia.linkedin && (
                        <SocialRow href={socialMedia.linkedin} label="LinkedIn" background="#eff6ff">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="#0077b5">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"></path>
                          </svg>
                        </SocialRow>
                      )}
                    </div>
              </div>
            )}
              </div>
          </div>
        </div>

          {/* Map - Second on mobile */}
          <div style={{
            gridRow: isMobile ? '2' : 'auto',
            display: 'flex',
            flexDirection: 'column',
            height: isMobile ? 'auto' : '100%'
          }}>
            <h2 style={sectionTitle}>
              Locație
            </h2>
            <div style={{
              height: isMobile ? '300px' : '100%',
              minHeight: isMobile ? '300px' : '400px',
              flex: isMobile ? 'none' : '1'
            }}>
              {resolvedCoords ? (
                <PublicMap
                  coordinates={resolvedCoords}
                  location={facility.location || facility.city}
                  zoom={mapZoom}
                />
              ) : (
                <div style={{
                  width: '100%',
                  height: '100%',
                  minHeight: isMobile ? '300px' : '400px',
                  borderRadius: '16px',
                  background: '#f8fafc',
                  border: '1px solid #eef2f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#64748b',
                  fontSize: '0.875rem'
                }}>
                  {facility.city || 'Se încarcă harta...'}
                </div>
              )}
            </div>
          </div>
        </div>

        {isRecommended && facility.facility_type !== 'field' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
            gap: '0.75rem 1.5rem',
            marginBottom: isMobile ? '2rem' : '3rem',
            padding: '1.25rem',
            background: '#f8fafc',
            borderRadius: '12px',
            border: '1px solid #eef2f6',
            color: '#0f172a',
            textAlign: isMobile ? 'center' : 'left'
          }}>
            {facility.sport && <div><strong>Sport:</strong> {facility.sport}</div>}
            {facility.specialization && <div><strong>Specializare:</strong> {facility.specialization}</div>}
            {facility.experience_years != null && <div><strong>Experiență:</strong> {facility.experience_years} ani</div>}
            {facility.price_per_lesson != null && <div><strong>Preț / lecție:</strong> {facility.price_per_lesson} lei</div>}
            {facility.certifications && <div><strong>Certificări:</strong> {facility.certifications}</div>}
            {facility.languages && <div><strong>Limbi:</strong> {facility.languages}</div>}
            {facility.services_offered && <div><strong>Servicii:</strong> {facility.services_offered}</div>}
            {facility.brands_serviced && <div><strong>Branduri:</strong> {facility.brands_serviced}</div>}
            {facility.average_repair_time && <div><strong>Timp mediu:</strong> {facility.average_repair_time}</div>}
            {Array.isArray(facility.repair_categories) && facility.repair_categories.length > 0 && (
              <div><strong>Categorii:</strong> {facility.repair_categories.join(', ')}</div>
            )}
            {facility.products_categories && <div><strong>Produse:</strong> {facility.products_categories}</div>}
            {facility.brands_available && <div><strong>Branduri:</strong> {facility.brands_available}</div>}
            {facility.facility_type === 'equipment_shop' && (
              <div><strong>Livrare:</strong> {facility.delivery_available ? 'Da' : 'Nu'}</div>
            )}
          </div>
        )}

        {/* Description */}
        {isRecommended && facility.description && (
          <div style={{
            marginBottom: isMobile ? '2rem' : '3rem'
          }}>
            <h2 style={sectionTitle}>
              Despre
            </h2>
            <p style={{
              color: '#64748b',
              lineHeight: '1.8',
              fontSize: '1rem',
              textAlign: isMobile ? 'center' : 'left'
            }}>
              {facility.description}
            </p>
          </div>
        )}

        {/* Sports Fields */}
        {isRecommended && facility.sportsFields && facility.sportsFields.length > 0 && (
          <div style={{ marginBottom: isMobile ? '2rem' : '3rem' }}>
            <h2 style={sectionTitle}>
              Terenuri disponibile
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
              gap: isMobile ? '1rem' : '1.5rem',
              alignItems: 'start'
            }}>
              {facility.sportsFields.map((field, idx) => (
                <div
                  key={idx}
                  style={{
                    background: '#f8fafc',
                    padding: isMobile ? '1rem' : '1.5rem',
                    borderRadius: '12px',
                    border: '1px solid #eef2f6',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%'
                  }}
                >
                  <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: 600,
                    marginTop: 0,
                    marginBottom: '0.75rem',
                    color: '#0f172a',
                    textAlign: isMobile ? 'center' : 'left'
                  }}>
                    {field.fieldName}
                  </h3>
                  {getFeatureLabels(field.features).length > 0 && (
                    <div style={{
                      marginTop: '1.5rem',
                      paddingTop: '1.5rem',
                      borderTop: '1px solid #e2e8f0',
                      flexShrink: 0
                    }}>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
                        gap: '0.75rem'
                    }}>
                      {getFeatureLabels(field.features).map((label, labelIdx) => (
                          <div
                          key={labelIdx}
                          style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.625rem',
                              padding: '0.625rem 0.875rem',
                              background: '#f8fafc',
                              borderRadius: '8px',
                              border: '1px solid #eef2f6',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                              if (!isMobile) {
                                e.currentTarget.style.background = '#f1f5f9'
                                e.currentTarget.style.borderColor = '#cbd5e1'
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!isMobile) {
                                e.currentTarget.style.background = '#f8fafc'
                                e.currentTarget.style.borderColor = '#e2e8f0'
                              }
                            }}
                          >
                            <div style={{
                              width: '18px',
                              height: '18px',
                              borderRadius: '4px',
                              background: '#10b981',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                            </div>
                            <span style={{
                              color: '#0f172a',
                              fontSize: '0.875rem',
                              fontWeight: '500',
                              lineHeight: '1.4'
                            }}>
                          {label}
                        </span>
                          </div>
                      ))}
                      </div>
                    </div>
                  )}
                  {/* Modern Schedule Grid */}
                  {field.timeSlots && field.timeSlots.length > 0 && (() => {
                    const maxPrice = getMaxPrice(field.timeSlots)
                    const hasAnyOpenSlots = field.timeSlots.some(s => s.status === 'open')
                    
                    // Build legend data
                    const legendItems: Array<{ color: string, label: string }> = []
                    const allOpenSlots = field.timeSlots.filter(s => s.status === 'open')
                    
                    // Check for unspecified price slots (green)
                    const hasUnspecifiedPrice = allOpenSlots.some(s => s.isPriceUnspecified || s.price === null || s.price === undefined)
                    if (hasUnspecifiedPrice) {
                      legendItems.push({ color: '#d1fae5', label: 'Verde deschis: Preț nespecificat' })
                    }
                    
                    // Check if there are slots with specified prices (dark green)
                    const slotsWithPrice = allOpenSlots.filter(s => 
                      !s.isPriceUnspecified && s.price !== null && s.price !== undefined
                    )
                    if (slotsWithPrice.length > 0) {
                      const uniquePrices = [...new Set(slotsWithPrice
                        .map(s => s.price as number)
                      )].sort((a, b) => a - b)
                      uniquePrices.forEach(price => {
                        legendItems.push({ color: '#10b981', label: `Verde închis: ${price} RON/oră` })
                      })
                    }
                    if (field.timeSlots.some(s => s.status === 'closed')) {
                      legendItems.push({ color: '#ef4444', label: 'Roșu: Închis' })
                    }
                    
                    return (
                      <div style={{
                        marginTop: 'auto',
                        paddingTop: '1.5rem',
                        borderTop: '1px solid #e2e8f0',
                        flexShrink: 0
                      }}>
                        <h4 style={{
                          fontSize: '1.125rem',
                          fontWeight: '600',
                          marginBottom: '0.75rem',
                          color: '#0f172a'
                        }}>
                          Program și prețuri
                        </h4>
                        
                        {/* Schedule Grid */}
                      <div style={{
                          display: 'grid',
                          gridTemplateColumns: `60px repeat(${DAYS_OF_WEEK.length}, 1fr)`,
                          gap: '0.25rem',
                          marginBottom: '0.75rem',
                          fontSize: '0.7rem'
                        }}>
                          {/* Time slots header */}
                          <div style={{ gridColumn: '1' }}></div>
                          {DAYS_OF_WEEK.map(day => (
                            <div
                              key={day.key}
                              style={{
                                textAlign: 'center',
                                fontSize: '0.7rem',
                                fontWeight: '600',
                                color: '#64748b',
                                padding: '0.375rem 0.25rem'
                              }}
                            >
                              {day.label.substring(0, 3)}
                            </div>
                          ))}
                          
                          {/* Generate time slots from 06:00 to 24:00 in 1-hour intervals */}
                          {Array.from({ length: 19 }, (_, idx) => {
                            const hour = idx + 6 // Start from 6 AM
                            const timeSlot = `${hour.toString().padStart(2, '0')}:00`
                            const nextHour = hour === 24 ? 24 : hour + 1
                            
                            return (
                              <div key={hour} style={{ display: 'contents' }}>
                                {/* Time label */}
                                <div style={{
                                  fontSize: '0.7rem',
                                  color: '#64748b',
                                  padding: '0.25rem',
                                  textAlign: 'left',
                                  paddingLeft: '0.5rem',
                                  fontWeight: '500'
                                }}>
                                  {timeSlot}
                      </div>
                                
                                {/* Day columns */}
                                {DAYS_OF_WEEK.map(day => {
                                  const daySlots = getDaySlots(day.key, field.timeSlots || [])
                                  const { main, secondary } = getMainAndSecondarySlots(daySlots)
                                  
                                  // Check if this hour falls within any slot
                                  const hourInMinutes = hour * 60
                                  const nextHourInMinutes = nextHour * 60
                                  
                                  // Find matching slot
                                  let matchingSlot: TimeSlot | null = null
                                  let isMain = false
                                  
                                  for (const slot of daySlots) {
                                    const [startH, startM] = slot.startTime.split(':').map(Number)
                                    const [endH, endM] = slot.endTime.split(':').map(Number)
                                    const slotStart = startH * 60 + startM
                                    const slotEnd = endH * 60 + endM
                                    
                                    // Check if hour overlaps with slot
                                    if (hourInMinutes < slotEnd && nextHourInMinutes > slotStart) {
                                      matchingSlot = slot
                                      isMain = main && slot.startTime === main.startTime && slot.endTime === main.endTime
                                      break
                                    }
                                  }
                                  
                                  if (!matchingSlot) {
                                    // No slot defined for this hour - mark as closed (red)
                                    return (
                                      <div
                                        key={day.key}
                                        style={{
                                          background: '#fee2e2',
                                          border: '2px solid #ef4444',
                                          minHeight: '16px',
                                          borderRadius: '4px'
                                        }}
                                        title="Închis"
                                      />
                                    )
                                  }
                                  
                                  // Determine color
                                  let backgroundColor = '#ffffff'
                                  let borderColor = '#e2e8f0'
                                  
                                  if (matchingSlot.status === 'closed') {
                                    // Red for closed
                                    backgroundColor = '#fee2e2'
                                    borderColor = '#ef4444'
                                  } else if (matchingSlot.isPriceUnspecified || matchingSlot.price === null || matchingSlot.price === undefined) {
                                    // Light green for unspecified price
                                    backgroundColor = '#d1fae5'
                                    borderColor = '#10b981'
                                  } else {
                                    // Darker green for specified price (both main and secondary slots)
                                    backgroundColor = '#10b981'
                                    borderColor = '#059669'
                                  }
                                  
                                  return (
                                    <div
                                      key={day.key}
                                      style={{
                                        background: backgroundColor,
                                        border: `2px solid ${borderColor}`,
                                        minHeight: '16px',
                                        borderRadius: '4px'
                                      }}
                                      title={`${formatTime(matchingSlot.startTime)} - ${formatTime(matchingSlot.endTime)}${matchingSlot.status === 'open' ? (matchingSlot.isPriceUnspecified ? ' (Preț nespecificat)' : (matchingSlot.price ? ` (${matchingSlot.price} RON/oră)` : '')) : ' (Închis)'}`}
                                    />
                                  )
                                })}
                              </div>
                            )
                          })}
                        </div>
                        
                        {/* Legend */}
                        {legendItems.length > 0 && (
                          <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '0.5rem',
                            padding: '0.75rem',
                            background: '#f8fafc',
                            borderRadius: '6px',
                            border: '1px solid #eef2f6'
                          }}>
                            {legendItems.map((item, idx) => (
                              <div
                                key={idx}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.375rem',
                                  fontSize: '0.7rem'
                                }}
                              >
                                <div
                                  style={{
                                    width: '14px',
                                    height: '14px',
                                    background: item.color,
                                    border: item.color === '#10b981' ? '1.5px solid #059669' : 
                                            item.color === '#ef4444' ? '1.5px solid #dc2626' :
                                            item.color.startsWith('rgba') ? `1.5px solid rgba(37, 99, 235, ${item.color.match(/[\d.]+/g)?.[3] || '0.5'})` :
                                            '1.5px solid #3b82f6',
                                    borderRadius: '3px'
                                  }}
                                />
                                <span style={{ color: '#64748b' }}>{item.label}</span>
                              </div>
                            ))}
                    </div>
                  )}
                      </div>
                    )
                  })()}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Gallery */}
        {isRecommended && gallery.length > 0 && (
          <div style={{ marginBottom: isMobile ? '2rem' : '3rem' }}>
            <h2 style={sectionTitle}>
              Galerie
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
              gap: '1rem'
            }}>
              {gallery.map((image: string, idx: number) => {
                const imageUrl = getImageUrl(image)
                if (!imageUrl) return null
                return (
                <img
                  key={idx}
                    src={imageUrl}
                  alt={`Galerie ${idx + 1}`}
                  style={{
                    width: '100%',
                    height: '200px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    border: '1px solid #eef2f6',
                    cursor: 'pointer',
                    transition: 'transform 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)'
                  }}
                    onError={(e) => {
                      // Hide broken images
                      e.currentTarget.style.display = 'none'
                  }}
                />
                )
              })}
            </div>
          </div>
        )}

      </div>
      
      <div style={{
          position: 'fixed',
          zIndex: 40,
          ...(isMobile
            ? { left: '0.75rem', right: '0.75rem', bottom: '0.75rem' }
            : { right: '1.5rem', bottom: '1.5rem' })
        }}>
          {facility.profile_tier === 'recommended' ? (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#ecfdf5',
              color: '#047857',
              border: '1px solid #a7f3d0',
              borderRadius: '12px',
              padding: isMobile ? '0.75rem 0.9rem' : '0.9rem 1.15rem',
              fontWeight: 700,
              fontSize: isMobile ? '0.85rem' : '0.95rem',
              boxShadow: 'none',
              whiteSpace: 'nowrap',
              width: isMobile ? '100%' : undefined,
              boxSizing: 'border-box'
            }}>
              Facilitate recomandată
            </div>
          ) : facility.profile_tier === 'verified' ? (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#fff7ed',
              color: '#c2410c',
              border: '1px solid #fed7aa',
              borderRadius: '12px',
              padding: isMobile ? '0.75rem 0.9rem' : '0.9rem 1.15rem',
              fontWeight: 700,
              fontSize: isMobile ? '0.85rem' : '0.95rem',
              boxShadow: 'none',
              whiteSpace: 'nowrap',
              width: isMobile ? '100%' : undefined,
              boxSizing: 'border-box'
            }}>
              Facilitate verificată
            </div>
          ) : (
            <Link
              to={`/revendica/${facility.id}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#fef2f2',
                color: '#b91c1c',
                border: '1px solid #fecaca',
                textDecoration: 'none',
                borderRadius: '12px',
                padding: isMobile ? '0.75rem 0.9rem' : '0.9rem 1.15rem',
                fontWeight: 700,
                fontSize: isMobile ? '0.85rem' : '0.95rem',
                boxShadow: 'none',
                whiteSpace: 'nowrap',
                width: isMobile ? '100%' : undefined,
                boxSizing: 'border-box'
              }}
            >
              Revendică profilul
            </Link>
          )}
        </div>

    </div>
  )
}

export default SportsBasePublic

