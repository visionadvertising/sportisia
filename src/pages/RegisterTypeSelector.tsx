import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'

function RegisterTypeSelector() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const types = [
    {
      value: 'baze-sportive',
      label: 'Baze Sportive',
      description: 'Terenuri și facilități sportive',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="3" y1="9" x2="21" y2="9"></line>
          <line x1="9" y1="21" x2="9" y2="9"></line>
        </svg>
      )
    },
    {
      value: 'antrenori',
      label: 'Antrenori',
      description: 'Antrenori și instructori sportivi',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="8.5" cy="7" r="4"></circle>
          <line x1="20" y1="8" x2="20" y2="14"></line>
          <line x1="23" y1="11" x2="17" y2="11"></line>
        </svg>
      )
    },
    {
      value: 'magazine-reparatii',
      label: 'Magazine Reparații',
      description: 'Servicii de reparații echipamente sportive',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
        </svg>
      )
    },
    {
      value: 'magazine-articole',
      label: 'Magazine Articole',
      description: 'Magazine de articole sportive',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <path d="M16 10a4 4 0 0 1-8 0"></path>
        </svg>
      )
    }
  ]

  return (
    <div style={{
      minHeight: '100vh',
      background: '#fafafa',
      padding: isMobile ? '3rem 1rem' : '5rem 2rem'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <h1 style={{
          fontSize: isMobile ? '2rem' : '3rem',
          fontWeight: '700',
          color: '#0f172a',
          marginBottom: '1rem',
          textAlign: 'center'
        }}>Alege tipul de facilitate</h1>
        <p style={{
          fontSize: isMobile ? '1rem' : '1.125rem',
          color: '#64748b',
          textAlign: 'center',
          marginBottom: isMobile ? '2rem' : '3rem'
        }}>Selectează categoria care se potrivește cel mai bine cu serviciul tău</p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
          gap: '1.5rem',
          maxWidth: '900px',
          margin: '0 auto'
        }}>
          {types.map((type) => (
            <Link
              key={type.value}
              to={`/register/${type.value}`}
              style={{
                padding: isMobile ? '2rem 1.5rem' : '2.5rem 2rem',
                background: 'white',
                borderRadius: '12px',
                border: '1.5px solid #e2e8f0',
                textDecoration: 'none',
                color: '#0f172a',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '1rem',
                transition: 'all 0.2s ease',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#10b981'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.15)'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0'
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <div style={{
                width: '56px',
                height: '56px',
                background: '#f0fdf4',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#10b981'
              }}>
                {type.icon}
              </div>
              <div>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  margin: '0 0 0.5rem 0',
                  color: '#0f172a'
                }}>{type.label}</h3>
                <p style={{
                  fontSize: '0.9375rem',
                  color: '#64748b',
                  margin: 0,
                  lineHeight: '1.5'
                }}>{type.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default RegisterTypeSelector

