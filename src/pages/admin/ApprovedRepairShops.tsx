import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from './AdminLayout'
import API_BASE_URL from '../../config'
import { ROMANIAN_CITIES, getCityNames } from '../../data/romanian-cities'

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
  repair_categories?: string
}

const ITEMS_PER_PAGE = 20

function ApprovedRepairShops() {
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [filterCity, setFilterCity] = useState('')
  const [availableCities, setAvailableCities] = useState<string[]>([])

  useEffect(() => {
    loadFacilities()
    loadCities()
  }, [])

  useEffect(() => {
    setCurrentPage(1)
    loadFacilities()
  }, [filterCity])

  const loadFacilities = async () => {
    setLoading(true)
    try {
      const queryParams = new URLSearchParams({ status: 'active', type: 'repair_shop' })
      if (filterCity) queryParams.append('city', filterCity)

      const response = await fetch(`${API_BASE_URL}/facilities?${queryParams}`)
      const data = await response.json()
      if (data.success) {
        setFacilities(data.data || [])
      }
    } catch (err) {
      console.error('Error loading facilities:', err)
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
      }
    } catch (err) {
      console.error('Error loading cities:', err)
      setAvailableCities(getCityNames())
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
          Magazine Reparații Aprobate
        </h1>

        {/* Filters */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
          padding: '1.5rem',
          background: '#f8fafc',
          borderRadius: '8px',
          border: '1px solid #e2e8f0'
        }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#0f172a' }}>
              Filtrează după oraș
            </label>
            <select
              value={filterCity}
              onChange={(e) => setFilterCity(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '0.875rem'
              }}
            >
              <option value="">Toate orașele</option>
              {availableCities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <p>Se încarcă...</p>
          </div>
        ) : currentFacilities.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <p style={{ color: '#64748b', fontSize: '1.125rem' }}>
              Nu există magazine de reparații aprobate.
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
                    {facility.repair_categories && (
                      <div style={{ color: '#64748b', fontSize: '0.875rem' }}>
                        <strong>Categorii:</strong> {facility.repair_categories}
                      </div>
                    )}
                  </div>
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

export default ApprovedRepairShops

