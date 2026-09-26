import { useEffect, useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'

export const CONSENT_KEY = 'sportisia-cookie-consent'
const OPEN_EVENT = 'sportisia-open-cookies'
const CHANGE_EVENT = 'sportisia-cookie-consent'
const MAX_AGE_MS = 180 * 24 * 60 * 60 * 1000

export type CookieChoice = {
  necessary: true
  functional: boolean
  analytics: boolean
  marketing: boolean
  updatedAt: string
}

const CATEGORIES = [
  {
    id: 'necessary' as const,
    title: 'Necesare',
    locked: true,
    text: 'Țin sesiunea deschisă, continuă revendicarea unui profil și rețin alegerea ta de aici. Site-ul nu funcționează corect fără ele.'
  },
  {
    id: 'functional' as const,
    title: 'Funcționale',
    locked: false,
    text: 'Rețin preferințe de afișare, dacă alegi să le păstrăm. Căutarea și autentificarea merg și fără ele.'
  },
  {
    id: 'analytics' as const,
    title: 'Statistici',
    locked: false,
    text: 'Măsoară vizitele și paginile folosite, ca să vedem ce funcționează. Nu pornesc fără acordul tău și nu includ reclame.'
  },
  {
    id: 'marketing' as const,
    title: 'Marketing',
    locked: false,
    text: 'Permit conținut de la rețele sociale sau campanii, doar dacă le accepți. Fără acord, aceste scripturi nu se încarcă.'
  }
]

export function readCookieConsent(): CookieChoice | null {
  try {
    const raw = localStorage.getItem(CONSENT_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as CookieChoice
    if (parsed.necessary !== true || !parsed.updatedAt) return null
    if (Date.now() - new Date(parsed.updatedAt).getTime() > MAX_AGE_MS) return null
    return parsed
  } catch {
    return null
  }
}

export function hasCookieConsent(category: keyof Omit<CookieChoice, 'updatedAt'>) {
  const saved = readCookieConsent()
  if (!saved) return category === 'necessary'
  return Boolean(saved[category])
}

export function openCookieSettings() {
  window.dispatchEvent(new Event(OPEN_EVENT))
}

function saveChoice(choice: Omit<CookieChoice, 'necessary' | 'updatedAt'>) {
  const stored: CookieChoice = {
    necessary: true,
    functional: choice.functional,
    analytics: choice.analytics,
    marketing: choice.marketing,
    updatedAt: new Date().toISOString()
  }
  localStorage.setItem(CONSENT_KEY, JSON.stringify(stored))
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: stored }))
  return stored
}

const emptyOptional = { functional: false, analytics: false, marketing: false }
const allOptional = { functional: true, analytics: true, marketing: true }

export default function CookieNotice() {
  const [saved, setSaved] = useState<CookieChoice | null>(() => readCookieConsent())
  const [mode, setMode] = useState<'banner' | 'preferences' | 'closed'>(() => (readCookieConsent() ? 'closed' : 'banner'))
  const [draft, setDraft] = useState(saved ? { functional: saved.functional, analytics: saved.analytics, marketing: saved.marketing } : emptyOptional)

  useEffect(() => {
    const open = () => {
      const current = readCookieConsent()
      setDraft(current ? { functional: current.functional, analytics: current.analytics, marketing: current.marketing } : emptyOptional)
      setMode('preferences')
    }
    window.addEventListener(OPEN_EVENT, open)
    return () => window.removeEventListener(OPEN_EVENT, open)
  }, [])

  useEffect(() => {
    if (mode !== 'preferences') return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMode(saved ? 'closed' : 'banner')
    }
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKey)
    }
  }, [mode, saved])

  const apply = (choice: Omit<CookieChoice, 'necessary' | 'updatedAt'>) => {
    const stored = saveChoice(choice)
    setSaved(stored)
    setDraft({ functional: stored.functional, analytics: stored.analytics, marketing: stored.marketing })
    setMode('closed')
  }

  return (
    <>
      {mode === 'banner' && (
        <div style={bannerWrap}>
          <div style={bannerCard}>
            <div style={{ flex: '1 1 280px' }}>
              <p style={{ margin: '0 0 0.35rem', fontWeight: 800, fontSize: '1.05rem' }}>Cookies pe Sportisia</p>
              <p style={{ margin: 0, color: 'rgba(255,255,255,0.82)', fontSize: '0.92rem', lineHeight: 1.55 }}>
                Folosim cookies necesare ca să meargă sesiunea. Cele funcționale, de statistici și de marketing pornesc doar dacă le accepți. Poți alege fiecare categorie.
              </p>
              <Link to="/politica-cookies" style={{ color: '#6ee7b7', fontWeight: 700, fontSize: '0.9rem' }}>Politica de cookies</Link>
            </div>
            <div style={buttonRow}>
              <button type="button" onClick={() => apply(emptyOptional)} style={ghostBtn}>Refuză opționale</button>
              <button type="button" onClick={() => setMode('preferences')} style={ghostBtn}>Personalizează</button>
              <button type="button" onClick={() => apply(allOptional)} style={primaryBtn}>Acceptă tot</button>
            </div>
          </div>
        </div>
      )}

      {mode === 'preferences' && (
        <div
          role="presentation"
          onClick={() => setMode(saved ? 'closed' : 'banner')}
          style={overlay}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="cookie-settings-title"
            onClick={(event) => event.stopPropagation()}
            style={dialog}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'flex-start' }}>
              <div>
                <p id="cookie-settings-title" style={{ margin: 0, color: '#0f172a', fontWeight: 800, fontSize: '1.25rem' }}>Personalizează cookies</p>
                <p style={{ margin: '0.4rem 0 0', color: '#64748b', fontSize: '0.92rem', lineHeight: 1.5 }}>
                  Necesarele rămân active. Restul le poți porni sau opri. Alegerea se păstrează 6 luni, apoi te întrebăm din nou.
                </p>
              </div>
              <button type="button" aria-label="Închide" onClick={() => setMode(saved ? 'closed' : 'banner')} style={closeBtn}>×</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.1rem' }}>
              {CATEGORIES.map((category) => {
                const on = category.id === 'necessary' ? true : draft[category.id]
                return (
                  <div key={category.id} style={categoryCard}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center' }}>
                      <strong style={{ color: '#0f172a' }}>{category.title}</strong>
                      <Toggle
                        on={on}
                        disabled={category.locked}
                        label={category.title}
                        onClick={() => {
                          if (category.locked || category.id === 'necessary') return
                          setDraft((current) => ({ ...current, [category.id]: !current[category.id] }))
                        }}
                      />
                    </div>
                    <p style={{ margin: '0.4rem 0 0', color: '#64748b', fontSize: '0.88rem', lineHeight: 1.5 }}>{category.text}</p>
                    {category.locked && <p style={{ margin: '0.35rem 0 0', color: '#059669', fontSize: '0.78rem', fontWeight: 700 }}>Întotdeauna active</p>}
                  </div>
                )
              })}
            </div>

            <div style={{ ...buttonRow, marginTop: '1.1rem' }}>
              <button type="button" onClick={() => apply(emptyOptional)} style={ghostDark}>Refuză opționale</button>
              <button type="button" onClick={() => apply(draft)} style={ghostDark}>Salvează selecția</button>
              <button type="button" onClick={() => apply(allOptional)} style={primaryBtn}>Acceptă tot</button>
            </div>
            <p style={{ margin: '0.85rem 0 0', fontSize: '0.85rem' }}>
              <Link to="/politica-cookies" onClick={() => setMode(saved ? 'closed' : 'banner')} style={{ color: '#059669', fontWeight: 700 }}>Citește politica de cookies</Link>
            </p>
          </div>
        </div>
      )}
    </>
  )
}

