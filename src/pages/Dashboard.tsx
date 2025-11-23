import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import API_BASE_URL from '../config'
import { ROMANIAN_CITIES } from '../data/romanian-cities'
import MapSelector from '../components/MapSelector'

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
  sport?: string
  price_per_hour?: number
  has_parking?: boolean
  has_shower?: boolean
  has_changing_room?: boolean
  has_air_conditioning?: boolean
  has_lighting?: boolean
  sportsFields?: SportsField[]
}

const DAYS_OF_WEEK = [
  { value: 'monday', label: 'Luni' },
  { value: 'tuesday', label: 'Marți' },
  { value: 'wednesday', label: 'Miercuri' },
  { value: 'thursday', label: 'Joi' },
  { value: 'friday', label: 'Vineri' },
  { value: 'saturday', label: 'Sâmbătă' },
  { value: 'sunday', label: 'Duminică' }
]

function Dashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState<any>(null)
  const [facility, setFacility] = useState<Facility | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [activeTab, setActiveTab] = useState('general')
  const [showPasswordReset, setShowPasswordReset] = useState(false)
  const [passwordResetLoading, setPasswordResetLoading] = useState(false)
  const [newPassword, setNewPassword] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  // Form state
  const [formData, setFormData] = useState<any>({})
  const [sportsFields, setSportsFields] = useState<SportsField[]>([])

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (!storedUser) {
      navigate('/login')
      return
    }

    const userData = JSON.parse(storedUser)
    setUser(userData)
    fetchFacility(userData.username)
  }, [navigate])

  const fetchFacility = async (username: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/my-facility?username=${username}`)
      const data = await response.json()

      if (data.success) {
        const facilityData = data.data
        
        // Parse JSON fields
        if (facilityData.phones) {
          try {
            facilityData.phones = typeof facilityData.phones === 'string' ? JSON.parse(facilityData.phones) : facilityData.phones
          } catch { facilityData.phones = [facilityData.phone] }
        } else {
          facilityData.phones = [facilityData.phone]
        }
        
        if (facilityData.whatsapps) {
          try {
            facilityData.whatsapps = typeof facilityData.whatsapps === 'string' ? JSON.parse(facilityData.whatsapps) : facilityData.whatsapps
          } catch { facilityData.whatsapps = facilityData.whatsapp ? [facilityData.whatsapp] : [] }
        } else {
          facilityData.whatsapps = facilityData.whatsapp ? [facilityData.whatsapp] : []
        }
        
        if (facilityData.emails) {
          try {
            facilityData.emails = typeof facilityData.emails === 'string' ? JSON.parse(facilityData.emails) : facilityData.emails
          } catch { facilityData.emails = [facilityData.email] }
        } else {
          facilityData.emails = [facilityData.email]
        }
        
        if (facilityData.social_media) {
          try {
            facilityData.social_media = typeof facilityData.social_media === 'string' ? JSON.parse(facilityData.social_media) : facilityData.social_media
          } catch { facilityData.social_media = { facebook: '', instagram: '', x: '', tiktok: '', youtube: '', linkedin: '' } }
        } else {
          facilityData.social_media = { facebook: '', instagram: '', x: '', tiktok: '', youtube: '', linkedin: '' }
        }
        
        if (facilityData.gallery) {
          try {
            facilityData.gallery = typeof facilityData.gallery === 'string' ? JSON.parse(facilityData.gallery) : facilityData.gallery
          } catch { facilityData.gallery = [] }
        } else {
          facilityData.gallery = []
        }

        if (facilityData.map_coordinates) {
          try {
            facilityData.map_coordinates = typeof facilityData.map_coordinates === 'string' ? JSON.parse(facilityData.map_coordinates) : facilityData.map_coordinates
          } catch { facilityData.map_coordinates = null }
        }

        setFacility(facilityData)
        setFormData(facilityData)

        // Fetch sports fields if it's a sports base
        if (facilityData.facility_type === 'field') {
          fetchSportsFields(facilityData.id)
        }
      } else {
        setError(data.error || 'Eroare la încărcarea facilității')
      }
    } catch (err) {
      setError('Eroare la conectarea la server')
      console.error('Fetch facility error:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchSportsFields = async (facilityId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/facilities/${facilityId}`)
      const data = await response.json()
      
      if (data.success && data.data.sportsFields) {
        // Parse timeSlots from JSON if needed
        const fields = data.data.sportsFields.map((field: any) => ({
          ...field,
          timeSlots: typeof field.time_slots === 'string' ? JSON.parse(field.time_slots) : (field.time_slots || []),
          features: typeof field.features === 'string' ? JSON.parse(field.features) : (field.features || {})
        }))
        setSportsFields(fields)
      }
    } catch (err) {
      console.error('Error fetching sports fields:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const updateData = {
        ...formData,
        phones: JSON.stringify(formData.phones || []),
        whatsapps: JSON.stringify(formData.whatsapps || []),
        emails: JSON.stringify(formData.emails || []),
        socialMedia: formData.social_media || formData.socialMedia,
        gallery: formData.gallery || [],
        mapCoordinates: formData.map_coordinates || formData.mapCoordinates,
        sportsFields: activeTab === 'fields' ? sportsFields : undefined
      }

      const response = await fetch(`${API_BASE_URL}/facilities/${facility?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      })

      const data = await response.json()

      if (data.success) {
        setSuccess('Modificările au fost salvate cu succes!')
        setTimeout(() => setSuccess(''), 5000)
        if (user) {
          fetchFacility(user.username)
        }
      } else {
        setError(data.error || 'Eroare la actualizare')
      }
    } catch (err) {
      setError('Eroare la conectarea la server')
      console.error('Update error:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleResetPassword = async () => {
    if (!user) return
    
    setPasswordResetLoading(true)
    setError('')
    setSuccess('')
    
    try {
      const response = await fetch(`${API_BASE_URL}/users/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: user.username })
      })

      const data = await response.json()

      if (data.success) {
        setNewPassword(data.newPassword)
        setSuccess('Parola a fost resetată cu succes! Noua parolă este: ' + data.newPassword)
        setShowPasswordReset(false)
      } else {
        setError(data.error || 'Eroare la resetarea parolei')
      }
    } catch (err) {
      setError('Eroare la conectarea la server')
      console.error('Password reset error:', err)
    } finally {
      setPasswordResetLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    navigate('/')
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f9fafb'
      }}>
        <div style={{ textAlign: 'center', color: '#64748b' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #e5e7eb',
            borderTopColor: '#10b981',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <p style={{ margin: 0, fontSize: '0.9375rem' }}>Se încarcă...</p>
        </div>
      </div>
    )
  }

  if (!facility) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f9fafb',
        padding: '2rem'
      }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#64748b', marginBottom: '1rem' }}>Facilitatea nu a fost găsită.</p>
          <Link
            to="/"
            style={{
              padding: '0.75rem 2rem',
              background: '#10b981',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '8px',
              display: 'inline-block',
              fontWeight: '500'
            }}
          >
            Mergi la Home
          </Link>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'general', label: 'Informații generale' },
    { id: 'contact', label: 'Contact' },
    { id: 'branding', label: 'Branding' },
    { id: 'gallery', label: 'Galerie' },
    ...(facility.facility_type === 'field' ? [{ id: 'fields', label: 'Terenuri' }] : []),
    { id: 'password', label: 'Securitate' }
  ]

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f9fafb'
    }}>
      {/* Header */}
      <div style={{
        background: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: isMobile ? '1rem' : '1.5rem 2rem',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <h1 style={{
              fontSize: isMobile ? '1.5rem' : '1.875rem',
              color: '#0f172a',
              margin: 0,
              marginBottom: '0.25rem',
              fontWeight: '600'
            }}>Dashboard</h1>
            <p style={{
              color: '#64748b',
              margin: 0,
              fontSize: '0.875rem'
            }}>{facility.name}</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {facility.status === 'active' && (
              <Link
                to={`/baza-sportiva/${facility.id}`}
                target="_blank"
                style={{
                  padding: '0.625rem 1.25rem',
                  background: '#10b981',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  fontWeight: '500',
                  fontSize: '0.875rem',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#059669'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#10b981'
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
                Vezi pagina publică
              </Link>
            )}
            <Link
              to="/"
              style={{
                padding: '0.625rem 1.25rem',
                background: '#f1f5f9',
                color: '#475569',
                textDecoration: 'none',
                borderRadius: '8px',
                fontWeight: '500',
                fontSize: '0.875rem',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#e2e8f0'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#f1f5f9'
              }}
            >
              Home
            </Link>
            <button
              onClick={handleLogout}
              style={{
                padding: '0.625rem 1.25rem',
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '500',
                fontSize: '0.875rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#dc2626'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#ef4444'
              }}
            >
              Deconectare
            </button>
          </div>
        </div>
      </div>

      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: isMobile ? '1.5rem 1rem' : '2rem'
      }}>
        {/* Status Badge */}
        <div style={{
          background: 'white',
          padding: '1rem 1.5rem',
          borderRadius: '12px',
          marginBottom: '1.5rem',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap'
        }}>
          <div style={{
            padding: '0.5rem 1rem',
            background: facility.status === 'active' ? '#d1fae5' : '#fef3c7',
            color: facility.status === 'active' ? '#065f46' : '#92400e',
            borderRadius: '6px',
            fontWeight: '600',
            textTransform: 'uppercase',
            fontSize: '0.75rem',
            letterSpacing: '0.05em'
          }}>
            {facility.status === 'active' ? 'Activ' : 'În așteptare'}
          </div>
          <span style={{ color: '#64748b', fontSize: '0.875rem' }}>
            {facility.status === 'pending' && 'Facilitatea ta este în așteptarea aprobării de către administrator.'}
            {facility.status === 'active' && 'Facilitatea ta este activă și vizibilă pe site.'}
          </span>
        </div>

        {/* Messages */}
        {error && (
          <div style={{
            background: '#fee2e2',
            border: '1px solid #fca5a5',
            color: '#991b1b',
            padding: '1rem 1.5rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            fontSize: '0.875rem'
          }}>
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
            marginBottom: '1.5rem',
            fontSize: '0.875rem'
          }}>
            {success}
          </div>
        )}

        {/* Tabs */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '0.5rem',
          marginBottom: '1.5rem',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          display: 'flex',
          gap: '0.5rem',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch'
        }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '0.75rem 1.5rem',
                background: activeTab === tab.id ? '#10b981' : 'transparent',
                color: activeTab === tab.id ? 'white' : '#64748b',
                border: 'none',
                borderRadius: '8px',
                fontWeight: activeTab === tab.id ? '600' : '500',
                fontSize: '0.875rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: isMobile ? '1.5rem' : '2rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
          }}>
            {/* General Tab */}
            {activeTab === 'general' && (
              <div>
                <h2 style={{
                  fontSize: '1.5rem',
                  color: '#0f172a',
                  marginBottom: '1.5rem',
                  fontWeight: '600'
                }}>Informații generale</h2>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
                  gap: '1.5rem',
                  marginBottom: '1.5rem'
                }}>
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      color: '#374151',
                      fontWeight: '500',
                      fontSize: '0.875rem'
                    }}>Nume baza sportivă *</label>
                    <input
                      type="text"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1.5px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '0.9375rem',
                        outline: 'none',
                        transition: 'all 0.2s'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#10b981'
                        e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)'
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e5e7eb'
                        e.target.style.boxShadow = 'none'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      color: '#374151',
                      fontWeight: '500',
                      fontSize: '0.875rem'
                    }}>Oraș *</label>
                    <input
                      type="text"
                      value={formData.city || ''}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1.5px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '0.9375rem',
                        outline: 'none',
                        transition: 'all 0.2s'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#10b981'
                        e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)'
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e5e7eb'
                        e.target.style.boxShadow = 'none'
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    color: '#374151',
                    fontWeight: '500',
                    fontSize: '0.875rem'
                  }}>Descriere</label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={5}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1.5px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '0.9375rem',
                      outline: 'none',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                      transition: 'all 0.2s'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#10b981'
                      e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e5e7eb'
                      e.target.style.boxShadow = 'none'
                    }}
                  />
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
                  gap: '1.5rem'
                }}>
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      color: '#374151',
                      fontWeight: '500',
                      fontSize: '0.875rem'
                    }}>Website</label>
                    <input
                      type="url"
                      value={formData.website || ''}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      placeholder="https://example.com"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1.5px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '0.9375rem',
                        outline: 'none',
                        transition: 'all 0.2s'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#10b981'
                        e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)'
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e5e7eb'
                        e.target.style.boxShadow = 'none'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      color: '#374151',
                      fontWeight: '500',
                      fontSize: '0.875rem'
                    }}>Program</label>
                    <input
                      type="text"
                      value={formData.opening_hours || ''}
                      onChange={(e) => setFormData({ ...formData, opening_hours: e.target.value })}
                      placeholder="ex: Luni-Vineri 9:00-18:00"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1.5px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '0.9375rem',
                        outline: 'none',
                        transition: 'all 0.2s'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#10b981'
                        e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)'
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e5e7eb'
                        e.target.style.boxShadow = 'none'
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Contact Tab */}
            {activeTab === 'contact' && (
              <div>
                <h2 style={{
                  fontSize: '1.5rem',
                  color: '#0f172a',
                  marginBottom: '1.5rem',
                  fontWeight: '600'
                }}>Date de contact</h2>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    color: '#374151',
                    fontWeight: '500',
                    fontSize: '0.875rem'
                  }}>Persoană de contact</label>
                  <input
                    type="text"
                    value={formData.contact_person || ''}
                    onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1.5px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '0.9375rem',
                      outline: 'none',
                      transition: 'all 0.2s'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#10b981'
                      e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e5e7eb'
                      e.target.style.boxShadow = 'none'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.75rem',
                    color: '#374151',
                    fontWeight: '500',
                    fontSize: '0.875rem'
                  }}>Telefoane *</label>
                  {(formData.phones || []).map((phone: string, index: number) => (
                    <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => {
                          const newPhones = [...(formData.phones || [])]
                          newPhones[index] = e.target.value
                          setFormData({ ...formData, phones: newPhones })
                        }}
                        required={index === 0}
                        style={{
                          flex: 1,
                          padding: '0.75rem',
                          border: '1.5px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '0.9375rem',
                          outline: 'none',
                          transition: 'all 0.2s'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#10b981'
                          e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)'
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#e5e7eb'
                          e.target.style.boxShadow = 'none'
                        }}
                      />
                      {(formData.phones || []).length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const newPhones = [...(formData.phones || [])]
                            newPhones.splice(index, 1)
                            setFormData({ ...formData, phones: newPhones })
                          }}
                          style={{
                            padding: '0.75rem 1rem',
                            background: '#fee2e2',
                            color: '#991b1b',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: '500',
                            fontSize: '0.875rem'
                          }}
                        >
                          Șterge
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, phones: [...(formData.phones || []), ''] })
                    }}
                    style={{
                      padding: '0.5rem 1rem',
                      background: '#f1f5f9',
                      color: '#475569',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: '500'
                    }}
                  >
                    + Adaugă telefon
                  </button>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.75rem',
                    color: '#374151',
                    fontWeight: '500',
                    fontSize: '0.875rem'
                  }}>WhatsApp</label>
                  {(formData.whatsapps || []).map((whatsapp: string, index: number) => (
                    <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <input
                        type="tel"
                        value={whatsapp}
                        onChange={(e) => {
                          const newWhatsapps = [...(formData.whatsapps || [])]
                          newWhatsapps[index] = e.target.value
                          setFormData({ ...formData, whatsapps: newWhatsapps })
                        }}
                        style={{
                          flex: 1,
                          padding: '0.75rem',
                          border: '1.5px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '0.9375rem',
                          outline: 'none',
                          transition: 'all 0.2s'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#10b981'
                          e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)'
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#e5e7eb'
                          e.target.style.boxShadow = 'none'
                        }}
                      />
                      {(formData.whatsapps || []).length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const newWhatsapps = [...(formData.whatsapps || [])]
                            newWhatsapps.splice(index, 1)
                            setFormData({ ...formData, whatsapps: newWhatsapps })
                          }}
                          style={{
                            padding: '0.75rem 1rem',
                            background: '#fee2e2',
                            color: '#991b1b',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: '500',
                            fontSize: '0.875rem'
                          }}
                        >
                          Șterge
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, whatsapps: [...(formData.whatsapps || []), ''] })
                    }}
                    style={{
                      padding: '0.5rem 1rem',
                      background: '#f1f5f9',
                      color: '#475569',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: '500'
                    }}
                  >
                    + Adaugă WhatsApp
                  </button>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.75rem',
                    color: '#374151',
                    fontWeight: '500',
                    fontSize: '0.875rem'
                  }}>Email-uri *</label>
                  {(formData.emails || []).map((email: string, index: number) => (
                    <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          const newEmails = [...(formData.emails || [])]
                          newEmails[index] = e.target.value
                          setFormData({ ...formData, emails: newEmails })
                        }}
                        required={index === 0}
                        style={{
                          flex: 1,
                          padding: '0.75rem',
                          border: '1.5px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '0.9375rem',
                          outline: 'none',
                          transition: 'all 0.2s'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#10b981'
                          e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)'
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#e5e7eb'
                          e.target.style.boxShadow = 'none'
                        }}
                      />
                      {(formData.emails || []).length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const newEmails = [...(formData.emails || [])]
                            newEmails.splice(index, 1)
                            setFormData({ ...formData, emails: newEmails })
                          }}
                          style={{
                            padding: '0.75rem 1rem',
                            background: '#fee2e2',
                            color: '#991b1b',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: '500',
                            fontSize: '0.875rem'
                          }}
                        >
                          Șterge
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, emails: [...(formData.emails || []), ''] })
                    }}
                    style={{
                      padding: '0.5rem 1rem',
                      background: '#f1f5f9',
                      color: '#475569',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: '500'
                    }}
                  >
                    + Adaugă email
                  </button>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    color: '#374151',
                    fontWeight: '500',
                    fontSize: '0.875rem'
                  }}>Locație</label>
                  <MapSelector
                    location={formData.location || ''}
                    coordinates={formData.map_coordinates || null}
                    onLocationChange={(location) => setFormData({ ...formData, location })}
                    onCoordinatesChange={(coords) => setFormData({ ...formData, map_coordinates: coords })}
                  />
                </div>
              </div>
            )}

            {/* Branding Tab */}
            {activeTab === 'branding' && (
              <div>
                <h2 style={{
                  fontSize: '1.5rem',
                  color: '#0f172a',
                  marginBottom: '1.5rem',
                  fontWeight: '600'
                }}>Branding și social media</h2>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    color: '#374151',
                    fontWeight: '500',
                    fontSize: '0.875rem'
                  }}>Logo URL</label>
                  <input
                    type="url"
                    value={formData.logo_url || ''}
                    onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                    placeholder="https://example.com/logo.png"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1.5px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '0.9375rem',
                      outline: 'none',
                      transition: 'all 0.2s'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#10b981'
                      e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e5e7eb'
                      e.target.style.boxShadow = 'none'
                    }}
                  />
                  {formData.logo_url && (
                    <img
                      src={formData.logo_url}
                      alt="Logo preview"
                      style={{
                        marginTop: '0.75rem',
                        maxWidth: '200px',
                        maxHeight: '200px',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb'
                      }}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  )}
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
                  gap: '1.5rem',
                  marginBottom: '1.5rem'
                }}>
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      color: '#374151',
                      fontWeight: '500',
                      fontSize: '0.875rem'
                    }}>Facebook</label>
                    <input
                      type="url"
                      value={formData.social_media?.facebook || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        social_media: { ...formData.social_media, facebook: e.target.value }
                      })}
                      placeholder="https://facebook.com/..."
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1.5px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '0.9375rem',
                        outline: 'none',
                        transition: 'all 0.2s'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#10b981'
                        e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)'
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e5e7eb'
                        e.target.style.boxShadow = 'none'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      color: '#374151',
                      fontWeight: '500',
                      fontSize: '0.875rem'
                    }}>Instagram</label>
                    <input
                      type="url"
                      value={formData.social_media?.instagram || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        social_media: { ...formData.social_media, instagram: e.target.value }
                      })}
                      placeholder="https://instagram.com/..."
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1.5px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '0.9375rem',
                        outline: 'none',
                        transition: 'all 0.2s'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#10b981'
                        e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)'
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e5e7eb'
                        e.target.style.boxShadow = 'none'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      color: '#374151',
                      fontWeight: '500',
                      fontSize: '0.875rem'
                    }}>X (Twitter)</label>
                    <input
                      type="url"
                      value={formData.social_media?.x || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        social_media: { ...formData.social_media, x: e.target.value }
                      })}
                      placeholder="https://x.com/..."
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1.5px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '0.9375rem',
                        outline: 'none',
                        transition: 'all 0.2s'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#10b981'
                        e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)'
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e5e7eb'
                        e.target.style.boxShadow = 'none'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      color: '#374151',
                      fontWeight: '500',
                      fontSize: '0.875rem'
                    }}>TikTok</label>
                    <input
                      type="url"
                      value={formData.social_media?.tiktok || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        social_media: { ...formData.social_media, tiktok: e.target.value }
                      })}
                      placeholder="https://tiktok.com/..."
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1.5px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '0.9375rem',
                        outline: 'none',
                        transition: 'all 0.2s'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#10b981'
                        e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)'
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e5e7eb'
                        e.target.style.boxShadow = 'none'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      color: '#374151',
                      fontWeight: '500',
                      fontSize: '0.875rem'
                    }}>YouTube</label>
                    <input
                      type="url"
                      value={formData.social_media?.youtube || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        social_media: { ...formData.social_media, youtube: e.target.value }
                      })}
                      placeholder="https://youtube.com/..."
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1.5px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '0.9375rem',
                        outline: 'none',
                        transition: 'all 0.2s'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#10b981'
                        e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)'
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e5e7eb'
                        e.target.style.boxShadow = 'none'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      color: '#374151',
                      fontWeight: '500',
                      fontSize: '0.875rem'
                    }}>LinkedIn</label>
                    <input
                      type="url"
                      value={formData.social_media?.linkedin || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        social_media: { ...formData.social_media, linkedin: e.target.value }
                      })}
                      placeholder="https://linkedin.com/..."
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1.5px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '0.9375rem',
                        outline: 'none',
                        transition: 'all 0.2s'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#10b981'
                        e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)'
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e5e7eb'
                        e.target.style.boxShadow = 'none'
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Gallery Tab */}
            {activeTab === 'gallery' && (
              <div>
                <h2 style={{
                  fontSize: '1.5rem',
                  color: '#0f172a',
                  marginBottom: '1.5rem',
                  fontWeight: '600'
                }}>Galerie imagini</h2>
                <p style={{
                  color: '#64748b',
                  marginBottom: '1.5rem',
                  fontSize: '0.875rem'
                }}>
                  Adaugă imagini pentru a prezenta baza ta sportivă. Poți adăuga până la 10 imagini.
                </p>

                <div style={{ marginBottom: '1.5rem' }}>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files || [])
                      const newGallery = [...(formData.gallery || [])]
                      
                      files.forEach(file => {
                        const reader = new FileReader()
                        reader.onloadend = () => {
                          newGallery.push(reader.result as string)
                          if (newGallery.length <= 10) {
                            setFormData({ ...formData, gallery: newGallery })
                          }
                        }
                        reader.readAsDataURL(file)
                      })
                    }}
                    style={{ display: 'none' }}
                    id="gallery-upload"
                  />
                  <label
                    htmlFor="gallery-upload"
                    style={{
                      display: 'inline-block',
                      padding: '0.75rem 1.5rem',
                      background: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#059669'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#10b981'
                    }}
                  >
                    + Adaugă imagini
                  </label>
                </div>

                {(formData.gallery || []).length > 0 && (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
                    gap: '1rem'
                  }}>
                    {(formData.gallery || []).map((image: string, index: number) => (
                      <div key={index} style={{ position: 'relative' }}>
                        <img
                          src={image}
                          alt={`Galerie ${index + 1}`}
                          style={{
                            width: '100%',
                            height: '200px',
                            objectFit: 'cover',
                            borderRadius: '8px',
                            border: '1px solid #e5e7eb'
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newGallery = [...(formData.gallery || [])]
                            newGallery.splice(index, 1)
                            setFormData({ ...formData, gallery: newGallery })
                          }}
                          style={{
                            position: 'absolute',
                            top: '0.5rem',
                            right: '0.5rem',
                            padding: '0.5rem',
                            background: 'rgba(239, 68, 68, 0.9)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {(formData.gallery || []).length === 0 && (
                  <div style={{
                    background: '#f9fafb',
                    padding: '3rem',
                    borderRadius: '8px',
                    textAlign: 'center',
                    color: '#64748b'
                  }}>
                    <p style={{ margin: 0 }}>Nu ai adăugat imagini încă.</p>
                  </div>
                )}
              </div>
            )}

            {/* Fields Tab - Only for sports bases */}
            {activeTab === 'fields' && facility.facility_type === 'field' && (
              <div>
                <h2 style={{
                  fontSize: '1.5rem',
                  color: '#0f172a',
                  marginBottom: '1.5rem',
                  fontWeight: '600'
                }}>Terenuri</h2>
                <p style={{
                  color: '#64748b',
                  marginBottom: '1.5rem',
                  fontSize: '0.875rem'
                }}>
                  Gestionează terenurile bazei tale sportive. Fiecare teren poate avea propriile prețuri și program.
                </p>
                {/* Sports fields management will be added here */}
                <div style={{
                  background: '#f9fafb',
                  padding: '2rem',
                  borderRadius: '8px',
                  textAlign: 'center',
                  color: '#64748b'
                }}>
                  <p>Gestionarea terenurilor va fi disponibilă în curând.</p>
                </div>
              </div>
            )}

            {/* Password Tab */}
            {activeTab === 'password' && (
              <div>
                <h2 style={{
                  fontSize: '1.5rem',
                  color: '#0f172a',
                  marginBottom: '1.5rem',
                  fontWeight: '600'
                }}>Securitate</h2>

                <div style={{
                  background: '#f9fafb',
                  padding: '1.5rem',
                  borderRadius: '8px',
                  marginBottom: '1.5rem'
                }}>
                  <h3 style={{
                    fontSize: '1.125rem',
                    color: '#0f172a',
                    marginBottom: '0.75rem',
                    fontWeight: '600'
                  }}>Resetare parolă</h3>
                  <p style={{
                    color: '#64748b',
                    marginBottom: '1rem',
                    fontSize: '0.875rem',
                    lineHeight: '1.6'
                  }}>
                    Dacă dorești să resetezi parola contului tău, apasă butonul de mai jos. Vei primi o parolă nouă generată automat.
                  </p>
                  <button
                    type="button"
                    onClick={handleResetPassword}
                    disabled={passwordResetLoading}
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: passwordResetLoading ? '#9ca3af' : '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      cursor: passwordResetLoading ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {passwordResetLoading ? 'Se resetează...' : 'Resetează parola'}
                  </button>
                </div>

                {newPassword && (
                  <div style={{
                    background: '#d1fae5',
                    border: '1px solid #86efac',
                    color: '#065f46',
                    padding: '1rem 1.5rem',
                    borderRadius: '8px',
                    marginBottom: '1.5rem'
                  }}>
                    <p style={{ margin: 0, marginBottom: '0.5rem', fontWeight: '600' }}>Parolă nouă generată:</p>
                    <div style={{
                      background: 'white',
                      padding: '0.75rem',
                      borderRadius: '6px',
                      fontFamily: 'monospace',
                      fontSize: '1rem',
                      color: '#0f172a',
                      border: '1px solid #86efac'
                    }}>
                      {newPassword}
                    </div>
                    <p style={{ margin: '0.75rem 0 0 0', fontSize: '0.875rem' }}>
                      Salvează această parolă într-un loc sigur. Vei avea nevoie de ea pentru a te conecta.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Submit Button */}
            {activeTab !== 'password' && (
              <div style={{
                marginTop: '2rem',
                paddingTop: '2rem',
                borderTop: '1px solid #e5e7eb',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '1rem'
              }}>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    padding: '0.875rem 2rem',
                    background: saving ? '#9ca3af' : '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.9375rem',
                    fontWeight: '600',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: saving ? 'none' : '0 2px 4px rgba(16, 185, 129, 0.2)'
                  }}
                >
                  {saving ? 'Se salvează...' : 'Salvează modificările'}
                </button>
              </div>
            )}
          </div>
        </form>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default Dashboard
