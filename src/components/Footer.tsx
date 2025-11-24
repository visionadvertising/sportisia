import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'

function Footer() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const currentYear = new Date().getFullYear()

  return (
    <footer style={{
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      color: 'white',
      marginTop: 'auto',
      padding: isMobile ? '3rem 1.5rem 2rem' : '4rem 2rem 2.5rem'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)',
          gap: isMobile ? '2.5rem' : '3rem',
          marginBottom: isMobile ? '2.5rem' : '3rem'
        }}>
          {/* Brand Section */}
          <div>
            <Link to="/" style={{
              textDecoration: 'none',
              display: 'inline-block',
              marginBottom: '1rem'
            }}>
              <h2 style={{
                margin: 0,
                fontSize: isMobile ? '1.5rem' : '1.875rem',
                fontWeight: '700',
                background: 'linear-gradient(135deg, #ffffff 0%, #10b981 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                letterSpacing: '-0.03em'
              }}>
                SPORTISIA
              </h2>
            </Link>
            <p style={{
              margin: 0,
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '0.875rem',
              lineHeight: '1.6',
              marginBottom: '1.5rem'
            }}>
              Platforma ta pentru găsirea bazei sportive, antrenorilor și magazinelor de articole sportive perfecte.
            </p>
            <div style={{
              display: 'flex',
              gap: '0.75rem'
            }}>
              {/* Social Media Icons - placeholder, can be customized */}
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </a>
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 style={{
              margin: 0,
              fontSize: '1rem',
              fontWeight: '600',
              marginBottom: '1.25rem',
              color: 'white'
            }}>
              Link-uri rapide
            </h3>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}>
              <li>
                <Link to="/" style={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  transition: 'color 0.2s ease',
                  display: 'inline-block'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#10b981'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'}
                >
                  Home
                </Link>
              </li>
              <li>
                <Link to="/terenuri" style={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  transition: 'color 0.2s ease',
                  display: 'inline-block'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#10b981'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'}
                >
                  Terenuri
                </Link>
              </li>
              <li>
                <Link to="/antrenori" style={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  transition: 'color 0.2s ease',
                  display: 'inline-block'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#10b981'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'}
                >
                  Antrenori
                </Link>
              </li>
              <li>
                <Link to="/magazine-reparatii" style={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  transition: 'color 0.2s ease',
                  display: 'inline-block'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#10b981'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'}
                >
                  Magazine Reparații
                </Link>
              </li>
              <li>
                <Link to="/magazine-articole" style={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  transition: 'color 0.2s ease',
                  display: 'inline-block'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#10b981'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'}
                >
                  Magazine Articole
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 style={{
              margin: 0,
              fontSize: '1rem',
              fontWeight: '600',
              marginBottom: '1.25rem',
              color: 'white'
            }}>
              Servicii
            </h3>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}>
              <li>
                <Link to="/register" style={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  transition: 'color 0.2s ease',
                  display: 'inline-block'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#10b981'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'}
                >
                  Înregistrare
                </Link>
              </li>
              <li>
                <Link to="/sugereaza" style={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  transition: 'color 0.2s ease',
                  display: 'inline-block'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#10b981'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'}
                >
                  Sugerează o bază sportivă
                </Link>
              </li>
              <li>
                <Link to="/login" style={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  transition: 'color 0.2s ease',
                  display: 'inline-block'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#10b981'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'}
                >
                  Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 style={{
              margin: 0,
              fontSize: '1rem',
              fontWeight: '600',
              marginBottom: '1.25rem',
              color: 'white'
            }}>
              Contact
            </h3>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem'
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255, 255, 255, 0.7)" strokeWidth="2" style={{ flexShrink: 0, marginTop: '2px' }}>
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                <p style={{
                  margin: 0,
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontSize: '0.875rem',
                  lineHeight: '1.6'
                }}>
                  România
                </p>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem'
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255, 255, 255, 0.7)" strokeWidth="2" style={{ flexShrink: 0, marginTop: '2px' }}>
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                <a href="mailto:contact@sportisia.ro" style={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  transition: 'color 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#10b981'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'}
                >
                  contact@sportisia.ro
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          paddingTop: isMobile ? '2rem' : '2.5rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'flex-start' : 'center',
          gap: isMobile ? '1rem' : '0'
        }}>
          <p style={{
            margin: 0,
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '0.8125rem'
          }}>
            © {currentYear} SPORTISIA. Toate drepturile rezervate.
          </p>
          <div style={{
            display: 'flex',
            gap: isMobile ? '1.5rem' : '2rem',
            flexWrap: 'wrap'
          }}>
            <Link to="/" style={{
              color: 'rgba(255, 255, 255, 0.6)',
              textDecoration: 'none',
              fontSize: '0.8125rem',
              transition: 'color 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#10b981'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)'}
            >
              Termeni și condiții
            </Link>
            <Link to="/" style={{
              color: 'rgba(255, 255, 255, 0.6)',
              textDecoration: 'none',
              fontSize: '0.8125rem',
              transition: 'color 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#10b981'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)'}
            >
              Politica de confidențialitate
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer

