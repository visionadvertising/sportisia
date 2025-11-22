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
  const [citySearch, setCitySearch] = useState('')
  const [showCityDropdown, setShowCityDropdown] = useState(false)
  const [sportSearch, setSportSearch] = useState('')
  const [showSportDropdown, setShowSportDropdown] = useState(false)
  const [typeSearch, setTypeSearch] = useState('')
  const [showTypeDropdown, setShowTypeDropdown] = useState(false)

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
    setCitySearch('')
    setShowCityDropdown(false)
    // Use current state values, but override with new city
    updateFilters(updatedCity, sport || selectedSport || '', type || selectedType || '')
  }

  const handleSportChange = (newSport: string) => {
    const updatedSport = newSport || ''
    setSport(updatedSport)
    setSportSearch('')
    setShowSportDropdown(false)
    // Use current state values, but override with new sport
    updateFilters(city || selectedCity || '', updatedSport, type || selectedType || '')
  }

  const handleTypeChange = (newType: string) => {
    const updatedType = newType || ''
    setType(updatedType)
    setTypeSearch('')
    setShowTypeDropdown(false)
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

  // Get display value for city
  const getCityDisplayValue = () => {
    if (city || selectedCity) {
      const cityObj = availableCities.find(c => c.city === (city || selectedCity))
      return cityObj ? (cityObj.county ? `${cityObj.city} • ${cityObj.county}` : cityObj.city) : (city || selectedCity)
    }
    return citySearch
  }

  // Get display value for sport
  const getSportDisplayValue = () => {
    if (sport || selectedSport) {
      return (sport || selectedSport).charAt(0).toUpperCase() + (sport || selectedSport).slice(1)
    }
    return sportSearch
  }

  // Get display value for type
  const getTypeDisplayValue = () => {
    if (type || selectedType) {
      const typeObj = FACILITY_TYPES.find(t => t.value === (type || selectedType))
      return typeObj ? typeObj.label : ''
    }
    return typeSearch
  }

  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: isMobile ? '1.25rem' : '1.75rem',
      boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
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
        {/* City Searchable Dropdown */}
        <div style={{ position: 'relative' }}>
          <label style={{
            display: 'block',
            marginBottom: '0.75rem',
            color: '#0f172a',
            fontWeight: '600',
            fontSize: '0.875rem'
          }}>Oraș</label>
          <input
            type="text"
            value={getCityDisplayValue()}
            onChange={(e) => {
              setCitySearch(e.target.value)
              setShowCityDropdown(true)
              if (!e.target.value) {
                setCity('')
                setCitySearch('')
              }
            }}
            onFocus={() => setShowCityDropdown(true)}
            placeholder="Caută sau selectează oraș"
            style={{
              width: '100%',
              padding: '0.875rem 1rem',
              paddingRight: '2.5rem',
              border: '1.5px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '1rem',
              outline: 'none',
              background: '#ffffff',
              color: '#0f172a',
              transition: 'all 0.2s ease',
              fontWeight: '400',
              lineHeight: '1.5',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#10b981'
              e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e2e8f0'
              e.target.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)'
              setTimeout(() => setShowCityDropdown(false), 200)
            }}
          />
          <div style={{
            position: 'absolute',
            right: '0.75rem',
            top: '2.75rem',
            pointerEvents: 'none'
          }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#94a3b8" strokeWidth="2">
              <path d="M5 7.5l5 5 5-5"/>
            </svg>
          </div>
          {showCityDropdown && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: '0.25rem',
              background: '#ffffff',
              border: '1.5px solid #e2e8f0',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              maxHeight: '300px',
              overflowY: 'auto',
              zIndex: 1000
            }}>
              <div
                onClick={() => handleCityChange('')}
                style={{
                  padding: '0.75rem 1rem',
                  cursor: 'pointer',
                  borderBottom: '1px solid #f1f5f9',
                  color: '#0f172a',
                  fontSize: '0.9375rem',
                  fontWeight: '500',
                  transition: 'background 0.15s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f0fdf4'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#ffffff'
                }}
              >
                Toate orașele
              </div>
              {availableCities
                .filter(cityOption => 
                  !citySearch || 
                  cityOption.city.toLowerCase().includes(citySearch.toLowerCase()) ||
                  (cityOption.county && cityOption.county.toLowerCase().includes(citySearch.toLowerCase()))
                )
                .slice(0, 20)
                .map(cityOption => (
                  <div
                    key={cityOption.city}
                    onClick={() => handleCityChange(cityOption.city)}
                    style={{
                      padding: '0.75rem 1rem',
                      cursor: 'pointer',
                      borderBottom: '1px solid #f1f5f9',
                      color: '#0f172a',
                      fontSize: '0.9375rem',
                      transition: 'background 0.15s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#f0fdf4'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#ffffff'
                    }}
                  >
                    <div style={{ fontWeight: '600' }}>{cityOption.city}</div>
                    {cityOption.county && (
                      <div style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '0.25rem' }}>
                        {cityOption.county}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Sport Searchable Dropdown */}
        <div style={{ position: 'relative' }}>
          <label style={{
            display: 'block',
            marginBottom: '0.75rem',
            color: '#0f172a',
            fontWeight: '600',
            fontSize: '0.875rem'
          }}>Sport</label>
          <input
            type="text"
            value={getSportDisplayValue()}
            onChange={(e) => {
              setSportSearch(e.target.value)
              setShowSportDropdown(true)
              if (!e.target.value) {
                setSport('')
                setSportSearch('')
              }
            }}
            onFocus={() => setShowSportDropdown(true)}
            placeholder="Caută sau selectează sport"
            style={{
              width: '100%',
              padding: '0.875rem 1rem',
              paddingRight: '2.5rem',
              border: '1.5px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '1rem',
              outline: 'none',
              background: '#ffffff',
              color: '#0f172a',
              transition: 'all 0.2s ease',
              fontWeight: '400',
              lineHeight: '1.5',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#10b981'
              e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e2e8f0'
              e.target.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)'
              setTimeout(() => setShowSportDropdown(false), 200)
            }}
          />
          <div style={{
            position: 'absolute',
            right: '0.75rem',
            top: '2.75rem',
            pointerEvents: 'none'
          }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#94a3b8" strokeWidth="2">
              <path d="M5 7.5l5 5 5-5"/>
            </svg>
          </div>
          {showSportDropdown && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: '0.25rem',
              background: '#ffffff',
              border: '1.5px solid #e2e8f0',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              maxHeight: '300px',
              overflowY: 'auto',
              zIndex: 1000
            }}>
              <div
                onClick={() => handleSportChange('')}
                style={{
                  padding: '0.75rem 1rem',
                  cursor: 'pointer',
                  borderBottom: '1px solid #f1f5f9',
                  color: '#0f172a',
                  fontSize: '0.9375rem',
                  fontWeight: '500',
                  transition: 'background 0.15s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f0fdf4'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#ffffff'
                }}
              >
                Toate sporturile
              </div>
              {availableSports
                .filter(sportOption => 
                  !sportSearch || 
                  sportOption.toLowerCase().includes(sportSearch.toLowerCase())
                )
                .slice(0, 20)
                .map(sportOption => (
                  <div
                    key={sportOption}
                    onClick={() => handleSportChange(sportOption)}
                    style={{
                      padding: '0.75rem 1rem',
                      cursor: 'pointer',
                      borderBottom: '1px solid #f1f5f9',
                      color: '#0f172a',
                      fontSize: '0.9375rem',
                      fontWeight: '500',
                      transition: 'background 0.15s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#f0fdf4'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#ffffff'
                    }}
                  >
                    {sportOption.charAt(0).toUpperCase() + sportOption.slice(1)}
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Type Searchable Dropdown */}
        {showTypeFilter && (
          <div style={{ position: 'relative' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.75rem',
              color: '#0f172a',
              fontWeight: '600',
              fontSize: '0.875rem'
            }}>Tip serviciu</label>
            <input
              type="text"
              value={getTypeDisplayValue()}
              onChange={(e) => {
                setTypeSearch(e.target.value)
                setShowTypeDropdown(true)
                if (!e.target.value) {
                  setType('')
                  setTypeSearch('')
                }
              }}
              onFocus={() => setShowTypeDropdown(true)}
              placeholder="Caută sau selectează tip"
              style={{
                width: '100%',
                padding: '0.875rem 1rem',
                paddingRight: '2.5rem',
                border: '1.5px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '1rem',
                outline: 'none',
                background: '#ffffff',
                color: '#0f172a',
                transition: 'all 0.2s ease',
                fontWeight: '400',
                lineHeight: '1.5',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#10b981'
                e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0'
                e.target.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)'
                setTimeout(() => setShowTypeDropdown(false), 200)
              }}
            />
            <div style={{
              position: 'absolute',
              right: '0.75rem',
              top: '2.75rem',
              pointerEvents: 'none'
            }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#94a3b8" strokeWidth="2">
                <path d="M5 7.5l5 5 5-5"/>
              </svg>
            </div>
            {showTypeDropdown && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                marginTop: '0.25rem',
                background: '#ffffff',
                border: '1.5px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                maxHeight: '300px',
                overflowY: 'auto',
                zIndex: 1000
              }}>
                {FACILITY_TYPES
                  .filter(typeOption => 
                    !typeSearch || 
                    typeOption.label.toLowerCase().includes(typeSearch.toLowerCase())
                  )
                  .map(typeOption => (
                    <div
                      key={typeOption.value}
                      onClick={() => handleTypeChange(typeOption.value)}
                      style={{
                        padding: '0.75rem 1rem',
                        cursor: 'pointer',
                        borderBottom: '1px solid #f1f5f9',
                        color: '#0f172a',
                        fontSize: '0.9375rem',
                        fontWeight: '500',
                        transition: 'background 0.15s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#f0fdf4'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#ffffff'
                      }}
                    >
                      {typeOption.label}
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default FacilityFilters