function Toggle({ on, disabled, label, onClick }: { on: boolean; disabled?: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      style={{
        width: 46,
        height: 26,
        borderRadius: 999,
        border: 0,
        padding: 0,
        background: on ? '#10b981' : '#cbd5e1',
        position: 'relative',
        cursor: disabled ? 'not-allowed' : 'pointer',
        flexShrink: 0
      }}
    >
      <span style={{
        position: 'absolute',
        top: 3,
        left: on ? 23 : 3,
        width: 20,
        height: 20,
        borderRadius: '50%',
        background: 'white',
        boxShadow: '0 1px 2px rgba(15,23,42,0.2)',
        transition: 'left 0.15s ease'
      }} />
    </button>
  )
}

const bannerWrap: CSSProperties = {
  position: 'fixed',
  left: '1rem',
  right: '1rem',
  bottom: '1rem',
  zIndex: 1200,
  display: 'flex',
  justifyContent: 'center',
  pointerEvents: 'none'
}

const bannerCard: CSSProperties = {
  pointerEvents: 'auto',
  width: 'min(920px, 100%)',
  background: '#0f172a',
  color: 'white',
  borderRadius: '18px',
  padding: '1.1rem 1.15rem',
  display: 'flex',
  gap: '1rem',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  boxShadow: '0 18px 40px rgba(15, 23, 42, 0.28)'
}

const buttonRow: CSSProperties = {
  display: 'flex',
  gap: '0.5rem',
  flexWrap: 'wrap',
  justifyContent: 'flex-end'
}

const primaryBtn: CSSProperties = {
  border: 0,
  background: '#10b981',
  color: 'white',
  borderRadius: '999px',
  padding: '0.62rem 1rem',
  fontWeight: 700,
  cursor: 'pointer'
}

const ghostBtn: CSSProperties = {
  border: '1px solid rgba(255,255,255,0.28)',
  background: 'transparent',
  color: 'white',
  borderRadius: '999px',
  padding: '0.62rem 0.95rem',
  fontWeight: 700,
  cursor: 'pointer'
}

const ghostDark: CSSProperties = {
  border: '1px solid #e2e8f0',
  background: 'white',
  color: '#0f172a',
  borderRadius: '999px',
  padding: '0.62rem 0.95rem',
  fontWeight: 700,
  cursor: 'pointer'
}

const overlay: CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 1300,
  background: 'rgba(15, 23, 42, 0.55)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '1rem'
}

const dialog: CSSProperties = {
  width: 'min(640px, 100%)',
  maxHeight: 'min(88vh, 760px)',
  overflow: 'auto',
  background: 'white',
  borderRadius: '18px',
  padding: '1.15rem 1.15rem 1.2rem',
  boxShadow: '0 24px 60px rgba(15, 23, 42, 0.28)'
}

const categoryCard: CSSProperties = {
  border: '1px solid #eef2f6',
  borderRadius: '14px',
  padding: '0.85rem 0.95rem',
  background: '#f8fafc'
}

const closeBtn: CSSProperties = {
  border: 0,
  background: '#f1f5f9',
  color: '#0f172a',
  width: 34,
  height: 34,
  borderRadius: '999px',
  fontSize: '1.3rem',
  lineHeight: 1,
  cursor: 'pointer'
}
