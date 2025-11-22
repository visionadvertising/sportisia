import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import API_BASE_URL from '../config'

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
  const [activeTab, setActiveTab] = useState<'fields' | 'coaches'>('fields')
  const [fields, setFields] = useState<Field[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFields()
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

  return (
    <>
      {/* Hero Section */}
      <div style={{
        background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #7e8ba3 100%)',
        padding: '6rem 2rem 4rem',
        textAlign: 'center',
        color: 'white'
      }}>
        <h1 style={{
          margin: 0,
          fontSize: '3.5rem',
          fontWeight: 'bold',
          marginBottom: '1rem',
          lineHeight: '1.2'
        }}>a Worldwide Sport Community</h1>
        <p style={{
          margin: 0,
          fontSize: '1.5rem',
          opacity: 0.95,
          marginBottom: '3rem'
        }}>Find what you need within seconds</p>

        {/* Search Bar */}
        <div style={{
          maxWidth: '1000px',
          margin: '0 auto',
          background: 'white',
          borderRadius: '12px',
          padding: '1.5rem',
          boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
          display: 'flex',
          gap: '1rem',
          alignItems: 'flex-end'
        }}>
          <div style={{ flex: '1', minWidth: '200px' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: '#333',
              fontWeight: '600',
              fontSize: '0.9rem',
              textTransform: 'uppercase'
            }}>LOCAȚIE</label>
            <input
              type="text"
              placeholder="Location"
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
          <div style={{ flex: '1', minWidth: '200px' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: '#333',
              fontWeight: '600',
              fontSize: '0.9rem',
              textTransform: 'uppercase'
            }}>SPORT</label>
            <select
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '1rem',
                outline: 'none',
                background: 'white',
                cursor: 'pointer'
              }}
            >
              <option value="">Sport</option>
              <option value="tenis">Tenis</option>
              <option value="fotbal">Fotbal</option>
              <option value="baschet">Baschet</option>
              <option value="volei">Volei</option>
            </select>
          </div>
          <div style={{ flex: '1', minWidth: '200px' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: '#333',
              fontWeight: '600',
              fontSize: '0.9rem',
              textTransform: 'uppercase'
            }}>TIP SERVICIU</label>
            <select
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '1rem',
                outline: 'none',
                background: 'white',
                cursor: 'pointer'
              }}
            >
              <option value="">Service type</option>
              <option value="teren">Teren</option>
              <option value="antrenor">Antrenor</option>
              <option value="echipa">Echipă</option>
            </select>
          </div>
          <button
            style={{
              padding: '0.75rem 2rem',
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              height: 'fit-content'
            }}
          >
            🔍
          </button>
        </div>

        {/* More filters link */}
        <div style={{ marginTop: '1.5rem' }}>
          <Link to="#" style={{
            color: 'white',
            textDecoration: 'none',
            fontSize: '0.9rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span>☰</span> More filters
          </Link>
        </div>
      </div>

      {/* Fields and Coaches Tabs Section */}
      <div style={{
        maxWidth: '1200px',
        margin: '4rem auto',
        padding: '0 2rem'
      }}>
        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '2rem',
          borderBottom: '2px solid #e0e0e0'
        }}>
          <button
            onClick={() => setActiveTab('fields')}
            style={{
              padding: '1rem 2rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'fields' ? '3px solid #10b981' : '3px solid transparent',
              color: activeTab === 'fields' ? '#10b981' : '#666',
              fontWeight: activeTab === 'fields' ? 'bold' : 'normal',
              cursor: 'pointer',
              fontSize: '1.1rem',
              transition: 'all 0.3s'
            }}
          >
            Terenuri
          </button>
          <button
            onClick={() => setActiveTab('coaches')}
            style={{
              padding: '1rem 2rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'coaches' ? '3px solid #10b981' : '3px solid transparent',
              color: activeTab === 'coaches' ? '#10b981' : '#666',
              fontWeight: activeTab === 'coaches' ? 'bold' : 'normal',
              cursor: 'pointer',
              fontSize: '1.1rem',
              transition: 'all 0.3s'
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
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '2rem'
            }}>
              <h2 style={{
                fontSize: '2rem',
                color: '#333',
                margin: 0
              }}>Terenuri disponibile</h2>
              <Link
                to="/adauga-teren"
                style={{
                  padding: '0.75rem 2rem',
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  display: 'inline-block'
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
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '2rem'
              }}>
                {fields.map((field) => (
                  <div
                    key={field.id}
                    style={{
                      background: 'white',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)'
                      e.currentTarget.style.boxShadow = '0 8px 12px rgba(0,0,0,0.15)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)'
                    }}
                  >
                    {field.image_url && (
                      <div style={{
                        width: '100%',
                        height: '200px',
                        background: `url(${field.image_url}) center/cover`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }} />
                    )}
                    <div style={{ padding: '1.5rem' }}>
                      <h3 style={{
                        margin: '0 0 0.5rem 0',
                        fontSize: '1.3rem',
                        color: '#333'
                      }}>{field.name}</h3>
                      <p style={{
                        margin: '0 0 0.5rem 0',
                        color: '#666',
                        fontSize: '0.9rem'
                      }}>📍 {field.city}, {field.location}</p>
                      <p style={{
                        margin: '0 0 0.5rem 0',
                        color: '#10b981',
                        fontWeight: 'bold'
                      }}>🎾 {field.sport}</p>
                      <p style={{
                        margin: '0 0 1rem 0',
                        color: '#333',
                        fontSize: '1.1rem',
                        fontWeight: 'bold'
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

              <button style={{
                marginTop: '2rem',
                padding: '1rem 2rem',
                background: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                width: '100%'
              }}>
                Become member
              </button>
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
