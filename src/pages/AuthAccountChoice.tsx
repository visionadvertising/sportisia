import { Link, useSearchParams } from 'react-router-dom'
import { useState, useEffect } from 'react'

type AuthAccountChoiceProps = {
  mode: 'login' | 'register'
}

export default function AuthAccountChoice({ mode }: AuthAccountChoiceProps) {
  const [searchParams] = useSearchParams()
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const isLogin = mode === 'login'
  const nextQuery = searchParams.get('next')
  const nextSuffix = nextQuery && nextQuery.startsWith('/') ? `?next=${encodeURIComponent(nextQuery)}` : ''

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const title = isLogin ? 'Autentificare' : 'Înregistrare'
  const subtitle = isLogin
    ? 'Alege tipul de cont cu care vrei să te conectezi.'
    : 'Alege ce fel de cont vrei să creezi pe Sportisia.'

  const options = [
    {
      key: 'member',
      title: 'Membru comunitate',
      description: isLogin
        ? 'Salvezi facilități favorite și îți gestionezi contul personal.'
        : 'Cont gratuit pentru sportivi: favorite, setări cont și (în curând) programări.',
      href: isLogin ? `/login/membru${nextSuffix}` : '/register/cont',
      icon: (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      )
    },
    {
      key: 'facility',
      title: 'Administrator facilitate',
      description: isLogin
        ? 'Gestionezi profilul bazei sportive, antrenorului sau magazinului tău.'
        : 'Înregistrezi sau revendici o facilitate și accesezi panoul de administrare.',
      href: isLogin ? `/login/facilitate${nextSuffix}` : '/register/facilitate',
      icon: (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <line x1="3" y1="9" x2="21" y2="9" />
          <line x1="9" y1="21" x2="9" y2="9" />
        </svg>
      )
    }
  ]

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 180px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isMobile ? '2.5rem 1rem' : '3rem 1.5rem',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 55%, #0f172a 100%)'
      }}
    >
      <div style={{ width: '100%', maxWidth: '720px' }}>
        <p
          style={{
            margin: '0 0 0.5rem',
            textAlign: 'center',
            color: '#6ee7b7',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            fontSize: '0.75rem'
          }}
        >
          Sportisia
        </p>
        <h1
          style={{
            margin: 0,
            textAlign: 'center',
            color: 'white',
            fontSize: isMobile ? '1.75rem' : '2.15rem',
            letterSpacing: '-0.03em'
          }}
        >
          {title}
        </h1>
        <p style={{ margin: '0.65rem 0 1.75rem', textAlign: 'center', color: 'rgba(255,255,255,0.72)', lineHeight: 1.5 }}>
          {subtitle}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1rem' }}>
          {options.map((option) => (
            <Link
              key={option.key}
              to={option.href}
              style={{
                textDecoration: 'none',
                color: '#0f172a',
                background: 'white',
                borderRadius: '16px',
                padding: isMobile ? '1.35rem 1.25rem' : '1.5rem 1.35rem',
                border: '1px solid #e2e8f0',
                boxShadow: '0 16px 40px rgba(0,0,0,0.18)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.85rem',
                transition: 'transform 0.2s ease, border-color 0.2s ease'
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: '#ecfdf5',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {option.icon}
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>{option.title}</h2>
                <p style={{ margin: '0.45rem 0 0', fontSize: '0.92rem', color: '#64748b', lineHeight: 1.55 }}>{option.description}</p>
              </div>
              <span style={{ marginTop: 'auto', fontSize: '0.9rem', fontWeight: 700, color: '#059669' }}>
                Continuă →
              </span>
            </Link>
          ))}
        </div>

        <p style={{ marginTop: '1.25rem', textAlign: 'center', color: 'rgba(255,255,255,0.65)', fontSize: '0.9rem' }}>
          {isLogin ? (
            <>
              Nu ai cont? <Link to="/register" style={{ color: '#6ee7b7', fontWeight: 700 }}>Înregistrează-te</Link>
            </>
          ) : (
            <>
              Ai deja cont? <Link to="/login" style={{ color: '#6ee7b7', fontWeight: 700 }}>Autentifică-te</Link>
            </>
          )}
        </p>
      </div>
    </div>
  )
}
