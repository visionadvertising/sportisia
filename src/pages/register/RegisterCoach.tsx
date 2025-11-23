import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import API_BASE_URL from '../../config'
import { ROMANIAN_CITIES } from '../../data/romanian-cities'
import { ROMANIAN_COUNTIES } from '../../data/romanian-counties'
import MapSelector from '../../components/MapSelector'

const KNOWN_SPORTS = ['tenis', 'fotbal', 'baschet', 'volei', 'handbal', 'badminton', 'squash', 'ping-pong', 'atletism', 'inot', 'fitness', 'box', 'karate', 'judo', 'dans']

function RegisterCoach() {
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

  // Step 5: Coach Details
  const [specialization, setSpecialization] = useState('')
  const [experienceYears, setExperienceYears] = useState('')
  const [pricePerLesson, setPricePerLesson] = useState('')
  const [certifications, setCertifications] = useState('')
  const [languages, setLanguages] = useState('')
  const [openingHours, setOpeningHours] = useState<Record<string, {
    isOpen: boolean | null,
    openTime: string,
    closeTime: string
  }>>({
    monday: { isOpen: null, openTime: '09:00', closeTime: '18:00' },
    tuesday: { isOpen: null, openTime: '09:00', closeTime: '18:00' },
    wednesday: { isOpen: null, openTime: '09:00', closeTime: '18:00' },
    thursday: { isOpen: null, openTime: '09:00', closeTime: '18:00' },
    friday: { isOpen: null, openTime: '09:00', closeTime: '18:00' },
    saturday: { isOpen: null, openTime: '09:00', closeTime: '18:00' },
    sunday: { isOpen: null, openTime: '09:00', closeTime: '18:00' }
  })

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
          const allCities = Array.from(cityMap.values()).sort((a, b) => a.city.localeCompare(b.city))
          setAvailableCities(allCities)
          
          // Set county if city is pre-selected from query params
          if (city && !county) {
            const cityData = allCities.find(c => c.city === city)
            if (cityData && cityData.county) {
              setCounty(cityData.county)
            }
          }
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
          setError('Te rugăm să selectezi un sport')
          return false
        }
        break
      case 5:
        if (!specialization) {
          setError('Te rugăm să introduci specializarea')
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
    
    if (!name || !phone || !email || !city || (!location && !locationNotSpecified) || !sport || !specialization) {
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

      const formattedOpeningHours = Object.entries(openingHours).map(([day, data]) => {
        if (data.isOpen === null) return null
        if (data.isOpen === false) return `${day}: closed`
        return `${day}: ${data.openTime}-${data.closeTime}`
      }).filter(Boolean).join('; ')

      const formData = {
        facilityType: 'coach',
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
        description: description || null,
        logoUrl: logoBase64 || null,
        website: website || null,
        socialMedia: JSON.stringify(socialMedia),
        gallery: JSON.stringify(galleryBase64),
        openingHours: formattedOpeningHours || null,
        sport,
        specialization,
        experienceYears: experienceYears ? parseInt(experienceYears) : null,
        pricePerLesson: pricePerLesson ? parseFloat(pricePerLesson) : null,
        certifications: certifications || null,
        languages: languages || null
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
          setCurrentStep(6)
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

  const totalSteps = 5
  const steps = [
    'Date de contact',
    'Branding',
    'Galerie',
    'Sport',
    'Detalii antrenor'
  ]

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
        }}>Înregistrare Antrenor</h1>

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

        <form onSubmit={currentStep === 5 ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }}>
          {/* Step 1: Contact Details - Identical to RegisterRepairShop */}
          {currentStep === 1 && (
            <div>
              <div style={{
                background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)',
                borderRadius: '12px',
                padding: isMobile ? '1.5rem' : '2rem',
                marginBottom: isMobile ? '2rem' : '2.5rem',
                border: '1px solid #d1fae5'
              }}>
                <h2 style={{ 
                  fontSize: isMobile ? '1.25rem' : '1.75rem', 
                  color: '#0f172a', 
                  marginBottom: isMobile ? '1.25rem' : '1.5rem',
                  fontWeight: '700',
                  letterSpacing: '-0.02em',
                  lineHeight: '1.3',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}>
                  <div style={{
                    width: '4px',
                    height: isMobile ? '24px' : '28px',
                    background: '#10b981',
                    borderRadius: '2px'
                  }} />
                  Date de contact
                </h2>
                <p style={{
                  fontSize: isMobile ? '0.875rem' : '0.9375rem',
                  color: '#64748b',
                  marginBottom: isMobile ? '1.5rem' : '2rem',
                  lineHeight: '1.6'
                }}>
                  Completează informațiile de contact pentru facilitatea ta sportivă
                </p>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
                  gap: isMobile ? '1.5rem' : '2rem'
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
              
              {/* City Selection - Identical to RegisterRepairShop */}
              <div style={{ marginBottom: isMobile ? '1.5rem' : '2.5rem', position: 'relative' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.75rem',
                  color: '#0f172a',
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  letterSpacing: '0.01em'
                }}>Oraș *</label>
                {!showAddCityInput ? (
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      value={city || citySearch}
                      onChange={(e) => {
                        setCitySearch(e.target.value)
                        setShowCityDropdown(true)
                        if (!e.target.value) {
                          setCity('')
                          setCounty('')
                        }
                      }}
                      onClick={() => setShowCityDropdown(true)}
                      onFocus={() => setShowCityDropdown(true)}
                      placeholder="Caută sau selectează oraș"
                      required={!city}
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
                        setTimeout(() => setShowCityDropdown(false), 250)
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
                        maxHeight: isMobile ? '250px' : '300px',
                        overflowY: 'auto',
                        zIndex: 1000,
                        WebkitOverflowScrolling: 'touch'
                      }}>
                        {[...availableCities, ...customCities.filter(c => !availableCities.some(ac => ac.city === c.city))]
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
                                setCity(cityOption.city)
                                setCounty(cityOption.county || '')
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
                        <div
                          onMouseDown={(e) => {
                            e.preventDefault()
                            setShowAddCityInput(true)
                            setShowCityDropdown(false)
                            setCitySearch('')
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
                          + Adaugă oraș nou
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        type="text"
                        value={newCity}
                        onChange={(e) => setNewCity(e.target.value)}
                        placeholder="Introdu numele orașului"
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
                      <select
                        value={newCityCounty}
                        onChange={(e) => setNewCityCounty(e.target.value)}
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
                          touchAction: 'manipulation',
                          cursor: 'pointer'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#0f172a'
                          e.target.style.boxShadow = '0 0 0 3px rgba(15, 23, 42, 0.1)'
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#e2e8f0'
                          e.target.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)'
                        }}
                      >
                        <option value="">Selectează județul</option>
                        {ROMANIAN_COUNTIES.map(countyOption => (
                          <option key={countyOption} value={countyOption}>{countyOption}</option>
                        ))}
                      </select>
                    </div>
                    <div style={{ 
                      display: 'flex', 
                      flexDirection: isMobile ? 'column' : 'row',
                      gap: isMobile ? '0.75rem' : '1rem', 
                      marginTop: '0.5rem' 
                    }}>
                      <button
                        type="button"
                        onClick={() => {
                          if (newCity.trim() && newCityCounty) {
                            const cityName = newCity.trim()
                            const cityCounty = newCityCounty
                            if (!customCities.some(c => c.city === cityName) && !availableCities.some(c => c.city === cityName)) {
                              setCustomCities([...customCities, { city: cityName, county: cityCounty }])
                            }
                            setCity(cityName)
                            setCounty(cityCounty)
                            setNewCity('')
                            setNewCityCounty('')
                            setShowAddCityInput(false)
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
                        onMouseEnter={(e) => {
                          if (!isMobile) {
                            e.currentTarget.style.background = '#1e293b'
                            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)'
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isMobile) {
                            e.currentTarget.style.background = '#0f172a'
                            e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)'
                          }
                        }}
                      >
                        Adaugă
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddCityInput(false)
                          setNewCity('')
                          setNewCityCounty('')
                          setCity('')
                          setCounty('')
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
                        onMouseEnter={(e) => {
                          if (!isMobile) {
                            e.currentTarget.style.borderColor = '#0f172a'
                            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)'
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isMobile) {
                            e.currentTarget.style.borderColor = '#e2e8f0'
                            e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)'
                          }
                        }}
                      >
                        Anulează
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Location with Map - Identical to RegisterRepairShop */}
              <div style={{ marginBottom: isMobile ? '1.5rem' : '2.5rem' }}>
                <div style={{ 
                  display: 'flex', 
                  flexDirection: isMobile ? 'column' : 'row',
                  alignItems: isMobile ? 'flex-start' : 'center', 
                  gap: isMobile ? '0.75rem' : '0.5rem', 
                  marginBottom: '0.75rem' 
                }}>
                  <label style={{
                    display: 'block',
                    color: '#0f172a',
                    fontWeight: '600',
                    fontSize: '0.875rem',
                    letterSpacing: '0.01em',
                    margin: 0
                  }}>Adresă completă {!locationNotSpecified && '*'}</label>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.75rem',
                    marginLeft: isMobile ? '0' : 'auto'
                  }}>
                    <span style={{
                      fontSize: '0.875rem',
                      color: '#64748b',
                      fontWeight: '500'
                    }}>Nespecificat</span>
                    <button
                      type="button"
                      onClick={() => {
                        const newValue = !locationNotSpecified
                        setLocationNotSpecified(newValue)
                        if (newValue) {
                          setLocation('')
                          setMapCoordinates(null)
                        }
                      }}
                      style={{
                        position: 'relative',
                        width: isMobile ? '48px' : '44px',
                        height: isMobile ? '28px' : '24px',
                        borderRadius: '14px',
                        border: 'none',
                        background: locationNotSpecified ? '#10b981' : '#cbd5e1',
                        cursor: 'pointer',
                        transition: 'background 0.2s ease',
                        outline: 'none',
                        padding: 0,
                        touchAction: 'manipulation',
                        minWidth: isMobile ? '48px' : '44px'
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.2)'
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                    >
                      <div style={{
                        position: 'absolute',
                        top: '2px',
                        left: locationNotSpecified ? (isMobile ? '22px' : '22px') : '2px',
                        width: isMobile ? '24px' : '20px',
                        height: isMobile ? '24px' : '20px',
                        borderRadius: '50%',
                        background: '#ffffff',
                        transition: 'left 0.2s ease',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                      }} />
                    </button>
                  </div>
                </div>
                {!locationNotSpecified && (
                  <>
                    <textarea
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Ex: Strada Mihai Eminescu, Nr. 10, Bl. A1, Sc. 2, Ap. 15"
                      required={!locationNotSpecified}
                      rows={3}
                      style={{
                        width: '100%',
                        padding: '0.875rem 1rem',
                        border: '1.5px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        outline: 'none',
                        fontFamily: 'inherit',
                        resize: 'vertical',
                        marginBottom: isMobile ? '1rem' : '1.5rem',
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
                    <div style={{ marginBottom: isMobile ? '1rem' : '1.5rem' }}>
                      <MapSelector
                        location={location}
                        coordinates={mapCoordinates}
                        onLocationChange={setLocation}
                        onCoordinatesChange={setMapCoordinates}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Branding - Identical to RegisterRepairShop */}
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
              <div style={{ marginBottom: '2.5rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.75rem',
                  color: '#0f172a',
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  letterSpacing: '0.01em'
                }}>Denumire facilitate *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
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
              <div style={{ marginBottom: '2.5rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.75rem',
                  color: '#0f172a',
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  letterSpacing: '0.01em'
                }}>Descriere</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descrie serviciile tale de antrenament..."
                  rows={5}
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
                }}>Logo (max 2MB)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
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
                    touchAction: 'manipulation',
                    cursor: 'pointer'
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
                {logoPreview && (
                  <div style={{ marginTop: '1rem' }}>
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      style={{
                        marginTop: '0.5rem',
                        maxWidth: '200px',
                        maxHeight: '200px',
                        borderRadius: '8px',
                        border: '1px solid #e0e0e0'
                      }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none'
                      }}
                    />
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
                }}>Website</label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://example.com"
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
                }}>Rețele sociale</label>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
                  gap: isMobile ? '1.5rem' : '2rem'
                }}>
                  <input
                    type="url"
                    value={socialMedia.facebook}
                    onChange={(e) => setSocialMedia({ ...socialMedia, facebook: e.target.value })}
                    placeholder="Facebook URL"
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
                  <input
                    type="url"
                    value={socialMedia.instagram}
                    onChange={(e) => setSocialMedia({ ...socialMedia, instagram: e.target.value })}
                    placeholder="Instagram URL"
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
                  <input
                    type="url"
                    value={socialMedia.x}
                    onChange={(e) => setSocialMedia({ ...socialMedia, x: e.target.value })}
                    placeholder="X.com URL"
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
                  <input
                    type="url"
                    value={socialMedia.tiktok}
                    onChange={(e) => setSocialMedia({ ...socialMedia, tiktok: e.target.value })}
                    placeholder="TikTok URL"
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
                  <input
                    type="url"
                    value={socialMedia.youtube}
                    onChange={(e) => setSocialMedia({ ...socialMedia, youtube: e.target.value })}
                    placeholder="YouTube URL"
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
                  <input
                    type="url"
                    value={socialMedia.linkedin}
                    onChange={(e) => setSocialMedia({ ...socialMedia, linkedin: e.target.value })}
                    placeholder="LinkedIn URL"
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

          {/* Step 3: Gallery - Identical to RegisterRepairShop */}
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
              <div style={{ marginBottom: '2.5rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.75rem',
                  color: '#0f172a',
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  letterSpacing: '0.01em'
                }}>
                  Încarcă imagini (max 10, 5MB/fișier)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleGalleryChange}
                  disabled={galleryFiles.length >= 10}
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
                    touchAction: 'manipulation',
                    cursor: galleryFiles.length >= 10 ? 'not-allowed' : 'pointer',
                    opacity: galleryFiles.length >= 10 ? 0.5 : 1
                  }}
                  onFocus={(e) => {
                    if (galleryFiles.length < 10) {
                      e.target.style.borderColor = '#0f172a'
                      e.target.style.boxShadow = '0 0 0 3px rgba(15, 23, 42, 0.1)'
                    }
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e2e8f0'
                    e.target.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)'
                  }}
                />
                {galleryFiles.length > 0 && (
                  <p style={{ marginTop: '0.75rem', color: '#64748b', fontSize: '0.875rem', fontWeight: '400' }}>
                    {galleryFiles.length} / 10 imagini selectate
                  </p>
                )}
              </div>
              {galleryPreviews.length > 0 && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: isMobile ? '0.75rem' : '1.5rem',
                  marginTop: isMobile ? '1.5rem' : '2rem'
                }}>
                  {galleryPreviews.map((preview, index) => (
                    <div key={index} style={{ position: 'relative' }}>
                      <img
                        src={preview}
                        alt={`Gallery ${index + 1}`}
                        style={{
                          width: '100%',
                          height: isMobile ? '150px' : '200px',
                          objectFit: 'cover',
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(index)}
                        style={{
                          position: 'absolute',
                          top: '0.5rem',
                          right: '0.5rem',
                          background: '#dc2626',
                          color: 'white',
                          border: 'none',
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          cursor: 'pointer',
                          fontSize: '1.25rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: '600',
                          transition: 'opacity 0.2s',
                          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.opacity = '0.8'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.opacity = '1'
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {galleryPreviews.length === 0 && (
                <p style={{ 
                  color: '#64748b', 
                  textAlign: 'center', 
                  padding: '3rem 0',
                  fontSize: '0.875rem',
                  fontWeight: '400'
                }}>
                  Nu ai adăugat imagini încă. Poți sări peste acest pas.
                </p>
              )}
            </div>
          )}

          {/* Step 4: Sport Selection - Identical to RegisterSportsBase */}
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
                Sport
              </h2>
              
              {/* Sport Selection */}
              <div style={{ marginBottom: isMobile ? '1.5rem' : '2.5rem', position: 'relative' }}>
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
                      placeholder="Caută sau selectează sport"
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
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: isMobile ? 'column' : 'row',
                    gap: isMobile ? '0.75rem' : '1rem' 
                  }}>
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
                          if (!customSports.includes(sportName) && !KNOWN_SPORTS.includes(sportName)) {
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
                        border: '1.5px solid #0f172a',
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
                      onMouseEnter={(e) => {
                        if (!isMobile) {
                          e.currentTarget.style.background = '#1e293b'
                          e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isMobile) {
                          e.currentTarget.style.background = '#0f172a'
                          e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)'
                        }
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
                      onMouseEnter={(e) => {
                        if (!isMobile) {
                          e.currentTarget.style.borderColor = '#0f172a'
                          e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isMobile) {
                          e.currentTarget.style.borderColor = '#e2e8f0'
                          e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)'
                        }
                      }}
                    >
                      Anulează
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 5: Coach Details */}
          {currentStep === 5 && (
            <div>
              <h2 style={{ 
                fontSize: isMobile ? '1.25rem' : '1.75rem', 
                color: '#0f172a', 
                marginBottom: isMobile ? '1.5rem' : '2.5rem',
                fontWeight: '600',
                letterSpacing: '-0.02em',
                lineHeight: '1.3'
              }}>
                Detalii antrenor
              </h2>
              <div style={{ marginBottom: '2.5rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.75rem',
                  color: '#0f172a',
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  letterSpacing: '0.01em'
                }}>Specializare *</label>
                <input
                  type="text"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  required
                  placeholder="Ex: Antrenor personal, Antrenor de tenis, etc."
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
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
                gap: isMobile ? '1.5rem' : '2rem',
                marginBottom: '2.5rem'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.75rem',
                    color: '#0f172a',
                    fontWeight: '600',
                    fontSize: '0.875rem',
                    letterSpacing: '0.01em'
                  }}>Ani experiență</label>
                  <input
                    type="number"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value)}
                    min="0"
                    placeholder="Ex: 5"
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
                  }}>Preț pe lecție (RON)</label>
                  <input
                    type="number"
                    value={pricePerLesson}
                    onChange={(e) => setPricePerLesson(e.target.value)}
                    min="0"
                    step="0.01"
                    placeholder="Ex: 150"
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
              <div style={{ marginBottom: '2.5rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.75rem',
                  color: '#0f172a',
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  letterSpacing: '0.01em'
                }}>Certificări</label>
                <textarea
                  value={certifications}
                  onChange={(e) => setCertifications(e.target.value)}
                  placeholder="Ex: Licență antrenor, Certificat ITF, etc."
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
                }}>Limbi vorbite</label>
                <input
                  type="text"
                  value={languages}
                  onChange={(e) => setLanguages(e.target.value)}
                  placeholder="Ex: Română, Engleză, Franceză"
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
              <div style={{ marginBottom: '2.5rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.75rem',
                  color: '#0f172a',
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  letterSpacing: '0.01em'
                }}>Program</label>
                {/* Opening Hours - Same as Register.tsx */}
                <p style={{ textAlign: 'center', color: '#64748b', padding: '2rem 0' }}>
                  Implementarea completă va include programul pentru fiecare zi (similar cu Register.tsx Step 5).
                </p>
              </div>
            </div>
          )}

          {/* Success Step - Same as RegisterRepairShop */}
          {currentStep === 6 && credentials && (
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
              }}>Profilul tău de antrenor a fost înregistrat. Contul tău a fost creat cu următoarele credențiale:</p>
              
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
                  ⚠️ <strong>Important:</strong> Salvează aceste credențiale! Vei avea nevoie de ele pentru a accesa și edita profilul tău.
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
          {currentStep < 6 && (
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
              {currentStep < 5 ? (
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

export default RegisterCoach

