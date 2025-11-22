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
  status: string
  created_at: string
  username?: string
  user_email?: string
}

interface User {
  id: number
  username: string
  email: string
  facility_id: number | null
  facility_type: string
  facility_name?: string
  facility_status?: string
  created_at: string
}

function AdminDashboard() {
  const navigate = useNavigate()
  const [admin, setAdmin] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'pending' | 'users' | 'settings'>('pending')
  const [loading, setLoading] = useState(true)
  const [pendingFacilities, setPendingFacilities] = useState<Facility[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [siteLogo, setSiteLogo] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    // Check if admin is logged in
    const storedAdmin = localStorage.getItem('admin')
    if (!storedAdmin) {
      navigate('/admin/login')
      return
    }

    const adminData = JSON.parse(storedAdmin)
    setAdmin(adminData)

    // Load initial data
    loadPendingFacilities()
    loadUsers()
    loadSiteSettings()
  }, [navigate])

  const loadPendingFacilities = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/pending-facilities`)
      const data = await response.json()
      if (data.success) {
        setPendingFacilities(data.data)
      }
    } catch (err) {
      console.error('Error loading pending facilities:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users`)
      const data = await response.json()
      if (data.success) {
        setUsers(data.data)
      }
    } catch (err) {
      console.error('Error loading users:', err)
    }
  }

  const loadSiteSettings = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/site-settings`)
      const data = await response.json()
      if (data.success) {
        setSiteLogo(data.data.site_logo || '')
        setLogoUrl(data.data.site_logo || '')
      }
    } catch (err) {
      console.error('Error loading site settings:', err)
    }
  }

  const handleApproveFacility = async (facilityId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/facilities/${facilityId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'active' })
      })

      const data = await response.json()
      if (data.success) {
        setSuccess('Facilitatea a fost aprobată cu succes!')
        loadPendingFacilities()
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(data.error || 'Eroare la aprobare')
        setTimeout(() => setError(''), 3000)
      }
    } catch (err) {
      setError('Eroare la conectarea la server')
      setTimeout(() => setError(''), 3000)
    }
  }

  const handleRejectFacility = async (facilityId: number) => {
    if (!confirm('Ești sigur că vrei să respingi această facilitate?')) {
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/admin/facilities/${facilityId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'inactive' })
      })

      const data = await response.json()
      if (data.success) {
        setSuccess('Facilitatea a fost respinsă.')
        loadPendingFacilities()
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(data.error || 'Eroare la respingere')
        setTimeout(() => setError(''), 3000)
      }
    } catch (err) {
      setError('Eroare la conectarea la server')
      setTimeout(() => setError(''), 3000)
    }
  }

  const handleResetPassword = async (userId: number) => {
    if (!confirm('Ești sigur că vrei să resetezi parola acestui utilizator?')) {
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/reset-password`, {
        method: 'POST'
      })

      const data = await response.json()
      if (data.success) {
        alert(`Parola a fost resetată!\n\nNoua parolă: ${data.newPassword}\n\nCopiază această parolă și o transmiți utilizatorului.`)
        loadUsers()
      } else {
        setError(data.error || 'Eroare la resetarea parolei')
        setTimeout(() => setError(''), 3000)
      }
    } catch (err) {
      setError('Eroare la conectarea la server')
      setTimeout(() => setError(''), 3000)
    }
  }

  const handleUpdateLogo = async () => {
    if (!logoUrl.trim()) {
      setError('URL-ul logo-ului este obligatoriu')
      setTimeout(() => setError(''), 3000)
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/admin/site-settings/logo`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ logoUrl })
      })

      const data = await response.json()
      if (data.success) {
        setSuccess('Logo-ul site-ului a fost actualizat cu succes!')
        setSiteLogo(logoUrl)
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(data.error || 'Eroare la actualizarea logo-ului')
        setTimeout(() => setError(''), 3000)
      }
    } catch (err) {
      setError('Eroare la conectarea la server')
      setTimeout(() => setError(''), 3000)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('admin')
    navigate('/admin/login')
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
        <div style={{ textAlign: 'center', color: '#666' }}>
          <p>Se încarcă...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f9fafb'
    }}>
      {/* Header */}
      <header style={{
        background: '#1e3c72',
        color: 'white',
        padding: '1.5rem 2rem',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h1 style={{ margin: 0, fontSize: '1.8rem' }}>Panou Administrare</h1>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span style={{ opacity: 0.9 }}>Bun venit, {admin?.username}</span>
            <button
              onClick={handleLogout}
              style={{
                padding: '0.5rem 1rem',
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '2rem'
      }}>
        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '2rem',
          background: 'white',
          padding: '1rem',
          borderRadius: '12px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <button
            onClick={() => setActiveTab('pending')}
            style={{
              padding: '0.75rem 1.5rem',
              background: activeTab === 'pending' ? '#1e3c72' : '#e5e7eb',
              color: activeTab === 'pending' ? 'white' : '#333',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '1rem'
            }}
          >
            Cereri în așteptare ({pendingFacilities.length})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            style={{
              padding: '0.75rem 1.5rem',
              background: activeTab === 'users' ? '#1e3c72' : '#e5e7eb',
              color: activeTab === 'users' ? 'white' : '#333',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '1rem'
            }}
          >
            Utilizatori ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            style={{
              padding: '0.75rem 1.5rem',
              background: activeTab === 'settings' ? '#1e3c72' : '#e5e7eb',
              color: activeTab === 'settings' ? 'white' : '#333',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '1rem'
            }}
          >
            Setări Site
          </button>
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

        {/* Pending Facilities Tab */}
        {activeTab === 'pending' && (
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '2rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{
              fontSize: '1.8rem',
              color: '#1e3c72',
              marginBottom: '1.5rem'
            }}>Cereri de înregistrare în așteptare</h2>

            {pendingFacilities.length === 0 ? (
              <p style={{ color: '#666', textAlign: 'center', padding: '3rem' }}>
                Nu există cereri în așteptare.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {pendingFacilities.map((facility) => (
                  <div
                    key={facility.id}
                    style={{
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      padding: '1.5rem',
                      background: '#f9fafb'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'start',
                      marginBottom: '1rem'
                    }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{
                          fontSize: '1.3rem',
                          color: '#1e3c72',
                          margin: '0 0 0.5rem 0'
                        }}>{facility.name}</h3>
                        <p style={{ margin: '0.25rem 0', color: '#666' }}>
                          <strong>Tip:</strong> {
                            facility.facility_type === 'field' ? 'Teren Sportiv' :
                            facility.facility_type === 'coach' ? 'Antrenor' :
                            facility.facility_type === 'repair_shop' ? 'Magazin Reparații' :
                            'Magazin Articole'
                          }
                        </p>
                        <p style={{ margin: '0.25rem 0', color: '#666' }}>
                          <strong>Oraș:</strong> {facility.city}
                        </p>
                        <p style={{ margin: '0.25rem 0', color: '#666' }}>
                          <strong>Adresă:</strong> {facility.location}
                        </p>
                        <p style={{ margin: '0.25rem 0', color: '#666' }}>
                          <strong>Telefon:</strong> {facility.phone}
                        </p>
                        <p style={{ margin: '0.25rem 0', color: '#666' }}>
                          <strong>Email:</strong> {facility.email}
                        </p>
                        {facility.username && (
                          <p style={{ margin: '0.25rem 0', color: '#666' }}>
                            <strong>Username:</strong> {facility.username}
                          </p>
                        )}
                        {facility.description && (
                          <p style={{ margin: '0.5rem 0', color: '#666' }}>
                            <strong>Descriere:</strong> {facility.description.substring(0, 200)}...
                          </p>
                        )}
                        <p style={{ margin: '0.5rem 0', color: '#999', fontSize: '0.9rem' }}>
                          Înregistrat: {new Date(facility.created_at).toLocaleString('ro-RO')}
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleApproveFacility(facility.id)}
                          style={{
                            padding: '0.75rem 1.5rem',
                            background: '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                          }}
                        >
                          ✓ Aprobă
                        </button>
                        <button
                          onClick={() => handleRejectFacility(facility.id)}
                          style={{
                            padding: '0.75rem 1.5rem',
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                          }}
                        >
                          ✗ Respinge
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '2rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{
              fontSize: '1.8rem',
              color: '#1e3c72',
              marginBottom: '1.5rem'
            }}>Lista utilizatorilor</h2>

            {users.length === 0 ? (
              <p style={{ color: '#666', textAlign: 'center', padding: '3rem' }}>
                Nu există utilizatori înregistrați.
              </p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse'
                }}>
                  <thead>
                    <tr style={{
                      background: '#f9fafb',
                      borderBottom: '2px solid #e0e0e0'
                    }}>
                      <th style={{ padding: '1rem', textAlign: 'left', color: '#333', fontWeight: 'bold' }}>ID</th>
                      <th style={{ padding: '1rem', textAlign: 'left', color: '#333', fontWeight: 'bold' }}>Username</th>
                      <th style={{ padding: '1rem', textAlign: 'left', color: '#333', fontWeight: 'bold' }}>Email</th>
                      <th style={{ padding: '1rem', textAlign: 'left', color: '#333', fontWeight: 'bold' }}>Facilitate</th>
                      <th style={{ padding: '1rem', textAlign: 'left', color: '#333', fontWeight: 'bold' }}>Status</th>
                      <th style={{ padding: '1rem', textAlign: 'left', color: '#333', fontWeight: 'bold' }}>Data înregistrării</th>
                      <th style={{ padding: '1rem', textAlign: 'left', color: '#333', fontWeight: 'bold' }}>Acțiuni</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} style={{
                        borderBottom: '1px solid #e0e0e0'
                      }}>
                        <td style={{ padding: '1rem', color: '#666' }}>{user.id}</td>
                        <td style={{ padding: '1rem', color: '#666' }}>{user.username}</td>
                        <td style={{ padding: '1rem', color: '#666' }}>{user.email}</td>
                        <td style={{ padding: '1rem', color: '#666' }}>
                          {user.facility_name || '-'}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          {user.facility_status && (
                            <span style={{
                              padding: '0.25rem 0.75rem',
                              borderRadius: '12px',
                              fontSize: '0.85rem',
                              fontWeight: 'bold',
                              background: user.facility_status === 'active' ? '#d1fae5' : '#fee2e2',
                              color: user.facility_status === 'active' ? '#065f46' : '#991b1b'
                            }}>
                              {user.facility_status === 'active' ? 'Activ' : user.facility_status === 'pending' ? 'În așteptare' : 'Inactiv'}
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '1rem', color: '#666', fontSize: '0.9rem' }}>
                          {new Date(user.created_at).toLocaleDateString('ro-RO')}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <button
                            onClick={() => handleResetPassword(user.id)}
                            style={{
                              padding: '0.5rem 1rem',
                              background: '#f59e0b',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '0.9rem',
                              fontWeight: '500'
                            }}
                          >
                            Resetare parolă
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '2rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{
              fontSize: '1.8rem',
              color: '#1e3c72',
              marginBottom: '1.5rem'
            }}>Setări Site</h2>

            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{
                fontSize: '1.3rem',
                color: '#333',
                marginBottom: '1rem'
              }}>Logo Site</h3>
              
              {siteLogo && (
                <div style={{ marginBottom: '1rem' }}>
                  <p style={{ marginBottom: '0.5rem', color: '#666' }}>Logo actual:</p>
                  <img
                    src={siteLogo}
                    alt="Site logo"
                    style={{
                      maxWidth: '200px',
                      maxHeight: '200px',
                      borderRadius: '8px',
                      border: '1px solid #e0e0e0'
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                </div>
              )}

              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  color: '#333',
                  fontWeight: '500'
                }}>URL Logo nou</label>
                <input
                  type="url"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://example.com/logo.png"
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
                onClick={handleUpdateLogo}
                style={{
                  padding: '0.75rem 2rem',
                  background: '#1e3c72',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Actualizează Logo
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard

