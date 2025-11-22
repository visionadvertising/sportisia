import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import AdminLayout from './AdminLayout'
import API_BASE_URL from '../../config'
import { ROMANIAN_CITIES } from '../../data/romanian-cities'

interface Facility {
  id: number
  facility_type: string
  name: string
  city: string
  location: string
  phone: string
  email: string
  description?: string
  website?: string
  logo_url?: string
  image_url?: string
  social_media?: any
  gallery?: string[]
  opening_hours?: string
  status: string
  created_at: string
  // Field specific
  sport?: string
  price_per_hour?: number
  pricing_details?: any
  has_parking?: boolean
  has_shower?: boolean
  has_changing_room?: boolean
  has_air_conditioning?: boolean
  has_lighting?: boolean
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
}

const KNOWN_SPORTS = ['tenis', 'fotbal', 'baschet', 'volei', 'handbal', 'badminton', 'squash', 'ping-pong', 'atletism', 'inot', 'fitness', 'box', 'karate', 'judo', 'dans']

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
        setFacility(data.data)
        setFormData(data.data)
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
        setAvailableCities([...new Set([...ROMANIAN_CITIES, ...cities])].sort())
      } else {
        setAvailableCities(ROMANIAN_CITIES)
      }
    } catch (err) {
      setAvailableCities(ROMANIAN_CITIES)
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
      const response = await fetch(`${API_BASE_URL}/facilities/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
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
      'field': 'Teren Sportiv',
      'coach': 'Antrenor',
      'repair_shop': 'Magazin Reparații',
      'equipment_shop': 'Magazin Articole'
    }
    return labels[type] || type
  }

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        Se încarcă...
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
          padding: '1rem',
          borderRadius: '8px'
        }}>
          Facilitatea nu a fost găsită
        </div>
      </div>
    )
  }

  return (
    <AdminLayout>
      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <button
            onClick={() => navigate(-1)}
            style={{
              padding: '0.5rem 1rem',
              background: '#e5e7eb',
              color: '#333',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              marginBottom: '1rem'
            }}
          >
            ← Înapoi
          </button>
          <h1 style={{ fontSize: '2rem', color: '#1e3c72', margin: 0 }}>
            {facility.name}
          </h1>
          <p style={{ color: '#666', marginTop: '0.5rem' }}>
            {getFacilityTypeLabel(facility.facility_type)}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#1e3c72',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
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
                  padding: '0.75rem 1.5rem',
                  background: '#e5e7eb',
                  color: '#333',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Anulează
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                  opacity: saving ? 0.6 : 1
                }}
              >
                {saving ? 'Salvează...' : 'Salvează'}
              </button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div style={{
          background: '#fee2e2',
          border: '1px solid #ef4444',
          color: '#991b1b',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1rem'
        }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{
          background: '#d1fae5',
          border: '1px solid #10b981',
          color: '#065f46',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1rem'
        }}>
          {success}
        </div>
      )}

      {/* Status Section */}
      <div style={{
        background: 'white',
        padding: '1.5rem',
        borderRadius: '12px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '1.5rem'
      }}>
        <h2 style={{ marginTop: 0, marginBottom: '1rem', color: '#333' }}>Status</h2>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            fontWeight: 'bold',
            background: facility.status === 'active' ? '#d1fae5' : facility.status === 'pending' ? '#fef3c7' : '#fee2e2',
            color: facility.status === 'active' ? '#065f46' : facility.status === 'pending' ? '#92400e' : '#991b1b'
          }}>
            {facility.status === 'active' ? 'Aprobat' : facility.status === 'pending' ? 'În așteptare' : 'Respins'}
          </span>
          <select
            value={facility.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            style={{
              padding: '0.5rem 1rem',
              border: '2px solid #e0e0e0',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            <option value="pending">În așteptare</option>
            <option value="active">Aprobat</option>
            <option value="inactive">Respins</option>
          </select>
        </div>
      </div>

      {/* Basic Information */}
      <div style={{
        background: 'white',
        padding: '1.5rem',
        borderRadius: '12px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '1.5rem'
      }}>
        <h2 style={{ marginTop: 0, marginBottom: '1rem', color: '#333' }}>Informații de bază</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#666', fontWeight: '500' }}>
              Nume
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e0e0e0',
                  borderRadius: '6px',
                  fontSize: '1rem'
                }}
              />
            ) : (
              <p style={{ margin: 0, color: '#333' }}>{facility.name}</p>
            )}
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#666', fontWeight: '500' }}>
              Oraș
            </label>
            {isEditing ? (
              <select
                value={formData.city || ''}
                onChange={(e) => handleInputChange('city', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e0e0e0',
                  borderRadius: '6px',
                  fontSize: '1rem'
                }}
              >
                {availableCities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            ) : (
              <p style={{ margin: 0, color: '#333' }}>{facility.city}</p>
            )}
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#666', fontWeight: '500' }}>
              Locație
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.location || ''}
                onChange={(e) => handleInputChange('location', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e0e0e0',
                  borderRadius: '6px',
                  fontSize: '1rem'
                }}
              />
            ) : (
              <p style={{ margin: 0, color: '#333' }}>{facility.location}</p>
            )}
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#666', fontWeight: '500' }}>
              Telefon
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e0e0e0',
                  borderRadius: '6px',
                  fontSize: '1rem'
                }}
              />
            ) : (
              <p style={{ margin: 0, color: '#333' }}>{facility.phone}</p>
            )}
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#666', fontWeight: '500' }}>
              Email
            </label>
            {isEditing ? (
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e0e0e0',
                  borderRadius: '6px',
                  fontSize: '1rem'
                }}
              />
            ) : (
              <p style={{ margin: 0, color: '#333' }}>{facility.email}</p>
            )}
          </div>

          {facility.website && (
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#666', fontWeight: '500' }}>
                Website
              </label>
              {isEditing ? (
                <input
                  type="url"
                  value={formData.website || ''}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e0e0e0',
                    borderRadius: '6px',
                    fontSize: '1rem'
                  }}
                />
              ) : (
                <p style={{ margin: 0, color: '#333' }}>
                  <a href={facility.website} target="_blank" rel="noopener noreferrer" style={{ color: '#1e3c72' }}>
                    {facility.website}
                  </a>
                </p>
              )}
            </div>
          )}

          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#666', fontWeight: '500' }}>
              Descriere
            </label>
            {isEditing ? (
              <textarea
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e0e0e0',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  fontFamily: 'inherit'
                }}
              />
            ) : (
              <p style={{ margin: 0, color: '#333', whiteSpace: 'pre-wrap' }}>
                {facility.description || 'Fără descriere'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Field Specific Details */}
      {facility.facility_type === 'field' && (
        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          marginBottom: '1.5rem'
        }}>
          <h2 style={{ marginTop: 0, marginBottom: '1rem', color: '#333' }}>Detalii Teren</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#666', fontWeight: '500' }}>
                Sport
              </label>
              {isEditing ? (
                <select
                  value={formData.sport || ''}
                  onChange={(e) => handleInputChange('sport', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e0e0e0',
                    borderRadius: '6px',
                    fontSize: '1rem'
                  }}
                >
                  <option value="">Selectează sport</option>
                  {availableSports.map(sport => (
                    <option key={sport} value={sport}>
                      {sport.charAt(0).toUpperCase() + sport.slice(1)}
                    </option>
                  ))}
                </select>
              ) : (
                <p style={{ margin: 0, color: '#333' }}>{facility.sport || 'N/A'}</p>
              )}
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#666', fontWeight: '500' }}>
                Preț pe oră (lei)
              </label>
              {isEditing ? (
                <input
                  type="number"
                  value={formData.price_per_hour || ''}
                  onChange={(e) => handleInputChange('price_per_hour', parseFloat(e.target.value) || 0)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e0e0e0',
                    borderRadius: '6px',
                    fontSize: '1rem'
                  }}
                />
              ) : (
                <p style={{ margin: 0, color: '#333' }}>{facility.price_per_hour ? `${facility.price_per_hour} lei` : 'N/A'}</p>
              )}
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#666', fontWeight: '500' }}>
                Facilități
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                {['has_parking', 'has_shower', 'has_changing_room', 'has_air_conditioning', 'has_lighting'].map(feature => (
                  <label key={feature} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    {isEditing ? (
                      <input
                        type="checkbox"
                        checked={formData[feature as keyof Facility] as boolean || false}
                        onChange={(e) => handleInputChange(feature, e.target.checked)}
                        style={{ cursor: 'pointer' }}
                      />
                    ) : (
                      <input
                        type="checkbox"
                        checked={facility[feature as keyof Facility] as boolean || false}
                        disabled
                        style={{ cursor: 'not-allowed' }}
                      />
                    )}
                    <span style={{ color: '#333' }}>
                      {feature.replace('has_', '').replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Coach Specific Details */}
      {facility.facility_type === 'coach' && (
        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          marginBottom: '1.5rem'
        }}>
          <h2 style={{ marginTop: 0, marginBottom: '1rem', color: '#333' }}>Detalii Antrenor</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#666', fontWeight: '500' }}>
                Specializare
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.specialization || ''}
                  onChange={(e) => handleInputChange('specialization', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e0e0e0',
                    borderRadius: '6px',
                    fontSize: '1rem'
                  }}
                />
              ) : (
                <p style={{ margin: 0, color: '#333' }}>{facility.specialization || 'N/A'}</p>
              )}
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#666', fontWeight: '500' }}>
                Ani experiență
              </label>
              {isEditing ? (
                <input
                  type="number"
                  value={formData.experience_years || ''}
                  onChange={(e) => handleInputChange('experience_years', parseInt(e.target.value) || 0)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e0e0e0',
                    borderRadius: '6px',
                    fontSize: '1rem'
                  }}
                />
              ) : (
                <p style={{ margin: 0, color: '#333' }}>{facility.experience_years || 'N/A'}</p>
              )}
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#666', fontWeight: '500' }}>
                Preț pe lecție (lei)
              </label>
              {isEditing ? (
                <input
                  type="number"
                  value={formData.price_per_lesson || ''}
                  onChange={(e) => handleInputChange('price_per_lesson', parseFloat(e.target.value) || 0)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e0e0e0',
                    borderRadius: '6px',
                    fontSize: '1rem'
                  }}
                />
              ) : (
                <p style={{ margin: 0, color: '#333' }}>{facility.price_per_lesson ? `${facility.price_per_lesson} lei` : 'N/A'}</p>
              )}
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#666', fontWeight: '500' }}>
                Certificări
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.certifications || ''}
                  onChange={(e) => handleInputChange('certifications', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e0e0e0',
                    borderRadius: '6px',
                    fontSize: '1rem'
                  }}
                />
              ) : (
                <p style={{ margin: 0, color: '#333' }}>{facility.certifications || 'N/A'}</p>
              )}
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#666', fontWeight: '500' }}>
                Limbi
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.languages || ''}
                  onChange={(e) => handleInputChange('languages', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e0e0e0',
                    borderRadius: '6px',
                    fontSize: '1rem'
                  }}
                />
              ) : (
                <p style={{ margin: 0, color: '#333' }}>{facility.languages || 'N/A'}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Opening Hours */}
      {facility.opening_hours && (
        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          marginBottom: '1.5rem'
        }}>
          <h2 style={{ marginTop: 0, marginBottom: '1rem', color: '#333' }}>Program</h2>
          {isEditing ? (
            <textarea
              value={formData.opening_hours || ''}
              onChange={(e) => handleInputChange('opening_hours', e.target.value)}
              rows={4}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #e0e0e0',
                borderRadius: '6px',
                fontSize: '1rem',
                fontFamily: 'inherit'
              }}
            />
          ) : (
            <p style={{ margin: 0, color: '#333', whiteSpace: 'pre-wrap' }}>{facility.opening_hours}</p>
          )}
        </div>
      )}

      {/* Created At */}
      <div style={{
        background: 'white',
        padding: '1.5rem',
        borderRadius: '12px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <p style={{ margin: 0, color: '#999', fontSize: '0.9rem' }}>
          Creat la: {new Date(facility.created_at).toLocaleString('ro-RO')}
        </p>
      </div>
      </div>
    </AdminLayout>
  )
}

export default FacilityDetails

