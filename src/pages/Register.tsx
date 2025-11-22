import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import API_BASE_URL from '../config'
import { ROMANIAN_CITIES } from '../data/romanian-cities'
import { ROMANIAN_COUNTIES } from '../data/romanian-counties'
import MapSelector from '../components/MapSelector'

type FacilityType = 'field' | 'coach' | 'repair_shop' | 'equipment_shop'

interface PricingDetail {
  title: string
  description: string
  price: number
}

function Register() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [credentials, setCredentials] = useState<{ username: string; password: string } | null>(null)
  const [error, setError] = useState('')

  // Step 1: Facility Type
  const [facilityType, setFacilityType] = useState<FacilityType | ''>('')

  // Step 2: Contact Details
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
  const [customCities, setCustomCities] = useState<Array<{city: string, county: string}>>([]) // Orașe adăugate de utilizator

  // Step 3: Branding
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

  // Step 4: Gallery
  const [galleryFiles, setGalleryFiles] = useState<File[]>([])
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([])

  // Step 5: Specific Details
  const [openingHours, setOpeningHours] = useState<Record<string, {
    isOpen: boolean | null, // null = not specified, false = closed, true = open
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
  
  // Field specific
  const [sport, setSport] = useState('')
  const [showAddSportInput, setShowAddSportInput] = useState(false)
  const [newSport, setNewSport] = useState('')
  const [customSports, setCustomSports] = useState<string[]>([]) // Sporturi adăugate de utilizator
  const [availableCities, setAvailableCities] = useState<Array<{city: string, county: string}>>([]) // Orașe aprobate din API
  const [availableSports, setAvailableSports] = useState<string[]>([]) // Sporturi aprobate din API
  const [pricingDetails, setPricingDetails] = useState<PricingDetail[]>([])
  const [hasParking, setHasParking] = useState(false)
  const [hasShower, setHasShower] = useState(false)
  const [hasChangingRoom, setHasChangingRoom] = useState(false)
  const [hasAirConditioning, setHasAirConditioning] = useState(false)
  const [hasLighting, setHasLighting] = useState(false)

  // Coach specific
  const [specialization, setSpecialization] = useState('')
  const [experienceYears, setExperienceYears] = useState('')
  const [certifications, setCertifications] = useState('')
  const [languages, setLanguages] = useState('')

  // Repair shop specific
  const [servicesOffered, setServicesOffered] = useState('')
  const [brandsServiced, setBrandsServiced] = useState('')
  const [averageRepairTime, setAverageRepairTime] = useState('')

  // Equipment shop specific
  const [productsCategories, setProductsCategories] = useState('')
  const [brandsAvailable, setBrandsAvailable] = useState('')
  const [deliveryAvailable, setDeliveryAvailable] = useState(false)

  const addPricingDetail = () => {
    setPricingDetails([...pricingDetails, { title: '', description: '', price: 0 }])
  }

  const removePricingDetail = (index: number) => {
    setPricingDetails(pricingDetails.filter((_, i) => i !== index))
  }

  const updatePricingDetail = (index: number, field: keyof PricingDetail, value: string | number) => {
    const updated = [...pricingDetails]
    updated[index] = { ...updated[index], [field]: value }
    setPricingDetails(updated)
  }


  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('Logo-ul trebuie să fie maxim 2MB')
      return
    }

    // Validate file type
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

  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    // Validate number of files (max 10 total)
    if (galleryFiles.length + files.length > 10) {
      setError('Poți încărca maxim 10 imagini în galerie')
      return
    }

    // Validate each file
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

    const newFiles = [...galleryFiles, ...files]
    setGalleryFiles(newFiles)

    // Create previews
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

  // Load approved cities and sports from API
  useEffect(() => {
    loadCities()
    loadSports()
  }, [])

  const loadCities = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/cities`)
      const data = await response.json()
      if (data.success && data.data) {
        // Combine standard cities with approved cities from API
        const apiCities = data.data.map((item: any) => ({
          city: item.city,
          county: item.county || ''
        }))
        // Create a map to avoid duplicates
        const cityMap = new Map<string, {city: string, county: string}>()
        // Add standard cities
        ROMANIAN_CITIES.forEach(c => {
          cityMap.set(c.city, c)
        })
        // Add API cities
        apiCities.forEach((c: {city: string, county: string}) => {
          if (!cityMap.has(c.city)) {
            cityMap.set(c.city, c)
          }
        })
        setAvailableCities(Array.from(cityMap.values()).sort((a, b) => a.city.localeCompare(b.city)))
      } else {
        setAvailableCities(ROMANIAN_CITIES)
      }
    } catch (err) {
      console.error('Error loading cities:', err)
      setAvailableCities(ROMANIAN_CITIES)
    }
  }

  const loadSports = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/sports`)
      const data = await response.json()
      if (data.success && data.data) {
        const sports = data.data.map((item: any) => item.sport)
        const standardSports = ['tenis', 'fotbal', 'baschet', 'volei', 'handbal', 'badminton', 'squash', 'ping-pong', 'atletism', 'inot', 'fitness', 'box', 'karate', 'judo', 'dans']
        setAvailableSports([...new Set([...standardSports, ...sports])].sort())
      } else {
        setAvailableSports(['tenis', 'fotbal', 'baschet', 'volei', 'handbal', 'badminton', 'squash', 'ping-pong', 'atletism', 'inot', 'fitness', 'box', 'karate', 'judo', 'dans'])
      }
    } catch (err) {
      console.error('Error loading sports:', err)
      setAvailableSports(['tenis', 'fotbal', 'baschet', 'volei', 'handbal', 'badminton', 'squash', 'ping-pong', 'atletism', 'inot', 'fitness', 'box', 'karate', 'judo', 'dans'])
    }
  }

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!facilityType) {
          setError('Te rugăm să alegi tipul facilității')
          return false
        }
        break
      case 2:
        if (!phone || !email || !city || (!location && !locationNotSpecified)) {
          setError('Telefon, email și oraș sunt obligatorii. Adresa este obligatorie dacă nu este bifată opțiunea "Nespecificat"')
          return false
        }
        break
      case 3:
        if (!name) {
          setError('Denumirea facilității este obligatorie')
          return false
        }
        break
      case 4:
        // Gallery is optional
        break
      case 5:
        if (facilityType === 'field' && !sport) {
          setError('Sportul este obligatoriu pentru terenuri')
          return false
        }
        if (facilityType === 'coach' && !specialization) {
          setError('Specializarea este obligatorie pentru antrenori')
          return false
        }
        break
    }
    setError('')
    return true
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    setCurrentStep(currentStep - 1)
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateStep(5)) return

    setLoading(true)
    setError('')

    try {
      // Prepare social media object (only non-empty values)
      const socialMediaFiltered: any = {}
      if (socialMedia.facebook) socialMediaFiltered.facebook = socialMedia.facebook
      if (socialMedia.instagram) socialMediaFiltered.instagram = socialMedia.instagram
      if (socialMedia.x) socialMediaFiltered.x = socialMedia.x
      if (socialMedia.tiktok) socialMediaFiltered.tiktok = socialMedia.tiktok
      if (socialMedia.youtube) socialMediaFiltered.youtube = socialMedia.youtube
      if (socialMedia.linkedin) socialMediaFiltered.linkedin = socialMedia.linkedin

      // Convert logo file to base64
      let logoBase64 = null
      if (logoFile) {
        logoBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(logoFile)
        })
      }

      // Convert gallery files to base64
      const galleryBase64: string[] = []
      for (const file of galleryFiles) {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(file)
        })
        galleryBase64.push(base64)
      }

      // Format opening hours
      const formattedOpeningHours = Object.entries(openingHours).map(([day, data]) => {
        if (data.isOpen === null) return null
        if (data.isOpen === false) return `${day}: closed`
        return `${day}: ${data.openTime}-${data.closeTime}`
      }).filter(Boolean).join('; ')

      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          facilityType,
          name,
          city,
          county: county || null,
          location: locationNotSpecified ? null : location,
          locationNotSpecified,
          mapCoordinates,
          phone,
          email,
          contactPerson: contactPerson || null,
          description: description || null,
          logoFile: logoBase64,
          website: website || null,
          socialMedia: Object.keys(socialMediaFiltered).length > 0 ? socialMediaFiltered : null,
          gallery: galleryBase64.length > 0 ? galleryBase64 : null,
          openingHours: formattedOpeningHours || null,
          // Field specific
          sport: facilityType === 'field' ? sport : null,
          pricePerHour: facilityType === 'field' && pricingDetails.length > 0 ? pricingDetails[0].price : null,
          pricingDetails: (facilityType === 'field' || facilityType === 'coach') && pricingDetails.length > 0 ? pricingDetails : null,
          hasParking: facilityType === 'field' ? hasParking : false,
          hasShower: facilityType === 'field' ? hasShower : false,
          hasChangingRoom: facilityType === 'field' ? hasChangingRoom : false,
          hasAirConditioning: facilityType === 'field' ? hasAirConditioning : false,
          hasLighting: facilityType === 'field' ? hasLighting : false,
          // Coach specific
          specialization: facilityType === 'coach' ? specialization : null,
          experienceYears: facilityType === 'coach' ? experienceYears : null,
          pricePerLesson: facilityType === 'coach' && pricingDetails.length > 0 ? pricingDetails[0].price : null,
          certifications: facilityType === 'coach' ? certifications : null,
          languages: facilityType === 'coach' ? languages : null,
          // Repair shop specific
          servicesOffered: facilityType === 'repair_shop' ? servicesOffered : null,
          brandsServiced: facilityType === 'repair_shop' ? brandsServiced : null,
          averageRepairTime: facilityType === 'repair_shop' ? averageRepairTime : null,
          // Equipment shop specific
          productsCategories: facilityType === 'equipment_shop' ? productsCategories : null,
          brandsAvailable: facilityType === 'equipment_shop' ? brandsAvailable : null,
          deliveryAvailable: facilityType === 'equipment_shop' ? deliveryAvailable : false
        })
      })

      const data = await response.json()

      if (data.success) {
        setCredentials(data.credentials)
      } else {
        setError(data.error || 'Eroare la înregistrare')
      }
    } catch (err) {
      setError('Eroare la conectarea la server')
      console.error('Registration error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (credentials) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '2rem'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '3rem',
          maxWidth: '600px',
          width: '100%',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
        }}>
          <h2 style={{
            color: '#10b981',
            fontSize: '2rem',
            marginBottom: '1rem',
            textAlign: 'center'
          }}>✅ Înregistrare reușită!</h2>
          <p style={{
            color: '#666',
            marginBottom: '2rem',
            textAlign: 'center'
          }}>Facilitatea ta a fost înregistrată. Contul tău a fost creat cu următoarele credențiale:</p>
          
          <div style={{
            background: '#f9fafb',
            padding: '1.5rem',
            borderRadius: '8px',
            marginBottom: '2rem'
          }}>
            <div style={{ marginBottom: '1rem' }}>
              <strong style={{ color: '#333' }}>Username:</strong>
              <div style={{
                background: 'white',
                padding: '0.75rem',
                borderRadius: '6px',
                marginTop: '0.5rem',
                fontFamily: 'monospace',
                fontSize: '1.1rem',
                color: '#1e3c72'
              }}>{credentials.username}</div>
            </div>
            <div>
              <strong style={{ color: '#333' }}>Parolă:</strong>
              <div style={{
                background: 'white',
                padding: '0.75rem',
                borderRadius: '6px',
                marginTop: '0.5rem',
                fontFamily: 'monospace',
                fontSize: '1.1rem',
                color: '#1e3c72'
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
              fontSize: '0.9rem'
            }}>
              ⚠️ <strong>Important:</strong> Salvează aceste credențiale! Vei avea nevoie de ele pentru a accesa și edita detaliile facilității tale.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => {
                navigator.clipboard.writeText(`Username: ${credentials.username}\nParolă: ${credentials.password}`)
                alert('Credențiale copiate în clipboard!')
              }}
              style={{
                flex: 1,
                padding: '0.75rem',
                background: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Copiază credențiale
            </button>
            <Link
              to="/login"
              style={{
                flex: 1,
                padding: '0.75rem',
                background: '#1e3c72',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: 'bold',
                textAlign: 'center',
                display: 'block'
              }}
            >
              Mergi la Login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const steps = [
    { number: 1, title: 'Tip facilitate' },
    { number: 2, title: 'Date de contact' },
    { number: 3, title: 'Branding' },
    { number: 4, title: 'Galerie' },
    { number: 5, title: 'Detalii specifice' }
  ]

  return (
    <div style={{
      minHeight: '100vh',
      background: '#fafafa',
      padding: '0'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '4rem 2rem',
        width: '100%'
      }}>
        <h1 style={{
          fontSize: '2rem',
          color: '#1a1a1a',
          marginBottom: '3rem',
          fontWeight: '300',
          letterSpacing: '-0.02em'
        }}>Înregistrare Facilitate</h1>

        {/* Progress Steps */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '4rem',
          position: 'relative',
          paddingBottom: '2rem',
          borderBottom: '1px solid #e5e5e5'
        }}>
          {steps.map((step, index) => (
            <div key={step.number} style={{ flex: 1, position: 'relative', zIndex: 1 }}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: currentStep >= step.number ? '#1a1a1a' : '#e5e5e5',
                  color: currentStep >= step.number ? 'white' : '#999',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '400',
                  fontSize: '0.875rem',
                  transition: 'all 0.2s'
                }}>
                  {currentStep > step.number ? '✓' : step.number}
                </div>
                <span style={{
                  fontSize: '0.75rem',
                  color: currentStep >= step.number ? '#1a1a1a' : '#999',
                  fontWeight: currentStep === step.number ? '500' : '400',
                  textAlign: 'center',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>{step.title}</span>
              </div>
              {index < steps.length - 1 && (
                <div style={{
                  position: 'absolute',
                  top: '16px',
                  left: 'calc(50% + 16px)',
                  right: 'calc(-50% + 16px)',
                  height: '1px',
                  background: currentStep > step.number ? '#1a1a1a' : '#e5e5e5',
                  zIndex: 0
                }} />
              )}
            </div>
          ))}
        </div>

        {error && (
          <div style={{
            background: '#fee2e2',
            border: '1px solid #ef4444',
            color: '#991b1b',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '2rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={currentStep === 5 ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }}>
          {/* Step 1: Facility Type */}
          {currentStep === 1 && (
            <div>
              <h2 style={{ 
                fontSize: '1.5rem', 
                color: '#1a1a1a', 
                marginBottom: '2rem',
                fontWeight: '400',
                letterSpacing: '-0.01em'
              }}>
                Alege tipul facilității
              </h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '1rem'
              }}>
                {[
                  { value: 'field', label: 'Teren Sportiv' },
                  { value: 'coach', label: 'Antrenor' },
                  { value: 'repair_shop', label: 'Magazin Reparații' },
                  { value: 'equipment_shop', label: 'Magazin Articole' }
                ].map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFacilityType(type.value as FacilityType)}
                    style={{
                      padding: '2rem',
                      border: facilityType === type.value ? '2px solid #1a1a1a' : '1px solid #e5e5e5',
                      borderRadius: '0',
                      background: facilityType === type.value ? '#1a1a1a' : 'transparent',
                      color: facilityType === type.value ? 'white' : '#1a1a1a',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      fontWeight: '400',
                      textAlign: 'left',
                      transition: 'all 0.2s',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Contact Details */}
          {currentStep === 2 && (
            <div>
              <h2 style={{ fontSize: '1.8rem', color: '#1e3c72', marginBottom: '1.5rem' }}>
                Date de contact
              </h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '1rem',
                marginBottom: '1rem'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    color: '#333',
                    fontWeight: '500'
                  }}>Telefon *</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #e0e0e0',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      outline: 'none'
                    }}
                  />
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    color: '#333',
                    fontWeight: '500'
                  }}>Email *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #e0e0e0',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      outline: 'none'
                    }}
                  />
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    color: '#333',
                    fontWeight: '500'
                  }}>Persoană de contact</label>
                  <input
                    type="text"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="Numele persoanei de contact"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #e0e0e0',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  color: '#333',
                  fontWeight: '500'
                }}>Oraș *</label>
                {!showAddCityInput ? (
                  <select
                    value={city}
                    onChange={(e) => {
                      if (e.target.value === '__add_new__') {
                        setShowAddCityInput(true)
                        setCity('')
                        setCounty('')
                      } else {
                        const selectedCity = availableCities.find(c => c.city === e.target.value) || 
                                            customCities.find(c => c.city === e.target.value)
                        setCity(e.target.value)
                        setCounty(selectedCity?.county || '')
                      }
                    }}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #e0e0e0',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="">Selectează oraș</option>
                    {availableCities.map(cityOption => (
                      <option key={cityOption.city} value={cityOption.city}>
                        {cityOption.city}{cityOption.county ? `, ${cityOption.county}` : ''}
                      </option>
                    ))}
                    {customCities.filter(c => !availableCities.some(ac => ac.city === c.city)).map(cityOption => (
                      <option key={cityOption.city} value={cityOption.city}>
                        {cityOption.city}{cityOption.county ? `, ${cityOption.county}` : ''}
                      </option>
                    ))}
                    <option value="__add_new__">+ Adaugă oraș nou</option>
                  </select>
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
                          padding: '0.75rem',
                          border: '2px solid #e0e0e0',
                          borderRadius: '8px',
                          fontSize: '1rem',
                          outline: 'none'
                        }}
                      />
                      <select
                        value={newCityCounty}
                        onChange={(e) => setNewCityCounty(e.target.value)}
                        required
                        style={{
                          flex: 1,
                          padding: '0.75rem',
                          border: '2px solid #e0e0e0',
                          borderRadius: '8px',
                          fontSize: '1rem',
                          outline: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="">Selectează județul</option>
                        {ROMANIAN_COUNTIES.map(countyOption => (
                          <option key={countyOption} value={countyOption}>{countyOption}</option>
                        ))}
                      </select>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        type="button"
                        onClick={() => {
                          if (newCity.trim() && newCityCounty) {
                            const cityName = newCity.trim()
                            const cityCounty = newCityCounty
                            // Adaugă orașul în lista locală pentru a-l putea selecta
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
                        padding: '0.75rem 1.5rem',
                        background: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        cursor: 'pointer'
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
                        padding: '0.75rem 1.5rem',
                        background: '#e5e7eb',
                        color: '#333',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                    >
                      Anulează
                    </button>
                  </div>
                  </div>
                )}
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <label style={{
                    display: 'block',
                    color: '#333',
                    fontWeight: '500',
                    margin: 0
                  }}>Adresă completă {!locationNotSpecified && '*'}</label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginLeft: 'auto' }}>
                    <input
                      type="checkbox"
                      checked={locationNotSpecified}
                      onChange={(e) => {
                        setLocationNotSpecified(e.target.checked)
                        if (e.target.checked) {
                          setLocation('')
                          setMapCoordinates(null)
                        }
                      }}
                      style={{ cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '0.9rem', color: '#666' }}>Nespecificat</span>
                  </label>
                </div>
                {!locationNotSpecified && (
                  <>
                    <textarea
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Introdu adresa completă (str., nr., bloc, etc.)"
                      required={!locationNotSpecified}
                      rows={3}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '2px solid #e0e0e0',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        outline: 'none',
                        fontFamily: 'inherit',
                        resize: 'vertical',
                        marginBottom: '1rem'
                      }}
                    />
                    <MapSelector
                      location={location}
                      coordinates={mapCoordinates}
                      onLocationChange={setLocation}
                      onCoordinatesChange={setMapCoordinates}
                    />
                  </>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Branding */}
          {currentStep === 3 && (
            <div>
              <h2 style={{ fontSize: '1.8rem', color: '#1e3c72', marginBottom: '1.5rem' }}>
                Branding și prezentare
              </h2>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  color: '#333',
                  fontWeight: '500'
                }}>Denumire facilitate *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    outline: 'none'
                  }}
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  color: '#333',
                  fontWeight: '500'
                }}>Descriere</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descrie facilitatea ta..."
                  rows={5}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    outline: 'none',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  color: '#333',
                  fontWeight: '500'
                }}>Logo (max 2MB)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    outline: 'none'
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
              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  color: '#333',
                  fontWeight: '500'
                }}>Website</label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://example.com"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    outline: 'none'
                  }}
                />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  color: '#333',
                  fontWeight: '500'
                }}>Rețele sociale</label>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '1rem'
                }}>
                  <input
                    type="url"
                    value={socialMedia.facebook}
                    onChange={(e) => setSocialMedia({ ...socialMedia, facebook: e.target.value })}
                    placeholder="Facebook URL"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #e0e0e0',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      outline: 'none'
                    }}
                  />
                  <input
                    type="url"
                    value={socialMedia.instagram}
                    onChange={(e) => setSocialMedia({ ...socialMedia, instagram: e.target.value })}
                    placeholder="Instagram URL"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #e0e0e0',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      outline: 'none'
                    }}
                  />
                  <input
                    type="url"
                    value={socialMedia.x}
                    onChange={(e) => setSocialMedia({ ...socialMedia, x: e.target.value })}
                    placeholder="X.com (Twitter) URL"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #e0e0e0',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      outline: 'none'
                    }}
                  />
                  <input
                    type="url"
                    value={socialMedia.tiktok}
                    onChange={(e) => setSocialMedia({ ...socialMedia, tiktok: e.target.value })}
                    placeholder="TikTok URL"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #e0e0e0',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      outline: 'none'
                    }}
                  />
                  <input
                    type="url"
                    value={socialMedia.youtube}
                    onChange={(e) => setSocialMedia({ ...socialMedia, youtube: e.target.value })}
                    placeholder="YouTube URL"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #e0e0e0',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      outline: 'none'
                    }}
                  />
                  <input
                    type="url"
                    value={socialMedia.linkedin}
                    onChange={(e) => setSocialMedia({ ...socialMedia, linkedin: e.target.value })}
                    placeholder="LinkedIn URL"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #e0e0e0',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Gallery */}
          {currentStep === 4 && (
            <div>
              <h2 style={{ fontSize: '1.8rem', color: '#1e3c72', marginBottom: '1.5rem' }}>
                Galerie imagini
              </h2>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  color: '#333',
                  fontWeight: '500'
                }}>
                  Încarcă imagini (max 10, 5MB/fișier)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleGalleryUpload}
                  disabled={galleryFiles.length >= 10}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    outline: 'none',
                    cursor: galleryFiles.length >= 10 ? 'not-allowed' : 'pointer'
                  }}
                />
                {galleryFiles.length > 0 && (
                  <p style={{ marginTop: '0.5rem', color: '#666', fontSize: '0.9rem' }}>
                    {galleryFiles.length} / 10 imagini selectate
                  </p>
                )}
              </div>
              {galleryPreviews.length > 0 && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                  gap: '1rem',
                  marginTop: '1rem'
                }}>
                  {galleryPreviews.map((preview, index) => (
                    <div key={index} style={{ position: 'relative' }}>
                      <img
                        src={preview}
                        alt={`Gallery ${index + 1}`}
                        style={{
                          width: '100%',
                          height: '150px',
                          objectFit: 'cover',
                          borderRadius: '8px',
                          border: '1px solid #e0e0e0'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(index)}
                        style={{
                          position: 'absolute',
                          top: '0.5rem',
                          right: '0.5rem',
                          background: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: '30px',
                          height: '30px',
                          cursor: 'pointer',
                          fontSize: '1.2rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {galleryPreviews.length === 0 && (
                <p style={{ color: '#666', fontStyle: 'italic', textAlign: 'center', padding: '2rem' }}>
                  Nu ai adăugat imagini încă. Poți sări peste acest pas.
                </p>
              )}
            </div>
          )}

          {/* Step 5: Specific Details */}
          {currentStep === 5 && (
            <div>
              <h2 style={{ fontSize: '1.8rem', color: '#1e3c72', marginBottom: '1.5rem' }}>
                Detalii specifice
              </h2>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  color: '#333',
                  fontWeight: '500'
                }}>Descriere</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    outline: 'none',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  color: '#333',
                  fontWeight: '500'
                }}>Program</label>
                <div style={{
                  background: '#f9fafb',
                  padding: '1.5rem',
                  borderRadius: '8px',
                  border: '1px solid #e0e0e0'
                }}>
                  {[
                    { key: 'monday', label: 'Luni' },
                    { key: 'tuesday', label: 'Marți' },
                    { key: 'wednesday', label: 'Miercuri' },
                    { key: 'thursday', label: 'Joi' },
                    { key: 'friday', label: 'Vineri' },
                    { key: 'saturday', label: 'Sâmbătă' },
                    { key: 'sunday', label: 'Duminică' }
                  ].map((day) => {
                    const dayData = openingHours[day.key as keyof typeof openingHours]
                    return (
                      <div key={day.key} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        marginBottom: '1rem',
                        paddingBottom: '1rem',
                        borderBottom: '1px solid #e0e0e0'
                      }}>
                        <div style={{ width: '100px', fontWeight: '500', color: '#333' }}>
                          {day.label}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                          <select
                            value={dayData.isOpen === null ? 'not_specified' : dayData.isOpen ? 'open' : 'closed'}
                            onChange={(e) => {
                              const newValue = e.target.value === 'not_specified' ? null : e.target.value === 'open'
                              setOpeningHours({
                                ...openingHours,
                                [day.key]: {
                                  ...dayData,
                                  isOpen: newValue
                                }
                              })
                            }}
                            style={{
                              padding: '0.5rem',
                              border: '2px solid #e0e0e0',
                              borderRadius: '6px',
                              fontSize: '0.9rem',
                              cursor: 'pointer'
                            }}
                          >
                            <option value="not_specified">Nu specifică</option>
                            <option value="open">Deschis</option>
                            <option value="closed">Închis</option>
                          </select>
                          {dayData.isOpen === true && (
                            <>
                              <input
                                type="time"
                                value={dayData.openTime}
                                onChange={(e) => {
                                  setOpeningHours({
                                    ...openingHours,
                                    [day.key]: {
                                      ...dayData,
                                      openTime: e.target.value
                                    }
                                  })
                                }}
                                style={{
                                  padding: '0.5rem',
                                  border: '2px solid #e0e0e0',
                                  borderRadius: '6px',
                                  fontSize: '0.9rem'
                                }}
                              />
                              <span style={{ color: '#666' }}>-</span>
                              <input
                                type="time"
                                value={dayData.closeTime}
                                onChange={(e) => {
                                  setOpeningHours({
                                    ...openingHours,
                                    [day.key]: {
                                      ...dayData,
                                      closeTime: e.target.value
                                    }
                                  })
                                }}
                                style={{
                                  padding: '0.5rem',
                                  border: '2px solid #e0e0e0',
                                  borderRadius: '6px',
                                  fontSize: '0.9rem'
                                }}
                              />
                            </>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Field Specific */}
              {facilityType === 'field' && (
                <div style={{
                  background: '#f9fafb',
                  padding: '1.5rem',
                  borderRadius: '8px',
                  marginBottom: '1.5rem'
                }}>
                  <h3 style={{ color: '#1e3c72', marginBottom: '1rem' }}>Detalii Teren</h3>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      color: '#333',
                      fontWeight: '500'
                    }}>Sport *</label>
                    {!showAddSportInput ? (
                      <select
                        value={sport}
                        onChange={(e) => {
                          if (e.target.value === '__add_new__') {
                            setShowAddSportInput(true)
                            setSport('')
                          } else {
                            setSport(e.target.value)
                          }
                        }}
                        required
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '2px solid #e0e0e0',
                          borderRadius: '8px',
                          fontSize: '1rem',
                          outline: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="">Selectează sport</option>
                        {availableSports.map(sportOption => (
                          <option key={sportOption} value={sportOption}>
                            {sportOption.charAt(0).toUpperCase() + sportOption.slice(1)}
                          </option>
                        ))}
                        {customSports.filter(s => !availableSports.includes(s)).map(sportOption => (
                          <option key={sportOption} value={sportOption}>
                            {sportOption.charAt(0).toUpperCase() + sportOption.slice(1)}
                          </option>
                        ))}
                        <option value="__add_new__">+ Adaugă sport nou</option>
                      </select>
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
                            padding: '0.75rem',
                            border: '2px solid #e0e0e0',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            outline: 'none'
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (newSport.trim()) {
                              const sportName = newSport.trim().toLowerCase()
                              // Adaugă sportul în lista locală pentru a-l putea selecta
                              const standardSports = ['tenis', 'fotbal', 'baschet', 'volei', 'handbal', 'badminton', 'squash']
                              if (!customSports.includes(sportName) && !standardSports.includes(sportName)) {
                                setCustomSports([...customSports, sportName])
                              }
                              setSport(sportName)
                              setNewSport('')
                              setShowAddSportInput(false)
                            }
                          }}
                          style={{
                            padding: '0.75rem 1.5rem',
                            background: '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            fontWeight: 'bold',
                            cursor: 'pointer'
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
                            padding: '0.75rem 1.5rem',
                            background: '#e5e7eb',
                            color: '#333',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                          }}
                        >
                          Anulează
                        </button>
                      </div>
                    )}
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <label style={{ color: '#333', fontWeight: '500' }}>Prețuri</label>
                      <button
                        type="button"
                        onClick={addPricingDetail}
                        style={{
                          padding: '0.5rem 1rem',
                          background: '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '0.9rem',
                          cursor: 'pointer'
                        }}
                      >
                        + Adaugă preț
                      </button>
                    </div>
                    {pricingDetails.map((detail, index) => (
                      <div key={index} style={{
                        background: 'white',
                        padding: '1rem',
                        borderRadius: '8px',
                        marginBottom: '1rem',
                        border: '1px solid #e0e0e0'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <span style={{ fontWeight: 'bold' }}>Preț #{index + 1}</span>
                          <button
                            type="button"
                            onClick={() => removePricingDetail(index)}
                            style={{
                              background: '#ef4444',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              padding: '0.25rem 0.5rem',
                              cursor: 'pointer',
                              fontSize: '0.85rem'
                            }}
                          >
                            Șterge
                          </button>
                        </div>
                        <div style={{ marginBottom: '0.5rem' }}>
                          <input
                            type="text"
                            placeholder="Titlu (ex: Preț pe oră, Preț pentru 2 ore)"
                            value={detail.title}
                            onChange={(e) => updatePricingDetail(index, 'title', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '0.5rem',
                              border: '1px solid #e0e0e0',
                              borderRadius: '6px',
                              fontSize: '0.9rem',
                              outline: 'none'
                            }}
                          />
                        </div>
                        <div style={{ marginBottom: '0.5rem' }}>
                          <textarea
                            placeholder="Descriere preț"
                            value={detail.description}
                            onChange={(e) => updatePricingDetail(index, 'description', e.target.value)}
                            rows={2}
                            style={{
                              width: '100%',
                              padding: '0.5rem',
                              border: '1px solid #e0e0e0',
                              borderRadius: '6px',
                              fontSize: '0.9rem',
                              outline: 'none',
                              fontFamily: 'inherit'
                            }}
                          />
                        </div>
                        <div>
                          <input
                            type="number"
                            placeholder="Preț (RON)"
                            value={detail.price || ''}
                            onChange={(e) => updatePricingDetail(index, 'price', parseFloat(e.target.value) || 0)}
                            min="0"
                            step="0.01"
                            style={{
                              width: '100%',
                              padding: '0.5rem',
                              border: '1px solid #e0e0e0',
                              borderRadius: '6px',
                              fontSize: '0.9rem',
                              outline: 'none'
                            }}
                          />
                        </div>
                      </div>
                    ))}
                    {pricingDetails.length === 0 && (
                      <p style={{ color: '#666', fontStyle: 'italic', textAlign: 'center', padding: '1rem' }}>
                        Adaugă cel puțin un preț
                      </p>
                    )}
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '1rem'
                  }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={hasParking}
                        onChange={(e) => setHasParking(e.target.checked)}
                      />
                      <span>Parcare</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={hasShower}
                        onChange={(e) => setHasShower(e.target.checked)}
                      />
                      <span>Dusuri</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={hasChangingRoom}
                        onChange={(e) => setHasChangingRoom(e.target.checked)}
                      />
                      <span>Vestiar</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={hasAirConditioning}
                        onChange={(e) => setHasAirConditioning(e.target.checked)}
                      />
                      <span>Aer condiționat</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={hasLighting}
                        onChange={(e) => setHasLighting(e.target.checked)}
                      />
                      <span>Iluminat</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Coach Specific */}
              {facilityType === 'coach' && (
                <div style={{
                  background: '#f9fafb',
                  padding: '1.5rem',
                  borderRadius: '8px',
                  marginBottom: '1.5rem'
                }}>
                  <h3 style={{ color: '#1e3c72', marginBottom: '1rem' }}>Detalii Antrenor</h3>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '1rem',
                    marginBottom: '1rem'
                  }}>
                    <div>
                      <label style={{
                        display: 'block',
                        marginBottom: '0.5rem',
                        color: '#333',
                        fontWeight: '500'
                      }}>Specializare *</label>
                      <input
                        type="text"
                        value={specialization}
                        onChange={(e) => setSpecialization(e.target.value)}
                        required
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '2px solid #e0e0e0',
                          borderRadius: '8px',
                          fontSize: '1rem',
                          outline: 'none'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{
                        display: 'block',
                        marginBottom: '0.5rem',
                        color: '#333',
                        fontWeight: '500'
                      }}>Ani experiență</label>
                      <input
                        type="number"
                        value={experienceYears}
                        onChange={(e) => setExperienceYears(e.target.value)}
                        min="0"
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '2px solid #e0e0e0',
                          borderRadius: '8px',
                          fontSize: '1rem',
                          outline: 'none'
                        }}
                      />
                    </div>
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      color: '#333',
                      fontWeight: '500'
                    }}>Certificări</label>
                    <textarea
                      value={certifications}
                      onChange={(e) => setCertifications(e.target.value)}
                      rows={3}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '2px solid #e0e0e0',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        outline: 'none',
                        fontFamily: 'inherit'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      color: '#333',
                      fontWeight: '500'
                    }}>Limbi vorbite</label>
                    <input
                      type="text"
                      value={languages}
                      onChange={(e) => setLanguages(e.target.value)}
                      placeholder="ex: Română, Engleză"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '2px solid #e0e0e0',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Repair Shop Specific */}
              {facilityType === 'repair_shop' && (
                <div style={{
                  background: '#f9fafb',
                  padding: '1.5rem',
                  borderRadius: '8px',
                  marginBottom: '1.5rem'
                }}>
                  <h3 style={{ color: '#1e3c72', marginBottom: '1rem' }}>Detalii Magazin Reparații</h3>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      color: '#333',
                      fontWeight: '500'
                    }}>Servicii oferite</label>
                    <textarea
                      value={servicesOffered}
                      onChange={(e) => setServicesOffered(e.target.value)}
                      rows={4}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '2px solid #e0e0e0',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        outline: 'none',
                        fontFamily: 'inherit'
                      }}
                    />
                  </div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '1rem'
                  }}>
                    <div>
                      <label style={{
                        display: 'block',
                        marginBottom: '0.5rem',
                        color: '#333',
                        fontWeight: '500'
                      }}>Mărci deservite</label>
                      <input
                        type="text"
                        value={brandsServiced}
                        onChange={(e) => setBrandsServiced(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '2px solid #e0e0e0',
                          borderRadius: '8px',
                          fontSize: '1rem',
                          outline: 'none'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{
                        display: 'block',
                        marginBottom: '0.5rem',
                        color: '#333',
                        fontWeight: '500'
                      }}>Timp mediu reparație</label>
                      <input
                        type="text"
                        value={averageRepairTime}
                        onChange={(e) => setAverageRepairTime(e.target.value)}
                        placeholder="ex: 2-3 zile"
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '2px solid #e0e0e0',
                          borderRadius: '8px',
                          fontSize: '1rem',
                          outline: 'none'
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Equipment Shop Specific */}
              {facilityType === 'equipment_shop' && (
                <div style={{
                  background: '#f9fafb',
                  padding: '1.5rem',
                  borderRadius: '8px',
                  marginBottom: '1.5rem'
                }}>
                  <h3 style={{ color: '#1e3c72', marginBottom: '1rem' }}>Detalii Magazin Articole Sportive</h3>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      color: '#333',
                      fontWeight: '500'
                    }}>Categorii produse</label>
                    <textarea
                      value={productsCategories}
                      onChange={(e) => setProductsCategories(e.target.value)}
                      rows={4}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '2px solid #e0e0e0',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        outline: 'none',
                        fontFamily: 'inherit'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      color: '#333',
                      fontWeight: '500'
                    }}>Mărci disponibile</label>
                    <input
                      type="text"
                      value={brandsAvailable}
                      onChange={(e) => setBrandsAvailable(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '2px solid #e0e0e0',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        outline: 'none'
                      }}
                    />
                  </div>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    cursor: 'pointer',
                    marginTop: '1rem'
                  }}>
                    <input
                      type="checkbox"
                      checked={deliveryAvailable}
                      onChange={(e) => setDeliveryAvailable(e.target.checked)}
                    />
                    <span>Livrare disponibilă</span>
                  </label>
                </div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', justifyContent: 'space-between' }}>
            {currentStep > 1 && (
              <button
                type="button"
                onClick={prevStep}
                style={{
                  padding: '0.875rem 2rem',
                  background: 'transparent',
                  color: '#1a1a1a',
                  border: '1px solid #e5e5e5',
                  borderRadius: '0',
                  fontSize: '0.875rem',
                  fontWeight: '400',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#1a1a1a'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e5e5e5'
                }}
              >
                Înapoi
              </button>
            )}
            <div style={{ flex: 1 }} />
            {currentStep < 5 ? (
              <button
                type="submit"
                style={{
                  padding: '0.875rem 2rem',
                  background: '#1a1a1a',
                  color: 'white',
                  border: '1px solid #1a1a1a',
                  borderRadius: '0',
                  fontSize: '0.875rem',
                  fontWeight: '400',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.8'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1'
                }}
              >
                Următorul
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '0.875rem 2rem',
                  background: loading ? '#999' : '#1a1a1a',
                  color: 'white',
                  border: '1px solid ' + (loading ? '#999' : '#1a1a1a'),
                  borderRadius: '0',
                  fontSize: '0.875rem',
                  fontWeight: '400',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  transition: 'all 0.2s'
                }}
              >
                {loading ? 'Se înregistrează...' : 'Finalizează'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

export default Register
