import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import API_BASE_URL from '../../config'
import { ROMANIAN_CITIES } from '../../data/romanian-cities'
import { ROMANIAN_COUNTIES } from '../../data/romanian-counties'
import MapSelector from '../../components/MapSelector'

interface PricingDetail {
  title: string
  description: string
  price: number
}

interface TimeSlot {
  day: string // monday, tuesday, etc.
  startTime: string // HH:mm format
  endTime: string // HH:mm format
  status: 'open' | 'closed' | 'not_specified' // Status of the slot
  price: number | null // Price for this slot (null if not_specified or closed)
  isPriceUnspecified?: boolean // Toggle for "preț nespecificat"
}

interface SportsField {
  fieldName: string
  sportType: string
  description: string
  features: {
    hasParking: boolean
    hasShower: boolean
    hasChangingRoom: boolean
    hasAirConditioning: boolean
    hasLighting: boolean
    hasWiFi: boolean
    hasBar: boolean
    hasFirstAid: boolean
    hasEquipmentRental: boolean
    hasLocker: boolean
    hasTowelService: boolean
    hasWaterFountain: boolean
    hasSeating: boolean
    hasScoreboard: boolean
    hasSoundSystem: boolean
    hasHeating: boolean
    hasCover: boolean
    hasGrass: boolean
    hasArtificialGrass: boolean
    hasIndoor: boolean
    hasOutdoor: boolean
  }
  // Pricing system - extensible for future online bookings
  slotSize: number // in minutes: 30, 60, 90, 120
  timeSlots: TimeSlot[] // Selected time slots with prices and status
}

