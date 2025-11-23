import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import API_BASE_URL from '../../config'
import { ROMANIAN_CITIES, getCityNames } from '../../data/romanian-cities'
import PublicMap from '../../components/PublicMap'

interface TimeSlot {
  day: string
  startTime: string
  endTime: string
  status: 'open' | 'closed' | 'not_specified'
  price: number | null
}

interface SportsField {
  id: number
  facility_id: number
  sport_type: string
  field_name: string
  price_per_hour?: number
  description?: string
  features?: {
    hasParking?: boolean
    hasShower?: boolean
    hasChangingRoom?: boolean
    hasAirConditioning?: boolean
    hasLighting?: boolean
    hasWiFi?: boolean
    hasBar?: boolean
    hasFirstAid?: boolean
    hasEquipmentRental?: boolean
    hasLocker?: boolean
    hasTowelService?: boolean
    hasWaterFountain?: boolean
    hasSeating?: boolean
    hasScoreboard?: boolean
    hasSoundSystem?: boolean
    hasHeating?: boolean
    hasCover?: boolean
    hasGrass?: boolean
    hasArtificialGrass?: boolean
    hasIndoor?: boolean
    hasOutdoor?: boolean
  }
  slot_size?: number
  time_slots?: string | TimeSlot[]
}

interface Facility {
  id: number
  facility_type: string
  name: string
  city: string
  county?: string
  location?: string
  location_not_specified?: boolean
  map_coordinates?: string | { lat: number; lng: number }
  contact_person?: string
  phone?: string
  phones?: string | string[]
  whatsapp?: string
  whatsapps?: string | string[]
  email?: string
  emails?: string | string[]
  description?: string
  website?: string
  logo_url?: string
  image_url?: string
  social_media?: string | {
    facebook?: string
    instagram?: string
    x?: string
    tiktok?: string
    youtube?: string
    linkedin?: string
  }
  gallery?: string | string[]
  opening_hours?: string
  status: string
  created_at: string
  // Field specific (legacy)
  sport?: string
  price_per_hour?: number
  // Coach specific
  specialization?: string
  experience_years?: number
  price_per_lesson?: number
  certifications?: string
  languages?: string
  // Repair shop specific
  services_offered?: string
  brands_serviced?: string
  average_repair_time?: string
  // Equipment shop specific
  products_categories?: string
  brands_available?: string
  delivery_available?: boolean
  // Sports fields
  sportsFields?: SportsField[]
}

const KNOWN_SPORTS = ['tenis', 'fotbal', 'baschet', 'volei', 'handbal', 'badminton', 'squash', 'ping-pong', 'atletism', 'inot', 'fitness', 'box', 'karate', 'judo', 'dans']

const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Luni' },
  { key: 'tuesday', label: 'Marți' },
  { key: 'wednesday', label: 'Miercuri' },
  { key: 'thursday', label: 'Joi' },
  { key: 'friday', label: 'Vineri' },
  { key: 'saturday', label: 'Sâmbătă' },
  { key: 'sunday', label: 'Duminică' }
]

function FacilityDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [facility, setFacility] = useState<Facility | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<Partial<Facility>>({})
  const [availableCities, setAvailableCities] = useState<string[]>([])
  const [availableSports, setAvailableSports] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    loadFacility()
    loadCities()
    loadSports()
  }, [id])

  const loadFacility = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/facilities/${id}`)
      const data = await response.json()
      if (data.success) {
        const facilityData = data.data || data.facility
        
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
        
        // Parse sportsFields time_slots
        if (facilityData.sportsFields) {
          facilityData.sportsFields = facilityData.sportsFields.map((field: SportsField) => {
            if (field.time_slots && typeof field.time_slots === 'string') {
              try {
                field.time_slots = JSON.parse(field.time_slots)
              } catch (e) {
                field.time_slots = []
              }
            }
            if (field.features && typeof field.features === 'string') {
              try {
                field.features = JSON.parse(field.features)
              } catch (e) {
                field.features = {}
              }
            }
            return field
          })
        }
        
        setFacility(facilityData)
        setFormData(facilityData)
      } else {
        setError('Facilitatea nu a fost găsită')
      }
    } catch (err) {
      console.error('Error loading facility:', err)
      setError('Eroare la încărcarea facilității')
    } finally {
      setLoading(false)
    }
  }

  const loadCities = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/cities`)
      const data = await response.json()
      if (data.success && data.data) {
        const cities = data.data.map((item: any) => item.city)
        setAvailableCities([...new Set([...getCityNames(), ...cities])].sort())
      } else {
        setAvailableCities(getCityNames())
      }
    } catch (err) {
      setAvailableCities(getCityNames())
    }
  }

  const loadSports = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/sports`)
      const data = await response.json()
      if (data.success && data.data) {
        const sports = data.data.map((item: any) => item.sport)
        setAvailableSports([...new Set([...KNOWN_SPORTS, ...sports])].sort())
      } else {
        setAvailableSports(KNOWN_SPORTS)
      }
    } catch (err) {
      setAvailableSports(KNOWN_SPORTS)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const updateData = {
        ...formData,
        phones: Array.isArray(formData.phones) ? JSON.stringify(formData.phones) : formData.phones,
        whatsapps: Array.isArray(formData.whatsapps) ? JSON.stringify(formData.whatsapps) : formData.whatsapps,
        emails: Array.isArray(formData.emails) ? JSON.stringify(formData.emails) : formData.emails,
        social_media: typeof formData.social_media === 'object' ? JSON.stringify(formData.social_media) : formData.social_media,
        gallery: Array.isArray(formData.gallery) ? JSON.stringify(formData.gallery) : formData.gallery,
        map_coordinates: typeof formData.map_coordinates === 'object' ? JSON.stringify(formData.map_coordinates) : formData.map_coordinates
      }

      const response = await fetch(`${API_BASE_URL}/facilities/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      })

      const data = await response.json()
      if (data.success) {
        setSuccess('Facilitatea a fost actualizată cu succes')
        setIsEditing(false)
        loadFacility()
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(data.error || 'Eroare la actualizare')
        setTimeout(() => setError(''), 3000)
      }
    } catch (err) {
      setError('Eroare la conectarea la server')
      setTimeout(() => setError(''), 3000)
      console.error('Error updating facility:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    if (!confirm(`Sigur vrei să schimbi statusul la "${newStatus}"?`)) return

    setSaving(true)
    try {
      const response = await fetch(`${API_BASE_URL}/admin/facilities/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      const data = await response.json()
      if (data.success) {
        setSuccess(`Statusul a fost schimbat la "${newStatus}"`)
        loadFacility()
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(data.error || 'Eroare la schimbarea statusului')
        setTimeout(() => setError(''), 3000)
      }
    } catch (err) {
      setError('Eroare la conectarea la server')
      setTimeout(() => setError(''), 3000)
    } finally {
      setSaving(false)
    }
  }

  const getFacilityTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'field': 'Bază Sportivă',
      'coach': 'Antrenor',
      'repair_shop': 'Magazin Reparații',
      'equipment_shop': 'Magazin Articole'
    }
    return labels[type] || type
  }

  const formatTime = (time: string) => {
    return time ? time.substring(0, 5) : ''
  }

  const getDaySlots = (day: string, timeSlots: TimeSlot[]) => {
    return timeSlots.filter(slot => slot.day === day)
  }

  const getFeatureLabels = (features: SportsField['features']) => {
    if (!features) return []
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

  // Create SEO-friendly slug
  const createSlug = (name: string, city: string): string => {
    const text = `${name} ${city}`
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#f8fafc'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #e2e8f0',
            borderTopColor: '#0f172a',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <p style={{ color: '#64748b', margin: 0 }}>Se încarcă...</p>
        </div>
      </div>
    )
  }

  if (!facility) {
    return (
      <div style={{ padding: '2rem' }}>
        <div style={{
          background: '#fee2e2',
          border: '1px solid #ef4444',
          color: '#991b1b',
          padding: '1.5rem',
          borderRadius: '12px',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          <h2 style={{ marginTop: 0, marginBottom: '0.5rem' }}>Eroare</h2>
          <p style={{ margin: 0 }}>Facilitatea nu a fost găsită</p>
        </div>
      </div>
    )
  }

  const phones = Array.isArray(facility.phones) ? facility.phones : (facility.phone ? [facility.phone] : [])
  const whatsapps = Array.isArray(facility.whatsapps) ? facility.whatsapps : (facility.whatsapp ? [facility.whatsapp] : [])
  const emails = Array.isArray(facility.emails) ? facility.emails : (facility.email ? [facility.email] : [])
  const gallery = Array.isArray(facility.gallery) ? facility.gallery : []
  const socialMedia = typeof facility.social_media === 'object' ? facility.social_media : {}
  const mapCoords = typeof facility.map_coordinates === 'object' ? facility.map_coordinates : null

  const tabs = [
    { id: 'overview', label: 'Prezentare generală' },
    { id: 'contact', label: 'Contact' },
    { id: 'location', label: 'Locație' },
    ...(facility.facility_type === 'field' ? [{ id: 'fields', label: 'Terenuri' }] : []),
    { id: 'media', label: 'Media' },
    { id: 'settings', label: 'Setări' }
  ]

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8fafc',
      padding: '2rem'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '2rem',
          marginBottom: '1.5rem',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div style={{ flex: 1 }}>
              <button
                onClick={() => navigate(-1)}
                style={{
                  padding: '0.5rem 1rem',
                  background: 'transparent',
                  color: '#64748b',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  marginBottom: '1rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f1f5f9'
                  e.currentTarget.style.borderColor = '#cbd5e1'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.borderColor = '#e2e8f0'
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                Înapoi
              </button>
              <h1 style={{
                fontSize: '2rem',
                fontWeight: '700',
                color: '#0f172a',
                margin: '0 0 0.5rem 0',
                letterSpacing: '-0.02em'
              }}>
                {facility.name}
              </h1>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                flexWrap: 'wrap'
              }}>
                <span style={{
                  padding: '0.375rem 0.75rem',
                  background: '#f1f5f9',
                  color: '#475569',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}>
                  {getFacilityTypeLabel(facility.facility_type)}
                </span>
                <span style={{
                  padding: '0.375rem 0.75rem',
                  background: facility.status === 'active' ? '#d1fae5' : facility.status === 'pending' ? '#fef3c7' : '#fee2e2',
                  color: facility.status === 'active' ? '#065f46' : facility.status === 'pending' ? '#92400e' : '#991b1b',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  {facility.status === 'active' ? 'Aprobat' : facility.status === 'pending' ? 'În așteptare' : 'Respins'}
                </span>
                {facility.status === 'active' && (
                  <Link
                    to={`/baza-sportiva/${createSlug(facility.name, facility.city)}`}
                    target="_blank"
                    style={{
                      padding: '0.375rem 0.75rem',
                      background: '#10b981',
                      color: 'white',
                      textDecoration: 'none',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#059669'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#10b981'
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                      <polyline points="15 3 21 3 21 9"></polyline>
                      <line x1="10" y1="14" x2="21" y2="3"></line>
                    </svg>
                    Vezi pagina publică
                  </Link>
                )}
              </div>
            </div>
            <div style={{
              display: 'flex',
              gap: '0.75rem',
              flexWrap: 'wrap'
            }}>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  style={{
                    padding: '0.625rem 1.25rem',
                    background: '#0f172a',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '0.875rem',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#1e293b'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#0f172a'
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                  Editează
                </button>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setIsEditing(false)
                      setFormData(facility)
                    }}
                    style={{
                      padding: '0.625rem 1.25rem',
                      background: 'white',
                      color: '#64748b',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '0.875rem',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#f8fafc'
                      e.currentTarget.style.borderColor = '#cbd5e1'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'white'
                      e.currentTarget.style.borderColor = '#e2e8f0'
                    }}
                  >
                    Anulează
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    style={{
                      padding: '0.625rem 1.25rem',
                      background: saving ? '#94a3b8' : '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: saving ? 'not-allowed' : 'pointer',
                      fontWeight: '600',
                      fontSize: '0.875rem',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                    onMouseEnter={(e) => {
                      if (!saving) {
                        e.currentTarget.style.background = '#059669'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!saving) {
                        e.currentTarget.style.background = '#10b981'
                      }
                    }}
                  >
                    {saving ? (
                      <>
                        <div style={{
                          width: '14px',
                          height: '14px',
                          border: '2px solid rgba(255,255,255,0.3)',
                          borderTopColor: 'white',
                          borderRadius: '50%',
                          animation: 'spin 0.6s linear infinite'
                        }} />
                        Salvează...
                      </>
                    ) : (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                          <polyline points="17 21 17 13 7 13 7 21"></polyline>
                          <polyline points="7 3 7 8 15 8"></polyline>
                        </svg>
                        Salvează
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div style={{
              background: '#fee2e2',
              border: '1px solid #fca5a5',
              color: '#991b1b',
              padding: '1rem 1.5rem',
              borderRadius: '8px',
              marginBottom: '1rem',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              {error}
            </div>
          )}

          {success && (
            <div style={{
              background: '#d1fae5',
              border: '1px solid #86efac',
              color: '#065f46',
              padding: '1rem 1.5rem',
              borderRadius: '8px',
              marginBottom: '1rem',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              {success}
            </div>
          )}

          {/* Tabs */}
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            borderBottom: '2px solid #e2e8f0',
            marginTop: '1.5rem',
            overflowX: 'auto'
          }}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'transparent',
                  color: activeTab === tab.id ? '#0f172a' : '#64748b',
                  border: 'none',
                  borderBottom: activeTab === tab.id ? '2px solid #0f172a' : '2px solid transparent',
                  borderRadius: '0',
                  fontWeight: activeTab === tab.id ? '600' : '500',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap',
                  marginBottom: '-2px'
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== tab.id) {
                    e.currentTarget.style.color = '#0f172a'
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== tab.id) {
                    e.currentTarget.style.color = '#64748b'
                  }
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '2rem',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2rem'
              }}>
                {/* Basic Info Card */}
                <div style={{
                  padding: '1.5rem',
                  background: '#f8fafc',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0'
                }}>
                  <h3 style={{
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#64748b',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    margin: '0 0 1rem 0'
                  }}>
                    Informații de bază
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        color: '#94a3b8',
                        marginBottom: '0.25rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        Nume
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.name || ''}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.625rem',
                            border: '1.5px solid #e2e8f0',
                            borderRadius: '8px',
                            fontSize: '0.9375rem',
                            outline: 'none',
                            transition: 'all 0.2s'
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = '#0f172a'
                            e.target.style.boxShadow = '0 0 0 3px rgba(15, 23, 42, 0.1)'
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = '#e2e8f0'
                            e.target.style.boxShadow = 'none'
                          }}
                        />
                      ) : (
                        <p style={{ margin: 0, color: '#0f172a', fontWeight: '500', fontSize: '1rem' }}>
                          {facility.name}
                        </p>
                      )}
                    </div>
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        color: '#94a3b8',
                        marginBottom: '0.25rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        Oraș
                      </label>
                      {isEditing ? (
                        <select
                          value={formData.city || ''}
                          onChange={(e) => handleInputChange('city', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.625rem',
                            border: '1.5px solid #e2e8f0',
                            borderRadius: '8px',
                            fontSize: '0.9375rem',
                            outline: 'none',
                            transition: 'all 0.2s',
                            background: 'white'
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = '#0f172a'
                            e.target.style.boxShadow = '0 0 0 3px rgba(15, 23, 42, 0.1)'
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = '#e2e8f0'
                            e.target.style.boxShadow = 'none'
                          }}
                        >
                          {availableCities.map(city => (
                            <option key={city} value={city}>{city}</option>
                          ))}
                        </select>
                      ) : (
                        <p style={{ margin: 0, color: '#0f172a', fontWeight: '500', fontSize: '1rem' }}>
                          {facility.city}
                        </p>
                      )}
                    </div>
                    {facility.county && (
                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          color: '#94a3b8',
                          marginBottom: '0.25rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}>
                          Județ
                        </label>
                        <p style={{ margin: 0, color: '#0f172a', fontWeight: '500', fontSize: '1rem' }}>
                          {facility.county}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status Card */}
                <div style={{
                  padding: '1.5rem',
                  background: '#f8fafc',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0'
                }}>
                  <h3 style={{
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#64748b',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    margin: '0 0 1rem 0'
                  }}>
                    Status
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        color: '#94a3b8',
                        marginBottom: '0.5rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        Status actual
                      </label>
                      <select
                        value={facility.status}
                        onChange={(e) => handleStatusChange(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.625rem',
                          border: '1.5px solid #e2e8f0',
                          borderRadius: '8px',
                          fontSize: '0.9375rem',
                          outline: 'none',
                          transition: 'all 0.2s',
                          background: 'white',
                          cursor: 'pointer'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#0f172a'
                          e.target.style.boxShadow = '0 0 0 3px rgba(15, 23, 42, 0.1)'
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#e2e8f0'
                          e.target.style.boxShadow = 'none'
                        }}
                      >
                        <option value="pending">În așteptare</option>
                        <option value="active">Aprobat</option>
                        <option value="inactive">Respins</option>
                      </select>
                    </div>
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        color: '#94a3b8',
                        marginBottom: '0.25rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        Creat la
                      </label>
                      <p style={{ margin: 0, color: '#64748b', fontSize: '0.875rem' }}>
                        {new Date(facility.created_at).toLocaleString('ro-RO')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              {facility.description && (
                <div style={{
                  padding: '1.5rem',
                  background: '#f8fafc',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  marginBottom: '2rem'
                }}>
                  <h3 style={{
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#64748b',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    margin: '0 0 1rem 0'
                  }}>
                    Descriere
                  </h3>
                  {isEditing ? (
                    <textarea
                      value={formData.description || ''}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={6}
                      style={{
                        width: '100%',
                        padding: '0.875rem',
                        border: '1.5px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '0.9375rem',
                        outline: 'none',
                        transition: 'all 0.2s',
                        fontFamily: 'inherit',
                        resize: 'vertical'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#0f172a'
                        e.target.style.boxShadow = '0 0 0 3px rgba(15, 23, 42, 0.1)'
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e2e8f0'
                        e.target.style.boxShadow = 'none'
                      }}
                    />
                  ) : (
                    <p style={{
                      margin: 0,
                      color: '#0f172a',
                      lineHeight: '1.7',
                      whiteSpace: 'pre-wrap'
                    }}>
                      {facility.description}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Contact Tab */}
          {activeTab === 'contact' && (
            <div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2rem'
              }}>
                {/* Contact Person */}
                {facility.contact_person && (
                  <div style={{
                    padding: '1.5rem',
                    background: '#f8fafc',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <h3 style={{
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: '#64748b',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      margin: '0 0 1rem 0'
                    }}>
                      Persoană de contact
                    </h3>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.contact_person || ''}
                        onChange={(e) => handleInputChange('contact_person', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.625rem',
                          border: '1.5px solid #e2e8f0',
                          borderRadius: '8px',
                          fontSize: '0.9375rem',
                          outline: 'none',
                          transition: 'all 0.2s'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#0f172a'
                          e.target.style.boxShadow = '0 0 0 3px rgba(15, 23, 42, 0.1)'
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#e2e8f0'
                          e.target.style.boxShadow = 'none'
                        }}
                      />
                    ) : (
                      <p style={{ margin: 0, color: '#0f172a', fontWeight: '500' }}>
                        {facility.contact_person}
                      </p>
                    )}
                  </div>
                )}

                {/* Phones */}
                <div style={{
                  padding: '1.5rem',
                  background: '#f8fafc',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0'
                }}>
                  <h3 style={{
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#64748b',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    margin: '0 0 1rem 0'
                  }}>
                    Telefoane ({phones.length})
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {phones.map((phone, idx) => (
                      <div key={idx} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        <a
                          href={`tel:${phone}`}
                          style={{
                            color: '#10b981',
                            textDecoration: 'none',
                            fontWeight: '500',
                            fontSize: '0.9375rem'
                          }}
                        >
                          {phone}
                        </a>
                      </div>
                    ))}
                    {phones.length === 0 && (
                      <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.875rem' }}>
                        Nu există telefoane
                      </p>
                    )}
                  </div>
                </div>

                {/* WhatsApp */}
                {whatsapps.length > 0 && (
                  <div style={{
                    padding: '1.5rem',
                    background: '#f8fafc',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <h3 style={{
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: '#64748b',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      margin: '0 0 1rem 0'
                    }}>
                      WhatsApp ({whatsapps.length})
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {whatsapps.map((whatsapp, idx) => (
                        <a
                          key={idx}
                          href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: '#10b981',
                            textDecoration: 'none',
                            fontWeight: '500',
                            fontSize: '0.9375rem'
                          }}
                        >
                          {whatsapp}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Emails */}
                <div style={{
                  padding: '1.5rem',
                  background: '#f8fafc',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0'
                }}>
                  <h3 style={{
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#64748b',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    margin: '0 0 1rem 0'
                  }}>
                    Email-uri ({emails.length})
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {emails.map((email, idx) => (
                      <a
                        key={idx}
                        href={`mailto:${email}`}
                        style={{
                          color: '#10b981',
                          textDecoration: 'none',
                          fontWeight: '500',
                          fontSize: '0.9375rem'
                        }}
                      >
                        {email}
                      </a>
                    ))}
                    {emails.length === 0 && (
                      <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.875rem' }}>
                        Nu există email-uri
                      </p>
                    )}
                  </div>
                </div>

                {/* Website */}
                {facility.website && (
                  <div style={{
                    padding: '1.5rem',
                    background: '#f8fafc',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <h3 style={{
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: '#64748b',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      margin: '0 0 1rem 0'
                    }}>
                      Website
                    </h3>
                    {isEditing ? (
                      <input
                        type="url"
                        value={formData.website || ''}
                        onChange={(e) => handleInputChange('website', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.625rem',
                          border: '1.5px solid #e2e8f0',
                          borderRadius: '8px',
                          fontSize: '0.9375rem',
                          outline: 'none',
                          transition: 'all 0.2s'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#0f172a'
                          e.target.style.boxShadow = '0 0 0 3px rgba(15, 23, 42, 0.1)'
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#e2e8f0'
                          e.target.style.boxShadow = 'none'
                        }}
                      />
                    ) : (
                      <a
                        href={facility.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: '#10b981',
                          textDecoration: 'none',
                          fontWeight: '500',
                          fontSize: '0.9375rem',
                          wordBreak: 'break-all'
                        }}
                      >
                        {facility.website}
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Location Tab */}
          {activeTab === 'location' && (
            <div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '2rem',
                marginBottom: '2rem'
              }}>
                {/* Map */}
                <div>
                  <h3 style={{
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#64748b',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    margin: '0 0 1rem 0'
                  }}>
                    Hartă
                  </h3>
                  {mapCoords ? (
                    <PublicMap
                      coordinates={mapCoords}
                      location={facility.location || undefined}
                    />
                  ) : (
                    <div style={{
                      width: '100%',
                      height: '400px',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#94a3b8'
                    }}>
                      Nu există coordonate
                    </div>
                  )}
                </div>

                {/* Location Details */}
                <div>
                  <h3 style={{
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#64748b',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    margin: '0 0 1rem 0'
                  }}>
                    Detalii locație
                  </h3>
                  <div style={{
                    padding: '1.5rem',
                    background: '#f8fafc',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{
                        display: 'block',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        color: '#94a3b8',
                        marginBottom: '0.5rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        Adresă
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.location || ''}
                          onChange={(e) => handleInputChange('location', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.625rem',
                            border: '1.5px solid #e2e8f0',
                            borderRadius: '8px',
                            fontSize: '0.9375rem',
                            outline: 'none',
                            transition: 'all 0.2s'
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = '#0f172a'
                            e.target.style.boxShadow = '0 0 0 3px rgba(15, 23, 42, 0.1)'
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = '#e2e8f0'
                            e.target.style.boxShadow = 'none'
                          }}
                        />
                      ) : (
                        <p style={{ margin: 0, color: '#0f172a', fontWeight: '500' }}>
                          {facility.location || 'Nu este specificată'}
                        </p>
                      )}
                    </div>
                    {mapCoords && (
                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          color: '#94a3b8',
                          marginBottom: '0.5rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}>
                          Coordonate
                        </label>
                        <p style={{ margin: 0, color: '#64748b', fontSize: '0.875rem', fontFamily: 'monospace' }}>
                          {mapCoords.lat.toFixed(6)}, {mapCoords.lng.toFixed(6)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Fields Tab - Only for sports bases */}
          {activeTab === 'fields' && facility.facility_type === 'field' && (
            <div>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: '#0f172a',
                marginBottom: '1.5rem'
              }}>
                Terenuri ({facility.sportsFields?.length || 0})
              </h3>
              {facility.sportsFields && facility.sportsFields.length > 0 ? (
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                  {facility.sportsFields.map((field, idx) => {
                    const timeSlots = Array.isArray(field.time_slots) ? field.time_slots : []
                    return (
                      <div
                        key={field.id || idx}
                        style={{
                          padding: '1.5rem',
                          background: '#f8fafc',
                          borderRadius: '12px',
                          border: '1px solid #e2e8f0'
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: '1rem',
                          flexWrap: 'wrap',
                          gap: '1rem'
                        }}>
                          <div>
                            <h4 style={{
                              fontSize: '1.125rem',
                              fontWeight: '600',
                              color: '#0f172a',
                              margin: '0 0 0.5rem 0'
                            }}>
                              {field.field_name || `Teren ${idx + 1}`}
                            </h4>
                            <div style={{
                              display: 'flex',
                              gap: '0.5rem',
                              flexWrap: 'wrap',
                              alignItems: 'center'
                            }}>
                              <span style={{
                                padding: '0.375rem 0.75rem',
                                background: '#dbeafe',
                                color: '#1e40af',
                                borderRadius: '6px',
                                fontSize: '0.875rem',
                                fontWeight: '600'
                              }}>
                                {field.sport_type}
                              </span>
                              {field.price_per_hour && (
                                <span style={{
                                  padding: '0.375rem 0.75rem',
                                  background: '#d1fae5',
                                  color: '#065f46',
                                  borderRadius: '6px',
                                  fontSize: '0.875rem',
                                  fontWeight: '600'
                                }}>
                                  {field.price_per_hour} RON/oră
                                </span>
                              )}
                              {field.slot_size && (
                                <span style={{
                                  padding: '0.375rem 0.75rem',
                                  background: '#f3f4f6',
                                  color: '#374151',
                                  borderRadius: '6px',
                                  fontSize: '0.875rem',
                                  fontWeight: '500'
                                }}>
                                  Slot: {field.slot_size} min
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {field.description && (
                          <p style={{
                            margin: '0 0 1rem 0',
                            color: '#64748b',
                            lineHeight: '1.6'
                          }}>
                            {field.description}
                          </p>
                        )}

                        {field.features && getFeatureLabels(field.features).length > 0 && (
                          <div style={{ marginBottom: '1rem' }}>
                            <label style={{
                              display: 'block',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              color: '#94a3b8',
                              marginBottom: '0.5rem',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em'
                            }}>
                              Facilități
                            </label>
                            <div style={{
                              display: 'flex',
                              flexWrap: 'wrap',
                              gap: '0.5rem'
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
                          </div>
                        )}

                        {timeSlots.length > 0 && (
                          <div>
                            <label style={{
                              display: 'block',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              color: '#94a3b8',
                              marginBottom: '0.75rem',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em'
                            }}>
                              Program și prețuri
                            </label>
                            <div style={{
                              background: 'white',
                              borderRadius: '8px',
                              border: '1px solid #e2e8f0',
                              overflow: 'hidden'
                            }}>
                              <table style={{
                                width: '100%',
                                borderCollapse: 'collapse'
                              }}>
                                <thead>
                                  <tr style={{
                                    background: '#f8fafc',
                                    borderBottom: '1px solid #e2e8f0'
                                  }}>
                                    <th style={{
                                      padding: '0.75rem',
                                      textAlign: 'left',
                                      fontSize: '0.75rem',
                                      fontWeight: '600',
                                      color: '#64748b',
                                      textTransform: 'uppercase',
                                      letterSpacing: '0.05em'
                                    }}>
                                      Zi
                                    </th>
                                    <th style={{
                                      padding: '0.75rem',
                                      textAlign: 'left',
                                      fontSize: '0.75rem',
                                      fontWeight: '600',
                                      color: '#64748b',
                                      textTransform: 'uppercase',
                                      letterSpacing: '0.05em'
                                    }}>
                                      Interval
                                    </th>
                                    <th style={{
                                      padding: '0.75rem',
                                      textAlign: 'left',
                                      fontSize: '0.75rem',
                                      fontWeight: '600',
                                      color: '#64748b',
                                      textTransform: 'uppercase',
                                      letterSpacing: '0.05em'
                                    }}>
                                      Status
                                    </th>
                                    <th style={{
                                      padding: '0.75rem',
                                      textAlign: 'left',
                                      fontSize: '0.75rem',
                                      fontWeight: '600',
                                      color: '#64748b',
                                      textTransform: 'uppercase',
                                      letterSpacing: '0.05em'
                                    }}>
                                      Preț
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {DAYS_OF_WEEK.map(day => {
                                    const daySlots = getDaySlots(day.key, timeSlots)
                                    if (daySlots.length === 0) {
                                      return (
                                        <tr key={day.key} style={{
                                          borderBottom: '1px solid #f1f5f9'
                                        }}>
                                          <td style={{
                                            padding: '0.75rem',
                                            fontWeight: '500',
                                            color: '#0f172a'
                                          }}>
                                            {day.label}
                                          </td>
                                          <td colSpan={3} style={{
                                            padding: '0.75rem',
                                            color: '#94a3b8',
                                            fontSize: '0.875rem'
                                          }}>
                                            Nu este configurat
                                          </td>
                                        </tr>
                                      )
                                    }
                                    return daySlots.map((slot, slotIdx) => (
                                      <tr key={`${day.key}-${slotIdx}`} style={{
                                        borderBottom: '1px solid #f1f5f9'
                                      }}>
                                        {slotIdx === 0 && (
                                          <td rowSpan={daySlots.length} style={{
                                            padding: '0.75rem',
                                            fontWeight: '500',
                                            color: '#0f172a',
                                            verticalAlign: 'top'
                                          }}>
                                            {day.label}
                                          </td>
                                        )}
                                        <td style={{
                                          padding: '0.75rem',
                                          color: '#64748b',
                                          fontSize: '0.875rem',
                                          fontFamily: 'monospace'
                                        }}>
                                          {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                                        </td>
                                        <td style={{
                                          padding: '0.75rem'
                                        }}>
                                          <span style={{
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '4px',
                                            fontSize: '0.75rem',
                                            fontWeight: '600',
                                            background: slot.status === 'open' ? '#d1fae5' : slot.status === 'closed' ? '#fee2e2' : '#fef3c7',
                                            color: slot.status === 'open' ? '#065f46' : slot.status === 'closed' ? '#991b1b' : '#92400e'
                                          }}>
                                            {slot.status === 'open' ? 'Deschis' : slot.status === 'closed' ? 'Închis' : 'Nespecificat'}
                                          </span>
                                        </td>
                                        <td style={{
                                          padding: '0.75rem',
                                          color: '#0f172a',
                                          fontWeight: '500'
                                        }}>
                                          {slot.price ? `${slot.price} RON` : '-'}
                                        </td>
                                      </tr>
                                    ))
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div style={{
                  padding: '3rem',
                  textAlign: 'center',
                  background: '#f8fafc',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  color: '#94a3b8'
                }}>
                  Nu există terenuri configurate
                </div>
              )}
            </div>
          )}

          {/* Media Tab */}
          {activeTab === 'media' && (
            <div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2rem'
              }}>
                {/* Logo */}
                {facility.logo_url && (
                  <div style={{
                    padding: '1.5rem',
                    background: '#f8fafc',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <h3 style={{
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: '#64748b',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      margin: '0 0 1rem 0'
                    }}>
                      Logo
                    </h3>
                    <img
                      src={facility.logo_url}
                      alt="Logo"
                      style={{
                        maxWidth: '200px',
                        maxHeight: '200px',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0'
                      }}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  </div>
                )}

                {/* Social Media */}
                {(socialMedia.facebook || socialMedia.instagram || socialMedia.x || socialMedia.tiktok || socialMedia.youtube || socialMedia.linkedin) && (
                  <div style={{
                    padding: '1.5rem',
                    background: '#f8fafc',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <h3 style={{
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: '#64748b',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      margin: '0 0 1rem 0'
                    }}>
                      Rețele sociale
                    </h3>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem'
                    }}>
                      {socialMedia.facebook && (
                        <a
                          href={socialMedia.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: '#1877f2',
                            textDecoration: 'none',
                            fontSize: '0.875rem',
                            fontWeight: '500'
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
                            color: '#e4405f',
                            textDecoration: 'none',
                            fontSize: '0.875rem',
                            fontWeight: '500'
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
                            color: '#000000',
                            textDecoration: 'none',
                            fontSize: '0.875rem',
                            fontWeight: '500'
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
                            color: '#000000',
                            textDecoration: 'none',
                            fontSize: '0.875rem',
                            fontWeight: '500'
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
                            color: '#ff0000',
                            textDecoration: 'none',
                            fontSize: '0.875rem',
                            fontWeight: '500'
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
                            color: '#0077b5',
                            textDecoration: 'none',
                            fontSize: '0.875rem',
                            fontWeight: '500'
                          }}
                        >
                          LinkedIn
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Gallery */}
              {gallery.length > 0 && (
                <div>
                  <h3 style={{
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#64748b',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    margin: '0 0 1rem 0'
                  }}>
                    Galerie ({gallery.length} imagini)
                  </h3>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: '1rem'
                  }}>
                    {gallery.map((image, idx) => (
                      <div key={idx} style={{
                        position: 'relative',
                        paddingTop: '75%',
                        background: '#f8fafc',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        border: '1px solid #e2e8f0'
                      }}>
                        <img
                          src={image}
                          alt={`Galerie ${idx + 1}`}
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: '#0f172a',
                marginBottom: '1.5rem'
              }}>
                Setări avansate
              </h3>
              <div style={{
                padding: '1.5rem',
                background: '#fee2e2',
                borderRadius: '12px',
                border: '1px solid #fca5a5',
                color: '#991b1b'
              }}>
                <p style={{ margin: 0, fontSize: '0.875rem' }}>
                  <strong>Notă:</strong> Setările avansate vor fi disponibile în curând.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default FacilityDetails
