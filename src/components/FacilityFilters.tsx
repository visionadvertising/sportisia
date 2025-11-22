import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ROMANIAN_CITIES } from '../data/romanian-cities'
import { cityNameToSlug, sportNameToSlug, facilityTypeToSlug } from '../utils/seo'
import API_BASE_URL from '../config'
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
  const [availableCities, setAvailableCities] = useState<Array<{city: string, county?: string}>>(ROMANIAN_CITIES)
  const [availableSports, setAvailableSports] = useState<string[]>(['tenis', 'fotbal', 'baschet', 'volei', 'handbal', 'badminton', 'squash'])
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Load cities and sports from backend
  useEffect(() => {
    const loadCities = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/cities`)
        const data = await response.json()
        if (data.success && data.data) {
          // Combine standard cities with approved cities from backend
          const backendCities = data.data.map((item: any) => ({
            city: item.city,
            county: item.county || null
          }))
          // Create a map to avoid duplicates
          const cityMap = new Map<string, {city: string, county?: string | null}>()
          // Add standard cities
          ROMANIAN_CITIES.forEach(c => {
            cityMap.set(c.city, c)
          })
          // Add API cities
          backendCities.forEach((c: {city: string, county?: string | null}) => {
            if (!cityMap.has(c.city)) {
              cityMap.set(c.city, c)
            }
          })
          setAvailableCities(Array.from(cityMap.values()).sort((a, b) => a.city.localeCompare(b.city)))
        }
      } catch (err) {
        console.error('Error loading cities:', err)
      }
    }

    const loadSports = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/sports`)
        const data = await response.json()
        if (data.success && data.data) {
          // Combine standard sports with approved sports from backend
          const backendSports = data.data.map((item: any) => item.sport)
          const standardSports = ['tenis', 'fotbal', 'baschet', 'volei', 'handbal', 'badminton', 'squash']
          const allSports = [...new Set([...standardSports, ...backendSports])].sort()
          setAvailableSports(allSports)
        }
      } catch (err) {
        console.error('Error loading sports:', err)
      }
    }

    loadCities()
    loadSports()
  }, [])

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
  // Rules:
  // - City + Sport + Type → /city/sport/type
  // - City + Type (no sport) → /city/type
  // - City + Sport (no type) → /city/sport
  // - City only → /city
  // - Sport + Type (no city) → /sport/type
  // - Sport only → /sport
  // - Type only → /type (base URL)
  // - Nothing → /toate
  const generateURLFromFilters = (city: string, sport: string, type: string): string => {
    // Clean empty strings
    const hasCity = city && city.trim() !== ''
    const hasSport = sport && sport.trim() !== ''
    const hasType = type && type.trim() !== ''
    
    // 1. City + Sport + Type → /city/sport/type
    if (hasCity && hasSport && hasType) {
      return `/${cityNameToSlug(city)}/${sportNameToSlug(sport)}/${facilityTypeToSlug(type)}`
    }
    
    // 2. City + Type (no sport) → /city/type
    if (hasCity && hasType && !hasSport) {
      return `/${cityNameToSlug(city)}/${facilityTypeToSlug(type)}`
    }
    
    // 3. City + Sport (no type) → /city/sport
    if (hasCity && hasSport && !hasType) {
      return `/${cityNameToSlug(city)}/${sportNameToSlug(sport)}`
    }
    
    // 4. City only → /city
    if (hasCity && !hasSport && !hasType) {
      return `/${cityNameToSlug(city)}`
    }
    
    // 5. Sport + Type (no city) → /sport/type
    if (hasSport && hasType && !hasCity) {
      return `/${sportNameToSlug(sport)}/${facilityTypeToSlug(type)}`
    }
    
    // 6. Sport only → /sport
    if (hasSport && !hasCity && !hasType) {
      return `/${sportNameToSlug(sport)}`
    }
    
    // 7. Type only → /type (base URL)
    if (hasType && !hasCity && !hasSport) {
      const baseUrls: Record<string, string> = {
        'field': '/terenuri',
        'coach': '/antrenori',
        'repair_shop': '/magazine-reparatii',
        'equipment_shop': '/magazine-articole'
      }
      return baseUrls[type] || '/toate'
    }
    
    // 8. Nothing → /toate
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
      borderRadius: '12px',
      padding: isMobile ? '1.25rem' : '1.75rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      border: '1px solid #f1f5f9',
      marginBottom: isMobile ? '2rem' : '3rem'
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile 
          ? '1fr' 
          : showTypeFilter 
            ? 'repeat(3, 1fr)' 
            : 'repeat(2, 1fr)',
        gap: isMobile ? '1rem' : '1.25rem'
      }}>
        <div>
          <label style={{
            display: 'block',
            marginBottom: isMobile ? '0.5rem' : '0.5rem',
            color: '#0f172a',
            fontWeight: '600',
            fontSize: isMobile ? '0.875rem' : '0.9rem'
          }}>Oraș</label>
          <select
            value={selectedCity || city || ''}
            onChange={(e) => handleCityChange(e.target.value)}
            style={{
              width: '100%',
              padding: isMobile ? '0.875rem 1rem' : '0.75rem',
              paddingRight: '2.5rem',
              border: '1.5px solid #e2e8f0',
              borderRadius: isMobile ? '8px' : '10px',
              fontSize: isMobile ? '16px' : '0.95rem',
              outline: 'none',
              cursor: 'pointer',
              background: 'white',
              transition: 'all 0.2s ease',
              appearance: 'none',
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 0.75rem center',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#10b981'
              e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e2e8f0'
              e.target.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)'
            }}
          >
            <option value="">Toate orașele</option>
            {availableCities.map(cityOption => (
              <option key={cityOption.city} value={cityOption.city}>
                {cityOption.county 
                  ? `${cityOption.city} • ${cityOption.county}` 
                  : cityOption.city}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label style={{
            display: 'block',
            marginBottom: isMobile ? '0.5rem' : '0.5rem',
            color: '#0f172a',
            fontWeight: '600',
            fontSize: isMobile ? '0.875rem' : '0.9rem'
          }}>Sport</label>
          <select
            value={selectedSport || sport || ''}
            onChange={(e) => handleSportChange(e.target.value)}
            style={{
              width: '100%',
              padding: isMobile ? '0.875rem 1rem' : '0.75rem',
              paddingRight: '2.5rem',
              border: '1.5px solid #e2e8f0',
              borderRadius: isMobile ? '8px' : '10px',
              fontSize: isMobile ? '16px' : '0.95rem',
              outline: 'none',
              cursor: 'pointer',
              background: 'white',
              transition: 'all 0.2s ease',
              appearance: 'none',
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 0.75rem center',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#10b981'
              e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e2e8f0'
              e.target.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)'
            }}
          >
            <option value="">Toate sporturile</option>
            {availableSports.map(sportOption => (
              <option key={sportOption} value={sportOption}>
                {sportOption.charAt(0).toUpperCase() + sportOption.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {showTypeFilter && (
          <div>
            <label style={{
              display: 'block',
              marginBottom: isMobile ? '0.5rem' : '0.5rem',
              color: '#0f172a',
              fontWeight: '600',
              fontSize: isMobile ? '0.875rem' : '0.9rem'
            }}>Tip serviciu</label>
            <select
              value={selectedType || type || ''}
              onChange={(e) => handleTypeChange(e.target.value)}
              style={{
                width: '100%',
                padding: isMobile ? '0.875rem 1rem' : '0.75rem',
                paddingRight: '2.5rem',
                border: '1.5px solid #e2e8f0',
                borderRadius: isMobile ? '8px' : '10px',
                fontSize: isMobile ? '16px' : '0.95rem',
                outline: 'none',
                cursor: 'pointer',
                background: 'white',
                transition: 'all 0.2s ease',
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 0.75rem center',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
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

