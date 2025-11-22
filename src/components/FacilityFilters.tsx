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
    const updatedCity = newCity || ''
    setCity(updatedCity)
    // Use current state values, but override with new city
    updateFilters(updatedCity, sport || selectedSport || '', type || selectedType || '')
  }

  const handleSportChange = (newSport: string) => {
    const updatedSport = newSport || ''
    setSport(updatedSport)
    // Use current state values, but override with new sport
    updateFilters(city || selectedCity || '', updatedSport, type || selectedType || '')
  }

  const handleTypeChange = (newType: string) => {
    const updatedType = newType || ''
    setType(updatedType)
    // Use current state values, but override with new type
    updateFilters(city || selectedCity || '', sport || selectedSport || '', updatedType)
  }

  // Simple, deterministic function to generate URL from filters
  const generateURLFromFilters = (city: string, sport: string, type: string): string => {
    // Priority order: City > Sport > Type
    
    // 1. City + Sport + Type
    if (city && sport && type) {
      return `/${cityNameToSlug(city)}/${sportNameToSlug(sport)}/${facilityTypeToSlug(type)}`
    }
    
    // 2. City + Sport (no type) - show all facilities for city and sport
    if (city && sport && !type) {
      return `/${cityNameToSlug(city)}/${sportNameToSlug(sport)}`
    }
    
    // 3. City + Type (no sport)
    if (city && type && !sport) {
      return `/${cityNameToSlug(city)}/${facilityTypeToSlug(type)}`
    }
    
    // 4. Sport + Type (no city)
    if (sport && type && !city) {
      return `/${sportNameToSlug(sport)}/${facilityTypeToSlug(type)}`
    }
    
    // 5. Only City
    if (city && !sport && !type) {
      return `/${cityNameToSlug(city)}`
    }
    
    // 6. Only Sport
    if (sport && !city && !type) {
      return `/${sportNameToSlug(sport)}`
    }
    
    // 7. Only Type
    if (type && !city && !sport) {
      const baseUrls: Record<string, string> = {
        'field': '/terenuri',
        'coach': '/antrenori',
        'repair_shop': '/magazine-reparatii',
        'equipment_shop': '/magazine-articole'
      }
      return baseUrls[type] || '/toate'
    }
    
    // 8. No filters - go to all facilities page
    return '/toate'
  }

  const updateFilters = (newCity: string, newSport: string, newType: string) => {
    if (onFiltersChange) {
      onFiltersChange({ city: newCity, sport: newSport, type: newType })
      return
    }

    // Use simple, deterministic URL generation
    const newURL = generateURLFromFilters(newCity, newSport, newType)
    navigate(newURL)
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
            value={selectedCity || city || ''}
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
            value={selectedSport || sport || ''}
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
              value={selectedType || type || ''}
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

