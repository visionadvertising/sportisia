import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

const BENEFITS = [
  {
    title: 'Crește-ți vizibilitatea',
    text: 'Prezintă-ți facilitățile, serviciile de antrenament sau magazinul tău în fața oamenilor care caută deja un teren, un antrenor sau un service în orașul lor. Profilul tău apare în liste, pe hartă și în căutările după sport, cu datele de contact la un click distanță.'
  },
  {
    title: 'Conectează-te cu sportivii locali',
    text: 'Sportisia te aduce mai aproape de publicul din zona ta, de la amatori care joacă seara până la sportivi care se antrenează constant. Ei filtrează după oraș și sport, iar tu ești acolo exact când au nevoie de un loc sau de un program.'
  },
  {
    title: 'Prezintă-ți expertiza',
    text: 'Evidențiază serviciile, programul, prețurile și ceea ce te diferențiază, într-un profil dedicat. Pozele, descrierea și detaliile pe care le completezi înlocuiesc informațiile generale și arată clar de ce merită să te aleagă.'
  },
  {
    title: 'Extinde-ți baza de clienți',
    text: 'Sportivii te pot suna sau deschide locația direct din listă, fără să te caute pe alte site-uri. Un profil complet aduce mai multe solicitări, iar cei care te-au găsit o dată revin când au nevoie din nou de același serviciu.'
  },
  {
    title: 'Preia controlul asupra profilului',
    text: 'Dacă locația ta este deja în platformă, o revendici și o actualizezi tu: program, prețuri, galerie și descriere. După activarea abonamentului, datele pe care le completezi înlocuiesc varianta existentă și profilul rămâne al tău.'
  }
]

export default function BusinessScrollCards({ isMobile }: { isMobile: boolean }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const update = () => {
      const track = trackRef.current
      if (!track) return
      const stickyTop = 76
      const rect = track.getBoundingClientRect()
      const scrollable = track.offsetHeight - (window.innerHeight - stickyTop)
      const traveled = Math.min(Math.max(stickyTop - rect.top, 0), Math.max(scrollable, 1))
      setProgress(scrollable <= 0 ? 0 : (traveled / scrollable) * (BENEFITS.length - 1))
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  const active = Math.round(progress)

  return (
    <div ref={trackRef} style={{ height: isMobile ? `${BENEFITS.length * 70}vh` : `${BENEFITS.length * 58}vh` }}>
      <div style={{
        position: 'sticky',
        top: '76px',
        minHeight: 'calc(100vh - 76px)',
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '0.9fr 1.1fr',
        gap: isMobile ? '1.75rem' : '4.5rem',
        alignItems: 'center',
        padding: isMobile ? '3.5rem 0 1.5rem' : '1rem 0'
      }}>
        <div>
          <p style={{ color: '#6ee7b7', fontSize: '0.8rem', fontWeight: 700, margin: '0 0 0.85rem', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
            Pentru afaceri sportive
          </p>
          <h2 style={{ fontSize: isMobile ? '2.1rem' : '3rem', fontWeight: 700, color: 'white', lineHeight: 1.12, margin: '0 0 1.75rem', letterSpacing: '-0.03em' }}>
            Fii acolo unde caută sportivii
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {BENEFITS.map((benefit, index) => {
              const on = index === active
              return (
                <div
                  key={benefit.title}
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: '0.75rem',
                    padding: '0.55rem 0 0.55rem 0.85rem',
                    borderLeft: `2px solid ${on ? '#34d399' : 'rgba(255,255,255,0.12)'}`,
                    color: on ? 'white' : 'rgba(255,255,255,0.42)',
                    fontWeight: on ? 700 : 500,
                    fontSize: isMobile ? '0.98rem' : '1.05rem',
                    transition: 'color 0.25s ease, border-color 0.25s ease'
                  }}
                >
                  <span style={{ fontSize: '0.75rem', letterSpacing: '0.06em', color: on ? '#34d399' : 'rgba(255,255,255,0.35)', fontWeight: 700 }}>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  {benefit.title}
                </div>
              )
            })}
          </div>
        </div>

        <div style={{
          position: 'relative',
          height: isMobile ? '440px' : '500px',
          background: '#f8fafc',
          borderRadius: '28px',
          overflow: 'hidden',
          boxShadow: '0 30px 70px rgba(0,0,0,0.28)'
        }}>
          {BENEFITS.map((benefit, index) => {
            const shown = index === active
            return (
              <article
                key={benefit.title}
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  padding: isMobile ? '1.6rem' : '2.4rem 2.5rem',
                  opacity: shown ? 1 : 0,
                  pointerEvents: shown ? 'auto' : 'none'
                }}
              >
                <div style={{ color: '#059669', fontWeight: 700, fontSize: '0.8rem', letterSpacing: '0.12em' }}>
                  {String(index + 1).padStart(2, '0')} / {String(BENEFITS.length).padStart(2, '0')}
                </div>
                <h3 style={{ margin: '0.85rem 0 1rem', color: '#0f172a', fontSize: isMobile ? '1.55rem' : '2rem', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.15 }}>
                  {benefit.title}
                </h3>
                <p style={{ margin: 0, color: '#475569', lineHeight: 1.7, fontSize: isMobile ? '1rem' : '1.08rem' }}>
                  {benefit.text}
                </p>
                <Link
                  to="/register"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: 'auto',
                    alignSelf: 'flex-start',
                    padding: '0.9rem 1.35rem',
                    background: '#059669',
                    color: 'white',
                    borderRadius: '999px',
                    fontWeight: 700,
                    textDecoration: 'none'
                  }}
                >
                  Devino membru
                </Link>
              </article>
            )
          })}
        </div>
      </div>
    </div>
  )
}
