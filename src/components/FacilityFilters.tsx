import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ROMANIAN_CITIES } from '../data/romanian-cities'
import { cityNameToSlug, sportNameToSlug, facilityTypeToSlug } from '../utils/seo'
import './FacilityFilters.css'

interface FacilityFiltersProps {
  selectedCity?: string
  selectedSport?: string
  selectedType?: string
  showTypeFilter?: boolean
  onFiltersChange?: (filters: { city: string; sport: string; type: string }) => void
}

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

function FacilityFilters({ 
  selectedCity = '', 
  selectedSport = '', 
  selectedType = '',
  showTypeFilter = true,
  onFiltersChange 
}: FacilityFiltersProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const [city, setCity] = useState(selectedCity)
  const [sport, setSport] = useState(selectedSport)
  const [type, setType] = useState(selectedType)

  useEffect(() => {
    setCity(selectedCity)
    setSport(selectedSport)
    setType(selectedType)
  }, [selectedCity, selectedSport, selectedType])

  const handleCityChange = (newCity: string) => {
    setCity(newCity)
    updateFilters(newCity, sport, type)
  }

  const handleSportChange = (newSport: string) => {
    setSport(newSport)
    updateFilters(city, newSport, type)
  }

  const handleTypeChange = (newType: string) => {
    setType(newType)
    updateFilters(city, sport, newType)
  }

  const updateFilters = (newCity: string, newSport: string, newType: string) => {
    if (onFiltersChange) {
      onFiltersChange({ city: newCity, sport: newSport, type: newType })
      return
    }

    // Default navigation logic
    const path = location.pathname
    
    // Determine the new URL based on current path
    if (path.startsWith('/sport/')) {
      // On sport page, navigate to sport page with filters
      if (newCity && newType) {
        navigate(`/${cityNameToSlug(newCity)}/${sportNameToSlug(newSport || selectedSport)}/${facilityTypeToSlug(newType)}`)
      } else if (newCity) {
        navigate(`/oras/${cityNameToSlug(newCity)}`)
      } else if (newType) {
        navigate(`/${sportNameToSlug(newSport || selectedSport)}/${facilityTypeToSlug(newType)}`)
      } else {
        navigate(`/sport/${sportNameToSlug(newSport || selectedSport)}`)
      }
    } else if (path.startsWith('/oras/')) {
      // On city page, navigate to city page with filters
      if (newSport && newType) {
        navigate(`/${cityNameToSlug(newCity || selectedCity)}/${sportNameToSlug(newSport)}/${facilityTypeToSlug(newType)}`)
      } else if (newType) {
        navigate(`/${cityNameToSlug(newCity || selectedCity)}/${facilityTypeToSlug(newType)}`)
      } else if (newSport) {
        navigate(`/${cityNameToSlug(newCity || selectedCity)}/${sportNameToSlug(newSport)}/${facilityTypeToSlug('field')}`)
      } else {
        navigate(`/oras/${cityNameToSlug(newCity || selectedCity)}`)
      }
    } else {
      // On other pages, use standard navigation
      if (newCity && newSport && newType) {
        navigate(`/${cityNameToSlug(newCity)}/${sportNameToSlug(newSport)}/${facilityTypeToSlug(newType)}`)
      } else if (newCity && newType) {
        navigate(`/${cityNameToSlug(newCity)}/${facilityTypeToSlug(newType)}`)
      } else if (newCity) {
        navigate(`/oras/${cityNameToSlug(newCity)}`)
      } else if (newSport && newType) {
        navigate(`/${sportNameToSlug(newSport)}/${facilityTypeToSlug(newType)}`)
      } else if (newSport) {
        navigate(`/sport/${sportNameToSlug(newSport)}`)
      } else if (newType) {
        const baseUrls: Record<string, string> = {
          'field': '/terenuri',
          'coach': '/antrenori',
          'repair_shop': '/magazine-reparatii',
          'equipment_shop': '/magazine-articole'
        }
        navigate(baseUrls[newType] || '/')
      }
    }
  }

  return (
    <div style={{
      background: 'white',
      borderRadius: '16px',
      padding: '1.5rem',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      marginBottom: '2rem'
    }}>
      <div className={`facility-filters-grid ${!showTypeFilter ? 'two-columns' : ''}`}>
        <div>
          <label style={{
            display: 'block',
            marginBottom: '0.5rem',
            color: '#333',
            fontWeight: '600',
            fontSize: '0.9rem'
          }}>Oraș</label>
          <select
            value={city || selectedCity || ''}
            onChange={(e) => handleCityChange(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '2px solid #e5e7eb',
              borderRadius: '10px',
              fontSize: '0.95rem',
              outline: 'none',
              cursor: 'pointer',
              background: 'white',
              transition: 'border-color 0.2s',
              appearance: 'none',
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 0.75rem center',
              paddingRight: '2.5rem'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#10b981'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e5e7eb'
            }}
          >
            <option value="">Toate orașele</option>
            {ROMANIAN_CITIES.map(cityOption => (
              <option key={cityOption} value={cityOption}>{cityOption}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label style={{
            display: 'block',
            marginBottom: '0.5rem',
            color: '#333',
            fontWeight: '600',
            fontSize: '0.9rem'
          }}>Sport</label>
          <select
            value={sport || selectedSport || ''}
            onChange={(e) => handleSportChange(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '2px solid #e5e7eb',
              borderRadius: '10px',
              fontSize: '0.95rem',
              outline: 'none',
              cursor: 'pointer',
              background: 'white',
              transition: 'border-color 0.2s',
              appearance: 'none',
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 0.75rem center',
              paddingRight: '2.5rem'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#10b981'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e5e7eb'
            }}
          >
            {SPORTS.map(sportOption => (
              <option key={sportOption.value} value={sportOption.value}>
                {sportOption.label}
              </option>
            ))}
          </select>
        </div>

        {showTypeFilter && (
          <div>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: '#333',
              fontWeight: '600',
              fontSize: '0.9rem'
            }}>Tip serviciu</label>
            <select
              value={type || selectedType || ''}
              onChange={(e) => handleTypeChange(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #e5e7eb',
                borderRadius: '10px',
                fontSize: '0.95rem',
                outline: 'none',
                cursor: 'pointer',
                background: 'white',
                transition: 'border-color 0.2s',
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 0.75rem center',
                paddingRight: '2.5rem'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#10b981'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb'
              }}
            >
              {FACILITY_TYPES.map(typeOption => (
                <option key={typeOption.value} value={typeOption.value}>
                  {typeOption.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  )
}

export default FacilityFilters

