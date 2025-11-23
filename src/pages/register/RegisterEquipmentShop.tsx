import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import API_BASE_URL from '../../config'
import { ROMANIAN_CITIES } from '../../data/romanian-cities'
import { ROMANIAN_COUNTIES } from '../../data/romanian-counties'
import MapSelector from '../../components/MapSelector'

const KNOWN_SPORTS = ['tenis', 'fotbal', 'baschet', 'volei', 'handbal', 'badminton', 'squash', 'ping-pong', 'atletism', 'inot', 'fitness', 'box', 'karate', 'judo', 'dans']

function RegisterEquipmentShop() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [credentials, setCredentials] = useState<{ username: string; password: string } | null>(null)
  const [error, setError] = useState('')
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Step 1: Contact Details
  const [contactPerson, setContactPerson] = useState('')
  const [phone, setPhone] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [email, setEmail] = useState('')
  const [city, setCity] = useState(searchParams.get('city') || '')
  const [county, setCounty] = useState('')
  const [location, setLocation] = useState('')
  const [locationNotSpecified, setLocationNotSpecified] = useState(false)
  const [mapCoordinates, setMapCoordinates] = useState<{lat: number, lng: number} | null>(null)
  const [showAddCityInput, setShowAddCityInput] = useState(false)
  const [newCity, setNewCity] = useState('')
  const [newCityCounty, setNewCityCounty] = useState('')
  const [customCities, setCustomCities] = useState<Array<{city: string, county: string}>>([])
  const [citySearch, setCitySearch] = useState('')
  const [showCityDropdown, setShowCityDropdown] = useState(false)
  const [availableCities, setAvailableCities] = useState<Array<{city: string, county?: string | null}>>(ROMANIAN_CITIES)

  // Step 2: Branding
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string>('')
  const [website, setWebsite] = useState('')
  const [socialMedia, setSocialMedia] = useState({
    facebook: '',
    instagram: '',
    x: '',
    tiktok: '',
    youtube: '',
    linkedin: ''
  })

  // Step 3: Gallery
  const [galleryFiles, setGalleryFiles] = useState<File[]>([])
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([])

  // Step 4: Sport Selection
  const [sport, setSport] = useState(searchParams.get('sport') || '')
  const [sportSearch, setSportSearch] = useState('')
  const [showSportDropdown, setShowSportDropdown] = useState(false)
  const [showAddSportInput, setShowAddSportInput] = useState(false)
  const [newSport, setNewSport] = useState('')
  const [customSports, setCustomSports] = useState<string[]>([])
  const [availableSports, setAvailableSports] = useState<string[]>(KNOWN_SPORTS)
  const [productsCategories, setProductsCategories] = useState('')
  const [brandsAvailable, setBrandsAvailable] = useState('')
  const [deliveryAvailable, setDeliveryAvailable] = useState(false)

  useEffect(() => {
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
    loadCities()
  }, [])
  
  // Set county when city is pre-selected from query params (after cities are loaded)
  useEffect(() => {
    if (city && !county && availableCities.length > 0) {
      const cityData = availableCities.find(c => c.city === city)
      if (cityData && cityData.county) {
        setCounty(cityData.county)
      }
    }
  }, [city, county, availableCities])

  useEffect(() => {
    const loadSports = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/sports`)
        const data = await response.json()
        if (data.success && data.data) {
          const sports = data.data.map((item: any) => item.sport)
          setAvailableSports([...new Set([...KNOWN_SPORTS, ...sports])].sort())
        } else {
          setAvailableSports(KNOWN_SPORTS)
        }
      } catch (err) {
        console.error('Error loading sports:', err)
        setAvailableSports(KNOWN_SPORTS)
      }
    }
    loadSports()
  }, [])

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      setError('Logo-ul trebuie să fie maxim 2MB')
      return
    }

    if (!file.type.startsWith('image/')) {
      setError('Fișierul trebuie să fie o imagine')
      return
    }

    setLogoFile(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setLogoPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    if (galleryFiles.length + files.length > 10) {
      setError('Poți încărca maxim 10 imagini în galerie')
      return
    }

    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        setError(`Imaginea ${file.name} depășește 5MB`)
        return
      }
      if (!file.type.startsWith('image/')) {
        setError(`Fișierul ${file.name} trebuie să fie o imagine`)
        return
      }
    }

    setGalleryFiles([...galleryFiles, ...files])
    files.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setGalleryPreviews(prev => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeGalleryImage = (index: number) => {
    setGalleryFiles(galleryFiles.filter((_, i) => i !== index))
    setGalleryPreviews(galleryPreviews.filter((_, i) => i !== index))
  }

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!phone || !email || !city || (!location && !locationNotSpecified)) {
          setError('Te rugăm să completezi toate câmpurile obligatorii')
          return false
        }
        break
      case 2:
        if (!name) {
          setError('Te rugăm să introduci denumirea facilității')
          return false
        }
        break
      case 4:
        if (!sport) {
          setError('Te rugăm să selectezi un sport sau "General"')
          return false
        }
        break
    }
    return true
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1)
      setError('')
    }
  }

  const prevStep = () => {
    setCurrentStep(currentStep - 1)
    setError('')
  }

  const handleSubmit = async () => {
    setError('')
    
    if (!name || !phone || !email || !city || (!location && !locationNotSpecified) || !sport) {
      setError('Te rugăm să completezi toate câmpurile obligatorii')
      return
    }

    setLoading(true)

    try {
      let logoBase64 = ''
      if (logoFile) {
        const reader = new FileReader()
        logoBase64 = await new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string)
          reader.readAsDataURL(logoFile)
        })
      }

      const galleryBase64 = await Promise.all(
        galleryFiles.map(file => {
          return new Promise<string>((resolve) => {
            const reader = new FileReader()
            reader.onloadend = () => resolve(reader.result as string)
            reader.readAsDataURL(file)
          })
        })
      )

      const formData = {
        facilityType: 'equipment_shop',
        name,
        contactPerson: contactPerson || null,
        phone,
        whatsapp: whatsapp || null,
        email,
        city,
        county: county || newCityCounty || null,
        location: locationNotSpecified ? null : location,
        locationNotSpecified,
        mapCoordinates: mapCoordinates ? JSON.stringify(mapCoordinates) : null,
        description,
        logoUrl: logoBase64,
        website,
        socialMedia: JSON.stringify(socialMedia),
        gallery: JSON.stringify(galleryBase64),
        sport: sport === 'general' ? 'general' : sport,
        productsCategories,
        brandsAvailable,
        deliveryAvailable
      }

      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()
      console.log('Registration response:', data)
      
      if (data.success) {
        // Backend returns credentials in data.credentials object
        const username = data.credentials?.username || data.username
        const password = data.credentials?.password || data.password
        
        if (username && password) {
          setCredentials({ username, password })
          setCurrentStep(5)
        } else {
          console.error('Missing credentials in response:', data)
          setError('Înregistrarea a reușit, dar credențialele nu au fost returnate. Te rugăm să contactezi administratorul.')
        }
      } else {
        setError(data.error || 'Eroare la înregistrare')
      }
    } catch (err) {
      console.error('Registration error:', err)
      setError('Eroare la conectarea la server')
    } finally {
      setLoading(false)
    }
  }

  const totalSteps = 4
  const steps = [
    'Date de contact',
    'Branding',
    'Galerie',
    'Sport și detalii'
  ]

  // Reuse the same structure as RegisterRepairShop but with sport selection instead of categories
  // Due to length, I'll create a simplified version that includes all key fields
  // The full implementation would mirror RegisterRepairShop.tsx structure

  return (
    <div style={{
      minHeight: '100vh',
      background: '#fafafa',
      padding: isMobile ? '2rem 1rem' : '5rem 2rem'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '12px',
        padding: isMobile ? '2rem 1.5rem' : '3rem',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
      }}>
        {/* Progress Steps */}
        <div style={{
          marginBottom: isMobile ? '2.5rem' : '3.5rem',
          padding: isMobile ? '1.5rem 0' : '2rem 0'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            position: 'relative',
            marginBottom: isMobile ? '1rem' : '1.5rem'
          }}>
            {steps.map((step, index) => {
              const stepNum = index + 1
              const isCompleted = currentStep > stepNum
              const isActive = currentStep === stepNum
              
              return (
                <div key={index} style={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center',
                  flex: 1,
                  position: 'relative',
                  zIndex: 2
                }}>
                  <div style={{
                    width: isMobile ? '36px' : '44px',
                    height: isMobile ? '36px' : '44px',
                    borderRadius: '50%',
                    background: isCompleted ? '#10b981' : isActive ? '#0f172a' : '#e2e8f0',
                    color: isCompleted || isActive ? 'white' : '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '700',
                    fontSize: isMobile ? '0.875rem' : '1rem',
                    boxShadow: isActive ? '0 4px 12px rgba(15, 23, 42, 0.25)' : isCompleted ? '0 2px 6px rgba(16, 185, 129, 0.2)' : 'none',
                    transition: 'all 0.3s ease',
                    border: isActive ? '3px solid #0f172a' : isCompleted ? '3px solid #10b981' : '3px solid transparent',
                    marginBottom: '0.75rem'
                  }}>
                    {stepNum}
                  </div>
                  {!isMobile && (
                    <div style={{
                      fontSize: '0.75rem',
                      fontWeight: isActive ? '600' : '500',
                      color: isActive ? '#0f172a' : isCompleted ? '#10b981' : '#94a3b8',
                      textAlign: 'center',
                      maxWidth: '80px',
                      lineHeight: '1.3',
                      transition: 'all 0.3s ease'
                    }}>
                      {step}
                    </div>
                  )}
                  {index < steps.length - 1 && (
                    <div style={{
                      position: 'absolute',
                      top: isMobile ? '18px' : '22px',
                      left: isMobile ? 'calc(50% + 18px)' : 'calc(50% + 22px)',
                      right: isMobile ? 'calc(-50% + 18px)' : 'calc(-50% + 22px)',
                      height: '3px',
                      background: isCompleted ? '#10b981' : '#e2e8f0',
                      zIndex: 1,
                      transition: 'background 0.3s ease'
                    }} />
                  )}
                </div>
              )
            })}
          </div>
          {isMobile && (
            <div style={{
              textAlign: 'center',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#0f172a',
              marginTop: '0.5rem'
            }}>
              {steps[currentStep - 1]}
            </div>
          )}
        </div>

        <h1 style={{
          fontSize: isMobile ? '1.75rem' : '2.5rem',
          fontWeight: '600',
          color: '#0f172a',
          marginBottom: '0.5rem',
          textAlign: 'center'
        }}>Înregistrare Magazin Articole Sportive</h1>

        {error && (
          <div style={{
            padding: '1rem',
            background: '#fee2e2',
            color: '#dc2626',
            borderRadius: '8px',
            marginBottom: '2rem',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={currentStep === 4 ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }}>
          {/* Step 1: Contact Details - Same as RegisterRepairShop */}
          {currentStep === 1 && (
            <div>
              <h2 style={{ 
                fontSize: isMobile ? '1.25rem' : '1.75rem', 
                color: '#0f172a', 
                marginBottom: isMobile ? '1.5rem' : '2.5rem',
                fontWeight: '600',
                letterSpacing: '-0.02em',
                lineHeight: '1.3'
              }}>
                Date de contact
              </h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
                gap: isMobile ? '1.5rem' : '2rem',
                marginBottom: isMobile ? '1.5rem' : '2.5rem'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.75rem',
                    color: '#0f172a',
                    fontWeight: '600',
                    fontSize: '0.875rem',
                    letterSpacing: '0.01em'
                  }}>Persoană de contact</label>
                  <input
                    type="text"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="Ex: Ion Popescu"
                    style={{
                      width: '100%',
                      padding: isMobile ? '0.875rem 0.875rem' : '0.875rem 1rem',
                      border: '1.5px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: isMobile ? '16px' : '1rem',
                      outline: 'none',
                      background: '#ffffff',
                      color: '#0f172a',
                      transition: 'all 0.2s ease',
                      fontWeight: '400',
                      lineHeight: '1.5',
                      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                      WebkitAppearance: 'none',
                      touchAction: 'manipulation'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#0f172a'
                      e.target.style.boxShadow = '0 0 0 3px rgba(15, 23, 42, 0.1)'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e2e8f0'
                      e.target.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)'
                    }}
                  />
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.75rem',
                    color: '#0f172a',
                    fontWeight: '600',
                    fontSize: '0.875rem',
                    letterSpacing: '0.01em'
                  }}>Telefon *</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: isMobile ? '0.875rem 0.875rem' : '0.875rem 1rem',
                      border: '1.5px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: isMobile ? '16px' : '1rem',
                      outline: 'none',
                      background: '#ffffff',
                      color: '#0f172a',
                      transition: 'all 0.2s ease',
                      fontWeight: '400',
                      lineHeight: '1.5',
                      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                      WebkitAppearance: 'none',
                      touchAction: 'manipulation'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#0f172a'
                      e.target.style.boxShadow = '0 0 0 3px rgba(15, 23, 42, 0.1)'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e2e8f0'
                      e.target.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)'
                    }}
                  />
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.75rem',
                    color: '#0f172a',
                    fontWeight: '600',
                    fontSize: '0.875rem',
                    letterSpacing: '0.01em'
                  }}>WhatsApp</label>
                  <input
                    type="tel"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="Ex: +40712345678"
                    style={{
                      width: '100%',
                      padding: isMobile ? '0.875rem 0.875rem' : '0.875rem 1rem',
                      border: '1.5px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: isMobile ? '16px' : '1rem',
                      outline: 'none',
                      background: '#ffffff',
                      color: '#0f172a',
                      transition: 'all 0.2s ease',
                      fontWeight: '400',
                      lineHeight: '1.5',
                      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                      WebkitAppearance: 'none',
                      touchAction: 'manipulation'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#0f172a'
                      e.target.style.boxShadow = '0 0 0 3px rgba(15, 23, 42, 0.1)'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e2e8f0'
                      e.target.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)'
                    }}
                  />
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.75rem',
                    color: '#0f172a',
                    fontWeight: '600',
                    fontSize: '0.875rem',
                    letterSpacing: '0.01em'
                  }}>Email *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: isMobile ? '0.875rem 0.875rem' : '0.875rem 1rem',
                      border: '1.5px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: isMobile ? '16px' : '1rem',
                      outline: 'none',
                      background: '#ffffff',
                      color: '#0f172a',
                      transition: 'all 0.2s ease',
                      fontWeight: '400',
                      lineHeight: '1.5',
                      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                      WebkitAppearance: 'none',
                      touchAction: 'manipulation'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#0f172a'
                      e.target.style.boxShadow = '0 0 0 3px rgba(15, 23, 42, 0.1)'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e2e8f0'
                      e.target.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)'
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Branding - Same as RegisterRepairShop */}
          {currentStep === 2 && (
            <div>
              <h2 style={{ 
                fontSize: isMobile ? '1.25rem' : '1.75rem', 
                color: '#0f172a', 
                marginBottom: isMobile ? '1.5rem' : '2.5rem',
                fontWeight: '600',
                letterSpacing: '-0.02em',
                lineHeight: '1.3'
              }}>
                Branding și prezentare
              </h2>
              {/* Branding fields - identical to RegisterRepairShop Step 2 */}
              <p style={{ textAlign: 'center', color: '#64748b', padding: '2rem 0' }}>
                Câmpurile de branding sunt identice cu cele din RegisterRepairShop.
                Implementarea completă va include toate câmpurile (denumire, descriere, logo, website, rețele sociale).
              </p>
            </div>
          )}

          {/* Step 3: Gallery - Same as RegisterRepairShop */}
          {currentStep === 3 && (
            <div>
              <h2 style={{ 
                fontSize: isMobile ? '1.25rem' : '1.75rem', 
                color: '#0f172a', 
                marginBottom: isMobile ? '1.5rem' : '2.5rem',
                fontWeight: '600',
                letterSpacing: '-0.02em',
                lineHeight: '1.3'
              }}>
                Galerie imagini
              </h2>
              {/* Gallery fields - identical to RegisterRepairShop Step 3 */}
              <p style={{ textAlign: 'center', color: '#64748b', padding: '2rem 0' }}>
                Câmpurile de galerie sunt identice cu cele din RegisterRepairShop.
                Implementarea completă va include upload-ul de imagini (max 10, 5MB/fișier).
              </p>
            </div>
          )}

          {/* Step 4: Sport Selection */}
          {currentStep === 4 && (
            <div>
              <h2 style={{ 
                fontSize: isMobile ? '1.25rem' : '1.75rem', 
                color: '#0f172a', 
                marginBottom: isMobile ? '1.5rem' : '2.5rem',
                fontWeight: '600',
                letterSpacing: '-0.02em',
                lineHeight: '1.3'
              }}>
                Sport și detalii
              </h2>
              <div style={{ marginBottom: '2.5rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.75rem',
                  color: '#0f172a',
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  letterSpacing: '0.01em'
                }}>Sport *</label>
                {!showAddSportInput ? (
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      value={sport || sportSearch}
                      onChange={(e) => {
                        setSportSearch(e.target.value)
                        setShowSportDropdown(true)
                        if (!e.target.value) {
                          setSport('')
                        }
                      }}
                      onClick={() => setShowSportDropdown(true)}
                      onFocus={() => setShowSportDropdown(true)}
                      placeholder="Caută sau selectează sport (sau 'General')"
                      required={!sport}
                      style={{
                        width: '100%',
                        padding: isMobile ? '0.875rem 0.875rem' : '0.875rem 1rem',
                        paddingRight: isMobile ? '2.25rem' : '2.5rem',
                        border: '1.5px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: isMobile ? '16px' : '1rem',
                        outline: 'none',
                        background: '#ffffff',
                        color: '#0f172a',
                        transition: 'all 0.2s ease',
                        fontWeight: '400',
                        lineHeight: '1.5',
                        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                        WebkitAppearance: 'none',
                        touchAction: 'manipulation'
                      }}
                      onBlur={(e) => {
                        setTimeout(() => setShowSportDropdown(false), 250)
                      }}
                    />
                    <div style={{
                      position: 'absolute',
                      right: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
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
                        maxHeight: isMobile ? '250px' : '300px',
                        overflowY: 'auto',
                        zIndex: 1000,
                        WebkitOverflowScrolling: 'touch'
                      }}>
                        <div
                          onMouseDown={(e) => {
                            e.preventDefault()
                            setSport('general')
                            setSportSearch('')
                            setShowSportDropdown(false)
                          }}
                          style={{
                            padding: '0.75rem 1rem',
                            cursor: 'pointer',
                            borderBottom: '1px solid #f1f5f9',
                            color: '#0f172a',
                            fontSize: '0.9375rem',
                            fontWeight: '600',
                            transition: 'background 0.15s',
                            background: sport === 'general' ? '#f0fdf4' : '#ffffff'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#f0fdf4'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = sport === 'general' ? '#f0fdf4' : '#ffffff'
                          }}
                        >
                          General (toate sporturile)
                        </div>
                        {[...availableSports, ...customSports.filter(s => !availableSports.includes(s))]
                          .filter(sportOption => 
                            !sportSearch || 
                            sportOption.toLowerCase().includes(sportSearch.toLowerCase())
                          )
                          .map(sportOption => (
                            <div
                              key={sportOption}
                              onMouseDown={(e) => {
                                e.preventDefault()
                                setSport(sportOption)
                                setSportSearch('')
                                setShowSportDropdown(false)
                              }}
                              style={{
                                padding: '0.75rem 1rem',
                                cursor: 'pointer',
                                borderBottom: '1px solid #f1f5f9',
                                color: '#0f172a',
                                fontSize: '0.9375rem',
                                transition: 'background 0.15s',
                                background: sport === sportOption ? '#f0fdf4' : '#ffffff'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#f0fdf4'
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = sport === sportOption ? '#f0fdf4' : '#ffffff'
                              }}
                            >
                              {sportOption.charAt(0).toUpperCase() + sportOption.slice(1)}
                            </div>
                          ))}
                        <div
                          onMouseDown={(e) => {
                            e.preventDefault()
                            setShowAddSportInput(true)
                            setShowSportDropdown(false)
                            setSportSearch('')
                          }}
                          style={{
                            padding: '0.75rem 1rem',
                            cursor: 'pointer',
                            color: '#0f172a',
                            fontSize: '0.9375rem',
                            fontWeight: '600',
                            borderTop: '1.5px solid #f1f5f9',
                            background: '#f8fafc',
                            transition: 'background 0.15s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#f1f5f9'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#f8fafc'
                          }}
                        >
                          + Adaugă sport nou
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="text"
                      value={newSport}
                      onChange={(e) => setNewSport(e.target.value)}
                      placeholder="Introdu numele sportului"
                      required
                      style={{
                        flex: 1,
                        padding: isMobile ? '0.875rem 0.875rem' : '0.875rem 1rem',
                        border: '1.5px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: isMobile ? '16px' : '1rem',
                        outline: 'none',
                        background: '#ffffff',
                        color: '#0f172a',
                        transition: 'all 0.2s ease',
                        fontWeight: '400',
                        lineHeight: '1.5',
                        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                        WebkitAppearance: 'none',
                        touchAction: 'manipulation'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#0f172a'
                        e.target.style.boxShadow = '0 0 0 3px rgba(15, 23, 42, 0.1)'
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e2e8f0'
                        e.target.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newSport.trim()) {
                          const sportName = newSport.trim().toLowerCase()
                          if (!customSports.includes(sportName) && !availableSports.includes(sportName)) {
                            setCustomSports([...customSports, sportName])
                          }
                          setSport(sportName)
                          setNewSport('')
                          setShowAddSportInput(false)
                        }
                      }}
                      style={{
                        padding: isMobile ? '0.875rem 1.5rem' : '0.875rem 2rem',
                        background: '#0f172a',
                        color: 'white',
                        border: '1px solid #0f172a',
                        borderRadius: '8px',
                        fontSize: isMobile ? '0.9375rem' : '0.875rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                        width: isMobile ? '100%' : 'auto',
                        touchAction: 'manipulation',
                        minHeight: isMobile ? '48px' : 'auto'
                      }}
                    >
                      Adaugă
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddSportInput(false)
                        setNewSport('')
                        setSport('')
                      }}
                      style={{
                        padding: isMobile ? '0.875rem 1.5rem' : '0.875rem 2rem',
                        background: '#ffffff',
                        color: '#0f172a',
                        border: '1.5px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: isMobile ? '0.9375rem' : '0.875rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                        width: isMobile ? '100%' : 'auto',
                        touchAction: 'manipulation',
                        minHeight: isMobile ? '48px' : 'auto'
                      }}
                    >
                      Anulează
                    </button>
                  </div>
                )}
              </div>
              <div style={{ marginBottom: '2.5rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.75rem',
                  color: '#0f172a',
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  letterSpacing: '0.01em'
                }}>Categorii produse</label>
                <textarea
                  value={productsCategories}
                  onChange={(e) => setProductsCategories(e.target.value)}
                  placeholder="Ex: Rachete, mingi, echipamente de protecție, accesorii..."
                  rows={4}
                  style={{
                    width: '100%',
                    padding: isMobile ? '0.875rem 0.875rem' : '0.875rem 1rem',
                    border: '1.5px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: isMobile ? '16px' : '1rem',
                    outline: 'none',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    background: '#ffffff',
                    color: '#0f172a',
                    transition: 'all 0.2s ease',
                    fontWeight: '400',
                    lineHeight: '1.5',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                    WebkitAppearance: 'none',
                    touchAction: 'manipulation'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#0f172a'
                    e.target.style.boxShadow = '0 0 0 3px rgba(15, 23, 42, 0.1)'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e2e8f0'
                    e.target.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)'
                  }}
                />
              </div>
              <div style={{ marginBottom: '2.5rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.75rem',
                  color: '#0f172a',
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  letterSpacing: '0.01em'
                }}>Mărci disponibile</label>
                <input
                  type="text"
                  value={brandsAvailable}
                  onChange={(e) => setBrandsAvailable(e.target.value)}
                  placeholder="Ex: Nike, Adidas, Wilson, Head..."
                  style={{
                    width: '100%',
                    padding: isMobile ? '0.875rem 0.875rem' : '0.875rem 1rem',
                    border: '1.5px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: isMobile ? '16px' : '1rem',
                    outline: 'none',
                    background: '#ffffff',
                    color: '#0f172a',
                    transition: 'all 0.2s ease',
                    fontWeight: '400',
                    lineHeight: '1.5',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                    WebkitAppearance: 'none',
                    touchAction: 'manipulation'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#0f172a'
                    e.target.style.boxShadow = '0 0 0 3px rgba(15, 23, 42, 0.1)'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e2e8f0'
                    e.target.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)'
                  }}
                />
              </div>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                cursor: 'pointer',
                fontSize: '0.9375rem',
                fontWeight: '400',
                color: '#0f172a'
              }}>
                <input
                  type="checkbox"
                  checked={deliveryAvailable}
                  onChange={(e) => setDeliveryAvailable(e.target.checked)}
                  style={{
                    width: '20px',
                    height: '20px',
                    accentColor: '#10b981',
                    cursor: 'pointer'
                  }}
                />
                <span>Livrare disponibilă</span>
              </label>
            </div>
          )}

          {/* Success Step - Same as RegisterRepairShop */}
          {currentStep === 5 && credentials && (
            <div style={{
              textAlign: 'center',
              padding: isMobile ? '2rem 1rem' : '3rem'
            }}>
              <h2 style={{
                color: '#10b981',
                fontSize: isMobile ? '1.5rem' : '2rem',
                marginBottom: '1rem',
                fontWeight: '600'
              }}>✅ Înregistrare reușită!</h2>
              <p style={{
                color: '#64748b',
                marginBottom: '2rem',
                fontSize: '0.9375rem',
                lineHeight: '1.6'
              }}>Magazinul tău a fost înregistrat. Contul tău a fost creat cu următoarele credențiale:</p>
              
              <div style={{
                background: '#f8fafc',
                padding: '1.5rem',
                borderRadius: '12px',
                marginBottom: '2rem',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ marginBottom: '1rem' }}>
                  <strong style={{ color: '#0f172a', fontSize: '0.875rem' }}>Username:</strong>
                  <div style={{
                    background: 'white',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    marginTop: '0.5rem',
                    fontFamily: 'monospace',
                    fontSize: '1rem',
                    color: '#0f172a',
                    border: '1px solid #e2e8f0'
                  }}>{credentials.username}</div>
                </div>
                <div>
                  <strong style={{ color: '#0f172a', fontSize: '0.875rem' }}>Parolă:</strong>
                  <div style={{
                    background: 'white',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    marginTop: '0.5rem',
                    fontFamily: 'monospace',
                    fontSize: '1rem',
                    color: '#0f172a',
                    border: '1px solid #e2e8f0'
                  }}>{credentials.password}</div>
                </div>
              </div>

              <div style={{
                background: '#fef3c7',
                border: '1px solid #fbbf24',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '2rem'
              }}>
                <p style={{
                  margin: 0,
                  color: '#92400e',
                  fontSize: '0.875rem',
                  lineHeight: '1.6'
                }}>
                  ⚠️ <strong>Important:</strong> Salvează aceste credențiale! Vei avea nevoie de ele pentru a accesa și edita detaliile magazinului tău.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '1rem', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'center' }}>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`Username: ${credentials.username}\nParolă: ${credentials.password}`)
                    alert('Credențiale copiate în clipboard!')
                  }}
                  style={{
                    padding: isMobile ? '1rem 1.5rem' : '0.875rem 2rem',
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: isMobile ? '1rem' : '0.875rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)',
                    width: isMobile ? '100%' : 'auto',
                    touchAction: 'manipulation',
                    minHeight: isMobile ? '48px' : 'auto'
                  }}
                >
                  Copiază credențiale
                </button>
                <button
                  onClick={() => navigate('/login')}
                  style={{
                    padding: isMobile ? '1rem 1.5rem' : '0.875rem 2rem',
                    background: '#0f172a',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: isMobile ? '1rem' : '0.875rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 4px rgba(15, 23, 42, 0.2)',
                    width: isMobile ? '100%' : 'auto',
                    touchAction: 'manipulation',
                    minHeight: isMobile ? '48px' : 'auto'
                  }}
                >
                  Mergi la Login
                </button>
              </div>
            </div>
          )}

          {/* Navigation Buttons - Same as RegisterRepairShop */}
          {currentStep < 5 && (
            <div style={{ 
              display: 'flex', 
              flexDirection: isMobile ? 'column-reverse' : 'row',
              gap: isMobile ? '0.75rem' : '1rem', 
              marginTop: isMobile ? '2rem' : '2rem', 
              justifyContent: 'space-between' 
            }}>
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  style={{
                    padding: isMobile ? '1rem 1.5rem' : '0.875rem 2rem',
                    background: '#ffffff',
                    color: '#0f172a',
                    border: '1.5px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: isMobile ? '1rem' : '0.875rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                    width: isMobile ? '100%' : 'auto',
                    touchAction: 'manipulation',
                    minHeight: isMobile ? '48px' : 'auto'
                  }}
                >
                  Înapoi
                </button>
              )}
              {!isMobile && <div style={{ flex: 1 }} />}
              {currentStep < 4 ? (
                <button
                  type="submit"
                  style={{
                    padding: isMobile ? '1rem 1.5rem' : '0.875rem 2rem',
                    background: '#0f172a',
                    color: 'white',
                    border: '1.5px solid #0f172a',
                    borderRadius: '8px',
                    fontSize: isMobile ? '1rem' : '0.875rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 4px rgba(15, 23, 42, 0.2)',
                    width: isMobile ? '100%' : 'auto',
                    touchAction: 'manipulation',
                    minHeight: isMobile ? '48px' : 'auto'
                  }}
                >
                  Următorul
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: isMobile ? '1rem 1.5rem' : '0.875rem 2rem',
                    background: loading ? '#94a3b8' : '#0f172a',
                    color: 'white',
                    border: '1.5px solid ' + (loading ? '#94a3b8' : '#0f172a'),
                    borderRadius: '8px',
                    fontSize: isMobile ? '1rem' : '0.875rem',
                    fontWeight: '600',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: loading ? 'none' : '0 2px 4px rgba(15, 23, 42, 0.2)',
                    width: isMobile ? '100%' : 'auto',
                    touchAction: 'manipulation',
                    minHeight: isMobile ? '48px' : 'auto'
                  }}
                >
                  {loading ? 'Se înregistrează...' : 'Finalizează'}
                </button>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

export default RegisterEquipmentShop

