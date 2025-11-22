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
  location: string
  phone: string
  email: string
  description?: string
  status: string
  created_at: string
  sport?: string
  specialization?: string
}

const ITEMS_PER_PAGE = 20
const FACILITY_TYPES = [
  { value: '', label: 'Toate tipurile' },
  { value: 'field', label: 'Terenuri' },
  { value: 'coach', label: 'Antrenori' },
  { value: 'repair_shop', label: 'Magazine Reparații' },
  { value: 'equipment_shop', label: 'Magazine Articole' }
]

const SPORTS = [
  { value: '', label: 'Toate sporturile' },
  { value: 'tenis', label: 'Tenis' },
  { value: 'fotbal', label: 'Fotbal' },
  { value: 'baschet', label: 'Baschet' },
  { value: 'volei', label: 'Volei' },
  { value: 'handbal', label: 'Handbal' },
  { value: 'badminton', label: 'Badminton' },
  { value: 'squash', label: 'Squash' }
]

function ApprovedFacilities() {
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [filterCity, setFilterCity] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterSport, setFilterSport] = useState('')
  const [availableCities, setAvailableCities] = useState<string[]>([])
  const [availableSports, setAvailableSports] = useState<string[]>([])

  useEffect(() => {
    loadFacilities()
    loadCities()
    loadSports()
  }, [])

  useEffect(() => {
    setCurrentPage(1) // Reset to first page when filters change
  }, [filterCity, filterType, filterSport])

  const loadFacilities = async () => {
    setLoading(true)
    try {
      const queryParams = new URLSearchParams({ status: 'active' })
      if (filterCity) queryParams.append('city', filterCity)
      if (filterType) queryParams.append('type', filterType)
      if (filterSport) queryParams.append('sport', filterSport)

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

  const loadSports = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/sports`)
      const data = await response.json()
      if (data.success && data.data) {
        const sports = data.data.map((item: any) => item.sport)
        const standardSports = ['tenis', 'fotbal', 'baschet', 'volei', 'handbal', 'badminton', 'squash']
        setAvailableSports([...new Set([...standardSports, ...sports])].sort())
      }
    } catch (err) {
      console.error('Error loading sports:', err)
      setAvailableSports(['tenis', 'fotbal', 'baschet', 'volei', 'handbal', 'badminton', 'squash'])
    }
  }

  useEffect(() => {
    loadFacilities()
  }, [filterCity, filterType, filterSport])

  const getFacilityTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'field': 'Teren Sportiv',
      'coach': 'Antrenor',
      'repair_shop': 'Magazin Reparații',
      'equipment_shop': 'Magazin Articole'
    }
    return labels[type] || type
  }

  // Filter facilities
  const filteredFacilities = facilities.filter(facility => {
    if (filterCity && facility.city !== filterCity) return false
    if (filterType && facility.facility_type !== filterType) return false
    if (filterSport && facility.sport !== filterSport) return false
    return true
  })

  // Pagination
  const totalPages = Math.ceil(filteredFacilities.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentFacilities = filteredFacilities.slice(startIndex, endIndex)

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        Se încarcă...
      </div>
    )
  }

  return (
    <AdminLayout>
      <div style={{ padding: '2rem' }}>
      <h1 style={{ fontSize: '2rem', color: '#1e3c72', marginBottom: '2rem' }}>
        Facilități aprobate ({filteredFacilities.length})
      </h1>

      {/* Filters */}
      <div style={{
        background: 'white',
        padding: '1.5rem',
        borderRadius: '12px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '2rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '1rem'
      }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333', fontWeight: '500' }}>
            Oraș
          </label>
          <select
            value={filterCity}
            onChange={(e) => setFilterCity(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '2px solid #e0e0e0',
              borderRadius: '8px',
              fontSize: '1rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="">Toate orașele</option>
            {availableCities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333', fontWeight: '500' }}>
            Tip serviciu
          </label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '2px solid #e0e0e0',
              borderRadius: '8px',
              fontSize: '1rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            {FACILITY_TYPES.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333', fontWeight: '500' }}>
            Sport
          </label>
          <select
            value={filterSport}
            onChange={(e) => setFilterSport(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '2px solid #e0e0e0',
              borderRadius: '8px',
              fontSize: '1rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            {availableSports.map(sport => (
              <option key={sport} value={sport}>
                {sport.charAt(0).toUpperCase() + sport.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredFacilities.length === 0 ? (
        <div style={{
          background: 'white',
          padding: '3rem',
          borderRadius: '12px',
          textAlign: 'center',
          color: '#666'
        }}>
          Nu sunt facilități care să corespundă filtrelor
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
                  border: '1px solid #e5e7eb',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'start'
                }}
              >
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
                      background: '#d1fae5',
                      color: '#065f46'
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
                </div>
                <Link
                  to={`/admin/facilities/${facility.id}`}
                  style={{
                    padding: '0.5rem 1.5rem',
                    background: '#1e3c72',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '6px',
                    fontSize: '0.9rem',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    marginLeft: '1rem'
                  }}
                >
                  Vezi/Editează
                </Link>
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
    </AdminLayout>
  )
}

export default ApprovedFacilities

