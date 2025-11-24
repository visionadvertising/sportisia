import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ROMANIAN_CITIES } from '../data/romanian-cities'
import { cityNameToSlug, sportNameToSlug, facilityTypeToSlug, repairCategoryToSlug } from '../utils/seo'
import API_BASE_URL from '../config'
import './FacilityFilters.css'

interface FacilityFiltersProps {
  selectedCity?: string
  selectedSport?: string
  selectedType?: string
  selectedRepairCategory?: string
  showTypeFilter?: boolean
  onFiltersChange?: (filters: { city: string; sport: string; type: string; repairCategory?: string }) => void
}

const FACILITY_TYPES = [
  { value: '', label: 'Toate tipurile' },
  { value: 'field', label: 'Terenuri' },
  { value: 'coach', label: 'Antrenori' },
  { value: 'repair_shop', label: 'Magazine Reparații' },
  { value: 'equipment_shop', label: 'Magazine Articole' }
]

const REPAIR_CATEGORIES = [
  { value: '', label: 'Toate categoriile' },
  { value: 'Rachete tenis', label: 'Rachete tenis' },
  { value: 'Biciclete', label: 'Biciclete' },
  { value: 'Echipamente ski', label: 'Echipamente ski' },
  { value: 'Echipamente snowboard', label: 'Echipamente snowboard' },
  { value: 'Echipamente fitness', label: 'Echipamente fitness' },
  { value: 'Echipamente fotbal', label: 'Echipamente fotbal' },
  { value: 'Echipamente baschet', label: 'Echipamente baschet' },
  { value: 'Echipamente volei', label: 'Echipamente volei' },
  { value: 'Echipamente handbal', label: 'Echipamente handbal' },
  { value: 'Altele', label: 'Altele' }
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
  selectedRepairCategory = '',
  showTypeFilter = true,
  onFiltersChange 
}: FacilityFiltersProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const [city, setCity] = useState(selectedCity)
  const [sport, setSport] = useState(selectedSport)
  const [type, setType] = useState(selectedType)
  const [repairCategory, setRepairCategory] = useState(selectedRepairCategory)
  const [availableCities, setAvailableCities] = useState<Array<{city: string, county?: string}>>(ROMANIAN_CITIES)
  const [availableSports, setAvailableSports] = useState<string[]>(['tenis', 'fotbal', 'baschet', 'volei', 'handbal', 'badminton', 'squash'])
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [citySearch, setCitySearch] = useState('')
  const [showCityDropdown, setShowCityDropdown] = useState(false)
  const [sportSearch, setSportSearch] = useState('')
  const [showSportDropdown, setShowSportDropdown] = useState(false)
  const [typeSearch, setTypeSearch] = useState('')
  const [showTypeDropdown, setShowTypeDropdown] = useState(false)
  const [repairCategorySearch, setRepairCategorySearch] = useState('')
  const [showRepairCategoryDropdown, setShowRepairCategoryDropdown] = useState(false)
  
  // Determine which filters to show based on selectedType
  const isRepairShop = selectedType === 'repair_shop'
  const isEquipmentShop = selectedType === 'equipment_shop'
  const isFieldOrCoach = selectedType === 'field' || selectedType === 'coach'
  const showSportFilter = !isRepairShop // Sport filter for all except repair shops
  const showTypeFilterConditional = showTypeFilter && !isRepairShop && !isEquipmentShop && !isFieldOrCoach // Type filter only when no specific type is selected
  const showRepairCategoryFilter = isRepairShop // Repair category filter only for repair shops

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
    setRepairCategory(selectedRepairCategory)
  }, [selectedCity, selectedSport, selectedType, selectedRepairCategory])

  const handleCityChange = (newCity: string) => {
    const updatedCity = newCity || ''
    setCity(updatedCity)
    setCitySearch('')
    setShowCityDropdown(false)
    // Use current state values, but override with new city
    updateFilters(updatedCity, sport || selectedSport || '', type || selectedType || '', repairCategory || selectedRepairCategory || '')
  }

  const handleSportChange = (newSport: string) => {
    const updatedSport = newSport || ''
    setSport(updatedSport)
    setSportSearch('')
    setShowSportDropdown(false)
    // Use current state values, but override with new sport
    updateFilters(city || selectedCity || '', updatedSport, type || selectedType || '', repairCategory || selectedRepairCategory || '')
  }

  const handleTypeChange = (newType: string) => {
    const updatedType = newType || ''
    setType(updatedType)
    setTypeSearch('')
    setShowTypeDropdown(false)
    // Use current state values, but override with new type
    updateFilters(city || selectedCity || '', sport || selectedSport || '', updatedType, repairCategory || selectedRepairCategory || '')
  }

  const handleRepairCategoryChange = (newCategory: string) => {
    const updatedCategory = newCategory || ''
    setRepairCategory(updatedCategory)
    setRepairCategorySearch('')
    setShowRepairCategoryDropdown(false)
    // Use current state values, but override with new category
    updateFilters(city || selectedCity || '', sport || selectedSport || '', type || selectedType || '', updatedCategory)
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
  const generateURLFromFilters = (city: string, sport: string, type: string, repairCategory: string = ''): string => {
    // Clean empty strings
    const hasCity = city && city.trim() !== ''
    const hasSport = sport && sport.trim() !== ''
    const hasType = type && type.trim() !== ''
    const hasRepairCategory = repairCategory && repairCategory.trim() !== ''
    
    // For repair shops, include category in URL
    if (type === 'repair_shop' && hasRepairCategory) {
      const repairCategorySlug = repairCategoryToSlug(repairCategory)
      
      // 1. City + Type + Repair Category → /city/type/category
      if (hasCity && hasType) {
        return `/${cityNameToSlug(city)}/${facilityTypeToSlug(type)}/${repairCategorySlug}`
      }
      
      // 2. Type + Repair Category (no city) → /type/category
      if (hasType) {
        return `/${facilityTypeToSlug(type)}/${repairCategorySlug}`
      }
    }
    
    // Standard URL generation (without repair category in URL)
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

  const updateFilters = (newCity: string, newSport: string, newType: string, newRepairCategory: string = '') => {
    if (onFiltersChange) {
      onFiltersChange({ city: newCity, sport: newSport, type: newType, repairCategory: newRepairCategory })
      return
    }

    // Use simple, deterministic URL generation
    // Repair category is now part of URL structure for repair shops
    const newURL = generateURLFromFilters(newCity, newSport, newType, newRepairCategory)
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

  // Get display value for repair category
  const getRepairCategoryDisplayValue = () => {
    if (repairCategory || selectedRepairCategory) {
      const categoryObj = REPAIR_CATEGORIES.find(c => c.value === (repairCategory || selectedRepairCategory))
      return categoryObj ? categoryObj.label : ''
    }
    return repairCategorySearch
  }

  return (
    <div style={{
      background: 'white',
      borderRadius: '16px',
      padding: isMobile ? '1.5rem' : '2rem',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.1)',
      marginBottom: isMobile ? '2rem' : '3rem',
      border: '1px solid #f1f5f9'
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile 
          ? '1fr' 
          : (showRepairCategoryFilter 
              ? 'repeat(2, 1fr)' // Type + City + Repair Category (when type is selected)
              : showTypeFilterConditional 
                ? 'repeat(3, 1fr)' // Type + City + Sport
                : showSportFilter 
                  ? 'repeat(2, 1fr)' // City + Sport (when type is selected)
                  : '1fr'), // City only
        gap: isMobile ? '1.25rem' : '1.5rem'
      }}>
        {/* Type Searchable Dropdown - FIRST (Only show when no specific type is selected) */}
        {showTypeFilterConditional && (
          <div style={{ position: 'relative' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.75rem',
              color: '#0f172a',
              fontWeight: '600',
              fontSize: '0.875rem'
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <line x1="3" y1="9" x2="21" y2="9"/>
                <line x1="9" y1="21" x2="9" y2="9"/>
              </svg>
              <span>Tip serviciu</span>
            </label>
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
              onClick={() => setShowTypeDropdown(true)}
              onFocus={(e) => {
                setShowTypeDropdown(true)
                e.target.style.borderColor = '#10b981'
                e.target.style.background = '#ffffff'
                e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0'
                e.target.style.background = '#fafafa'
                e.target.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)'
                setTimeout(() => setShowTypeDropdown(false), 250)
              }}
              placeholder="Caută sau selectează tip"
              style={{
                width: '100%',
                padding: '0.875rem 1rem',
                paddingRight: '2.5rem',
                border: '1.5px solid #e2e8f0',
                borderRadius: '10px',
                fontSize: '0.9375rem',
                outline: 'none',
                background: '#fafafa',
                color: '#0f172a',
                transition: 'all 0.2s ease',
                fontWeight: '400',
                lineHeight: '1.5',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
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
                marginTop: '0.5rem',
                background: '#ffffff',
                border: '1.5px solid #e2e8f0',
                borderRadius: '12px',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)',
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
                      onMouseDown={(e) => {
                        e.preventDefault()
                        handleTypeChange(typeOption.value)
                      }}
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
                        e.currentTarget.style.color = '#059669'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#ffffff'
                        e.currentTarget.style.color = '#0f172a'
                      }}
                    >
                      {typeOption.label}
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* City Searchable Dropdown - SECOND */}
        <div style={{ position: 'relative' }}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '0.75rem',
            color: '#0f172a',
            fontWeight: '600',
            fontSize: '0.875rem'
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            <span>Oraș</span>
          </label>
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
            onClick={() => setShowCityDropdown(true)}
            onFocus={(e) => {
              setShowCityDropdown(true)
              e.target.style.borderColor = '#10b981'
              e.target.style.background = '#ffffff'
              e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e2e8f0'
              e.target.style.background = '#fafafa'
              e.target.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)'
              setTimeout(() => setShowCityDropdown(false), 250)
            }}
            placeholder="Caută sau selectează oraș"
            style={{
              width: '100%',
              padding: '0.875rem 1rem',
              paddingRight: '2.5rem',
              border: '1.5px solid #e2e8f0',
              borderRadius: '10px',
              fontSize: '0.9375rem',
              outline: 'none',
              background: '#fafafa',
              color: '#0f172a',
              transition: 'all 0.2s ease',
              fontWeight: '400',
              lineHeight: '1.5',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
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
              marginTop: '0.5rem',
              background: '#ffffff',
              border: '1.5px solid #e2e8f0',
              borderRadius: '12px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)',
              maxHeight: '300px',
              overflowY: 'auto',
              zIndex: 1000
            }}>
              <div
                onMouseDown={(e) => {
                  e.preventDefault()
                  handleCityChange('')
                }}
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
                .map(cityOption => (
                  <div
                    key={cityOption.city}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      handleCityChange(cityOption.city)
                    }}
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
                      e.currentTarget.style.color = '#059669'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#ffffff'
                      e.currentTarget.style.color = '#0f172a'
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

        {/* Sport Searchable Dropdown - Only show if not repair shop */}
        {showSportFilter && (
          <div style={{ position: 'relative' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.75rem',
              color: '#0f172a',
              fontWeight: '600',
              fontSize: '0.875rem'
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
                <path d="M4 22h16"/>
                <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
                <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
                <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
              </svg>
              <span>Sport</span>
            </label>
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
            onClick={() => setShowSportDropdown(true)}
            onFocus={(e) => {
              setShowSportDropdown(true)
              e.target.style.borderColor = '#10b981'
              e.target.style.background = '#ffffff'
              e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e2e8f0'
              e.target.style.background = '#fafafa'
              e.target.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)'
              setTimeout(() => setShowSportDropdown(false), 250)
            }}
            placeholder="Caută sau selectează sport"
            style={{
              width: '100%',
              padding: '0.875rem 1rem',
              paddingRight: '2.5rem',
              border: '1.5px solid #e2e8f0',
              borderRadius: '10px',
              fontSize: '0.9375rem',
              outline: 'none',
              background: '#fafafa',
              color: '#0f172a',
              transition: 'all 0.2s ease',
              fontWeight: '400',
              lineHeight: '1.5',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
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
              marginTop: '0.5rem',
              background: '#ffffff',
              border: '1.5px solid #e2e8f0',
              borderRadius: '12px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)',
              maxHeight: '300px',
              overflowY: 'auto',
              zIndex: 1000
            }}>
              <div
                onMouseDown={(e) => {
                  e.preventDefault()
                  handleSportChange('')
                }}
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
                .map(sportOption => (
                  <div
                    key={sportOption}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      handleSportChange(sportOption)
                    }}
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
                      e.currentTarget.style.color = '#059669'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#ffffff'
                      e.currentTarget.style.color = '#0f172a'
                    }}
                  >
                    {sportOption.charAt(0).toUpperCase() + sportOption.slice(1)}
                  </div>
                ))}
            </div>
          )}
          </div>
        )}

        {/* Repair Category Searchable Dropdown - Only show for repair shops */}
        {showRepairCategoryFilter && (
          <div style={{ position: 'relative' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.75rem',
              color: '#0f172a',
              fontWeight: '600',
              fontSize: '0.875rem'
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
              </svg>
              <span>Categorie reparații</span>
            </label>
            <input
              type="text"
              value={getRepairCategoryDisplayValue()}
              onChange={(e) => {
                setRepairCategorySearch(e.target.value)
                setShowRepairCategoryDropdown(true)
                if (!e.target.value) {
                  setRepairCategory('')
                  setRepairCategorySearch('')
                }
              }}
              onClick={() => setShowRepairCategoryDropdown(true)}
              onFocus={(e) => {
                setShowRepairCategoryDropdown(true)
                e.target.style.borderColor = '#10b981'
                e.target.style.background = '#ffffff'
                e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0'
                e.target.style.background = '#fafafa'
                e.target.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)'
                setTimeout(() => setShowRepairCategoryDropdown(false), 250)
              }}
              placeholder="Caută sau selectează categorie"
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
            {showRepairCategoryDropdown && (
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
                  onMouseDown={(e) => {
                    e.preventDefault()
                    handleRepairCategoryChange('')
                  }}
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
                  Toate categoriile
                </div>
                {REPAIR_CATEGORIES
                  .filter(categoryOption => 
                    !repairCategorySearch || 
                    categoryOption.label.toLowerCase().includes(repairCategorySearch.toLowerCase())
                  )
                  .map(categoryOption => (
                    <div
                      key={categoryOption.value}
                      onMouseDown={(e) => {
                        e.preventDefault()
                        handleRepairCategoryChange(categoryOption.value)
                      }}
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
                      {categoryOption.label}
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

