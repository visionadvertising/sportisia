import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import API_BASE_URL from '../config'

type FacilityType = 'field' | 'coach' | 'repair_shop' | 'equipment_shop'

function Register() {
  const navigate = useNavigate()
  const [facilityType, setFacilityType] = useState<FacilityType>('field')
  const [loading, setLoading] = useState(false)
  const [credentials, setCredentials] = useState<{ username: string; password: string } | null>(null)
  const [error, setError] = useState('')

  // Common fields
  const [name, setName] = useState('')
  const [city, setCity] = useState('')
  const [location, setLocation] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [website, setWebsite] = useState('')
  const [openingHours, setOpeningHours] = useState('')

  // Field specific
  const [sport, setSport] = useState('')
  const [pricePerHour, setPricePerHour] = useState('')
  const [hasParking, setHasParking] = useState(false)
  const [hasShower, setHasShower] = useState(false)
  const [hasChangingRoom, setHasChangingRoom] = useState(false)
  const [hasAirConditioning, setHasAirConditioning] = useState(false)
  const [hasLighting, setHasLighting] = useState(false)

  // Coach specific
  const [specialization, setSpecialization] = useState('')
  const [experienceYears, setExperienceYears] = useState('')
  const [pricePerLesson, setPricePerLesson] = useState('')
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          facilityType,
          name,
          city,
          location,
          phone,
          email,
          description: description || null,
          imageUrl: imageUrl || null,
          website: website || null,
          openingHours: openingHours || null,
          // Field specific
          sport: facilityType === 'field' ? sport : null,
          pricePerHour: facilityType === 'field' ? pricePerHour : null,
          hasParking: facilityType === 'field' ? hasParking : false,
          hasShower: facilityType === 'field' ? hasShower : false,
          hasChangingRoom: facilityType === 'field' ? hasChangingRoom : false,
          hasAirConditioning: facilityType === 'field' ? hasAirConditioning : false,
          hasLighting: facilityType === 'field' ? hasLighting : false,
          // Coach specific
          specialization: facilityType === 'coach' ? specialization : null,
          experienceYears: facilityType === 'coach' ? experienceYears : null,
          pricePerLesson: facilityType === 'coach' ? pricePerLesson : null,
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

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem'
    }}>
      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '16px',
        padding: '3rem',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          color: '#1e3c72',
          marginBottom: '0.5rem',
          textAlign: 'center'
        }}>Înregistrare Facilitate</h1>
        <p style={{
          color: '#666',
          textAlign: 'center',
          marginBottom: '2rem'
        }}>Completează formularul pentru a-ți înregistra facilitatea</p>

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

        <form onSubmit={handleSubmit}>
          {/* Facility Type Selection */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: '#333',
              fontWeight: 'bold',
              fontSize: '1.1rem'
            }}>Tip facilitate *</label>
            <select
              value={facilityType}
              onChange={(e) => setFacilityType(e.target.value as FacilityType)}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '1rem',
                outline: 'none'
              }}
            >
              <option value="field">Teren Sportiv</option>
              <option value="coach">Antrenor</option>
              <option value="repair_shop">Magazin Reparații Articole Sportive</option>
              <option value="equipment_shop">Magazin Articole Sportive</option>
            </select>
          </div>

          {/* Common Fields */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '1rem',
            marginBottom: '1.5rem'
          }}>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: '#333',
                fontWeight: '500'
              }}>Nume facilitate *</label>
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
            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: '#333',
                fontWeight: '500'
              }}>Oraș *</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
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
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: '#333',
              fontWeight: '500'
            }}>Adresă completă *</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
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

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '1rem',
            marginBottom: '1.5rem'
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
          </div>

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
            gap: '1rem',
            marginBottom: '1.5rem'
          }}>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: '#333',
                fontWeight: '500'
              }}>URL Imagine</label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
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
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: '#333',
              fontWeight: '500'
            }}>Program (ex: Luni-Vineri 9:00-18:00)</label>
            <input
              type="text"
              value={openingHours}
              onChange={(e) => setOpeningHours(e.target.value)}
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

          {/* Field Specific Fields */}
          {facilityType === 'field' && (
            <div style={{
              background: '#f9fafb',
              padding: '1.5rem',
              borderRadius: '8px',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{ color: '#1e3c72', marginBottom: '1rem' }}>Detalii Teren</h3>
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
                  }}>Sport *</label>
                  <select
                    value={sport}
                    onChange={(e) => setSport(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #e0e0e0',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      outline: 'none'
                    }}
                  >
                    <option value="">Selectează sport</option>
                    <option value="tenis">Tenis</option>
                    <option value="fotbal">Fotbal</option>
                    <option value="baschet">Baschet</option>
                    <option value="volei">Volei</option>
                    <option value="handbal">Handbal</option>
                    <option value="badminton">Badminton</option>
                    <option value="squash">Squash</option>
                  </select>
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    color: '#333',
                    fontWeight: '500'
                  }}>Preț pe oră (RON) *</label>
                  <input
                    type="number"
                    value={pricePerHour}
                    onChange={(e) => setPricePerHour(e.target.value)}
                    required
                    min="0"
                    step="0.01"
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

          {/* Coach Specific Fields */}
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
                    placeholder="ex: Tenis pentru începători"
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
                  }}>Preț pe lecție (RON) *</label>
                  <input
                    type="number"
                    value={pricePerLesson}
                    onChange={(e) => setPricePerLesson(e.target.value)}
                    required
                    min="0"
                    step="0.01"
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
              <div>
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
                  placeholder="Listează certificările tale"
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
            </div>
          )}

          {/* Repair Shop Specific Fields */}
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
                }}>Servicii oferite *</label>
                <textarea
                  value={servicesOffered}
                  onChange={(e) => setServicesOffered(e.target.value)}
                  required
                  rows={4}
                  placeholder="ex: Reparație rachete tenis, Reparație pantofi sport, Reparație echipamente fitness"
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
                    placeholder="ex: Nike, Adidas, Wilson"
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

          {/* Equipment Shop Specific Fields */}
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
                }}>Categorii produse *</label>
                <textarea
                  value={productsCategories}
                  onChange={(e) => setProductsCategories(e.target.value)}
                  required
                  rows={4}
                  placeholder="ex: Rachete tenis, Pantofi sport, Echipamente fitness, Accesorii"
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
                gap: '1rem',
                marginBottom: '1rem'
              }}>
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
                    placeholder="ex: Nike, Adidas, Wilson, Head"
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
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    cursor: 'pointer',
                    marginTop: '1.5rem'
                  }}>
                    <input
                      type="checkbox"
                      checked={deliveryAvailable}
                      onChange={(e) => setDeliveryAvailable(e.target.checked)}
                    />
                    <span>Livrare disponibilă</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                padding: '1rem',
                background: loading ? '#9ca3af' : '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Se înregistrează...' : 'Înregistrează facilitatea'}
            </button>
            <Link
              to="/"
              style={{
                padding: '1rem 2rem',
                background: '#e5e7eb',
                color: '#333',
                textDecoration: 'none',
                borderRadius: '8px',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                textAlign: 'center',
                display: 'block'
              }}
            >
              Anulează
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Register

