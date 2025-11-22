import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import API_BASE_URL from '../config'

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
  status: string
  // Field specific
  sport?: string
  price_per_hour?: number
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
  // Common
  website?: string
  opening_hours?: string
}

function Dashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState<any>(null)
  const [facility, setFacility] = useState<Facility | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Form state - initialize with facility data
  const [formData, setFormData] = useState<any>({})

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('user')
    if (!storedUser) {
      navigate('/login')
      return
    }

    const userData = JSON.parse(storedUser)
    setUser(userData)

    // Fetch facility data
    fetchFacility(userData.username)
  }, [navigate])

  const fetchFacility = async (username: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/my-facility?username=${username}`)
      const data = await response.json()

      if (data.success) {
        setFacility(data.data)
        setFormData(data.data)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch(`${API_BASE_URL}/facilities/${facility?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (data.success) {
        setSuccess('Facilitatea a fost actualizată cu succes!')
        // Refresh facility data
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
        background: 'white'
      }}>
        <div style={{ textAlign: 'center', color: '#666' }}>
          <p>Se încarcă...</p>
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
        background: 'white',
        padding: '2rem'
      }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#666', marginBottom: '1rem' }}>Facilitatea nu a fost găsită.</p>
          <Link
            to="/"
            style={{
              padding: '0.75rem 2rem',
              background: '#10b981',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '8px',
              display: 'inline-block'
            }}
          >
            Mergi la Home
          </Link>
        </div>
      </div>
    )
  }

  const facilityTypeLabels: Record<string, string> = {
    field: 'Teren Sportiv',
    coach: 'Antrenor',
    repair_shop: 'Magazin Reparații',
    equipment_shop: 'Magazin Articole Sportive'
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f9fafb',
      padding: '2rem'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          background: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div>
            <h1 style={{
              fontSize: '2rem',
              color: '#1e3c72',
              margin: 0,
              marginBottom: '0.5rem'
            }}>Dashboard</h1>
            <p style={{
              color: '#666',
              margin: 0
            }}>{facilityTypeLabels[facility.facility_type]} - {facility.name}</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link
              to="/"
              style={{
                padding: '0.75rem 1.5rem',
                background: '#e5e7eb',
                color: '#333',
                textDecoration: 'none',
                borderRadius: '8px',
                fontWeight: '500'
              }}
            >
              Home
            </Link>
            <button
              onClick={handleLogout}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Logout
            </button>
          </div>
        </div>

        {/* Status Badge */}
        <div style={{
          background: 'white',
          padding: '1rem 1.5rem',
          borderRadius: '12px',
          marginBottom: '2rem',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{
              padding: '0.5rem 1rem',
              background: facility.status === 'active' ? '#d1fae5' : '#fef3c7',
              color: facility.status === 'active' ? '#065f46' : '#92400e',
              borderRadius: '6px',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              fontSize: '0.85rem'
            }}>
              {facility.status === 'active' ? '✓ Activ' : '⏳ În așteptare'}
            </span>
            <span style={{ color: '#666' }}>
              {facility.status === 'pending' && 'Facilitatea ta este în așteptarea aprobării.'}
              {facility.status === 'active' && 'Facilitatea ta este activă și vizibilă pe site.'}
            </span>
          </div>
        </div>

        {error && (
          <div style={{
            background: '#fee2e2',
            border: '1px solid #ef4444',
            color: '#991b1b',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '2rem'
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
            marginBottom: '2rem'
          }}>
            {success}
          </div>
        )}

        {/* Edit Form */}
        <form onSubmit={handleSubmit}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '2rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            marginBottom: '2rem'
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              color: '#1e3c72',
              marginBottom: '1.5rem'
            }}>Editează detaliile facilității</h2>

            {/* Common Fields */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '1rem',
              marginBottom: '1rem'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  color: '#333',
                  fontWeight: '500'
                }}>Nume facilitate *</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    outline: 'none'
                  }}
                />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  color: '#333',
                  fontWeight: '500'
                }}>Oraș *</label>
                <input
                  type="text"
                  value={formData.city || ''}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: '#333',
                fontWeight: '500'
              }}>Adresă completă *</label>
              <input
                type="text"
                value={formData.location || ''}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '1rem',
              marginBottom: '1rem'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  color: '#333',
                  fontWeight: '500'
                }}>Telefon *</label>
                <input
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    outline: 'none'
                  }}
                />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  color: '#333',
                  fontWeight: '500'
                }}>Email *</label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: '#333',
                fontWeight: '500'
              }}>Descriere</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  outline: 'none',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            {/* Field Specific Fields */}
            {facility.facility_type === 'field' && (
              <div style={{
                background: '#f9fafb',
                padding: '1.5rem',
                borderRadius: '8px',
                marginBottom: '1rem'
              }}>
                <h3 style={{ color: '#1e3c72', marginBottom: '1rem' }}>Detalii Teren</h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '1rem',
                  marginBottom: '1rem'
                }}>
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      color: '#333',
                      fontWeight: '500'
                    }}>Sport</label>
                    <select
                      value={formData.sport || ''}
                      onChange={(e) => setFormData({ ...formData, sport: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '2px solid #e0e0e0',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        outline: 'none'
                      }}
                    >
                      <option value="">Selectează sport</option>
                      <option value="tenis">Tenis</option>
                      <option value="fotbal">Fotbal</option>
                      <option value="baschet">Baschet</option>
                      <option value="volei">Volei</option>
                    </select>
                  </div>
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      color: '#333',
                      fontWeight: '500'
                    }}>Preț pe oră (RON)</label>
                    <input
                      type="number"
                      value={formData.price_per_hour || ''}
                      onChange={(e) => setFormData({ ...formData, price_per_hour: e.target.value })}
                      min="0"
                      step="0.01"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '2px solid #e0e0e0',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '1rem'
                }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.has_parking || false}
                      onChange={(e) => setFormData({ ...formData, has_parking: e.target.checked })}
                    />
                    <span>Parcare</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.has_shower || false}
                      onChange={(e) => setFormData({ ...formData, has_shower: e.target.checked })}
                    />
                    <span>Dusuri</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.has_changing_room || false}
                      onChange={(e) => setFormData({ ...formData, has_changing_room: e.target.checked })}
                    />
                    <span>Vestiar</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.has_air_conditioning || false}
                      onChange={(e) => setFormData({ ...formData, has_air_conditioning: e.target.checked })}
                    />
                    <span>Aer condiționat</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.has_lighting || false}
                      onChange={(e) => setFormData({ ...formData, has_lighting: e.target.checked })}
                    />
                    <span>Iluminat</span>
                  </label>
                </div>
              </div>
            )}

            {/* Coach Specific Fields */}
            {facility.facility_type === 'coach' && (
              <div style={{
                background: '#f9fafb',
                padding: '1.5rem',
                borderRadius: '8px',
                marginBottom: '1rem'
              }}>
                <h3 style={{ color: '#1e3c72', marginBottom: '1rem' }}>Detalii Antrenor</h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '1rem'
                }}>
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      color: '#333',
                      fontWeight: '500'
                    }}>Specializare</label>
                    <input
                      type="text"
                      value={formData.specialization || ''}
                      onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '2px solid #e0e0e0',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        outline: 'none'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      color: '#333',
                      fontWeight: '500'
                    }}>Preț pe lecție (RON)</label>
                    <input
                      type="number"
                      value={formData.price_per_lesson || ''}
                      onChange={(e) => setFormData({ ...formData, price_per_lesson: e.target.value })}
                      min="0"
                      step="0.01"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '2px solid #e0e0e0',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Repair Shop Specific Fields */}
            {facility.facility_type === 'repair_shop' && (
              <div style={{
                background: '#f9fafb',
                padding: '1.5rem',
                borderRadius: '8px',
                marginBottom: '1rem'
              }}>
                <h3 style={{ color: '#1e3c72', marginBottom: '1rem' }}>Detalii Magazin Reparații</h3>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    color: '#333',
                    fontWeight: '500'
                  }}>Servicii oferite</label>
                  <textarea
                    value={formData.services_offered || ''}
                    onChange={(e) => setFormData({ ...formData, services_offered: e.target.value })}
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #e0e0e0',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      outline: 'none',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>
              </div>
            )}

            {/* Equipment Shop Specific Fields */}
            {facility.facility_type === 'equipment_shop' && (
              <div style={{
                background: '#f9fafb',
                padding: '1.5rem',
                borderRadius: '8px',
                marginBottom: '1rem'
              }}>
                <h3 style={{ color: '#1e3c72', marginBottom: '1rem' }}>Detalii Magazin Articole Sportive</h3>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    color: '#333',
                    fontWeight: '500'
                  }}>Categorii produse</label>
                  <textarea
                    value={formData.products_categories || ''}
                    onChange={(e) => setFormData({ ...formData, products_categories: e.target.value })}
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #e0e0e0',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      outline: 'none',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>
              </div>
            )}

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '1rem',
              marginBottom: '1rem'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  color: '#333',
                  fontWeight: '500'
                }}>URL Imagine</label>
                <input
                  type="url"
                  value={formData.image_url || ''}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    outline: 'none'
                  }}
                />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  color: '#333',
                  fontWeight: '500'
                }}>Website</label>
                <input
                  type="url"
                  value={formData.website || ''}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: '#333',
                fontWeight: '500'
              }}>Program</label>
              <input
                type="text"
                value={formData.opening_hours || ''}
                onChange={(e) => setFormData({ ...formData, opening_hours: e.target.value })}
                placeholder="ex: Luni-Vineri 9:00-18:00"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  outline: 'none'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              style={{
                width: '100%',
                padding: '1rem',
                background: saving ? '#9ca3af' : '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                cursor: saving ? 'not-allowed' : 'pointer'
              }}
            >
              {saving ? 'Se salvează...' : 'Salvează modificările'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Dashboard

