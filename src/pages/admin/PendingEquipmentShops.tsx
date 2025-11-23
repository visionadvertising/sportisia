import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from './AdminLayout'
import API_BASE_URL from '../../config'

interface Facility {
  id: number
  facility_type: string
  name: string
  city: string
  county?: string
  location: string
  phone: string
  email: string
  description?: string
  status: string
  created_at: string
  sport?: string
}

const ITEMS_PER_PAGE = 10

function PendingEquipmentShops() {
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    loadFacilities()
  }, [])

  const loadFacilities = async () => {
    setLoading(true)
    setError('')
    try {
      const adminToken = localStorage.getItem('admin')
      if (!adminToken) {
        setError('Nu sunteți autentificat')
        setLoading(false)
        return
      }

      const response = await fetch(`${API_BASE_URL}/admin/pending-facilities?type=equipment_shop`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      })
      const data = await response.json()
      if (data.success) {
        const equipmentShops = data.data.filter((f: Facility) => f.facility_type === 'equipment_shop')
        setFacilities(equipmentShops)
      } else {
        setError(data.error || 'Eroare la încărcarea cererilor')
      }
    } catch (err) {
      console.error('Error loading pending equipment shops:', err)
      setError('Eroare la încărcarea cererilor')
    } finally {
      setLoading(false)
    }
  }

  const handleApproveFacility = async (facilityId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/facilities/${facilityId}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin')}`
        },
        body: JSON.stringify({ status: 'active' })
      })
      const data = await response.json()
      if (data.success) {
        setSuccess('Magazinul de articole a fost aprobat cu succes')
        setTimeout(() => setSuccess(''), 3000)
        loadFacilities()
      } else {
        setError(data.error || 'Eroare la aprobare')
        setTimeout(() => setError(''), 3000)
      }
    } catch (err) {
      setError('Eroare la conectarea la server')
      setTimeout(() => setError(''), 3000)
      console.error('Error approving facility:', err)
    }
  }

  const handleRejectFacility = async (facilityId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/facilities/${facilityId}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin')}`
        },
        body: JSON.stringify({ status: 'inactive' })
      })
      const data = await response.json()
      if (data.success) {
        setSuccess('Magazinul de articole a fost respins')
        setTimeout(() => setSuccess(''), 3000)
        loadFacilities()
      } else {
        setError(data.error || 'Eroare la respingere')
        setTimeout(() => setError(''), 3000)
      }
    } catch (err) {
      setError('Eroare la conectarea la server')
      setTimeout(() => setError(''), 3000)
      console.error('Error rejecting facility:', err)
    }
  }

  const totalPages = Math.ceil(facilities.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentFacilities = facilities.slice(startIndex, endIndex)

  return (
    <AdminLayout>
      <div style={{ padding: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '600', marginBottom: '2rem', color: '#0f172a' }}>
          Magazine Articole în Așteptare
        </h1>

        {error && (
          <div style={{
            padding: '1rem',
            background: '#fee2e2',
            color: '#dc2626',
            borderRadius: '8px',
            marginBottom: '1rem'
          }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{
            padding: '1rem',
            background: '#d1fae5',
            color: '#065f46',
            borderRadius: '8px',
            marginBottom: '1rem'
          }}>
            {success}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <p>Se încarcă...</p>
          </div>
        ) : currentFacilities.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <p style={{ color: '#64748b', fontSize: '1.125rem' }}>
              Nu există magazine de articole în așteptare.
            </p>
          </div>
        ) : (
          <>
            <div style={{
              display: 'grid',
              gap: '1rem',
              marginBottom: '2rem'
            }}>
              {currentFacilities.map((facility) => (
                <div
                  key={facility.id}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '1.5rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem', color: '#0f172a' }}>
                      {facility.name}
                    </h3>
                    <div style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                      <strong>Oraș:</strong> {facility.city}{facility.county ? ` • ${facility.county}` : ''}
                    </div>
                    {facility.sport && (
                      <div style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                        <strong>Sport:</strong> {facility.sport === 'general' ? 'General (toate sporturile)' : facility.sport}
                      </div>
                    )}
                    <div style={{ color: '#64748b', fontSize: '0.875rem' }}>
                      <strong>Telefon:</strong> {facility.phone}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <Link
                      to={`/admin/facilities/${facility.id}`}
                      style={{
                        padding: '0.5rem 1rem',
                        background: '#0f172a',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '6px',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#1e293b'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#0f172a'
                      }}
                    >
                      Vezi detalii
                    </Link>
                    <button
                      onClick={() => handleApproveFacility(facility.id)}
                      style={{
                        padding: '0.5rem 1rem',
                        background: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '0.875rem',
                        fontWeight: '500',
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
                      Aprobă
                    </button>
                    <button
                      onClick={() => handleRejectFacility(facility.id)}
                      style={{
                        padding: '0.5rem 1rem',
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '0.875rem',
                        fontWeight: '500',
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
                      Respinge
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '0.5rem',
                marginTop: '2rem'
              }}>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  style={{
                    padding: '0.5rem 1rem',
                    background: currentPage === 1 ? '#e2e8f0' : '#0f172a',
                    color: currentPage === 1 ? '#64748b' : 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    fontSize: '0.875rem'
                  }}
                >
                  Înapoi
                </button>
                <span style={{
                  padding: '0.5rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  color: '#0f172a',
                  fontSize: '0.875rem'
                }}>
                  Pagina {currentPage} din {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  style={{
                    padding: '0.5rem 1rem',
                    background: currentPage === totalPages ? '#e2e8f0' : '#0f172a',
                    color: currentPage === totalPages ? '#64748b' : 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    fontSize: '0.875rem'
                  }}
                >
                  Înainte
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  )
}

export default PendingEquipmentShops

