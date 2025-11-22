import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import API_BASE_URL from '../config'
import { ROMANIAN_CITIES } from '../data/romanian-cities'
import { cityNameToSlug, sportNameToSlug, facilityTypeToSlug } from '../utils/seo'

interface Field {
  id: number
  name: string
  city: string
  location: string
  sport: string
  price: number
  description?: string
  image_url?: string
}

function Home() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'fields' | 'coaches'>('fields')
  const [fields, setFields] = useState<Field[]>([])
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  
  // Search filters
  const [selectedCity, setSelectedCity] = useState('')
  const [selectedSport, setSelectedSport] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [citySearch, setCitySearch] = useState('')
  const [showCityDropdown, setShowCityDropdown] = useState(false)
  const [sportSearch, setSportSearch] = useState('')
  const [showSportDropdown, setShowSportDropdown] = useState(false)
  const [typeSearch, setTypeSearch] = useState('')
  const [showTypeDropdown, setShowTypeDropdown] = useState(false)
  const [availableCities, setAvailableCities] = useState<Array<{city: string, county?: string}>>(ROMANIAN_CITIES)
  const [availableSports, setAvailableSports] = useState<string[]>(['tenis', 'fotbal', 'baschet', 'volei', 'handbal', 'badminton', 'squash'])
  
  const FACILITY_TYPES = [
    { value: '', label: 'Toate tipurile' },
    { value: 'field', label: 'Terenuri' },
    { value: 'coach', label: 'Antrenori' },
    { value: 'repair_shop', label: 'Magazine Reparații' },
    { value: 'equipment_shop', label: 'Magazine Articole' }
  ]

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    fetchFields()
    
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

  const fetchFields = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/fields`)
      const data = await response.json()
      if (data.success) {
        setFields(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching fields:', error)
    } finally {
      setLoading(false)
    }
  }

  // Generate URL from filters (same logic as FacilityFilters)
  const generateURLFromFilters = (city: string, sport: string, type: string): string => {
    const hasCity = city && city.trim() !== ''
    const hasSport = sport && sport.trim() !== ''
    const hasType = type && type.trim() !== ''
    
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
    const url = generateURLFromFilters(selectedCity, selectedSport, selectedType)
    navigate(url)
  }

  return (
    <>
      {/* Hero Section */}
      <div style={{
        background: '#0f172a',
        padding: isMobile ? '4rem 1rem 3rem' : '6rem 2rem 5rem',
        textAlign: 'center',
        color: 'white'
      }}>
        <h1 style={{
          margin: 0,
          fontSize: isMobile ? '2rem' : '3rem',
          fontWeight: '600',
          marginBottom: isMobile ? '0.75rem' : '1rem',
          lineHeight: '1.2',
          padding: isMobile ? '0 0.5rem' : '0',
          letterSpacing: '-0.02em'
        }}>Găsește facilități sportive</h1>
        <p style={{
          margin: 0,
          fontSize: isMobile ? '1rem' : '1.25rem',
          opacity: 0.8,
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
              value={selectedCity || citySearch}
              onChange={(e) => {
                setCitySearch(e.target.value)
                setShowCityDropdown(true)
                if (!e.target.value) {
                  setSelectedCity('')
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
              onBlur={(e) => {
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
                      onClick={() => {
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
                        e.currentTarget.style.background = '#f8fafc'
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
              value={selectedSport || sportSearch}
              onChange={(e) => {
                setSportSearch(e.target.value)
                setShowSportDropdown(true)
                if (!e.target.value) {
                  setSelectedSport('')
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
              onBlur={(e) => {
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
                {availableSports
                  .filter(sportOption => 
                    !sportSearch || 
                    sportOption.toLowerCase().includes(sportSearch.toLowerCase())
                  )
                  .slice(0, 20)
                  .map(sportOption => (
                    <div
                      key={sportOption}
                      onClick={() => {
                        setSelectedSport(sportOption)
                        setSportSearch('')
                        setShowSportDropdown(false)
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
                        e.currentTarget.style.background = '#f8fafc'
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
              onBlur={(e) => {
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
                      onClick={() => {
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
                        e.currentTarget.style.background = '#f8fafc'
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
                background: '#0f172a',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                minHeight: '48px',
                touchAction: 'manipulation',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 4px rgba(15, 23, 42, 0.2)'
              }}
              onMouseEnter={(e) => {
                if (!isMobile) {
                  e.currentTarget.style.background = '#1e293b'
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(15, 23, 42, 0.3)'
                  e.currentTarget.style.transform = 'translateY(-1px)'
                }
              }}
              onMouseLeave={(e) => {
                if (!isMobile) {
                  e.currentTarget.style.background = '#0f172a'
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(15, 23, 42, 0.2)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }
              }}
            >
              Caută
            </button>
          </div>
        </div>
      </div>

      {/* Fields and Coaches Tabs Section */}
      <div style={{
        maxWidth: '1200px',
        margin: isMobile ? '2rem auto' : '4rem auto',
        padding: isMobile ? '0 1rem' : '0 2rem'
      }}>
        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: isMobile ? '0.5rem' : '1rem',
          marginBottom: isMobile ? '1.5rem' : '2rem',
          borderBottom: '2px solid #e0e0e0',
          overflowX: isMobile ? 'auto' : 'visible'
        }}>
          <button
            onClick={() => setActiveTab('fields')}
            style={{
              padding: isMobile ? '0.75rem 1rem' : '1rem 2rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'fields' ? '3px solid #10b981' : '3px solid transparent',
              color: activeTab === 'fields' ? '#10b981' : '#666',
              fontWeight: activeTab === 'fields' ? 'bold' : 'normal',
              cursor: 'pointer',
              fontSize: isMobile ? '0.9375rem' : '1.1rem',
              transition: 'all 0.3s',
              whiteSpace: 'nowrap'
            }}
          >
            Terenuri
          </button>
          <button
            onClick={() => setActiveTab('coaches')}
            style={{
              padding: isMobile ? '0.75rem 1rem' : '1rem 2rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'coaches' ? '3px solid #10b981' : '3px solid transparent',
              color: activeTab === 'coaches' ? '#10b981' : '#666',
              fontWeight: activeTab === 'coaches' ? 'bold' : 'normal',
              cursor: 'pointer',
              fontSize: isMobile ? '0.9375rem' : '1.1rem',
              transition: 'all 0.3s',
              whiteSpace: 'nowrap'
            }}
          >
            Antrenori
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'fields' && (
          <div>
            <div style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              justifyContent: 'space-between',
              alignItems: isMobile ? 'flex-start' : 'center',
              gap: isMobile ? '1rem' : '0',
              marginBottom: isMobile ? '1.5rem' : '2rem'
            }}>
              <h2 style={{
                fontSize: isMobile ? '1.5rem' : '2rem',
                color: '#333',
                margin: 0
              }}>Terenuri disponibile</h2>
              <Link
                to="/adauga-teren"
                style={{
                  padding: isMobile ? '0.875rem 1.5rem' : '0.75rem 2rem',
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: isMobile ? '0.9375rem' : '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  display: 'inline-block',
                  width: isMobile ? '100%' : 'auto',
                  textAlign: isMobile ? 'center' : 'left',
                  minHeight: isMobile ? '44px' : 'auto',
                  touchAction: 'manipulation'
                }}
              >
                + Adaugă Teren
              </Link>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
                Se încarcă...
              </div>
            ) : fields.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '3rem',
                background: '#f9fafb',
                borderRadius: '12px',
                color: '#666'
              }}>
                <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Nu există terenuri disponibile momentan.</p>
                <Link
                  to="/adauga-teren"
                  style={{
                    padding: '0.75rem 2rem',
                    background: '#10b981',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '8px',
                    display: 'inline-block'
                  }}
                >
                  Adaugă primul teren
                </Link>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: isMobile ? '1rem' : '2rem'
              }}>
                {fields.map((field) => (
                  <div
                    key={field.id}
                    style={{
                      background: 'white',
                      borderRadius: isMobile ? '8px' : '12px',
                      overflow: 'hidden',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      if (!isMobile) {
                        e.currentTarget.style.transform = 'translateY(-4px)'
                        e.currentTarget.style.boxShadow = '0 8px 12px rgba(0,0,0,0.15)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isMobile) {
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)'
                      }
                    }}
                  >
                    {field.image_url && (
                      <div style={{
                        width: '100%',
                        height: isMobile ? '180px' : '200px',
                        background: `url(${field.image_url}) center/cover`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }} />
                    )}
                    <div style={{ padding: isMobile ? '1rem' : '1.5rem' }}>
                      <h3 style={{
                        margin: '0 0 0.5rem 0',
                        fontSize: isMobile ? '1.125rem' : '1.3rem',
                        color: '#333',
                        fontWeight: '600'
                      }}>{field.name}</h3>
                      <p style={{
                        margin: '0 0 0.5rem 0',
                        color: '#666',
                        fontSize: isMobile ? '0.8125rem' : '0.9rem'
                      }}>📍 {field.city}, {field.location}</p>
                      <p style={{
                        margin: '0 0 0.5rem 0',
                        color: '#10b981',
                        fontWeight: '600',
                        fontSize: isMobile ? '0.875rem' : '0.9375rem'
                      }}>🎾 {field.sport}</p>
                      <p style={{
                        margin: '0 0 1rem 0',
                        color: '#333',
                        fontSize: isMobile ? '1rem' : '1.1rem',
                        fontWeight: '600'
                      }}>De la {field.price} RON/oră</p>
                      {field.description && (
                        <p style={{
                          margin: 0,
                          color: '#666',
                          fontSize: '0.9rem',
                          lineHeight: '1.5'
                        }}>{field.description.substring(0, 100)}...</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'coaches' && (
          <div>
            <h2 style={{
              fontSize: '2rem',
              color: '#333',
              marginBottom: '2rem'
            }}>Antrenori disponibili</h2>
            <div style={{
              textAlign: 'center',
              padding: '3rem',
              background: '#f9fafb',
              borderRadius: '12px',
              color: '#666'
            }}>
              <p style={{ fontSize: '1.2rem' }}>Secțiunea de antrenori va fi disponibilă în curând.</p>
            </div>
          </div>
        )}
      </div>

      {/* SPORT MADE SIMPLE Section */}
      <div style={{
        background: '#f9fafb',
        padding: '5rem 2rem',
        marginTop: '4rem'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '4rem',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{
              fontSize: '3rem',
              fontWeight: 'bold',
              color: '#1e3c72',
              marginBottom: '2rem',
              lineHeight: '1.2'
            }}>SPORT MADE SIMPLE</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div>
                <h3 style={{
                  color: '#10b981',
                  fontSize: '1.3rem',
                  fontWeight: 'bold',
                  marginBottom: '0.5rem'
                }}>Discover top sports facilities nearby</h3>
                <p style={{
                  color: '#1e3c72',
                  lineHeight: '1.6',
                  fontSize: '1rem'
                }}>Find detailed information about the best sports venues, from tennis courts to football fields, all in your area.</p>
              </div>

              <div>
                <h3 style={{
                  color: '#10b981',
                  fontSize: '1.3rem',
                  fontWeight: 'bold',
                  marginBottom: '0.5rem'
                }}>Connect with expert trainers</h3>
                <p style={{
                  color: '#1e3c72',
                  lineHeight: '1.6',
                  fontSize: '1rem'
                }}>Search for certified coaches and trainers who can help you improve your skills and achieve your goals.</p>
              </div>

              <div>
                <h3 style={{
                  color: '#10b981',
                  fontSize: '1.3rem',
                  fontWeight: 'bold',
                  marginBottom: '0.5rem'
                }}>Access reliable equipment services</h3>
                <p style={{
                  color: '#1e3c72',
                  lineHeight: '1.6',
                  fontSize: '1rem'
                }}>Whether you need equipment repairs or maintenance, locate trusted sports service providers near you.</p>
              </div>

              <div>
                <h3 style={{
                  color: '#10b981',
                  fontSize: '1.3rem',
                  fontWeight: 'bold',
                  marginBottom: '0.5rem'
                }}>Comprehensive and easy-to-use</h3>
                <p style={{
                  color: '#1e3c72',
                  lineHeight: '1.6',
                  fontSize: '1rem'
                }}>Explore a wide range of options with clear details like location, contact info, and facilities offered—all in one place.</p>
              </div>

              <div>
                <h3 style={{
                  color: '#10b981',
                  fontSize: '1.3rem',
                  fontWeight: 'bold',
                  marginBottom: '0.5rem'
                }}>Your personal sports network</h3>
                <p style={{
                  color: '#1e3c72',
                  lineHeight: '1.6',
                  fontSize: '1rem'
                }}>Stay informed and connected to the sports community, whether you're seeking advice, guidance, or simply looking for new opportunities.</p>
              </div>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1rem'
          }}>
            {/* Placeholder pentru imagini sport - poți adăuga imagini reale mai târziu */}
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
              <div
                key={i}
                style={{
                  aspectRatio: '1',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '2rem'
                }}
              >
                🏃
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* For Sport Businesses Section */}
      <div style={{
        background: 'white',
        padding: '5rem 2rem'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {/* Statistics */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '3rem',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            marginBottom: '4rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '2rem',
            textAlign: 'center'
          }}>
            <div>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👨‍🏫</div>
              <h3 style={{ fontSize: '1.5rem', color: '#333', marginBottom: '0.5rem' }}>Over 300</h3>
              <p style={{ color: '#666' }}>Trainers & Coaches</p>
            </div>
            <div>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚽</div>
              <h3 style={{ fontSize: '1.5rem', color: '#333', marginBottom: '0.5rem' }}>Over 100</h3>
              <p style={{ color: '#666' }}>Courts & Fields</p>
            </div>
            <div>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔧</div>
              <h3 style={{ fontSize: '1.5rem', color: '#333', marginBottom: '0.5rem' }}>Over 150</h3>
              <p style={{ color: '#666' }}>Repair services</p>
            </div>
            <div>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏪</div>
              <h3 style={{ fontSize: '1.5rem', color: '#333', marginBottom: '0.5rem' }}>Over 20</h3>
              <p style={{ color: '#666' }}>Equipment stores</p>
            </div>
          </div>

          {/* Main Content */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '4rem',
            alignItems: 'start'
          }}>
            {/* Left: Visual Diagram */}
            <div>
              <div style={{
                marginBottom: '2rem'
              }}>
                <p style={{
                  color: '#10b981',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  marginBottom: '0.5rem'
                }}>For sport businesses</p>
                <h2 style={{
                  fontSize: '2.5rem',
                  fontWeight: 'bold',
                  color: '#1e3c72',
                  lineHeight: '1.2'
                }}>BE WHERE ATHLETES LOOK FIRST</h2>
              </div>

              {/* Visual diagram placeholder */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '1rem'
              }}>
                {['Coaches', 'Sport courts', 'Sport mates', 'Repair services', 'Equipment shops', 'Nutritionists'].map((item, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem'
                  }}>
                    <div style={{
                      background: '#10b981',
                      padding: '1rem',
                      borderRadius: '8px',
                      color: 'white',
                      textAlign: 'center',
                      fontWeight: 'bold'
                    }}>{item}</div>
                    <div style={{
                      background: '#1e3c72',
                      padding: '1rem',
                      borderRadius: '8px',
                      color: 'white',
                      textAlign: 'center',
                      fontWeight: 'bold'
                    }}>User</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Benefits List */}
            <div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div>
                  <h3 style={{
                    color: '#10b981',
                    fontSize: '1.3rem',
                    fontWeight: 'bold',
                    marginBottom: '0.5rem'
                  }}>Boost Your Visibility</h3>
                  <p style={{
                    color: '#666',
                    lineHeight: '1.6'
                  }}>Get your sports facility, coaching services, or equipment shop in front of thousands of potential clients.</p>
                </div>

                <div>
                  <h3 style={{
                    color: '#10b981',
                    fontSize: '1.3rem',
                    fontWeight: 'bold',
                    marginBottom: '0.5rem'
                  }}>Connect with Local Athletes</h3>
                  <p style={{
                    color: '#666',
                    lineHeight: '1.6'
                  }}>Sportisia brings you closer to your target audience, from amateurs to semi-professional athletes.</p>
                </div>

                <div>
                  <h3 style={{
                    color: '#10b981',
                    fontSize: '1.3rem',
                    fontWeight: 'bold',
                    marginBottom: '0.5rem'
                  }}>Showcase Your Expertise</h3>
                  <p style={{
                    color: '#666',
                    lineHeight: '1.6'
                  }}>Highlight your services, expertise, and unique offerings with a dedicated profile.</p>
                </div>

                <div>
                  <h3 style={{
                    color: '#10b981',
                    fontSize: '1.3rem',
                    fontWeight: 'bold',
                    marginBottom: '0.5rem'
                  }}>Expand Your Client Base</h3>
                  <p style={{
                    color: '#666',
                    lineHeight: '1.6'
                  }}>Our platform allows athletes to easily discover and contact you, leading to more inquiries.</p>
                </div>

                <div>
                  <h3 style={{
                    color: '#10b981',
                    fontSize: '1.3rem',
                    fontWeight: 'bold',
                    marginBottom: '0.5rem'
                  }}>It's Free to Join</h3>
                  <p style={{
                    color: '#666',
                    lineHeight: '1.6'
                  }}>There's no cost to list your services. Simply sign up and start showcasing what you offer.</p>
                </div>

                <div>
                  <h3 style={{
                    color: '#10b981',
                    fontSize: '1.3rem',
                    fontWeight: 'bold',
                    marginBottom: '0.5rem'
                  }}>Simple Setup and Support</h3>
                  <p style={{
                    color: '#666',
                    lineHeight: '1.6'
                  }}>We create your profile, add your services, and you start connecting with clients.</p>
                </div>
              </div>

              <Link
                to="/register"
                style={{
                  marginTop: '2rem',
                  padding: '1rem 2rem',
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  width: '100%',
                  display: 'block',
                  textAlign: 'center',
                  textDecoration: 'none'
                }}
              >
                Become member
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        background: '#1e3c72',
        padding: '3rem 2rem',
        textAlign: 'center',
        color: 'white'
      }}>
        <p style={{
          margin: 0,
          opacity: 0.9,
          fontSize: '1rem'
        }}>©2024 Sportisia. Toate drepturile rezervate.</p>
      </footer>
    </>
  )
}

export default Home
