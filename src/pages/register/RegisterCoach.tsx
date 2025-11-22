import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import API_BASE_URL from '../../config'
import { ROMANIAN_CITIES } from '../../data/romanian-cities'
import { ROMANIAN_COUNTIES } from '../../data/romanian-counties'
import MapSelector from '../../components/MapSelector'

const KNOWN_SPORTS = ['tenis', 'fotbal', 'baschet', 'volei', 'handbal', 'badminton', 'squash', 'ping-pong', 'atletism', 'inot', 'fitness', 'box', 'karate', 'judo', 'dans']

function RegisterCoach() {
  const navigate = useNavigate()
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
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [contactPerson, setContactPerson] = useState('')
  const [city, setCity] = useState('')
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
  const [sport, setSport] = useState('')
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
          setAvailableCities(Array.from(cityMap.values()).sort((a, b) => a.city.localeCompare(b.city)))
        }
      } catch (err) {
        console.error('Error loading cities:', err)
      }
    }
    loadCities()
  }, [])

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

      const formData = {
        facilityType: 'coach',
        name,
        phone,
        email,
        contactPerson,
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
        openingHours: JSON.stringify(openingHours),
        sport,
        specialization,
        experienceYears: experienceYears ? parseInt(experienceYears) : null,
        pricePerLesson: pricePerLesson ? parseFloat(pricePerLesson) : null,
        certifications,
        languages
      }

      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()
      if (data.success) {
        setCredentials({ username: data.username, password: data.password })
        setCurrentStep(6)
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
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '3rem',
          position: 'relative'
        }}>
          {steps.map((step, index) => {
            const stepNum = index + 1
            const isCompleted = currentStep > stepNum
            const isActive = currentStep === stepNum
            
            return (
              <div key={index} style={{ display: 'flex', alignItems: 'center', flex: 1, position: 'relative' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: isCompleted ? '#10b981' : isActive ? '#0f172a' : '#e2e8f0',
                  color: isCompleted || isActive ? 'white' : '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '600',
                  fontSize: '0.9375rem',
                  zIndex: 2,
                  boxShadow: isActive ? '0 4px 8px rgba(15, 23, 42, 0.2)' : 'none'
                }}>
                  {stepNum}
                </div>
                {index < steps.length - 1 && (
                  <div style={{
                    position: 'absolute',
                    left: '40px',
                    right: '40px',
                    height: '2px',
                    background: isCompleted ? '#10b981' : '#e2e8f0',
                    zIndex: 1
                  }} />
                )}
              </div>
            )
          })}
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
          {/* Step 1-3: Contact, Branding, Gallery - Same as RegisterRepairShop */}
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
              <p style={{ textAlign: 'center', color: '#64748b', padding: '2rem 0' }}>
                Câmpurile de contact sunt identice cu cele din RegisterRepairShop.
                Implementarea completă va include toate câmpurile (telefon, email, persoană contact, oraș, adresă, hartă).
              </p>
            </div>
          )}

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
              <p style={{ textAlign: 'center', color: '#64748b', padding: '2rem 0' }}>
                Câmpurile de branding sunt identice cu cele din RegisterRepairShop.
                Implementarea completă va include toate câmpurile (denumire, descriere, logo, website, rețele sociale).
              </p>
            </div>
          )}

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
              <p style={{ textAlign: 'center', color: '#64748b', padding: '2rem 0' }}>
                Câmpurile de galerie sunt identice cu cele din RegisterRepairShop.
                Implementarea completă va include upload-ul de imagini (max 10, 5MB/fișier).
              </p>
            </div>
          )}

          {/* Step 4: Sport Selection - Similar to RegisterSportsBase */}
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
              <p style={{ textAlign: 'center', color: '#64748b', padding: '2rem 0' }}>
                Implementarea completă va include selecția sportului (similar cu RegisterSportsBase Step 4).
              </p>
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

