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
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

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
  const [citySearch, setCitySearch] = useState('')
  const [showCityDropdown, setShowCityDropdown] = useState(false)
  const [sportSearch, setSportSearch] = useState('')
  const [showSportDropdown, setShowSportDropdown] = useState(false)

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
      const response = await fetch(`${API_BASE_URL}/api/cities`)
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
      const response = await fetch(`${API_BASE_URL}/api/sports`)
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
      background: '#ffffff',
      padding: '0'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: isMobile ? '2rem 1rem' : '5rem 2rem',
        width: '100%'
      }}>
        <h1 style={{
          fontSize: isMobile ? '1.75rem' : '2.5rem',
          color: '#0f172a',
          marginBottom: isMobile ? '2rem' : '4rem',
          fontWeight: '600',
          letterSpacing: '-0.03em',
          lineHeight: '1.2'
        }}>Înregistrare Facilitate</h1>

        {/* Progress Steps */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: isMobile ? '2rem' : '5rem',
          position: 'relative',
          paddingBottom: isMobile ? '1.5rem' : '3rem',
          borderBottom: '1px solid #f1f5f9',
          flexWrap: isMobile ? 'wrap' : 'nowrap',
          gap: isMobile ? '1rem' : '0'
        }}>
          {steps.map((step, index) => (
            <div key={step.number} style={{ 
              flex: isMobile ? '0 0 calc(50% - 0.5rem)' : 1, 
              position: 'relative', 
              zIndex: 1,
              marginBottom: isMobile && index < steps.length - 2 ? '1rem' : '0'
            }}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: isMobile ? '0.5rem' : '1rem'
              }}>
                <div style={{
                  width: isMobile ? '32px' : '40px',
                  height: isMobile ? '32px' : '40px',
                  borderRadius: '50%',
                  background: currentStep > step.number ? '#10b981' : currentStep === step.number ? '#0f172a' : '#f1f5f9',
                  color: currentStep > step.number ? 'white' : currentStep === step.number ? 'white' : '#94a3b8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '600',
                  fontSize: isMobile ? '0.8125rem' : '0.9375rem',
                  transition: 'all 0.3s ease',
                  boxShadow: currentStep >= step.number ? (currentStep > step.number ? '0 2px 8px rgba(16, 185, 129, 0.25)' : '0 2px 8px rgba(15, 23, 42, 0.15)') : 'none'
                }}>
                  {step.number}
                </div>
                <span style={{
                  fontSize: isMobile ? '0.6875rem' : '0.8125rem',
                  color: currentStep > step.number ? '#10b981' : currentStep >= step.number ? '#0f172a' : '#94a3b8',
                  fontWeight: currentStep >= step.number ? '600' : '500',
                  textAlign: 'center',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  lineHeight: '1.2'
                }}>{step.title}</span>
              </div>
              {index < steps.length - 1 && !isMobile && (
                <div style={{
                  position: 'absolute',
                  top: '20px',
                  left: 'calc(50% + 20px)',
                  right: 'calc(-50% + 20px)',
                  height: '2px',
                  background: currentStep > step.number ? '#10b981' : '#f1f5f9',
                  zIndex: 0,
                  transition: 'all 0.3s ease'
                }} />
              )}
            </div>
          ))}
        </div>

        {error && (
          <div style={{
            background: '#fef2f2',
            border: '1.5px solid #fca5a5',
            color: '#991b1b',
            padding: '1rem 1.25rem',
            borderRadius: '8px',
            marginBottom: '2rem',
            fontSize: '0.9375rem',
            fontWeight: '500',
            boxShadow: '0 1px 3px rgba(239, 68, 68, 0.1)'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={currentStep === 5 ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }}>
          {/* Step 1: Facility Type */}
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
                Alege tipul facilității
              </h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
                gap: isMobile ? '0.75rem' : '1.25rem'
              }}>
                {[
                  { 
                    value: 'field', 
                    label: 'Teren Sportiv',
                    icon: (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <line x1="3" y1="9" x2="21" y2="9"/>
                        <line x1="9" y1="21" x2="9" y2="9"/>
                      </svg>
                    )
                  },
                  { 
                    value: 'coach', 
                    label: 'Antrenor',
                    icon: (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                      </svg>
                    )
                  },
                  { 
                    value: 'repair_shop', 
                    label: 'Magazin Reparații',
                    icon: (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                      </svg>
                    )
                  },
                  { 
                    value: 'equipment_shop', 
                    label: 'Magazin Articole',
                    icon: (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                        <line x1="3" y1="6" x2="21" y2="6"/>
                        <path d="M16 10a4 4 0 0 1-8 0"/>
                      </svg>
                    )
                  }
                ].map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFacilityType(type.value as FacilityType)}
                    style={{
                      padding: isMobile ? '1rem' : '1.5rem',
                      border: facilityType === type.value ? '2px solid #0f172a' : '1.5px solid #e2e8f0',
                      borderRadius: '12px',
                      background: facilityType === type.value ? '#0f172a' : '#ffffff',
                      color: facilityType === type.value ? 'white' : '#0f172a',
                      cursor: 'pointer',
                      fontSize: isMobile ? '0.9375rem' : '1rem',
                      fontWeight: '600',
                      textAlign: 'left',
                      transition: 'all 0.2s ease',
                      boxShadow: facilityType === type.value ? '0 4px 12px rgba(15, 23, 42, 0.15)' : '0 1px 3px rgba(0, 0, 0, 0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: isMobile ? '0.75rem' : '1rem',
                      minHeight: isMobile ? '60px' : 'auto'
                    }}
                    onMouseEnter={(e) => {
                      if (facilityType !== type.value) {
                        e.currentTarget.style.borderColor = '#0f172a'
                        e.currentTarget.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.1)'
                        e.currentTarget.style.transform = 'translateY(-2px)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (facilityType !== type.value) {
                        e.currentTarget.style.borderColor = '#e2e8f0'
                        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)'
                        e.currentTarget.style.transform = 'translateY(0)'
                      }
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: isMobile ? '36px' : '40px',
                      height: isMobile ? '36px' : '40px',
                      borderRadius: '8px',
                      background: facilityType === type.value ? 'rgba(255, 255, 255, 0.15)' : '#f8fafc',
                      flexShrink: 0
                    }}>
                      <div style={{ 
                        width: isMobile ? '20px' : '24px', 
                        height: isMobile ? '20px' : '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {type.icon}
                      </div>
                    </div>
                    <span>{type.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Contact Details */}
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
              </div>
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
                        setTimeout(() => setShowCityDropdown(false), 200)
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
                      <div                       style={{
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
                              onClick={() => {
                                setCity(cityOption.city)
                                setCounty(cityOption.county)
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
                        <div
                          onClick={() => {
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
                          padding: '0.875rem 0',
                          border: 'none',
                          borderBottom: '1px solid #e5e5e5',
                          borderRadius: '0',
                          fontSize: '1rem',
                          outline: 'none',
                          background: 'transparent',
                          color: '#1a1a1a',
                          transition: 'border-color 0.2s'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderBottomColor = '#1a1a1a'
                        }}
                        onBlur={(e) => {
                          e.target.style.borderBottomColor = '#e5e5e5'
                        }}
                      />
                      <select
                        value={newCityCounty}
                        onChange={(e) => setNewCityCounty(e.target.value)}
                        required
                        style={{
                          flex: 1,
                          padding: '0.875rem 0',
                          border: 'none',
                          borderBottom: '1px solid #e5e5e5',
                          borderRadius: '0',
                          fontSize: '1rem',
                          outline: 'none',
                          cursor: 'pointer',
                          background: 'transparent',
                          color: '#1a1a1a',
                          transition: 'border-color 0.2s'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderBottomColor = '#1a1a1a'
                        }}
                        onBlur={(e) => {
                          e.target.style.borderBottomColor = '#e5e5e5'
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
                      marginTop: '1rem' 
                    }}>
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
                        transition: 'opacity 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = '0.8'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = '1'
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
                        transition: 'border-color 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#1a1a1a'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#e5e5e5'
                      }}
                    >
                      Anulează
                    </button>
                  </div>
                  </div>
                )}
              </div>
              <div style={{ marginBottom: '2.5rem' }}>
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

          {/* Step 3: Branding */}
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
                Branding și prezentare
              </h2>
              <div style={{ marginBottom: '2.5rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.75rem',
                  color: '#1a1a1a',
                  fontWeight: '400',
                  fontSize: '0.875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>Denumire facilitate *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.875rem 0',
                    border: 'none',
                    borderBottom: '1px solid #e5e5e5',
                    borderRadius: '0',
                    fontSize: '1rem',
                    outline: 'none',
                    background: 'transparent',
                    color: '#1a1a1a',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderBottomColor = '#1a1a1a'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderBottomColor = '#e5e5e5'
                  }}
                />
              </div>
              <div style={{ marginBottom: '2.5rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.75rem',
                  color: '#1a1a1a',
                  fontWeight: '400',
                  fontSize: '0.875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>Descriere</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descrie facilitatea ta..."
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
                  color: '#1a1a1a',
                  fontWeight: '400',
                  fontSize: '0.875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>Logo (max 2MB)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  style={{
                    width: '100%',
                    padding: '0.875rem 0',
                    border: 'none',
                    borderBottom: '1px solid #e5e5e5',
                    borderRadius: '0',
                    fontSize: '1rem',
                    outline: 'none',
                    background: 'transparent',
                    color: '#1a1a1a',
                    cursor: 'pointer',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderBottomColor = '#1a1a1a'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderBottomColor = '#e5e5e5'
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
                  color: '#1a1a1a',
                  fontWeight: '400',
                  fontSize: '0.875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>Website</label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://example.com"
                  style={{
                    width: '100%',
                    padding: '0.875rem 0',
                    border: 'none',
                    borderBottom: '1px solid #e5e5e5',
                    borderRadius: '0',
                    fontSize: '1rem',
                    outline: 'none',
                    background: 'transparent',
                    color: '#1a1a1a',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderBottomColor = '#1a1a1a'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderBottomColor = '#e5e5e5'
                  }}
                />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.75rem',
                  color: '#1a1a1a',
                  fontWeight: '400',
                  fontSize: '0.875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
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

          {/* Step 4: Gallery */}
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
                Galerie imagini
              </h2>
              <div style={{ marginBottom: '2.5rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.75rem',
                  color: '#1a1a1a',
                  fontWeight: '400',
                  fontSize: '0.875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
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
                    padding: '0.875rem 0',
                    border: 'none',
                    borderBottom: '1px solid #e5e5e5',
                    borderRadius: '0',
                    fontSize: '1rem',
                    outline: 'none',
                    background: 'transparent',
                    color: '#1a1a1a',
                    cursor: galleryFiles.length >= 10 ? 'not-allowed' : 'pointer',
                    transition: 'border-color 0.2s',
                    opacity: galleryFiles.length >= 10 ? 0.5 : 1
                  }}
                  onFocus={(e) => {
                    if (galleryFiles.length < 10) {
                      e.target.style.borderBottomColor = '#1a1a1a'
                    }
                  }}
                  onBlur={(e) => {
                    e.target.style.borderBottomColor = '#e5e5e5'
                  }}
                />
                {galleryFiles.length > 0 && (
                  <p style={{ marginTop: '0.75rem', color: '#666', fontSize: '0.875rem', fontWeight: '400' }}>
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
                          border: '1px solid #e5e5e5'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(index)}
                        style={{
                          position: 'absolute',
                          top: '0.5rem',
                          right: '0.5rem',
                          background: '#1a1a1a',
                          color: 'white',
                          border: 'none',
                          width: '32px',
                          height: '32px',
                          cursor: 'pointer',
                          fontSize: '1rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: '300',
                          transition: 'opacity 0.2s'
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
                  color: '#999', 
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

          {/* Step 5: Specific Details */}
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
                Detalii specifice
              </h2>

              <div style={{ marginBottom: '2.5rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.75rem',
                  color: '#1a1a1a',
                  fontWeight: '400',
                  fontSize: '0.875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>Program</label>
                <div style={{
                  padding: '0'
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
                        flexDirection: isMobile ? 'column' : 'row',
                        alignItems: isMobile ? 'flex-start' : 'center',
                        gap: isMobile ? '0.75rem' : '2rem',
                        marginBottom: isMobile ? '1rem' : '1.5rem',
                        paddingBottom: isMobile ? '1rem' : '1.5rem',
                        borderBottom: '1px solid #e5e5e5'
                      }}>
                        <div style={{ 
                          width: isMobile ? '100%' : '120px', 
                          fontWeight: '400', 
                          color: '#0f172a',
                          fontSize: '0.875rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}>
                          {day.label}
                        </div>
                        <div style={{ 
                          display: 'flex', 
                          flexDirection: isMobile ? 'column' : 'row',
                          alignItems: isMobile ? 'stretch' : 'center', 
                          gap: isMobile ? '0.75rem' : '1rem', 
                          flex: 1,
                          width: isMobile ? '100%' : 'auto'
                        }}>
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
                              padding: isMobile ? '0.75rem 1rem' : '0.5rem 0',
                              border: isMobile ? '1.5px solid #e2e8f0' : 'none',
                              borderBottom: isMobile ? 'none' : '1px solid #e5e5e5',
                              borderRadius: isMobile ? '8px' : '0',
                              fontSize: isMobile ? '16px' : '0.875rem',
                              cursor: 'pointer',
                              background: isMobile ? '#ffffff' : 'transparent',
                              color: '#0f172a',
                              transition: 'all 0.2s ease',
                              boxShadow: isMobile ? '0 1px 2px rgba(0, 0, 0, 0.05)' : 'none',
                              width: isMobile ? '100%' : 'auto',
                              WebkitAppearance: 'none',
                              touchAction: 'manipulation'
                            }}
                            onFocus={(e) => {
                              if (isMobile) {
                                e.target.style.borderColor = '#0f172a'
                                e.target.style.boxShadow = '0 0 0 3px rgba(15, 23, 42, 0.1)'
                              } else {
                                e.target.style.borderBottomColor = '#0f172a'
                              }
                            }}
                            onBlur={(e) => {
                              if (isMobile) {
                                e.target.style.borderColor = '#e2e8f0'
                                e.target.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)'
                              } else {
                                e.target.style.borderBottomColor = '#e5e5e5'
                              }
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
                      padding: isMobile ? '0.875rem 1rem' : '0.75rem 1rem',
                      border: '1.5px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: isMobile ? '16px' : '0.875rem',
                      background: '#ffffff',
                      color: '#0f172a',
                      transition: 'all 0.2s ease',
                      fontWeight: '400',
                      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                      width: isMobile ? '100%' : 'auto',
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
                              {!isMobile && <span style={{ color: '#999', fontSize: '0.875rem' }}>—</span>}
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
                      padding: '0.75rem 1rem',
                      border: '1.5px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      background: '#ffffff',
                      color: '#0f172a',
                      transition: 'all 0.2s ease',
                      fontWeight: '400',
                      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
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
                  padding: '0',
                  marginBottom: isMobile ? '2rem' : '3rem',
                  borderTop: '1px solid #e5e5e5',
                  paddingTop: isMobile ? '2rem' : '3rem'
                }}>
                  <h3 style={{ 
                    color: '#0f172a', 
                    marginBottom: isMobile ? '1.5rem' : '2rem',
                    fontSize: isMobile ? '1.125rem' : '1.375rem',
                    fontWeight: '600',
                    letterSpacing: '-0.01em',
                    lineHeight: '1.3'
                  }}>Detalii Teren</h3>
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
                            setTimeout(() => setShowSportDropdown(false), 200)
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
                          <div                       style={{
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
                                  onClick={() => {
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
                                    e.currentTarget.style.background = '#f8fafc'
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background = '#ffffff'
                                  }}
                                >
                                  {sportOption.charAt(0).toUpperCase() + sportOption.slice(1)}
                                </div>
                              ))}
                            <div
                              onClick={() => {
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
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#1e293b'
                            e.currentTarget.style.borderColor = '#1e293b'
                            e.currentTarget.style.boxShadow = '0 4px 8px rgba(15, 23, 42, 0.3)'
                            e.currentTarget.style.transform = 'translateY(-1px)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#0f172a'
                            e.currentTarget.style.borderColor = '#0f172a'
                            e.currentTarget.style.boxShadow = '0 2px 4px rgba(15, 23, 42, 0.2)'
                            e.currentTarget.style.transform = 'translateY(0)'
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
                            transition: 'border-color 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#1a1a1a'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#e5e5e5'
                          }}
                        >
                          Anulează
                        </button>
                      </div>
                    )}
                  </div>

                  <div style={{ marginBottom: '2.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                      <label style={{ 
                        color: '#1a1a1a', 
                        fontWeight: '400',
                        fontSize: '0.875rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>Prețuri</label>
                      <button
                        type="button"
                        onClick={addPricingDetail}
                        style={{
                          padding: '0.5rem 1rem',
                          background: '#1a1a1a',
                          color: 'white',
                          border: '1px solid #1a1a1a',
                          borderRadius: '0',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          fontWeight: '400',
                          transition: 'opacity 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.opacity = '0.8'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.opacity = '1'
                        }}
                      >
                        Adaugă preț
                      </button>
                    </div>
                    {pricingDetails.map((detail, index) => (
                      <div key={index} style={{
                        padding: '1.5rem 0',
                        marginBottom: '2rem',
                        borderBottom: '1px solid #e5e5e5'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                          <span style={{ 
                            fontWeight: '400',
                            fontSize: '0.875rem',
                            color: '#666',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}>Preț #{index + 1}</span>
                          <button
                            type="button"
                            onClick={() => removePricingDetail(index)}
                            style={{
                              background: 'transparent',
                              color: '#1a1a1a',
                              border: '1px solid #e5e5e5',
                              borderRadius: '0',
                              padding: '0.375rem 0.75rem',
                              cursor: 'pointer',
                              fontSize: '0.75rem',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                              fontWeight: '400',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = '#1a1a1a'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = '#e5e5e5'
                            }}
                          >
                            Șterge
                          </button>
                        </div>
                        <div style={{ marginBottom: '1.5rem' }}>
                          <input
                            type="text"
                            placeholder="Titlu (ex: Preț pe oră, Preț pentru 2 ore)"
                            value={detail.title}
                            onChange={(e) => updatePricingDetail(index, 'title', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '0.875rem 0',
                              border: 'none',
                              borderBottom: '1px solid #e5e5e5',
                              borderRadius: '0',
                              fontSize: '1rem',
                              outline: 'none',
                              background: 'transparent',
                              color: '#1a1a1a',
                              transition: 'border-color 0.2s'
                            }}
                            onFocus={(e) => {
                              e.target.style.borderBottomColor = '#1a1a1a'
                            }}
                            onBlur={(e) => {
                              e.target.style.borderBottomColor = '#e5e5e5'
                            }}
                          />
                        </div>
                        <div style={{ marginBottom: '1.5rem' }}>
                          <textarea
                            placeholder="Descriere preț"
                            value={detail.description}
                            onChange={(e) => updatePricingDetail(index, 'description', e.target.value)}
                            rows={2}
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
                              padding: '0.875rem 0',
                              border: 'none',
                              borderBottom: '1px solid #e5e5e5',
                              borderRadius: '0',
                              fontSize: '1rem',
                              outline: 'none',
                              background: 'transparent',
                              color: '#1a1a1a',
                              transition: 'border-color 0.2s'
                            }}
                            onFocus={(e) => {
                              e.target.style.borderBottomColor = '#1a1a1a'
                            }}
                            onBlur={(e) => {
                              e.target.style.borderBottomColor = '#e5e5e5'
                            }}
                          />
                        </div>
                      </div>
                    ))}
                    {pricingDetails.length === 0 && (
                      <p style={{ 
                        color: '#999', 
                        textAlign: 'center', 
                        padding: '2rem 0',
                        fontSize: '0.875rem',
                        fontWeight: '400'
                      }}>
                        Adaugă cel puțin un preț
                      </p>
                    )}
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
                    gap: isMobile ? '1rem' : '1.5rem',
                    marginTop: isMobile ? '1.5rem' : '2rem'
                  }}>
                    <label style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.75rem', 
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: '400',
                      color: '#1a1a1a'
                    }}>
                      <input
                        type="checkbox"
                        checked={hasParking}
                        onChange={(e) => setHasParking(e.target.checked)}
                        style={{
                          width: '20px',
                          height: '20px',
                          accentColor: '#0f172a',
                          cursor: 'pointer'
                        }}
                      />
                      <span>Parcare</span>
                    </label>
                    <label style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.75rem', 
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: '400',
                      color: '#1a1a1a'
                    }}>
                      <input
                        type="checkbox"
                        checked={hasShower}
                        onChange={(e) => setHasShower(e.target.checked)}
                        style={{
                          width: '20px',
                          height: '20px',
                          accentColor: '#0f172a',
                          cursor: 'pointer'
                        }}
                      />
                      <span>Dusuri</span>
                    </label>
                    <label style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.75rem', 
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: '400',
                      color: '#1a1a1a'
                    }}>
                      <input
                        type="checkbox"
                        checked={hasChangingRoom}
                        onChange={(e) => setHasChangingRoom(e.target.checked)}
                        style={{
                          width: '20px',
                          height: '20px',
                          accentColor: '#0f172a',
                          cursor: 'pointer'
                        }}
                      />
                      <span>Vestiar</span>
                    </label>
                    <label style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.75rem', 
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: '400',
                      color: '#1a1a1a'
                    }}>
                      <input
                        type="checkbox"
                        checked={hasAirConditioning}
                        onChange={(e) => setHasAirConditioning(e.target.checked)}
                        style={{
                          width: '20px',
                          height: '20px',
                          accentColor: '#0f172a',
                          cursor: 'pointer'
                        }}
                      />
                      <span>Aer condiționat</span>
                    </label>
                    <label style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.75rem', 
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: '400',
                      color: '#1a1a1a'
                    }}>
                      <input
                        type="checkbox"
                        checked={hasLighting}
                        onChange={(e) => setHasLighting(e.target.checked)}
                        style={{
                          width: '20px',
                          height: '20px',
                          accentColor: '#0f172a',
                          cursor: 'pointer'
                        }}
                      />
                      <span>Iluminat</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Coach Specific */}
              {facilityType === 'coach' && (
                <div style={{
                  padding: '0',
                  marginBottom: isMobile ? '2rem' : '3rem',
                  borderTop: '1px solid #e5e5e5',
                  paddingTop: isMobile ? '2rem' : '3rem'
                }}>
                  <h3 style={{ 
                    color: '#0f172a', 
                    marginBottom: isMobile ? '1.5rem' : '2rem',
                    fontSize: isMobile ? '1.125rem' : '1.375rem',
                    fontWeight: '600',
                    letterSpacing: '-0.01em',
                    lineHeight: '1.3'
                  }}>Detalii Antrenor</h3>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '2rem',
                    marginBottom: '2rem'
                  }}>
                    <div>
                      <label style={{
                        display: 'block',
                        marginBottom: '0.75rem',
                        color: '#1a1a1a',
                        fontWeight: '400',
                        fontSize: '0.875rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>Specializare *</label>
                      <input
                        type="text"
                        value={specialization}
                        onChange={(e) => setSpecialization(e.target.value)}
                        required
                        style={{
                          width: '100%',
                          padding: '0.875rem 0',
                          border: 'none',
                          borderBottom: '1px solid #e5e5e5',
                          borderRadius: '0',
                          fontSize: '1rem',
                          outline: 'none',
                          background: 'transparent',
                          color: '#1a1a1a',
                          transition: 'border-color 0.2s'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderBottomColor = '#1a1a1a'
                        }}
                        onBlur={(e) => {
                          e.target.style.borderBottomColor = '#e5e5e5'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{
                        display: 'block',
                        marginBottom: '0.75rem',
                        color: '#1a1a1a',
                        fontWeight: '400',
                        fontSize: '0.875rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>Ani experiență</label>
                      <input
                        type="number"
                        value={experienceYears}
                        onChange={(e) => setExperienceYears(e.target.value)}
                        min="0"
                        style={{
                          width: '100%',
                          padding: '0.875rem 0',
                          border: 'none',
                          borderBottom: '1px solid #e5e5e5',
                          borderRadius: '0',
                          fontSize: '1rem',
                          outline: 'none',
                          background: 'transparent',
                          color: '#1a1a1a',
                          transition: 'border-color 0.2s'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderBottomColor = '#1a1a1a'
                        }}
                        onBlur={(e) => {
                          e.target.style.borderBottomColor = '#e5e5e5'
                        }}
                      />
                    </div>
                  </div>
                  <div style={{ marginBottom: '2.5rem' }}>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.75rem',
                      color: '#1a1a1a',
                      fontWeight: '400',
                      fontSize: '0.875rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>Certificări</label>
                    <textarea
                      value={certifications}
                      onChange={(e) => setCertifications(e.target.value)}
                      rows={3}
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
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.75rem',
                      color: '#1a1a1a',
                      fontWeight: '400',
                      fontSize: '0.875rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>Limbi vorbite</label>
                    <input
                      type="text"
                      value={languages}
                      onChange={(e) => setLanguages(e.target.value)}
                      placeholder="ex: Română, Engleză"
                      style={{
                        width: '100%',
                        padding: '0.875rem 0',
                        border: 'none',
                        borderBottom: '1px solid #e5e5e5',
                        borderRadius: '0',
                        fontSize: '1rem',
                        outline: 'none',
                        background: 'transparent',
                        color: '#1a1a1a',
                        transition: 'border-color 0.2s'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderBottomColor = '#1a1a1a'
                      }}
                      onBlur={(e) => {
                        e.target.style.borderBottomColor = '#e5e5e5'
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Repair Shop Specific */}
              {facilityType === 'repair_shop' && (
                <div style={{
                  padding: '0',
                  marginBottom: isMobile ? '2rem' : '3rem',
                  borderTop: '1px solid #e5e5e5',
                  paddingTop: isMobile ? '2rem' : '3rem'
                }}>
                  <h3 style={{ 
                    color: '#0f172a', 
                    marginBottom: isMobile ? '1.5rem' : '2rem',
                    fontSize: isMobile ? '1.125rem' : '1.375rem',
                    fontWeight: '600',
                    letterSpacing: '-0.01em',
                    lineHeight: '1.3'
                  }}>Detalii Magazin Reparații</h3>
                  <div style={{ marginBottom: '2.5rem' }}>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.75rem',
                      color: '#1a1a1a',
                      fontWeight: '400',
                      fontSize: '0.875rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>Servicii oferite</label>
                    <textarea
                      value={servicesOffered}
                      onChange={(e) => setServicesOffered(e.target.value)}
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
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '2rem'
                  }}>
                    <div>
                      <label style={{
                        display: 'block',
                        marginBottom: '0.75rem',
                        color: '#1a1a1a',
                        fontWeight: '400',
                        fontSize: '0.875rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>Mărci deservite</label>
                      <input
                        type="text"
                        value={brandsServiced}
                        onChange={(e) => setBrandsServiced(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.875rem 0',
                          border: 'none',
                          borderBottom: '1px solid #e5e5e5',
                          borderRadius: '0',
                          fontSize: '1rem',
                          outline: 'none',
                          background: 'transparent',
                          color: '#1a1a1a',
                          transition: 'border-color 0.2s'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderBottomColor = '#1a1a1a'
                        }}
                        onBlur={(e) => {
                          e.target.style.borderBottomColor = '#e5e5e5'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{
                        display: 'block',
                        marginBottom: '0.75rem',
                        color: '#1a1a1a',
                        fontWeight: '400',
                        fontSize: '0.875rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>Timp mediu reparație</label>
                      <input
                        type="text"
                        value={averageRepairTime}
                        onChange={(e) => setAverageRepairTime(e.target.value)}
                        placeholder="ex: 2-3 zile"
                        style={{
                          width: '100%',
                          padding: '0.875rem 0',
                          border: 'none',
                          borderBottom: '1px solid #e5e5e5',
                          borderRadius: '0',
                          fontSize: '1rem',
                          outline: 'none',
                          background: 'transparent',
                          color: '#1a1a1a',
                          transition: 'border-color 0.2s'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderBottomColor = '#1a1a1a'
                        }}
                        onBlur={(e) => {
                          e.target.style.borderBottomColor = '#e5e5e5'
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Equipment Shop Specific */}
              {facilityType === 'equipment_shop' && (
                <div style={{
                  padding: '0',
                  marginBottom: isMobile ? '2rem' : '3rem',
                  borderTop: '1px solid #e5e5e5',
                  paddingTop: isMobile ? '2rem' : '3rem'
                }}>
                  <h3 style={{ 
                    color: '#0f172a', 
                    marginBottom: isMobile ? '1.5rem' : '2rem',
                    fontSize: isMobile ? '1.125rem' : '1.375rem',
                    fontWeight: '600',
                    letterSpacing: '-0.01em',
                    lineHeight: '1.3'
                  }}>Detalii Magazin Articole Sportive</h3>
                  <div style={{ marginBottom: '2.5rem' }}>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.75rem',
                      color: '#1a1a1a',
                      fontWeight: '400',
                      fontSize: '0.875rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>Categorii produse</label>
                    <textarea
                      value={productsCategories}
                      onChange={(e) => setProductsCategories(e.target.value)}
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
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.75rem',
                      color: '#1a1a1a',
                      fontWeight: '400',
                      fontSize: '0.875rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>Mărci disponibile</label>
                    <input
                      type="text"
                      value={brandsAvailable}
                      onChange={(e) => setBrandsAvailable(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.875rem 0',
                        border: 'none',
                        borderBottom: '1px solid #e5e5e5',
                        borderRadius: '0',
                        fontSize: '1rem',
                        outline: 'none',
                        background: 'transparent',
                        color: '#1a1a1a',
                        transition: 'border-color 0.2s'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderBottomColor = '#1a1a1a'
                      }}
                      onBlur={(e) => {
                        e.target.style.borderBottomColor = '#e5e5e5'
                      }}
                    />
                  </div>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    cursor: 'pointer',
                    marginTop: '2rem',
                    fontSize: '0.875rem',
                    fontWeight: '400',
                    color: '#1a1a1a'
                  }}>
                    <input
                      type="checkbox"
                      checked={deliveryAvailable}
                      onChange={(e) => setDeliveryAvailable(e.target.checked)}
                      style={{
                        width: '18px',
                        height: '18px',
                        accentColor: '#1a1a1a',
                        cursor: 'pointer'
                      }}
                    />
                    <span>Livrare disponibilă</span>
                  </label>
                </div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
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
                onMouseEnter={(e) => {
                  if (!isMobile) {
                    e.currentTarget.style.background = '#1e293b'
                    e.currentTarget.style.borderColor = '#1e293b'
                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(15, 23, 42, 0.3)'
                    e.currentTarget.style.transform = 'translateY(-1px)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isMobile) {
                    e.currentTarget.style.background = '#0f172a'
                    e.currentTarget.style.borderColor = '#0f172a'
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(15, 23, 42, 0.2)'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }
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
                  background: loading ? '#999' : '#0f172a',
                  color: 'white',
                  border: '1.5px solid ' + (loading ? '#999' : '#0f172a'),
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
        </form>
      </div>
    </div>
  )
}

export default Register
