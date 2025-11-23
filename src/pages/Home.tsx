import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import API_BASE_URL from '../config'
import { ROMANIAN_CITIES } from '../data/romanian-cities'
import { cityNameToSlug, sportNameToSlug, facilityTypeToSlug, repairCategoryToSlug } from '../utils/seo'


function Home() {
  const navigate = useNavigate()
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  
  // Search filters
  const [selectedCity, setSelectedCity] = useState('')
  const [selectedSport, setSelectedSport] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [selectedRepairCategory, setSelectedRepairCategory] = useState('')
  const [citySearch, setCitySearch] = useState('')
  const [showCityDropdown, setShowCityDropdown] = useState(false)
  const [sportSearch, setSportSearch] = useState('')
  const [showSportDropdown, setShowSportDropdown] = useState(false)
  const [repairCategorySearch, setRepairCategorySearch] = useState('')
  const [showRepairCategoryDropdown, setShowRepairCategoryDropdown] = useState(false)
  const [typeSearch, setTypeSearch] = useState('')
  const [showTypeDropdown, setShowTypeDropdown] = useState(false)
  const [availableCities, setAvailableCities] = useState<Array<{city: string, county?: string | null}>>(ROMANIAN_CITIES)
  const [availableSports, setAvailableSports] = useState<string[]>(['tenis', 'fotbal', 'baschet', 'volei', 'handbal', 'badminton', 'squash'])
  
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

  // Determine which options to show based on selected type
  const isRepairShop = selectedType === 'repair_shop'
  const showSportFilter = selectedType === 'field' || selectedType === 'coach' || selectedType === 'equipment_shop' || selectedType === ''
  const showRepairCategoryFilter = isRepairShop

  // Reset sport/repair category when type changes
  useEffect(() => {
    if (selectedType !== 'repair_shop') {
      setSelectedRepairCategory('')
      setRepairCategorySearch('')
    }
    if (selectedType === 'repair_shop') {
      setSelectedSport('')
      setSportSearch('')
    }
  }, [selectedType])

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    // Load cities and sports from backend
    const loadCities = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/cities`)
        const data = await response.json()
        if (data.success && data.data) {
          const backendCities = data.data.map((item: any) => ({
            city: item.city,
            county: item.county || null
          }))
          const cityMap = new Map<string, {city: string, county?: string | null}>()
          ROMANIAN_CITIES.forEach(c => {
            cityMap.set(c.city, c)
          })
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


  // Generate URL from filters (same logic as FacilityFilters)
  const generateURLFromFilters = (city: string, sport: string, type: string, repairCategory?: string): string => {
    const hasCity = city && city.trim() !== ''
    const hasSport = sport && sport.trim() !== ''
    const hasType = type && type.trim() !== ''
    const hasRepairCategory = repairCategory && repairCategory.trim() !== ''
    
    // For repair shops with category
    if (hasType && type === 'repair_shop' && hasRepairCategory) {
      if (hasCity) {
        return `/${cityNameToSlug(city)}/magazine-reparatii/${repairCategoryToSlug(repairCategory)}`
      }
      return `/magazine-reparatii/${repairCategoryToSlug(repairCategory)}`
    }
    
    if (hasCity && hasSport && hasType) {
      return `/${cityNameToSlug(city)}/${sportNameToSlug(sport)}/${facilityTypeToSlug(type)}`
    }
    if (hasCity && hasType && !hasSport) {
      return `/${cityNameToSlug(city)}/${facilityTypeToSlug(type)}`
    }
    if (hasCity && hasSport && !hasType) {
      return `/${cityNameToSlug(city)}/${sportNameToSlug(sport)}`
    }
    if (hasCity && !hasSport && !hasType) {
      return `/${cityNameToSlug(city)}`
    }
    if (hasSport && hasType && !hasCity) {
      return `/${sportNameToSlug(sport)}/${facilityTypeToSlug(type)}`
    }
    if (hasSport && !hasCity && !hasType) {
      return `/${sportNameToSlug(sport)}`
    }
    if (hasType && !hasCity && !hasSport) {
      const baseUrls: Record<string, string> = {
        'field': '/terenuri',
        'coach': '/antrenori',
        'repair_shop': '/magazine-reparatii',
        'equipment_shop': '/magazine-articole'
      }
      return baseUrls[type] || '/toate'
    }
    return '/toate'
  }

  const handleSearch = () => {
    const url = generateURLFromFilters(selectedCity, selectedSport, selectedType, selectedRepairCategory)
    navigate(url)
  }

  return (
    <>
      {/* Hero Section */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
        padding: isMobile ? '4rem 1rem 3rem' : '6rem 2rem 5rem',
        textAlign: 'center',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <h1 style={{
          margin: 0,
          fontSize: isMobile ? '2rem' : '3.5rem',
          fontWeight: '700',
          marginBottom: isMobile ? '0.75rem' : '1rem',
          lineHeight: '1.2',
          padding: isMobile ? '0 0.5rem' : '0',
          letterSpacing: '-0.02em'
        }}>Găsește facilități sportive</h1>
        <p style={{
          margin: 0,
          fontSize: isMobile ? '1rem' : '1.25rem',
          opacity: 0.9,
          marginBottom: isMobile ? '2rem' : '3rem',
          padding: isMobile ? '0 0.5rem' : '0',
          fontWeight: '400'
        }}>Caută terenuri, antrenori și servicii sportive</p>

        {/* Search Bar */}
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          background: 'white',
          borderRadius: '12px',
          padding: isMobile ? '1.5rem' : '2rem',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
          gap: isMobile ? '1rem' : '1.25rem',
          position: 'relative'
        }}>
          {/* Type Searchable Dropdown - FIRST */}
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
              value={selectedType ? FACILITY_TYPES.find(t => t.value === selectedType)?.label || '' : typeSearch}
              onChange={(e) => {
                setTypeSearch(e.target.value)
                setShowTypeDropdown(true)
                if (!e.target.value) {
                  setSelectedType('')
                }
              }}
              onClick={() => setShowTypeDropdown(true)}
              onFocus={(e) => {
                setShowTypeDropdown(true)
                e.target.style.borderColor = '#10b981'
                e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0'
                e.target.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)'
                setTimeout(() => setShowTypeDropdown(false), 250)
              }}
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
                      onMouseDown={(e) => {
                        e.preventDefault()
                        setSelectedType(typeOption.value)
                        setTypeSearch('')
                        setShowTypeDropdown(false)
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
                      {typeOption.label}
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* City Searchable Dropdown - SECOND */}
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
              value={selectedCity || citySearch}
              onChange={(e) => {
                setCitySearch(e.target.value)
                setShowCityDropdown(true)
                if (!e.target.value) {
                  setSelectedCity('')
                }
              }}
              onClick={() => setShowCityDropdown(true)}
              onFocus={(e) => {
                setShowCityDropdown(true)
                e.target.style.borderColor = '#10b981'
                e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0'
                e.target.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)'
                setTimeout(() => setShowCityDropdown(false), 250)
              }}
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
                      setSelectedCity(cityOption.city)
                      setCitySearch('')
                      setShowCityDropdown(false)
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


          {/* Search Button */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'flex-end',
            gridColumn: isMobile ? '1' : 'span 3'
          }}>
            <button
              onClick={handleSearch}
              style={{
                width: '100%',
                padding: '1rem 2rem',
                background: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                minHeight: '48px',
                touchAction: 'manipulation',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)'
              }}
              onMouseEnter={(e) => {
                if (!isMobile) {
                  e.currentTarget.style.background = '#059669'
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(16, 185, 129, 0.3)'
                  e.currentTarget.style.transform = 'translateY(-1px)'
                }
              }}
              onMouseLeave={(e) => {
                if (!isMobile) {
                  e.currentTarget.style.background = '#10b981'
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(16, 185, 129, 0.2)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }
              }}
            >
              Caută
            </button>
          </div>
        </div>
      </div>


      {/* Features Section */}
      <div style={{
        background: '#ffffff',
        padding: isMobile ? '4rem 1rem' : '6rem 2rem',
        marginTop: isMobile ? '2rem' : '4rem'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <h2 style={{
            fontSize: isMobile ? '2rem' : '2.5rem',
            fontWeight: '700',
            color: '#0f172a',
            marginBottom: isMobile ? '2rem' : '3rem',
            textAlign: 'center',
            lineHeight: '1.2'
          }}>De ce să folosești Sportisia?</h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
            gap: isMobile ? '2rem' : '2.5rem'
          }}>
            <div style={{
              padding: isMobile ? '1.5rem' : '2rem',
              background: '#f8fafc',
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: '#10b981',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.5rem'
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </div>
              <h3 style={{
                color: '#0f172a',
                fontSize: '1.25rem',
                fontWeight: '600',
                marginBottom: '0.75rem'
              }}>Găsește facilități aproape</h3>
              <p style={{
                color: '#64748b',
                lineHeight: '1.6',
                fontSize: '0.9375rem',
                margin: 0
              }}>Descoperă terenuri, antrenori și servicii sportive din orașul tău sau din apropiere.</p>
            </div>

            <div style={{
              padding: isMobile ? '1.5rem' : '2rem',
              background: '#f8fafc',
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: '#10b981',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.5rem'
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="8.5" cy="7" r="4"></circle>
                  <line x1="20" y1="8" x2="20" y2="14"></line>
                  <line x1="23" y1="11" x2="17" y2="11"></line>
                </svg>
              </div>
              <h3 style={{
                color: '#0f172a',
                fontSize: '1.25rem',
                fontWeight: '600',
                marginBottom: '0.75rem'
              }}>Conectează-te cu antrenori</h3>
              <p style={{
                color: '#64748b',
                lineHeight: '1.6',
                fontSize: '0.9375rem',
                margin: 0
              }}>Găsește antrenori certificați care te pot ajuta să îți îmbunătățești performanțele.</p>
            </div>

            <div style={{
              padding: isMobile ? '1.5rem' : '2rem',
              background: '#f8fafc',
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: '#10b981',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.5rem'
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
                </svg>
              </div>
              <h3 style={{
                color: '#0f172a',
                fontSize: '1.25rem',
                fontWeight: '600',
                marginBottom: '0.75rem'
              }}>Servicii de reparații</h3>
              <p style={{
                color: '#64748b',
                lineHeight: '1.6',
                fontSize: '0.9375rem',
                margin: 0
              }}>Localizează magazine și servicii de reparații pentru echipamentele tale sportive.</p>
            </div>
          </div>
        </div>
      </div>

      {/* For Sport Businesses Section */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
        padding: isMobile ? '4rem 1rem' : '6rem 2rem',
        color: 'white'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {/* Statistics */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '16px',
            padding: isMobile ? '2rem 1rem' : '3rem 2rem',
            marginBottom: isMobile ? '3rem' : '4rem',
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
            gap: isMobile ? '1.5rem' : '2rem',
            textAlign: 'center',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div>
              <div style={{
                width: '56px',
                height: '56px',
                background: 'rgba(16, 185, 129, 0.2)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem'
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <h3 style={{ fontSize: isMobile ? '1.25rem' : '1.75rem', color: 'white', marginBottom: '0.5rem', fontWeight: '700' }}>Peste 300</h3>
              <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.9375rem' }}>Antrenori</p>
            </div>
            <div>
              <div style={{
                width: '56px',
                height: '56px',
                background: 'rgba(16, 185, 129, 0.2)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem'
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="3" y1="9" x2="21" y2="9"></line>
                  <line x1="9" y1="21" x2="9" y2="9"></line>
                </svg>
              </div>
              <h3 style={{ fontSize: isMobile ? '1.25rem' : '1.75rem', color: 'white', marginBottom: '0.5rem', fontWeight: '700' }}>Peste 100</h3>
              <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.9375rem' }}>Terenuri</p>
            </div>
            <div>
              <div style={{
                width: '56px',
                height: '56px',
                background: 'rgba(16, 185, 129, 0.2)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem'
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
                </svg>
              </div>
              <h3 style={{ fontSize: isMobile ? '1.25rem' : '1.75rem', color: 'white', marginBottom: '0.5rem', fontWeight: '700' }}>Peste 150</h3>
              <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.9375rem' }}>Servicii reparații</p>
            </div>
            <div>
              <div style={{
                width: '56px',
                height: '56px',
                background: 'rgba(16, 185, 129, 0.2)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem'
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
              </div>
              <h3 style={{ fontSize: isMobile ? '1.25rem' : '1.75rem', color: 'white', marginBottom: '0.5rem', fontWeight: '700' }}>Peste 20</h3>
              <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.9375rem' }}>Magazine</p>
            </div>
          </div>

          {/* Main Content */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: isMobile ? '3rem' : '4rem',
            alignItems: 'start'
          }}>
            {/* Left: Title */}
            <div>
              <p style={{
                color: '#10b981',
                fontSize: '1rem',
                fontWeight: '600',
                marginBottom: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>Pentru afaceri sportive</p>
              <h2 style={{
                fontSize: isMobile ? '2rem' : '2.5rem',
                fontWeight: '700',
                color: 'white',
                lineHeight: '1.2',
                marginBottom: isMobile ? '2rem' : '3rem'
              }}>Fii acolo unde caută sportivii</h2>
            </div>

            {/* Right: Benefits List */}
            <div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '1.5rem' : '2rem' }}>
                <div>
                  <h3 style={{
                    color: '#10b981',
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    marginBottom: '0.5rem'
                  }}>Crește-ți vizibilitatea</h3>
                  <p style={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    lineHeight: '1.6',
                    fontSize: '0.9375rem',
                    margin: 0
                  }}>Prezintă-ți facilitățile, serviciile de antrenament sau magazinul tău în fața a mii de clienți potențiali.</p>
                </div>

                <div>
                  <h3 style={{
                    color: '#10b981',
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    marginBottom: '0.5rem'
                  }}>Conectează-te cu sportivii locali</h3>
                  <p style={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    lineHeight: '1.6',
                    fontSize: '0.9375rem',
                    margin: 0
                  }}>Sportisia te aduce mai aproape de publicul țintă, de la amatori la sportivi semi-profesioniști.</p>
                </div>

                <div>
                  <h3 style={{
                    color: '#10b981',
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    marginBottom: '0.5rem'
                  }}>Prezintă-ți expertiza</h3>
                  <p style={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    lineHeight: '1.6',
                    fontSize: '0.9375rem',
                    margin: 0
                  }}>Evidențiază serviciile, expertiza și ofertele tale unice cu un profil dedicat.</p>
                </div>

                <div>
                  <h3 style={{
                    color: '#10b981',
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    marginBottom: '0.5rem'
                  }}>Extinde-ți baza de clienți</h3>
                  <p style={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    lineHeight: '1.6',
                    fontSize: '0.9375rem',
                    margin: 0
                  }}>Platforma noastră permite sportivilor să te descopere și să te contacteze ușor, ducând la mai multe solicitări.</p>
                </div>

                <div>
                  <h3 style={{
                    color: '#10b981',
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    marginBottom: '0.5rem'
                  }}>Este gratuit</h3>
                  <p style={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    lineHeight: '1.6',
                    fontSize: '0.9375rem',
                    margin: 0
                  }}>Nu există costuri pentru a-ți lista serviciile. Înregistrează-te și începe să-ți prezinți oferta.</p>
                </div>
              </div>

              <Link
                to="/register"
                style={{
                  marginTop: '2rem',
                  padding: isMobile ? '1rem 1.5rem' : '1.125rem 2rem',
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  width: '100%',
                  display: 'block',
                  textAlign: 'center',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 6px rgba(16, 185, 129, 0.2)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#059669'
                  e.currentTarget.style.boxShadow = '0 6px 12px rgba(16, 185, 129, 0.3)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#10b981'
                  e.currentTarget.style.boxShadow = '0 4px 6px rgba(16, 185, 129, 0.2)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                Devino membru
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        background: '#0f172a',
        padding: isMobile ? '2rem 1rem' : '3rem 2rem',
        textAlign: 'center',
        color: 'rgba(255, 255, 255, 0.8)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <p style={{
          margin: 0,
          fontSize: '0.9375rem'
        }}>©2024 Sportisia. Toate drepturile rezervate.</p>
      </footer>
    </>
  )
}

export default Home
