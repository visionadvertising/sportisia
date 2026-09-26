import { useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { absoluteUrl, usePageSeo } from '../../utils/blogSeo'
import { COMPANY } from './company'

export default function LegalLayout({
  title,
  description,
  path,
  children
}: {
  title: string
  description: string
  path: string
  children: ReactNode
}) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 800)
  usePageSeo({ title: `${title} | Sportisia`, description, canonical: absoluteUrl(path) })

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 800)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: 'white', padding: isMobile ? '3rem 1rem 2rem' : '5rem 2rem 3rem' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <p style={{ margin: '0 0 0.6rem', color: '#6ee7b7', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', fontSize: '0.78rem' }}>{COMPANY.name}</p>
          <h1 style={{ margin: 0, fontSize: isMobile ? '2rem' : '2.8rem', letterSpacing: '-0.03em' }}>{title}</h1>
          <p style={{ margin: '0.9rem 0 0', color: 'rgba(255,255,255,0.75)' }}>Actualizat la {COMPANY.updated}</p>
        </div>
      </div>
      <div style={{ background: '#ffffff', padding: isMobile ? '2rem 1rem 3rem' : '3rem 2rem 4rem' }}>
      <article style={{ maxWidth: '1400px', margin: '0 auto', color: '#334155', lineHeight: 1.7, fontSize: '1rem' }}>
        <div style={{ background: 'white', border: '1px solid #eef2f6', borderRadius: '16px', padding: isMobile ? '1.15rem' : '1.75rem 2rem' }}>
          {children}
          <p style={{ margin: '2rem 0 0', color: '#64748b', fontSize: '0.92rem' }}>
            Vezi și <Link to="/termeni-si-conditii" style={link}>Termenii și condițiile</Link>, <Link to="/politica-de-confidentialitate" style={link}>Politica de confidențialitate</Link> și <Link to="/politica-cookies" style={link}>Politica de cookies</Link>.
          </p>
        </div>
      </article>
      </div>
    </div>
  )
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section style={{ marginTop: '1.75rem' }}>
      <h2 style={{ margin: '0 0 0.5rem', color: '#0f172a', fontSize: '1.15rem' }}>{title}</h2>
      {children}
    </section>
  )
}

export function Subsection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div style={{ marginTop: '0.95rem' }}>
      <h3 style={{ margin: '0 0 0.3rem', color: '#0f172a', fontSize: '1rem' }}>{title}</h3>
      {children}
    </div>
  )
}

const link = { color: '#059669', fontWeight: 700, textDecoration: 'none' }