function RegisterSportsBase() {
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

  // Step 2: Contact Details
  const [contactPerson, setContactPerson] = useState('')
  const [phones, setPhones] = useState<string[]>([''])
  const [whatsapps, setWhatsapps] = useState<string[]>([''])
  const [emails, setEmails] = useState<string[]>([''])
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
  const [isDragging, setIsDragging] = useState(false)
  

  // Step 5: Specific Details
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
  
  // Sports Base specific - Multiple fields
  const [sportsFields, setSportsFields] = useState<SportsField[]>([{
    fieldName: '',
    sportType: searchParams.get('sport') || '',
    description: '',
    features: {
      hasParking: false,
      hasShower: false,
      hasChangingRoom: false,
      hasAirConditioning: false,
      hasLighting: false,
      hasWiFi: false,
      hasBar: false,
      hasFirstAid: false,
      hasEquipmentRental: false,
      hasLocker: false,
      hasTowelService: false,
      hasWaterFountain: false,
      hasSeating: false,
      hasScoreboard: false,
      hasSoundSystem: false,
      hasHeating: false,
      hasCover: false,
      hasGrass: false,
      hasArtificialGrass: false,
      hasIndoor: false,
      hasOutdoor: false
    },
      slotSize: 60, // Default 1 hour
      timeSlots: [] // Empty initially, user will select from grid
  }])
  const [showAddSportInput, setShowAddSportInput] = useState<number | null>(null)
  const [newSport, setNewSport] = useState('')
  const [customSports, setCustomSports] = useState<string[]>([])
  const [availableCities, setAvailableCities] = useState<Array<{city: string, county?: string | null}>>(ROMANIAN_CITIES)
  const [availableSports, setAvailableSports] = useState<string[]>([])
  const [sportSearch, setSportSearch] = useState<Record<number, string>>({})
  const [showSportDropdown, setShowSportDropdown] = useState<Record<number, boolean>>({})
  
  // Legacy fields for backward compatibility (will be removed)
  const [sport, setSport] = useState('')
  const [pricingDetails, setPricingDetails] = useState<PricingDetail[]>([])
  const [hasParking, setHasParking] = useState(false)
  const [hasShower, setHasShower] = useState(false)
  const [hasChangingRoom, setHasChangingRoom] = useState(false)
  const [hasAirConditioning, setHasAirConditioning] = useState(false)
  const [hasLighting, setHasLighting] = useState(false)

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

    const loadSports = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/sports`)
        const data = await response.json()
        if (data.success && data.data) {
          const backendSports = data.data.map((item: any) => item.sport)
          const standardSports = ['tenis', 'fotbal', 'baschet', 'volei', 'handbal', 'badminton', 'squash', 'paddle', 'tenis de masă', 'ping-pong', 'rugby', 'hochei', 'golf', 'bowling', 'dans', 'fitness', 'yoga', 'pilates', 'box', 'karate', 'judo', 'taekwondo', 'swimming', 'înot', 'atletism', 'ciclism', 'alpinism', 'schi', 'snowboard']
          const allSports = [...new Set([...standardSports, ...backendSports])].sort()
          setAvailableSports(allSports)
          console.log('Loaded sports:', allSports.length, allSports)
        } else {
          // Fallback: use standard sports if API fails
          const standardSports = ['tenis', 'fotbal', 'baschet', 'volei', 'handbal', 'badminton', 'squash', 'paddle', 'tenis de masă', 'ping-pong', 'rugby', 'hochei', 'golf', 'bowling', 'dans', 'fitness', 'yoga', 'pilates', 'box', 'karate', 'judo', 'taekwondo', 'swimming', 'înot', 'atletism', 'ciclism', 'alpinism', 'schi', 'snowboard']
          setAvailableSports(standardSports)
          console.log('Using fallback sports:', standardSports.length)
        }
      } catch (err) {
        console.error('Error loading sports:', err)
        // Fallback: use standard sports if API fails
        const standardSports = ['tenis', 'fotbal', 'baschet', 'volei', 'handbal', 'badminton', 'squash', 'paddle', 'tenis de masă', 'ping-pong', 'rugby', 'hochei', 'golf', 'bowling', 'dans', 'fitness', 'yoga', 'pilates', 'box', 'karate', 'judo', 'taekwondo', 'swimming', 'înot', 'atletism', 'ciclism', 'alpinism', 'schi', 'snowboard']
        setAvailableSports(standardSports)
        console.log('Using fallback sports after error:', standardSports.length)
      }
    }

    loadCities()
    loadSports()
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

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    try {
      // Optimize logo before setting it (isLogo = true for smaller size)
      const optimizedFile = await optimizeImage(file, true)
      setLogoFile(optimizedFile)
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(optimizedFile)
    } catch (error) {
      console.error('Error optimizing logo:', error)
      setError('Eroare la optimizarea logo-ului. Te rugăm să încerci din nou.')
    }
  }

  // Optimize image: resize and compress more aggressively
  const optimizeImage = (file: File, isLogo: boolean = false): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          if (!ctx) {
            reject(new Error('Could not get canvas context'))
            return
          }

          // More aggressive resizing: max 1200x1200 for gallery, 800x800 for logo
          const maxWidth = isLogo ? 800 : 1200
          const maxHeight = isLogo ? 800 : 1200
          let width = img.width
          let height = img.height

          if (width > maxWidth || height > maxHeight) {
            if (width > height) {
              height = (height * maxWidth) / width
              width = maxWidth
            } else {
              width = (width * maxHeight) / height
              height = maxHeight
            }
          }

          canvas.width = width
          canvas.height = height
          ctx.drawImage(img, 0, 0, width, height)

          // More aggressive compression: quality 0.75 for gallery, 0.8 for logo
          const quality = isLogo ? 0.8 : 0.75
          canvas.toBlob(
            (blob) => {
              if (blob) {
                // Check if file size is still too large (> 500KB), compress more
                if (blob.size > 500 * 1024) {
                  const img2 = new Image()
                  img2.onload = () => {
                    const canvas2 = document.createElement('canvas')
                    const ctx2 = canvas2.getContext('2d')
                    if (!ctx2) {
                      const optimizedFile = new File([blob], file.name, {
                        type: 'image/jpeg',
                        lastModified: Date.now()
                      })
                      resolve(optimizedFile)
                      return
                    }
                    
                    // Further reduce size
                    const scale = Math.sqrt(500 * 1024 / blob.size)
                    canvas2.width = width * scale
                    canvas2.height = height * scale
                    ctx2.drawImage(img2, 0, 0, canvas2.width, canvas2.height)
                    
                    canvas2.toBlob(
                      (blob2) => {
                        if (blob2) {
                          const optimizedFile = new File([blob2], file.name, {
                            type: 'image/jpeg',
                            lastModified: Date.now()
                          })
                          resolve(optimizedFile)
                        } else {
                          const optimizedFile = new File([blob], file.name, {
                            type: 'image/jpeg',
                            lastModified: Date.now()
                          })
                          resolve(optimizedFile)
                        }
                      },
                      'image/jpeg',
                      0.7
                    )
                  }
                  img2.onerror = () => {
                    const optimizedFile = new File([blob], file.name, {
                      type: 'image/jpeg',
                      lastModified: Date.now()
                    })
                    resolve(optimizedFile)
                  }
                  img2.src = URL.createObjectURL(blob)
                } else {
                  const optimizedFile = new File([blob], file.name, {
                    type: 'image/jpeg',
                    lastModified: Date.now()
                  })
                  resolve(optimizedFile)
                }
              } else {
                reject(new Error('Failed to create blob'))
              }
            },
            'image/jpeg',
            quality
          )
        }
        img.onerror = () => reject(new Error('Failed to load image'))
        img.src = e.target?.result as string
      }
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsDataURL(file)
    })
  }

  const processGalleryFiles = async (files: File[]) => {
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

    // Optimize images before adding them
    try {
      const optimizedFiles = await Promise.all(files.map(file => optimizeImage(file)))
      setGalleryFiles([...galleryFiles, ...optimizedFiles])
      
      optimizedFiles.forEach(file => {
        const reader = new FileReader()
        reader.onloadend = () => {
          setGalleryPreviews(prev => [...prev, reader.result as string])
        }
        reader.readAsDataURL(file)
      })
    } catch (error) {
      console.error('Error optimizing images:', error)
      setError('Eroare la optimizarea imaginilor. Te rugăm să încerci din nou.')
    }
  }

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    processGalleryFiles(files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (galleryFiles.length < 10) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (galleryFiles.length >= 10) {
      setError('Poți încărca maxim 10 imagini în galerie')
      return
    }

    const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'))
    if (files.length > 0) {
      processGalleryFiles(files)
    }
  }

  // Functions for managing multiple sports fields
  const addSportsField = () => {
    setSportsFields([...sportsFields, {
      fieldName: '',
      sportType: '',
      description: '',
      features: {
        hasParking: false,
        hasShower: false,
        hasChangingRoom: false,
        hasAirConditioning: false,
        hasLighting: false
      },
      slotSize: 60, // Default 1 hour
      timeSlots: [] // Empty initially, user will select from grid
    }])
  }

  const removeSportsField = (index: number) => {
    if (sportsFields.length > 1) {
      setSportsFields(sportsFields.filter((_, i) => i !== index))
      // Clean up search state
      const newSearch = { ...sportSearch }
      delete newSearch[index]
      setSportSearch(newSearch)
      const newDropdown = { ...showSportDropdown }
      delete newDropdown[index]
      setShowSportDropdown(newDropdown)
    }
  }

  const updateSportsField = (index: number, field: keyof SportsField, value: any) => {
    const updated = [...sportsFields]
    
    // If slotSize changes, clear timeSlots that are no longer valid
    if (field === 'slotSize' && value !== updated[index].slotSize) {
      updated[index] = { 
        ...updated[index], 
        [field]: value,
        timeSlots: [] // Clear slots when slot size changes
      }
    } else {
      updated[index] = { ...updated[index], [field]: value }
    }
    
    setSportsFields(updated)
  }

  const updateSportsFieldFeature = (index: number, feature: keyof SportsField['features'], value: boolean) => {
    const updated = [...sportsFields]
    updated[index] = {
      ...updated[index],
      features: {
        ...updated[index].features,
        [feature]: value
      }
    }
    setSportsFields(updated)
  }

  // Update slot status and price (used in the new simple interface)
  // Check if two time slots overlap
  const doSlotsOverlap = (start1: string, end1: string, start2: string, end2: string): boolean => {
    const [start1H, start1M] = start1.split(':').map(Number)
    const [end1H, end1M] = end1.split(':').map(Number)
    const [start2H, start2M] = start2.split(':').map(Number)
    const [end2H, end2M] = end2.split(':').map(Number)
    
    const start1Minutes = start1H * 60 + start1M
    const end1Minutes = end1H * 60 + end1M
    const start2Minutes = start2H * 60 + start2M
    const end2Minutes = end2H * 60 + end2M
    
    // Check if intervals overlap (excluding exact boundaries)
    return start1Minutes < end2Minutes && start2Minutes < end1Minutes
  }

  // Check if a slot overlaps with any existing slot for a day
  const hasOverlappingSlot = (day: string, startTime: string, endTime: string, existingSlots: TimeSlot[], excludeSlot?: TimeSlot): boolean => {
    return existingSlots.some(slot => {
      if (slot.day !== day) return false
      // Exclude the slot being edited
      if (excludeSlot && slot.startTime === excludeSlot.startTime && slot.endTime === excludeSlot.endTime && slot.day === excludeSlot.day) {
        return false
      }
      return doSlotsOverlap(startTime, endTime, slot.startTime, slot.endTime)
    })
  }

  const updateSlot = (fieldIndex: number, day: string, startTime: string, updates: Partial<TimeSlot>) => {
    const updated = [...sportsFields]
    updated[fieldIndex] = {
      ...updated[fieldIndex],
      timeSlots: updated[fieldIndex].timeSlots.map(slot => 
        slot.day === day && slot.startTime === startTime && slot.endTime === (updates.endTime || slot.endTime)
          ? { ...slot, ...updates }
          : slot
      )
    }
    setSportsFields(updated)
  }

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

  const removeGalleryImage = (index: number) => {
    setGalleryFiles(galleryFiles.filter((_, i) => i !== index))
    setGalleryPreviews(galleryPreviews.filter((_, i) => i !== index))
  }

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        const validPhones = phones.filter(p => p.trim() !== '')
        const validEmails = emails.filter(e => e.trim() !== '')
        if (validPhones.length === 0 || validEmails.length === 0) {
          setError('Te rugăm să completezi toate câmpurile obligatorii (cel puțin un telefon și un email)')
          return false
        }
        break
      case 2:
        // Verifică dacă orașul este completat
        if (!city) {
          setError('Te rugăm să selectezi orașul')
          return false
        }
        // Locația poate fi nespecificată, deci nu validăm locația aici
        break
      case 3:
        if (!name) {
          setError('Te rugăm să introduci denumirea facilității')
          return false
        }
        break
      case 5:
        // Validate that at least one field is complete with time slots
        const validFields = sportsFields.filter(field => {
          const hasBasicInfo = field.fieldName.trim() && field.sportType.trim()
          const hasTimeSlots = field.timeSlots && field.timeSlots.length > 0
          return hasBasicInfo && hasTimeSlots
        })
        if (validFields.length === 0) {
          setError('Te rugăm să adaugi cel puțin un teren complet (nume, sport și cel puțin un interval de timp configurat)')
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

  // Scroll la top când se schimbă pasul
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentStep])

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    
    setError('')
    
    // Validate required fields
    const validPhones = phones.filter(p => p.trim() !== '')
    const validEmails = emails.filter(e => e.trim() !== '')
    
    // Validate that at least one sports field is complete
    const validFields = sportsFields.filter(field => {
      const hasBasicInfo = field.fieldName.trim() && field.sportType.trim()
      const hasTimeSlots = field.timeSlots && field.timeSlots.length > 0
      return hasBasicInfo && hasTimeSlots
    })
    
    if (!name || validPhones.length === 0 || validEmails.length === 0 || !city || (!location && !locationNotSpecified) || validFields.length === 0) {
      setError('Te rugăm să completezi toate câmpurile obligatorii (cel puțin un telefon, un email și un teren complet cu sloturi configurate)')
      return
    }

    setLoading(true)

    try {
      // Filter out empty values
      const validPhones = phones.filter(p => p.trim() !== '')
      const validWhatsapps = whatsapps.filter(w => w.trim() !== '')
      const validEmails = emails.filter(e => e.trim() !== '')

      // Create FormData for file uploads
      const formData = new FormData()
      
      // Add logo file if exists
      if (logoFile) {
        formData.append('logo', logoFile)
      }
      
      // Add gallery files
      galleryFiles.forEach(file => {
        formData.append('gallery', file)
      })
      
      // Add all other form fields
      formData.append('facilityType', 'field')
      formData.append('name', name)
      if (contactPerson) formData.append('contactPerson', contactPerson)
      formData.append('phone', validPhones.length > 0 ? validPhones[0] : '')
      formData.append('phones', JSON.stringify(validPhones))
      if (validWhatsapps.length > 0) {
        formData.append('whatsapp', validWhatsapps[0])
        formData.append('whatsapps', JSON.stringify(validWhatsapps))
      }
      formData.append('email', validEmails.length > 0 ? validEmails[0] : '')
      formData.append('emails', JSON.stringify(validEmails))
      formData.append('city', city)
      if (county || newCityCounty) formData.append('county', county || newCityCounty || '')
      if (!locationNotSpecified && location) formData.append('location', location)
      formData.append('locationNotSpecified', locationNotSpecified ? 'true' : 'false')
      if (mapCoordinates) formData.append('mapCoordinates', JSON.stringify(mapCoordinates))
      if (description) formData.append('description', description)
      if (website) formData.append('website', website)
      formData.append('socialMedia', JSON.stringify(socialMedia))
      formData.append('openingHours', 'null')
      
      // Legacy fields for backward compatibility
      if (validFields.length > 0) {
        formData.append('sport', validFields[0].sportType)
        const firstPrice = validFields[0].timeSlots && validFields[0].timeSlots.length > 0 
          ? validFields[0].timeSlots.find(s => s.status === 'open' && s.price)?.price || null : null
        if (firstPrice) formData.append('pricePerHour', firstPrice.toString())
      }
      formData.append('pricingDetails', JSON.stringify(pricingDetails))
      formData.append('hasParking', validFields.some(f => f.features.hasParking) ? 'true' : 'false')
      formData.append('hasShower', validFields.some(f => f.features.hasShower) ? 'true' : 'false')
      formData.append('hasChangingRoom', validFields.some(f => f.features.hasChangingRoom) ? 'true' : 'false')
      formData.append('hasAirConditioning', validFields.some(f => f.features.hasAirConditioning) ? 'true' : 'false')
      formData.append('hasLighting', validFields.some(f => f.features.hasLighting) ? 'true' : 'false')
      
      // Sports fields array
      formData.append('sportsFields', JSON.stringify(validFields.map(field => ({
        fieldName: field.fieldName,
        sportType: field.sportType,
        description: field.description || null,
        features: field.features,
        slotSize: field.slotSize || 60,
        timeSlots: field.timeSlots || []
      }))))

      console.log('Submitting form data with files:', { 
        logo: logoFile ? logoFile.name : null, 
        gallery: galleryFiles.length > 0 ? `${galleryFiles.length} files` : null 
      })
      
      const response = await fetch('/api/register', {
        method: 'POST',
        body: formData
        // Don't set Content-Type header - browser will set it automatically with boundary for FormData
      })

      console.log('Response status:', response.status, response.statusText)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Registration failed - HTTP error:', response.status, errorText)
        try {
          const errorData = JSON.parse(errorText)
          setError(errorData.error || `Eroare la înregistrare (${response.status})`)
        } catch {
          setError(`Eroare la înregistrare: ${errorText || response.statusText}`)
        }
        return
      }

      const data = await response.json()
      console.log('Registration response:', data)
      
      if (data.success) {
        // Backend returns credentials in data.credentials object
        const username = data.credentials?.username || data.username
        const password = data.credentials?.password || data.password
        
        if (username && password) {
          setCredentials({ username, password })
          setCurrentStep(6)
          setError('')
          // Scroll to top to show success message
          window.scrollTo({ top: 0, behavior: 'smooth' })
        } else {
          console.error('Missing credentials in response:', data)
          setError('Înregistrarea a reușit, dar credențialele nu au fost returnate. Te rugăm să contactezi administratorul.')
        }
      } else {
        console.error('Registration failed:', data)
        setError(data.error || 'Eroare la înregistrare')
      }
    } catch (err) {
      console.error('Registration error:', err)
      setError('Eroare la conectarea la server. Te rugăm să verifici consola pentru detalii.')
    } finally {
      setLoading(false)
    }
  }

  const totalSteps = 5
  const steps = [
    'Date de contact',
    'Locație',
    'Branding',
    'Galerie',
    'Terenuri, prețuri și program'
  ]

  // Rest of the component JSX will be similar to Register.tsx but simplified for sports bases
  // For brevity, I'll include the key parts - the full component would be quite long
  
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
        {/* Page Title */}
        <div style={{
          textAlign: 'center',
          marginBottom: isMobile ? '2rem' : '3rem',
          paddingBottom: isMobile ? '1.5rem' : '2rem',
          borderBottom: '1px solid #e2e8f0'
        }}>
          <h1 style={{
            fontSize: isMobile ? '1.875rem' : '2.75rem',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #0f172a 0%, #10b981 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '0.5rem',
            letterSpacing: '-0.02em',
            lineHeight: '1.2'
          }}>Înregistrare Baze Sportive</h1>
          <p style={{
            fontSize: isMobile ? '0.875rem' : '1rem',
            color: '#64748b',
            marginTop: '0.75rem',
            fontWeight: '400'
          }}>Completează formularul pentru a-ți înregistra baza sportivă</p>
        </div>

        {/* Progress Steps */}
        <div style={{
          marginBottom: isMobile ? '1.5rem' : '2rem',
          padding: isMobile ? '0.75rem 0' : '1rem 0'
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

        <form onSubmit={currentStep === 5 ? (e) => handleSubmit(e) : (e) => { e.preventDefault(); nextStep(); }}>
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

                {/* Dynamic Phones */}
                <div style={{ gridColumn: isMobile ? '1' : 'span 2' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <label style={{
                      display: 'block',
                      color: '#0f172a',
                      fontWeight: '600',
                      fontSize: '0.875rem',
                      letterSpacing: '0.01em'
                    }}>Telefoane *</label>
                    <button
                      type="button"
                      onClick={() => setPhones([...phones, ''])}
                      style={{
                        padding: '0.5rem 1rem',
                        background: '#f0fdf4',
                        color: '#10b981',
                        border: '1.5px solid #10b981',
                        borderRadius: '6px',
                        fontSize: '0.8125rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#10b981'
                        e.currentTarget.style.color = 'white'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#f0fdf4'
                        e.currentTarget.style.color = '#10b981'
                      }}
                    >
                      + Adaugă telefon
                    </button>
                  </div>
                  {phones.map((phone, index) => (
                    <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', alignItems: 'flex-start' }}>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => {
                          const updated = [...phones]
                          updated[index] = e.target.value
                          setPhones(updated)
                        }}
                        placeholder={index === 0 ? "Ex: 0768057046 *" : `Telefon ${index + 1}`}
                        required={index === 0}
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
                      {phones.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const updated = phones.filter((_, i) => i !== index)
                            setPhones(updated.length > 0 ? updated : [''])
                          }}
                          style={{
                            padding: '0.875rem 1rem',
                            background: '#fee2e2',
                            color: '#dc2626',
                            border: '1.5px solid #dc2626',
                            borderRadius: '8px',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            minWidth: '48px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#dc2626'
                            e.currentTarget.style.color = 'white'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#fee2e2'
                            e.currentTarget.style.color = '#dc2626'
                          }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Dynamic WhatsApps */}
                <div style={{ gridColumn: isMobile ? '1' : 'span 2' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <label style={{
                      display: 'block',
                      color: '#0f172a',
                      fontWeight: '600',
                      fontSize: '0.875rem',
                      letterSpacing: '0.01em'
                    }}>WhatsApp</label>
                    <button
                      type="button"
                      onClick={() => setWhatsapps([...whatsapps, ''])}
                      style={{
                        padding: '0.5rem 1rem',
                        background: '#f0fdf4',
                        color: '#10b981',
                        border: '1.5px solid #10b981',
                        borderRadius: '6px',
                        fontSize: '0.8125rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#10b981'
                        e.currentTarget.style.color = 'white'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#f0fdf4'
                        e.currentTarget.style.color = '#10b981'
                      }}
                    >
                      + Adaugă WhatsApp
                    </button>
                  </div>
                  {whatsapps.map((whatsapp, index) => (
                    <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', alignItems: 'flex-start' }}>
                      <input
                        type="tel"
                        value={whatsapp}
                        onChange={(e) => {
                          const updated = [...whatsapps]
                          updated[index] = e.target.value
                          setWhatsapps(updated)
                        }}
                        placeholder={index === 0 ? "Ex: +40712345678" : `WhatsApp ${index + 1}`}
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
                      {whatsapps.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const updated = whatsapps.filter((_, i) => i !== index)
                            setWhatsapps(updated.length > 0 ? updated : [''])
                          }}
                          style={{
                            padding: '0.875rem 1rem',
                            background: '#fee2e2',
                            color: '#dc2626',
                            border: '1.5px solid #dc2626',
                            borderRadius: '8px',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            minWidth: '48px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#dc2626'
                            e.currentTarget.style.color = 'white'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#fee2e2'
                            e.currentTarget.style.color = '#dc2626'
                          }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Dynamic Emails */}
                <div style={{ gridColumn: isMobile ? '1' : 'span 2' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <label style={{
                      display: 'block',
                      color: '#0f172a',
                      fontWeight: '600',
                      fontSize: '0.875rem',
                      letterSpacing: '0.01em'
                    }}>Email-uri *</label>
                    <button
                      type="button"
                      onClick={() => setEmails([...emails, ''])}
                      style={{
                        padding: '0.5rem 1rem',
                        background: '#f0fdf4',
                        color: '#10b981',
                        border: '1.5px solid #10b981',
                        borderRadius: '6px',
                        fontSize: '0.8125rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#10b981'
                        e.currentTarget.style.color = 'white'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#f0fdf4'
                        e.currentTarget.style.color = '#10b981'
                      }}
                    >
                      + Adaugă email
                    </button>
                  </div>
                  {emails.map((email, index) => (
                    <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', alignItems: 'flex-start' }}>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          const updated = [...emails]
                          updated[index] = e.target.value
                          setEmails(updated)
                        }}
                        placeholder={index === 0 ? "Ex: contact@example.com *" : `Email ${index + 1}`}
                        required={index === 0}
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
                      {emails.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const updated = emails.filter((_, i) => i !== index)
                            setEmails(updated.length > 0 ? updated : [''])
                          }}
                          style={{
                            padding: '0.875rem 1rem',
                            background: '#fee2e2',
                            color: '#dc2626',
                            border: '1.5px solid #dc2626',
                            borderRadius: '8px',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            minWidth: '48px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#dc2626'
                            e.currentTarget.style.color = 'white'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#fee2e2'
                            e.currentTarget.style.color = '#dc2626'
                          }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                </div>
              </div>
              
              {/* City Selection removed from Step 1 - now in Step 2 (Location) */}
            </div>
          )}

          {/* Step 2: Location */}
          {currentStep === 2 && (
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
                  Locație
                </h2>
                <p style={{
                  fontSize: isMobile ? '0.875rem' : '0.9375rem',
                  color: '#64748b',
                  marginBottom: isMobile ? '1.5rem' : '2rem',
                  lineHeight: '1.6'
                }}>
                  Completează locația bazei tale sportive. Poți specifica adresa completă sau marca locația ca nespecificată.
                </p>
                
                {/* City Selection */}
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
                                  transition: 'background 0.15s',
                                  backgroundColor: city === cityOption.city ? '#f0fdf4' : 'transparent'
                                }}
                                onMouseEnter={(e) => {
                                  if (city !== cityOption.city) {
                                    e.currentTarget.style.backgroundColor = '#f8fafc'
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (city !== cityOption.city) {
                                    e.currentTarget.style.backgroundColor = 'transparent'
                                  }
                                }}
                              >
                                <div style={{ fontWeight: '500' }}>{cityOption.city}</div>
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
                            }}
                            style={{
                              padding: '0.75rem 1rem',
                              cursor: 'pointer',
                              borderTop: '1px solid #e2e8f0',
                              background: '#f8fafc',
                              color: '#10b981',
                              fontSize: '0.875rem',
                              fontWeight: '600',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              transition: 'background 0.15s'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#f0fdf4'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = '#f8fafc'
                            }}
                          >
                            <span>+</span> Adaugă oraș nou
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <input
                        type="text"
                        value={newCity}
                        onChange={(e) => setNewCity(e.target.value)}
                        placeholder="Nume oraș"
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
                      <select
                        value={newCityCounty}
                        onChange={(e) => setNewCityCounty(e.target.value)}
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
                      >
                        <option value="">Selectează județul</option>
                        {ROMANIAN_COUNTIES.map(county => (
                          <option key={county} value={county}>{county}</option>
                        ))}
                      </select>
                      <div style={{ 
                        display: 'flex', 
                        gap: '0.5rem',
                        marginTop: '0.5rem'
                      }}>
                        <button
                          type="button"
                          onClick={() => {
                            if (newCity.trim() && newCityCounty) {
                              const newCityObj = { city: newCity.trim(), county: newCityCounty }
                              setCustomCities([...customCities, newCityObj])
                              setCity(newCity.trim())
                              setCounty(newCityCounty)
                              setNewCity('')
                              setNewCityCounty('')
                              setShowAddCityInput(false)
                            }
                          }}
                          style={{
                            flex: 1,
                            padding: '0.75rem 1rem',
                            background: '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#059669'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#10b981'
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
                          }}
                          style={{
                            flex: 1,
                            padding: '0.75rem 1rem',
                            background: '#ffffff',
                            color: '#0f172a',
                            border: '1.5px solid #e2e8f0',
                            borderRadius: '8px',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#f8fafc'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#ffffff'
                          }}
                        >
                          Anulează
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Location with Map */}
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
                          city={city}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Branding - Identical to RegisterRepairShop */}
          {currentStep === 3 && (
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
                  Branding și prezentare
                </h2>
                <p style={{
                  fontSize: isMobile ? '0.875rem' : '0.9375rem',
                  color: '#64748b',
                  marginBottom: isMobile ? '1.5rem' : '2rem',
                  lineHeight: '1.6'
                }}>
                  Completează informațiile despre brandul și prezentarea bazei tale sportive
                </p>
              <div style={{ marginBottom: '2.5rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.75rem',
                  color: '#0f172a',
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  letterSpacing: '0.01em'
                }}>Denumire Baza sportivă *</label>
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
                  placeholder="Descrie baza ta sportivă..."
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
                  type="text"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://example.com sau www.example.com"
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
            </div>
          )}

          {/* Step 4: Gallery - Identical to RegisterRepairShop */}
          {currentStep === 4 && (
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
                  Galerie imagini
                </h2>
                <p style={{
                  fontSize: isMobile ? '0.875rem' : '0.9375rem',
                  color: '#64748b',
                  marginBottom: isMobile ? '1.5rem' : '2rem',
                  lineHeight: '1.6'
                }}>
                  Încarcă imagini pentru a-ți prezenta baza sportivă. Poți adăuga până la 10 imagini, fiecare cu maximum 5MB.
                </p>
              <div style={{ marginBottom: '2.5rem' }}>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  style={{
                    border: isDragging 
                      ? '2px dashed #10b981' 
                      : galleryFiles.length >= 10 
                        ? '2px dashed #e2e8f0' 
                        : '2px dashed #cbd5e1',
                    borderRadius: '12px',
                    padding: isMobile ? '2rem 1.5rem' : '3rem 2rem',
                    background: isDragging 
                      ? 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)' 
                      : galleryFiles.length >= 10
                        ? '#f8fafc'
                        : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                    textAlign: 'center',
                    cursor: galleryFiles.length >= 10 ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    opacity: galleryFiles.length >= 10 ? 0.6 : 1
                  }}
                  onClick={() => {
                    if (galleryFiles.length < 10) {
                      document.getElementById('gallery-file-input')?.click()
                    }
                  }}
                >
                  <input
                    id="gallery-file-input"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleGalleryChange}
                    disabled={galleryFiles.length >= 10}
                    style={{
                      display: 'none'
                    }}
                  />
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '1rem'
                  }}>
                    <div style={{
                      width: isMobile ? '56px' : '64px',
                      height: isMobile ? '56px' : '64px',
                      borderRadius: '50%',
                      background: isDragging 
                        ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
                        : galleryFiles.length >= 10
                          ? '#e2e8f0'
                          : 'linear-gradient(135deg, #f0fdf4 0%, #d1fae5 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.3s ease',
                      transform: isDragging ? 'scale(1.1)' : 'scale(1)'
                    }}>
                      <svg 
                        width={isMobile ? '28' : '32'} 
                        height={isMobile ? '28' : '32'} 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke={isDragging ? 'white' : galleryFiles.length >= 10 ? '#94a3b8' : '#10b981'} 
                        strokeWidth="2"
                      >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="17 8 12 3 7 8"></polyline>
                        <line x1="12" y1="3" x2="12" y2="15"></line>
                      </svg>
                    </div>
                    <div>
                      <p style={{
                        fontSize: isMobile ? '1rem' : '1.125rem',
                        fontWeight: '600',
                        color: isDragging ? '#10b981' : galleryFiles.length >= 10 ? '#94a3b8' : '#0f172a',
                        marginBottom: '0.5rem',
                        transition: 'color 0.3s ease'
                      }}>
                        {isDragging 
                          ? 'Lasă fișierele aici' 
                          : galleryFiles.length >= 10 
                            ? 'Limită atinsă (10 imagini)'
                            : 'Trage și plasează imagini aici'}
                      </p>
                      <p style={{
                        fontSize: isMobile ? '0.8125rem' : '0.875rem',
                        color: '#64748b',
                        marginBottom: '0.75rem'
                      }}>
                        sau <span style={{ color: '#10b981', fontWeight: '600', cursor: 'pointer' }}>browsează</span> pentru a selecta
                      </p>
                      <p style={{
                        fontSize: '0.75rem',
                        color: '#94a3b8',
                        marginTop: '0.5rem'
                      }}>
                        Maxim 10 imagini, fiecare până la 5MB
                      </p>
                    </div>
                    {galleryFiles.length > 0 && (
                      <div style={{
                        marginTop: '0.5rem',
                        padding: '0.5rem 1rem',
                        background: '#f0fdf4',
                        borderRadius: '8px',
                        border: '1px solid #d1fae5'
                      }}>
                        <p style={{ 
                          color: '#059669', 
                          fontSize: '0.875rem', 
                          fontWeight: '600',
                          margin: 0
                        }}>
                          {galleryFiles.length} / 10 imagini încărcate
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {galleryPreviews.length > 0 && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(180px, 1fr))',
                  gap: isMobile ? '1rem' : '1.25rem',
                  marginTop: isMobile ? '1.5rem' : '2rem'
                }}>
                  {galleryPreviews.map((preview, index) => (
                    <div 
                      key={index} 
                      style={{ 
                        position: 'relative',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                      onMouseEnter={(e) => {
                        if (!isMobile) {
                          e.currentTarget.style.transform = 'translateY(-4px)'
                          e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.12)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isMobile) {
                          e.currentTarget.style.transform = 'translateY(0)'
                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)'
                        }
                      }}
                    >
                      <img
                        src={preview}
                        alt={`Gallery ${index + 1}`}
                        style={{
                          width: '100%',
                          height: isMobile ? '160px' : '200px',
                          objectFit: 'cover',
                          display: 'block'
                        }}
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          removeGalleryImage(index)
                        }}
                        style={{
                          position: 'absolute',
                          top: '0.75rem',
                          right: '0.75rem',
                          background: 'rgba(220, 38, 38, 0.95)',
                          backdropFilter: 'blur(8px)',
                          color: 'white',
                          border: 'none',
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s ease',
                          boxShadow: '0 2px 8px rgba(220, 38, 38, 0.3)'
                        }}
                        onMouseEnter={(e) => {
                          if (!isMobile) {
                            e.currentTarget.style.background = 'rgba(220, 38, 38, 1)'
                            e.currentTarget.style.transform = 'scale(1.1)'
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isMobile) {
                            e.currentTarget.style.background = 'rgba(220, 38, 38, 0.95)'
                            e.currentTarget.style.transform = 'scale(1)'
                          }
                        }}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M18 6L6 18M6 6l12 12"/>
                        </svg>
                      </button>
                      <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)',
                        padding: '0.75rem',
                        color: 'white',
                        fontSize: '0.75rem',
                        fontWeight: '500'
                      }}>
                        Imagine {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {galleryPreviews.length === 0 && (
                <div style={{ 
                  textAlign: 'center', 
                  marginTop: isMobile ? '1.5rem' : '2rem',
                  padding: isMobile ? '1.5rem' : '2rem',
                  background: '#f8fafc',
                  borderRadius: '12px',
                  border: '1px dashed #e2e8f0'
                }}>
                  <svg 
                    width="48" 
                    height="48" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="#cbd5e1" 
                    strokeWidth="1.5"
                    style={{ margin: '0 auto 1rem' }}
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                  </svg>
                  <p style={{ 
                    color: '#64748b', 
                    fontSize: isMobile ? '0.875rem' : '0.9375rem',
                    margin: 0,
                    fontWeight: '500'
                  }}>
                    Nu ai adăugat imagini încă
                  </p>
                  <p style={{ 
                    color: '#94a3b8', 
                    fontSize: isMobile ? '0.8125rem' : '0.875rem',
                    marginTop: '0.5rem',
                    margin: '0.5rem 0 0 0'
                  }}>
                    Poți sări peste acest pas
                  </p>
                </div>
              )}
              </div>
            </div>
          )}

          {/* Step 5: Sports Fields */}
          {currentStep === 5 && (
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
                  Terenuri
                </h2>
                <p style={{
                  fontSize: isMobile ? '0.875rem' : '0.9375rem',
                  color: '#64748b',
                  marginBottom: isMobile ? '1.5rem' : '2rem',
                  lineHeight: '1.6'
                }}>
                  Adaugă toate terenurile disponibile în baza ta sportivă. Fiecare teren poate fi de un tip diferit (fotbal, tenis, etc.) și poate avea propriile prețuri și facilități.
                </p>
              
              {/* Sports Fields List */}
              <div style={{ marginBottom: isMobile ? '1.5rem' : '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <label style={{ 
                    color: '#0f172a', 
                    fontWeight: '600',
                    fontSize: '0.875rem',
                    letterSpacing: '0.01em'
                  }}>Terenuri adăugate ({sportsFields.length})</label>
                  <button
                    type="button"
                    onClick={addSportsField}
                    style={{
                      padding: isMobile ? '0.75rem 1.25rem' : '0.625rem 1.5rem',
                      background: '#10b981',
                      color: 'white',
                      border: '1.5px solid #10b981',
                      borderRadius: '8px',
                      fontSize: isMobile ? '0.9375rem' : '0.875rem',
                      cursor: 'pointer',
                      fontWeight: '600',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                      touchAction: 'manipulation'
                    }}
                    onMouseEnter={(e) => {
                      if (!isMobile) {
                        e.currentTarget.style.background = '#059669'
                        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isMobile) {
                        e.currentTarget.style.background = '#10b981'
                        e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)'
                      }
                    }}
                  >
                    + Adaugă teren
                  </button>
                </div>
                
                {sportsFields.map((field, index) => (
                  <div key={index} style={{
                    padding: isMobile ? '1.25rem' : '1.5rem',
                    marginBottom: '1.5rem',
                    border: '1.5px solid #e2e8f0',
                    borderRadius: '8px',
                    background: '#ffffff',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
                      <span style={{ 
                        fontWeight: '600',
                        fontSize: '0.875rem',
                        color: '#0f172a',
                        letterSpacing: '0.01em'
                      }}>Teren #{index + 1}</span>
                      {sportsFields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSportsField(index)}
                          style={{
                            background: '#fee2e2',
                            color: '#dc2626',
                            border: '1.5px solid #fee2e2',
                            borderRadius: '6px',
                            padding: '0.5rem 1rem',
                            cursor: 'pointer',
                            fontSize: '0.8125rem',
                            fontWeight: '600',
                            transition: 'all 0.2s',
                            touchAction: 'manipulation'
                          }}
                          onMouseEnter={(e) => {
                            if (!isMobile) {
                              e.currentTarget.style.background = '#fecaca'
                              e.currentTarget.style.borderColor = '#fecaca'
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isMobile) {
                              e.currentTarget.style.background = '#fee2e2'
                              e.currentTarget.style.borderColor = '#fee2e2'
                            }
                          }}
                        >
                          Șterge
                        </button>
                      )}
                    </div>
                    
                    {/* Field Name */}
                    <div style={{ marginBottom: isMobile ? '1.25rem' : '1.5rem' }}>
                      <label style={{
                        display: 'block',
                        marginBottom: '0.75rem',
                        color: '#0f172a',
                        fontWeight: '600',
                        fontSize: '0.875rem',
                        letterSpacing: '0.01em'
                      }}>Nume teren *</label>
                      <input
                        type="text"
                        placeholder="ex: Teren Central, Teren 1, Teren de Tenis A"
                        value={field.fieldName}
                        onChange={(e) => updateSportsField(index, 'fieldName', e.target.value)}
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
                          e.target.style.borderColor = '#10b981'
                          e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)'
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#e2e8f0'
                          e.target.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)'
                        }}
                      />
                    </div>
                    
                    {/* Sport Type */}
                    <div style={{ marginBottom: isMobile ? '1.25rem' : '1.5rem', position: 'relative' }}>
                      <label style={{
                        display: 'block',
                        marginBottom: '0.75rem',
                        color: '#0f172a',
                        fontWeight: '600',
                        fontSize: '0.875rem',
                        letterSpacing: '0.01em'
                      }}>Tip sport *</label>
                      {showAddSportInput !== index ? (
                        <div style={{ position: 'relative' }}>
                          <input
                            type="text"
                            value={field.sportType || sportSearch[index] || ''}
                            onChange={(e) => {
                              const newSearch = { ...sportSearch }
                              newSearch[index] = e.target.value
                              setSportSearch(newSearch)
                              setShowSportDropdown({ ...showSportDropdown, [index]: true })
                              if (!e.target.value) {
                                updateSportsField(index, 'sportType', '')
                              }
                            }}
                            onClick={() => setShowSportDropdown({ ...showSportDropdown, [index]: true })}
                            onFocus={() => setShowSportDropdown({ ...showSportDropdown, [index]: true })}
                            placeholder="Caută sau selectează sport"
                            required={!field.sportType}
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
                              setTimeout(() => {
                                const newDropdown = { ...showSportDropdown }
                                delete newDropdown[index]
                                setShowSportDropdown(newDropdown)
                              }, 250)
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
                          {showSportDropdown[index] && (
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
                              {(availableSports.length > 0 || customSports.length > 0) ? (
                                [...availableSports, ...customSports.filter(s => !availableSports.includes(s))]
                                  .filter(sportOption => 
                                    !sportSearch[index] || 
                                    sportOption.toLowerCase().includes(sportSearch[index]?.toLowerCase() || '')
                                  )
                                  .map(sportOption => (
                                  <div
                                    key={sportOption}
                                    onMouseDown={(e) => {
                                      e.preventDefault()
                                      updateSportsField(index, 'sportType', sportOption)
                                      const newSearch = { ...sportSearch }
                                      delete newSearch[index]
                                      setSportSearch(newSearch)
                                      const newDropdown = { ...showSportDropdown }
                                      delete newDropdown[index]
                                      setShowSportDropdown(newDropdown)
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
                                  ))
                              ) : (
                                <div style={{
                                  padding: '0.75rem 1rem',
                                  color: '#64748b',
                                  fontSize: '0.875rem',
                                  textAlign: 'center'
                                }}>
                                  Se încarcă sporturile...
                                </div>
                              )}
                              <div
                                onMouseDown={(e) => {
                                  e.preventDefault()
                                  setShowAddSportInput(index)
                                  const newDropdown = { ...showSportDropdown }
                                  delete newDropdown[index]
                                  setShowSportDropdown(newDropdown)
                                  const newSearch = { ...sportSearch }
                                  delete newSearch[index]
                                  setSportSearch(newSearch)
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
                              e.target.style.borderColor = '#10b981'
                              e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)'
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
                                const standardSports = ['tenis', 'fotbal', 'baschet', 'volei', 'handbal', 'badminton', 'squash']
                                if (!customSports.includes(sportName) && !standardSports.includes(sportName)) {
                                  setCustomSports([...customSports, sportName])
                                }
                                updateSportsField(index, 'sportType', sportName)
                                setNewSport('')
                                setShowAddSportInput(null)
                              }
                            }}
                            style={{
                              padding: isMobile ? '0.875rem 1.5rem' : '0.875rem 2rem',
                              background: '#10b981',
                              color: 'white',
                              border: '1.5px solid #10b981',
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
                                e.currentTarget.style.background = '#059669'
                                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)'
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!isMobile) {
                                e.currentTarget.style.background = '#10b981'
                                e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)'
                              }
                            }}
                          >
                            Adaugă
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowAddSportInput(null)
                              setNewSport('')
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
                    
                    {/* Slot Size */}
                    <div style={{ marginBottom: isMobile ? '1.25rem' : '1.5rem' }}>
                      <label style={{
                        display: 'block',
                        marginBottom: '0.75rem',
                        color: '#0f172a',
                        fontWeight: '600',
                        fontSize: '0.875rem',
                        letterSpacing: '0.01em'
                      }}>Dimensiune slot (minute) *</label>
                      <select
                        value={field.slotSize || 60}
                        onChange={(e) => updateSportsField(index, 'slotSize', parseInt(e.target.value))}
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
                          touchAction: 'manipulation',
                          cursor: 'pointer'
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
                        <option value={30}>30 minute</option>
                        <option value={60}>60 minute (1 oră)</option>
                        <option value={90}>90 minute (1.5 ore)</option>
                        <option value={120}>120 minute (2 ore)</option>
                      </select>
                      <p style={{
                        marginTop: '0.5rem',
                        fontSize: '0.8125rem',
                        color: '#64748b',
                        lineHeight: '1.5'
                      }}>
                        Dimensiunea slotului pentru rezervări (extensibil pentru rezervări online viitoare)
                      </p>
                    </div>

                    {/* Time Slots - Days List */}
                    <div style={{ marginBottom: isMobile ? '1.25rem' : '1.5rem' }}>
                      <label style={{
                        display: 'block',
                        marginBottom: '0.75rem',
                        color: '#0f172a',
                        fontWeight: '600',
                        fontSize: '0.875rem',
                        letterSpacing: '0.01em'
                      }}>Program și prețuri *</label>
                      
                      {/* Quick Apply Section */}
                      <div style={{
                        marginBottom: '1.5rem',
                        padding: '1rem',
                        background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)',
                        borderRadius: '10px',
                        border: '1px solid #d1fae5'
                      }}>
                        <div style={{
                          display: 'flex',
                          flexDirection: isMobile ? 'column' : 'row',
                          gap: '0.75rem',
                          alignItems: isMobile ? 'stretch' : 'end'
                        }}>
                          <div style={{ flex: 1 }}>
                            <label style={{
                              display: 'block',
                              fontSize: '0.8125rem',
                              fontWeight: '600',
                              color: '#0f172a',
                              marginBottom: '0.5rem'
                            }}>
                              Interval orar
                            </label>
                            <div style={{
                              display: 'grid',
                              gridTemplateColumns: '1fr 1fr',
                              gap: '0.5rem'
                            }}>
                              <input
                                type="time"
                                id={`quick-start-${index}`}
                                defaultValue="08:00"
                                style={{
                                  width: '100%',
                                  padding: '0.625rem',
                                  border: '1.5px solid #e2e8f0',
                                  borderRadius: '8px',
                                  fontSize: '0.875rem',
                                  background: '#ffffff'
                                }}
                              />
                              <input
                                type="time"
                                id={`quick-end-${index}`}
                                defaultValue="18:00"
                                style={{
                                  width: '100%',
                                  padding: '0.625rem',
                                  border: '1.5px solid #e2e8f0',
                                  borderRadius: '8px',
                                  fontSize: '0.875rem',
                                  background: '#ffffff'
                                }}
                              />
                            </div>
                          </div>
                          <div style={{ flex: 1 }}>
                            <label style={{
                              display: 'block',
                              fontSize: '0.8125rem',
                              fontWeight: '600',
                              color: '#0f172a',
                              marginBottom: '0.5rem'
                            }}>
                              Status
                            </label>
                            <select
                              id={`quick-status-${index}`}
                              defaultValue="open"
                              style={{
                                width: '100%',
                                padding: '0.625rem',
                                border: '1.5px solid #e2e8f0',
                                borderRadius: '8px',
                                fontSize: '0.875rem',
                                cursor: 'pointer',
                                background: '#ffffff'
                              }}
                            >
                              <option value="open">Deschis</option>
                              <option value="closed">Închis</option>
                            </select>
                          </div>
                          <div style={{ flex: 1 }}>
                            <label style={{
                              display: 'block',
                              fontSize: '0.8125rem',
                              fontWeight: '600',
                              color: '#0f172a',
                              marginBottom: '0.5rem'
                            }}>
                              Preț (lei/oră)
                            </label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                              <input
                                type="number"
                                id={`quick-price-${index}`}
                                min="0"
                                step="0.01"
                                placeholder="Ex: 50"
                                style={{
                                  width: '100%',
                                  padding: '0.625rem',
                                  border: '1.5px solid #e2e8f0',
                                  borderRadius: '8px',
                                  fontSize: '0.875rem',
                                  background: '#ffffff'
                                }}
                              />
                              <label style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                fontSize: '0.8125rem',
                                color: '#64748b',
                                cursor: 'pointer'
                              }}>
                                <input
                                  type="checkbox"
                                  id={`quick-price-unspecified-${index}`}
                                  style={{
                                    width: '16px',
                                    height: '16px',
                                    cursor: 'pointer'
                                  }}
                                  onChange={(e) => {
                                    const priceInput = document.getElementById(`quick-price-${index}`) as HTMLInputElement
                                    if (e.target.checked) {
                                      priceInput.value = ''
                                      priceInput.disabled = true
                                      priceInput.style.opacity = '0.5'
                                    } else {
                                      priceInput.disabled = false
                                      priceInput.style.opacity = '1'
                                    }
                                  }}
                                />
                                <span>Preț nespecificat</span>
                              </label>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const startTime = (document.getElementById(`quick-start-${index}`) as HTMLInputElement)?.value || '08:00'
                              const endTime = (document.getElementById(`quick-end-${index}`) as HTMLInputElement)?.value || '18:00'
                              const status = (document.getElementById(`quick-status-${index}`) as HTMLSelectElement)?.value as 'open' | 'closed'
                              const priceInput = document.getElementById(`quick-price-${index}`) as HTMLInputElement
                              const priceUnspecifiedCheckbox = document.getElementById(`quick-price-unspecified-${index}`) as HTMLInputElement
                              
                              let price: number | null = null
                              let isPriceUnspecified = false
                              
                              if (status === 'open') {
                                if (priceUnspecifiedCheckbox?.checked) {
                                  isPriceUnspecified = true
                                  price = null
                                } else {
                                  price = priceInput?.value ? parseFloat(priceInput.value) : null
                                  isPriceUnspecified = false
                                }
                              }
                              
                              const updated = [...sportsFields]
                              const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
                              
                              // Check for overlapping slots before adding
                              const overlappingDays: string[] = []
                              days.forEach(day => {
                                if (hasOverlappingSlot(day, startTime, endTime, updated[index].timeSlots)) {
                                  overlappingDays.push(day)
                                }
                              })
                              
                              if (overlappingDays.length > 0) {
                                const dayLabels: { [key: string]: string } = {
                                  monday: 'Luni',
                                  tuesday: 'Marți',
                                  wednesday: 'Miercuri',
                                  thursday: 'Joi',
                                  friday: 'Vineri',
                                  saturday: 'Sâmbătă',
                                  sunday: 'Duminică'
                                }
                                const dayNames = overlappingDays.map(d => dayLabels[d]).join(', ')
                                alert(`Există deja un slot configurat pentru intervalul ${startTime} - ${endTime} în zilele: ${dayNames}. Te rugăm să verifici și să modifici slot-urile existente.`)
                                return
                              }
                              
                              // Add new slots for all days (without removing existing ones)
                              days.forEach(day => {
                                updated[index].timeSlots.push({
                                  day,
                                  startTime,
                                  endTime,
                                  status,
                                  price: status === 'open' ? price : null,
                                  isPriceUnspecified: status === 'open' ? isPriceUnspecified : false
                                })
                              })
                              
                              setSportsFields(updated)
                            }}
                            style={{
                              padding: '0.625rem 1.25rem',
                              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              fontSize: '0.8125rem',
                              fontWeight: '600',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              whiteSpace: 'nowrap',
                              boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)',
                              height: 'fit-content'
                            }}
                            onMouseEnter={(e) => {
                              if (!isMobile) {
                                e.currentTarget.style.transform = 'translateY(-1px)'
                                e.currentTarget.style.boxShadow = '0 4px 6px rgba(16, 185, 129, 0.3)'
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!isMobile) {
                                e.currentTarget.style.transform = 'translateY(0)'
                                e.currentTarget.style.boxShadow = '0 2px 4px rgba(16, 185, 129, 0.2)'
                              }
                            }}
                          >
                            Aplică pentru toate zilele
                          </button>
                        </div>
                      </div>

                      {/* Days List */}
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem'
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
                          const daySlots = field.timeSlots.filter(slot => slot.day === day.key)
                          
                          return (
                            <div key={day.key} style={{
                              padding: '1.25rem',
                              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                              borderRadius: '12px',
                              border: '1.5px solid #e2e8f0',
                              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
                            }}>
                              {/* Day Header */}
                              <h3 style={{
                                margin: 0,
                                marginBottom: '1rem',
                                fontSize: '0.9375rem',
                                fontWeight: '600',
                                color: '#0f172a'
                              }}>
                                {day.label}
                              </h3>
                              
                              {/* Multiple time intervals per day */}
                              <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '1rem'
                              }}>
                                {/* Display existing intervals or "Închis" message */}
                                {daySlots.length === 0 ? (
                                  <div style={{
                                    padding: '1rem',
                                    background: '#f8fafc',
                                    borderRadius: '8px',
                                    border: '1.5px solid #e2e8f0',
                                    textAlign: 'center',
                                    color: '#64748b',
                                    fontSize: '0.875rem'
                                  }}>
                                    Închis - Nu există intervale configurate
                                  </div>
                                ) : (
                                  daySlots.map((slot, slotIndex) => (
                                    <div key={slotIndex} style={{
                                      padding: '1rem',
                                      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                                      borderRadius: '10px',
                                      border: '1.5px solid #e2e8f0',
                                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
                                    }}>
                                      <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: '0.75rem'
                                      }}>
                                        <span style={{
                                          fontSize: '0.8125rem',
                                          fontWeight: '600',
                                          color: '#0f172a'
                                        }}>
                                          Interval {slotIndex + 1}
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const updated = [...sportsFields]
                                            // Find and remove the specific slot by matching all properties
                                            const slotToRemove = updated[index].timeSlots.findIndex(s => 
                                              s.day === day.key && 
                                              s.startTime === slot.startTime && 
                                              s.endTime === slot.endTime
                                            )
                                            if (slotToRemove !== -1) {
                                              updated[index] = {
                                                ...updated[index],
                                                timeSlots: updated[index].timeSlots.filter((_, idx) => idx !== slotToRemove)
                                              }
                                              setSportsFields(updated)
                                            }
                                          }}
                                          style={{
                                            padding: '0.375rem 0.625rem',
                                            background: 'white',
                                            color: '#ef4444',
                                            border: '1.5px solid #fee2e2',
                                            borderRadius: '6px',
                                            fontSize: '0.75rem',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.25rem'
                                          }}
                                          onMouseEnter={(e) => {
                                            if (!isMobile) {
                                              e.currentTarget.style.borderColor = '#ef4444'
                                              e.currentTarget.style.background = '#fef2f2'
                                            }
                                          }}
                                          onMouseLeave={(e) => {
                                            if (!isMobile) {
                                              e.currentTarget.style.borderColor = '#fee2e2'
                                              e.currentTarget.style.background = 'white'
                                            }
                                          }}
                                        >
                                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M18 6L6 18M6 6l12 12"/>
                                          </svg>
                                          Șterge
                                        </button>
                                      </div>
                                      
                                      {/* Time interval inputs */}
                                      <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                                        gap: '0.75rem',
                                        marginBottom: '0.75rem'
                                      }}>
                                        <div>
                                          <label style={{
                                            display: 'block',
                                            fontSize: '0.8125rem',
                                            fontWeight: '600',
                                            color: '#0f172a',
                                            marginBottom: '0.5rem'
                                          }}>
                                            De la
                                          </label>
                                          <input
                                            type="time"
                                            value={slot.startTime}
                                            onChange={(e) => {
                                              const updated = [...sportsFields]
                                              const slotIdx = updated[index].timeSlots.findIndex(s => 
                                                s.day === day.key && 
                                                s.startTime === slot.startTime && 
                                                s.endTime === slot.endTime
                                              )
                                              if (slotIdx !== -1) {
                                                const newStartTime = e.target.value
                                                const currentSlot = updated[index].timeSlots[slotIdx]
                                                
                                                // Check for overlapping slots (excluding current slot)
                                                if (hasOverlappingSlot(day.key, newStartTime, currentSlot.endTime, updated[index].timeSlots, currentSlot)) {
                                                  alert(`Există deja un slot configurat pentru intervalul ${newStartTime} - ${currentSlot.endTime} în ziua ${day.label}. Te rugăm să verifici și să modifici slot-urile existente.`)
                                                  return
                                                }
                                                
                                                updated[index].timeSlots[slotIdx] = {
                                                  ...updated[index].timeSlots[slotIdx],
                                                  startTime: newStartTime
                                                }
                                                setSportsFields(updated)
                                              }
                                            }}
                                            style={{
                                              width: '100%',
                                              padding: '0.75rem',
                                              border: '1.5px solid #e2e8f0',
                                              borderRadius: '8px',
                                              fontSize: '0.9375rem',
                                              background: '#ffffff',
                                              transition: 'all 0.2s ease'
                                            }}
                                            onFocus={(e) => {
                                              e.target.style.borderColor = '#10b981'
                                              e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)'
                                            }}
                                            onBlur={(e) => {
                                              e.target.style.borderColor = '#e2e8f0'
                                              e.target.style.boxShadow = 'none'
                                            }}
                                          />
                                        </div>
                                        
                                        <div>
                                          <label style={{
                                            display: 'block',
                                            fontSize: '0.8125rem',
                                            fontWeight: '600',
                                            color: '#0f172a',
                                            marginBottom: '0.5rem'
                                          }}>
                                            Până la
                                          </label>
                                          <input
                                            type="time"
                                            value={slot.endTime}
                                            onChange={(e) => {
                                              const updated = [...sportsFields]
                                              const slotIdx = updated[index].timeSlots.findIndex(s => 
                                                s.day === day.key && 
                                                s.startTime === slot.startTime && 
                                                s.endTime === slot.endTime
                                              )
                                              if (slotIdx !== -1) {
                                                const newEndTime = e.target.value
                                                const currentSlot = updated[index].timeSlots[slotIdx]
                                                
                                                // Check for overlapping slots (excluding current slot)
                                                if (hasOverlappingSlot(day.key, currentSlot.startTime, newEndTime, updated[index].timeSlots, currentSlot)) {
                                                  alert(`Există deja un slot configurat pentru intervalul ${currentSlot.startTime} - ${newEndTime} în ziua ${day.label}. Te rugăm să verifici și să modifici slot-urile existente.`)
                                                  return
                                                }
                                                
                                                updated[index].timeSlots[slotIdx] = {
                                                  ...updated[index].timeSlots[slotIdx],
                                                  endTime: newEndTime
                                                }
                                                setSportsFields(updated)
                                              }
                                            }}
                                            style={{
                                              width: '100%',
                                              padding: '0.75rem',
                                              border: '1.5px solid #e2e8f0',
                                              borderRadius: '8px',
                                              fontSize: '0.9375rem',
                                              background: '#ffffff',
                                              transition: 'all 0.2s ease'
                                            }}
                                            onFocus={(e) => {
                                              e.target.style.borderColor = '#10b981'
                                              e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)'
                                            }}
                                            onBlur={(e) => {
                                              e.target.style.borderColor = '#e2e8f0'
                                              e.target.style.boxShadow = 'none'
                                            }}
                                          />
                                        </div>
                                      </div>
                                      
                                      {/* Status selector */}
                                      <div style={{ marginBottom: '0.75rem' }}>
                                        <label style={{
                                          display: 'block',
                                          fontSize: '0.8125rem',
                                          fontWeight: '600',
                                          color: '#0f172a',
                                          marginBottom: '0.5rem'
                                        }}>
                                          Status
                                        </label>
                                        <select
                                          value={slot.status}
                                          onChange={(e) => {
                                            const updated = [...sportsFields]
                                            const status = e.target.value as 'open' | 'closed'
                                            const slotIdx = updated[index].timeSlots.findIndex(s => 
                                              s.day === day.key && 
                                              s.startTime === slot.startTime && 
                                              s.endTime === slot.endTime
                                            )
                                            if (slotIdx !== -1) {
                                              updated[index].timeSlots[slotIdx] = {
                                                ...updated[index].timeSlots[slotIdx],
                                                status,
                                                price: status === 'closed' ? null : updated[index].timeSlots[slotIdx].price,
                                                isPriceUnspecified: status === 'closed' ? false : updated[index].timeSlots[slotIdx].isPriceUnspecified
                                              }
                                              setSportsFields(updated)
                                            }
                                          }}
                                          style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            border: '1.5px solid #e2e8f0',
                                            borderRadius: '8px',
                                            fontSize: '0.9375rem',
                                            cursor: 'pointer',
                                            background: '#ffffff',
                                            transition: 'all 0.2s ease'
                                          }}
                                          onFocus={(e) => {
                                            e.currentTarget.style.borderColor = '#10b981'
                                            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)'
                                          }}
                                          onBlur={(e) => {
                                            e.currentTarget.style.borderColor = '#e2e8f0'
                                            e.currentTarget.style.boxShadow = 'none'
                                          }}
                                        >
                                          <option value="open">Deschis</option>
                                          <option value="closed">Închis</option>
                                        </select>
                                      </div>
                                      
                                      {/* Price input - only if status is open */}
                                      {slot.status === 'open' && (
                                        <div>
                                          <label style={{
                                            display: 'block',
                                            fontSize: '0.8125rem',
                                            fontWeight: '600',
                                            color: '#0f172a',
                                            marginBottom: '0.5rem'
                                          }}>
                                            Preț (lei/oră)
                                          </label>
                                          <div style={{
                                            display: 'flex',
                                            gap: '0.75rem',
                                            alignItems: 'center'
                                          }}>
                                            <input
                                              type="number"
                                              min="0"
                                              step="0.01"
                                              value={slot.price !== null && slot.price !== undefined ? slot.price : ''}
                                              onChange={(e) => {
                                                const updated = [...sportsFields]
                                                const slotIdx = updated[index].timeSlots.findIndex(s => 
                                                  s.day === day.key && 
                                                  s.startTime === slot.startTime && 
                                                  s.endTime === slot.endTime
                                                )
                                                if (slotIdx !== -1) {
                                                  updated[index].timeSlots[slotIdx] = {
                                                    ...updated[index].timeSlots[slotIdx],
                                                    price: e.target.value ? parseFloat(e.target.value) : null,
                                                    isPriceUnspecified: false
                                                  }
                                                  setSportsFields(updated)
                                                }
                                              }}
                                              placeholder="Ex: 50"
                                              disabled={slot.isPriceUnspecified}
                                              style={{
                                                flex: 1,
                                                padding: '0.75rem',
                                                border: '1.5px solid #e2e8f0',
                                                borderRadius: '8px',
                                                fontSize: '0.9375rem',
                                                background: slot.isPriceUnspecified ? '#f8fafc' : '#ffffff',
                                                color: slot.isPriceUnspecified ? '#94a3b8' : '#0f172a',
                                                transition: 'all 0.2s ease',
                                                cursor: slot.isPriceUnspecified ? 'not-allowed' : 'text'
                                              }}
                                              onFocus={(e) => {
                                                if (!slot.isPriceUnspecified) {
                                                  e.target.style.borderColor = '#10b981'
                                                  e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)'
                                                }
                                              }}
                                              onBlur={(e) => {
                                                e.target.style.borderColor = '#e2e8f0'
                                                e.target.style.boxShadow = 'none'
                                              }}
                                            />
                                            <button
                                              type="button"
                                              onClick={() => {
                                                const updated = [...sportsFields]
                                                const slotIdx = updated[index].timeSlots.findIndex(s => 
                                                  s.day === day.key && 
                                                  s.startTime === slot.startTime && 
                                                  s.endTime === slot.endTime
                                                )
                                                if (slotIdx !== -1) {
                                                  const isUnspecified = updated[index].timeSlots[slotIdx].isPriceUnspecified || false
                                                  updated[index].timeSlots[slotIdx] = {
                                                    ...updated[index].timeSlots[slotIdx],
                                                    isPriceUnspecified: !isUnspecified,
                                                    price: !isUnspecified ? null : updated[index].timeSlots[slotIdx].price
                                                  }
                                                  setSportsFields(updated)
                                                }
                                              }}
                                              style={{
                                                padding: '0.625rem 1rem',
                                                background: slot.isPriceUnspecified 
                                                  ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
                                                  : 'white',
                                                color: slot.isPriceUnspecified ? 'white' : '#64748b',
                                                border: slot.isPriceUnspecified 
                                                  ? 'none' 
                                                  : '1.5px solid #e2e8f0',
                                                borderRadius: '8px',
                                                fontSize: '0.8125rem',
                                                fontWeight: '600',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease',
                                                whiteSpace: 'nowrap',
                                                boxShadow: slot.isPriceUnspecified 
                                                  ? '0 2px 4px rgba(16, 185, 129, 0.2)' 
                                                  : 'none'
                                              }}
                                              onMouseEnter={(e) => {
                                                if (!isMobile && !slot.isPriceUnspecified) {
                                                  e.currentTarget.style.borderColor = '#10b981'
                                                  e.currentTarget.style.color = '#10b981'
                                                }
                                              }}
                                              onMouseLeave={(e) => {
                                                if (!isMobile && !slot.isPriceUnspecified) {
                                                  e.currentTarget.style.borderColor = '#e2e8f0'
                                                  e.currentTarget.style.color = '#64748b'
                                                }
                                              }}
                                            >
                                              {slot.isPriceUnspecified ? 'Nespecificat ✓' : 'Nespecificat'}
                                            </button>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  ))
                                )}
                                
                                {/* Add new interval button */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = [...sportsFields]
                                    const newSlot: TimeSlot = {
                                      day: day.key,
                                      startTime: '08:00',
                                      endTime: '18:00',
                                      status: 'open',
                                      price: null,
                                      isPriceUnspecified: false
                                    }
                                    
                                    // Check for overlapping slots
                                    if (hasOverlappingSlot(day.key, newSlot.startTime, newSlot.endTime, updated[index].timeSlots)) {
                                      alert(`Există deja un slot configurat pentru intervalul ${newSlot.startTime} - ${newSlot.endTime} în ziua ${day.label}. Te rugăm să verifici și să modifici slot-urile existente.`)
                                      return
                                    }
                                    
                                    updated[index] = {
                                      ...updated[index],
                                      timeSlots: [...updated[index].timeSlots, newSlot]
                                    }
                                    setSportsFields(updated)
                                  }}
                                  style={{
                                    padding: '0.75rem 1rem',
                                    background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)',
                                    color: '#10b981',
                                    border: '1.5px solid #d1fae5',
                                    borderRadius: '8px',
                                    fontSize: '0.8125rem',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem'
                                  }}
                                  onMouseEnter={(e) => {
                                    if (!isMobile) {
                                      e.currentTarget.style.background = 'linear-gradient(135deg, #d1fae5 0%, #f0fdf4 100%)'
                                      e.currentTarget.style.borderColor = '#10b981'
                                    }
                                  }}
                                  onMouseLeave={(e) => {
                                    if (!isMobile) {
                                      e.currentTarget.style.background = 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)'
                                      e.currentTarget.style.borderColor = '#d1fae5'
                                    }
                                  }}
                                >
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 5v14M5 12h14"/>
                                  </svg>
                                  Adaugă interval
                                </button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                    
                    {/* Description */}
                    <div style={{ marginBottom: isMobile ? '1.25rem' : '1.5rem' }}>
                      <label style={{
                        display: 'block',
                        marginBottom: '0.75rem',
                        color: '#0f172a',
                        fontWeight: '600',
                        fontSize: '0.875rem',
                        letterSpacing: '0.01em'
                      }}>Descriere (opțional)</label>
                      <textarea
                        placeholder="Descrie terenul (ex: Teren sintetic, iluminat, cu vestiar)"
                        value={field.description}
                        onChange={(e) => updateSportsField(index, 'description', e.target.value)}
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
                          e.target.style.borderColor = '#10b981'
                          e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)'
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#e2e8f0'
                          e.target.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)'
                        }}
                      />
                    </div>
                    
                    {/* Features - Toggle Switches */}
                    <div style={{ marginBottom: isMobile ? '1.25rem' : '1.5rem' }}>
                      <label style={{
                        display: 'block',
                        marginBottom: '0.75rem',
                        color: '#0f172a',
                        fontWeight: '600',
                        fontSize: '0.875rem',
                        letterSpacing: '0.01em'
                      }}>Facilități</label>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
                        gap: '0.75rem'
                      }}>
                        {[
                          { key: 'hasParking', label: 'Parcare' },
                          { key: 'hasShower', label: 'Duș' },
                          { key: 'hasChangingRoom', label: 'Vestiar' },
                          { key: 'hasAirConditioning', label: 'Aer condiționat' },
                          { key: 'hasLighting', label: 'Iluminat' },
                          { key: 'hasWiFi', label: 'WiFi' },
                          { key: 'hasBar', label: 'Bar/Restaurant' },
                          { key: 'hasFirstAid', label: 'Sală prim ajutor' },
                          { key: 'hasEquipmentRental', label: 'Închiriere echipament' },
                          { key: 'hasLocker', label: 'Locker-uri' },
                          { key: 'hasTowelService', label: 'Serviciu prosoape' },
                          { key: 'hasWaterFountain', label: 'Fântână apă' },
                          { key: 'hasSeating', label: 'Tribună/Locuri' },
                          { key: 'hasScoreboard', label: 'Tablou de scor' },
                          { key: 'hasSoundSystem', label: 'Sistem sonor' },
                          { key: 'hasHeating', label: 'Încălzire' },
                          { key: 'hasCover', label: 'Acoperiș' },
                          { key: 'hasGrass', label: 'Iarbă naturală' },
                          { key: 'hasArtificialGrass', label: 'Iarbă sintetică' },
                          { key: 'hasIndoor', label: 'Interior' },
                          { key: 'hasOutdoor', label: 'Exterior' }
                        ].map(feature => {
                          const isChecked = field.features[feature.key as keyof SportsField['features']]
                          return (
                            <label key={feature.key} style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              cursor: 'pointer',
                              padding: '0.75rem',
                              borderRadius: '8px',
                              border: '1.5px solid #e2e8f0',
                              background: isChecked ? '#f0fdf4' : '#ffffff',
                              transition: 'all 0.2s ease'
                            }}>
                              <span style={{
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                color: '#0f172a'
                              }}>{feature.label}</span>
                              <div
                                onClick={(e) => {
                                  e.preventDefault()
                                  updateSportsFieldFeature(index, feature.key as keyof SportsField['features'], !isChecked)
                                }}
                                style={{
                                  width: '44px',
                                  height: '24px',
                                  borderRadius: '12px',
                                  background: isChecked ? '#10b981' : '#cbd5e1',
                                  position: 'relative',
                                  cursor: 'pointer',
                                  transition: 'background 0.2s ease',
                                  flexShrink: 0
                                }}
                              >
                                <div style={{
                                  width: '20px',
                                  height: '20px',
                                  borderRadius: '50%',
                                  background: '#ffffff',
                                  position: 'absolute',
                                  top: '2px',
                                  left: isChecked ? '22px' : '2px',
                                  transition: 'left 0.2s ease',
                                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)'
                                }} />
                              </div>
                            </label>
                          )
                        })}
                      </div>
                    </div>

                  </div>
                ))}
              </div>
              <div style={{
                display: 'flex',
                justifyContent: isMobile ? 'center' : 'flex-end',
                marginTop: isMobile ? '0.5rem' : '1rem'
              }}>
                <button
                  type="button"
                  onClick={addSportsField}
                  style={{
                    padding: isMobile ? '0.75rem 1.25rem' : '0.625rem 1.5rem',
                    background: '#10b981',
                    color: 'white',
                    border: '1.5px solid #10b981',
                    borderRadius: '8px',
                    fontSize: isMobile ? '0.9375rem' : '0.875rem',
                    cursor: 'pointer',
                    fontWeight: '600',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                    touchAction: 'manipulation'
                  }}
                  onMouseEnter={(e) => {
                    if (!isMobile) {
                      e.currentTarget.style.background = '#059669'
                      e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isMobile) {
                      e.currentTarget.style.background = '#10b981'
                      e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)'
                    }
                  }}
                >
                  + Adaugă teren
                </button>
              </div>
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
              {currentStep < 6 ? (
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

        {/* Success Step - Outside form since it doesn't need form submission */}
        {currentStep === 6 && credentials && (
          <div style={{
            textAlign: 'center',
            padding: isMobile ? '2rem 1rem' : '3rem'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              padding: isMobile ? '2rem 1.5rem' : '3rem',
              borderRadius: '12px',
              marginBottom: '2rem',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
            }}>
              <h2 style={{
                color: 'white',
                fontSize: isMobile ? '1.5rem' : '2rem',
                marginBottom: '1.5rem',
                fontWeight: '600',
                margin: 0
              }}>Cererea a fost înregistrată cu succes!</h2>
              
              <div style={{
                background: 'rgba(255, 255, 255, 0.15)',
                borderRadius: '8px',
                padding: '1.5rem',
                marginBottom: '1.5rem',
                textAlign: 'left'
              }}>
                <p style={{
                  color: 'rgba(255, 255, 255, 0.95)',
                  marginBottom: '1rem',
                  fontSize: '1rem',
                  lineHeight: '1.6',
                  margin: '0 0 1rem 0',
                  fontWeight: '500'
                }}>
                  Ce urmează?
                </p>
                <ul style={{
                  color: 'rgba(255, 255, 255, 0.95)',
                  fontSize: '0.9375rem',
                  lineHeight: '1.8',
                  margin: 0,
                  paddingLeft: '1.5rem'
                }}>
                  <li style={{ marginBottom: '0.75rem' }}>
                    <strong>Vei primi un email</strong> cu datele de conectare (username și parolă) la adresa de email furnizată
                  </li>
                  <li style={{ marginBottom: '0.75rem' }}>
                    <strong>Cererea ta este în așteptarea aprobării</strong> de către administrator
                  </li>
                  <li style={{ marginBottom: '0.75rem' }}>
                    <strong>După aprobare</strong>, baza ta sportivă va deveni publică pe platformă și vei primi o notificare pe email
                  </li>
                  <li>
                    Poți accesa contul tău folosind datele de conectare primite pe email
                  </li>
                </ul>
              </div>
              
              <div style={{
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                padding: '1rem',
                border: '1px solid rgba(255, 255, 255, 0.3)'
              }}>
                <p style={{
                  color: 'rgba(255, 255, 255, 0.95)',
                  fontSize: '0.875rem',
                  lineHeight: '1.6',
                  margin: 0
                }}>
                  <strong>Important:</strong> Verifică inbox-ul (și spam-ul) pentru email-ul cu datele de conectare. Dacă nu primești email-ul în câteva minute, verifică că adresa de email este corectă.
                </p>
              </div>
            </div>
            
            <div style={{
              background: '#f8fafc',
              padding: '1.5rem',
              borderRadius: '12px',
              marginBottom: '2rem',
              border: '1px solid #e2e8f0',
              textAlign: 'left'
            }}>
              <p style={{
                color: '#64748b',
                marginBottom: '1rem',
                fontSize: '0.9375rem',
                lineHeight: '1.6',
                fontWeight: '500'
              }}>
                Datele de conectare (au fost trimise și pe email):
              </p>
              
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
              background: '#eff6ff',
              border: '1px solid #3b82f6',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '2rem',
              textAlign: 'left'
            }}>
              <p style={{
                margin: 0,
                color: '#1e40af',
                fontSize: '0.875rem',
                lineHeight: '1.6'
              }}>
                <strong>Notă:</strong> Aceste credențiale au fost trimise și pe email. Salvează-le într-un loc sigur - vei avea nevoie de ele pentru a accesa și edita detaliile bazei tale sportive după aprobare.
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
      </div>
    </div>
  )
}

export default RegisterSportsBase

