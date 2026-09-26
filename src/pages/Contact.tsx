import { FormEvent, useEffect, useState, type CSSProperties } from 'react'
import API_BASE_URL from '../config'
import { absoluteUrl, usePageSeo } from '../utils/blogSeo'

function Contact() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 800)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [notice, setNotice] = useState('')
  const [ok, setOk] = useState(false)
  const [sending, setSending] = useState(false)

  usePageSeo({
    title: 'Contact | Sportisia',
    description: 'Scrie-ne despre o bază sportivă, un cont sau o colaborare.',
    canonical: absoluteUrl('/contact')
  })

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 800)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setSending(true)
    setNotice('')
    setOk(false)
    try {
      const response = await fetch(`${API_BASE_URL}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message })
      })
      const data = await response.json()
      setOk(Boolean(data.success))
      setNotice(data.success ? data.message : (data.error || 'Nu am putut trimite mesajul.'))
      if (data.success) {
        setName('')
        setEmail('')
        setSubject('')
        setMessage('')
      }
    } catch {
      setNotice('Eroare la conectarea la server.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' }}>
      <div style={{ position: 'relative', overflow: 'hidden', textAlign: 'center', color: 'white', padding: isMobile ? '3rem 1rem 2rem' : '5rem 2rem 3rem' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 30% 50%, rgba(16, 185, 129, 0.15) 0%, transparent 50%), radial-gradient(circle at 70% 50%, rgba(99, 102, 241, 0.1) 0%, transparent 50%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '720px', margin: '0 auto' }}>
          <h1 style={{ margin: 0, fontSize: isMobile ? '2rem' : '3rem', fontWeight: 700, letterSpacing: '-0.02em' }}>Contact</h1>
          <p style={{ margin: '1rem auto 0', color: 'rgba(255,255,255,0.78)', lineHeight: 1.6 }}>Scrie-ne despre un cont, o listare sau o colaborare. Răspundem pe email.</p>
        </div>
      </div>
      <div style={{ background: '#ffffff', padding: isMobile ? '2rem 1rem 3rem' : '3rem 2rem 4rem' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '280px 1fr', gap: '1.5rem', alignItems: 'start' }}>
          <aside style={{ background: 'white', border: '1px solid #eef2f6', borderRadius: '16px', padding: '1.15rem' }}>
            <h2 style={{ margin: '0 0 0.85rem', fontSize: '1.05rem', color: '#0f172a' }}>Sportisia</h2>
            <p style={{ margin: '0 0 1rem', color: '#64748b', lineHeight: 1.6 }}>România</p>
            <a href="mailto:contact@sportisia.ro" style={{ color: '#059669', fontWeight: 700, textDecoration: 'none' }}>contact@sportisia.ro</a>
          </aside>
          <form onSubmit={submit} style={{ background: 'white', border: '1px solid #eef2f6', borderRadius: '16px', padding: isMobile ? '1rem' : '1.35rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '0.85rem' }}>
              <label style={label}>Nume<input required value={name} onChange={(e) => setName(e.target.value)} style={field} /></label>
              <label style={label}>Email<input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={field} /></label>
            </div>
            <label style={{ ...label, marginTop: '0.85rem' }}>Subiect<input required value={subject} onChange={(e) => setSubject(e.target.value)} style={field} /></label>
            <label style={{ ...label, marginTop: '0.85rem' }}>Mesaj<textarea required minLength={10} value={message} onChange={(e) => setMessage(e.target.value)} rows={6} style={{ ...field, resize: 'vertical' }} /></label>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1rem' }}>
              {notice ? <p style={{ margin: 0, color: ok ? '#047857' : '#b91c1c' }}>{notice}</p> : <span />}
              <button type="submit" disabled={sending} style={button}>{sending ? 'Se trimite...' : 'Trimite mesajul'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

const label: CSSProperties = { display: 'block', color: '#334155', fontWeight: 700, fontSize: '0.85rem' }
const field: CSSProperties = { display: 'block', width: '100%', boxSizing: 'border-box', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.75rem 0.85rem', marginTop: '0.35rem', fontSize: '0.95rem', fontFamily: 'inherit' }
const button: CSSProperties = { background: '#10b981', color: 'white', border: 'none', borderRadius: '10px', padding: '0.75rem 1.1rem', fontWeight: 700, cursor: 'pointer' }

export default Contact
