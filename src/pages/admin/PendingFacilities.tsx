import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import API_BASE_URL from '../../config'

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
  sport?: string
  specialization?: string
}

const ITEMS_PER_PAGE = 10

function PendingFacilities() {
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
    try {
      const response = await fetch(`${API_BASE_URL}/admin/pending-facilities`)
      const data = await response.json()
      if (data.success) {
        setFacilities(data.data)
      }
    } catch (err) {
      console.error('Error loading pending facilities:', err)
      setError('Eroare la încărcarea cererilor')
    } finally {
      setLoading(false)
    }
  }

  const handleApproveFacility = async (facilityId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/facilities/${facilityId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'active' })
      })
      const data = await response.json()
      if (data.success) {
        setSuccess('Facilitatea a fost aprobată cu succes')
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'inactive' })
      })
      const data = await response.json()
      if (data.success) {
        setSuccess('Facilitatea a fost respinsă')
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

  const getFacilityTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'field': 'Teren Sportiv',
      'coach': 'Antrenor',
      'repair_shop': 'Magazin Reparații',
      'equipment_shop': 'Magazin Articole'
    }
    return labels[type] || type
  }

  // Pagination
  const totalPages = Math.ceil(facilities.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentFacilities = facilities.slice(startIndex, endIndex)

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        Se încarcă...
      </div>
    )
  }

  return (
    <div>
      <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', color: '#1e3c72', margin: 0 }}>
          Cereri în așteptare ({facilities.length})
        </h1>
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

      {facilities.length === 0 ? (
        <div style={{
          background: 'white',
          padding: '3rem',
          borderRadius: '12px',
          textAlign: 'center',
          color: '#666'
        }}>
          Nu sunt cereri în așteptare
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {currentFacilities.map((facility) => (
              <div
                key={facility.id}
                style={{
                  background: 'white',
                  padding: '1.5rem',
                  borderRadius: '12px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  border: '1px solid #e5e7eb'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                      <h3 style={{ margin: 0, fontSize: '1.3rem', color: '#333' }}>
                        {facility.name}
                      </h3>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '12px',
                        fontSize: '0.85rem',
                        fontWeight: 'bold',
                        background: '#fef3c7',
                        color: '#92400e'
                      }}>
                        {getFacilityTypeLabel(facility.facility_type)}
                      </span>
                    </div>
                    <p style={{ margin: '0.5rem 0', color: '#666' }}>
                      📍 {facility.city}, {facility.location}
                    </p>
                    <p style={{ margin: '0.5rem 0', color: '#666' }}>
                      📞 {facility.phone} | ✉️ {facility.email}
                    </p>
                    {facility.sport && (
                      <p style={{ margin: '0.5rem 0', color: '#10b981', fontWeight: 'bold' }}>
                        🎾 Sport: {facility.sport}
                      </p>
                    )}
                    {facility.specialization && (
                      <p style={{ margin: '0.5rem 0', color: '#10b981', fontWeight: 'bold' }}>
                        👨‍🏫 Specializare: {facility.specialization}
                      </p>
                    )}
                    {facility.description && (
                      <p style={{ margin: '0.5rem 0', color: '#666', fontSize: '0.9rem' }}>
                        {facility.description.substring(0, 150)}...
                      </p>
                    )}
                    <p style={{ margin: '0.5rem 0', color: '#999', fontSize: '0.85rem' }}>
                      Trimis: {new Date(facility.created_at).toLocaleString('ro-RO')}
                    </p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginLeft: '1rem' }}>
                    <Link
                      to={`/admin/facilities/${facility.id}`}
                      style={{
                        padding: '0.5rem 1rem',
                        background: '#1e3c72',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '6px',
                        fontSize: '0.9rem',
                        fontWeight: 'bold',
                        textAlign: 'center'
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
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '0.9rem'
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
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '0.9rem'
                      }}
                    >
                      Respinge
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '0.5rem',
              marginTop: '2rem'
            }}>
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={{
                  padding: '0.5rem 1rem',
                  background: currentPage === 1 ? '#e5e7eb' : '#1e3c72',
                  color: currentPage === 1 ? '#666' : 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                ← Anterior
              </button>
              <span style={{ padding: '0.5rem 1rem', color: '#666' }}>
                Pagina {currentPage} din {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                style={{
                  padding: '0.5rem 1rem',
                  background: currentPage === totalPages ? '#e5e7eb' : '#1e3c72',
                  color: currentPage === totalPages ? '#666' : 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                Următor →
              </button>
            </div>
          )}
        </>
      )}
      </div>
    </div>
  )
}

export default PendingFacilities

