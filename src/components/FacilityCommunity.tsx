import { FormEvent, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import API_BASE_URL from '../config'
import { trackFacility } from '../utils/facilityLocal'
import { card, field, primaryButton, secondaryButton } from '../ui/theme'

interface Review {
  id: number
  author_name: string
  body: string
  rating: number
  created_at: string
}

interface Similar {
  id: number
  name: string
  city: string
  facility_type: string
  minPrice?: number | null
  ratingAvg?: number | null
}

function profileUrl(facility: Similar) {
  if (facility.facility_type === 'field') {
    const slug = `${facility.name} ${facility.city}`.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
    return `/baza-sportiva/${slug}`
  }
  return `/facility/${facility.id}/${facility.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
}

export default function FacilityCommunity({
  facilityId,
  name,
  city,
  type,
  sport,
  phone,
  whatsapp
}: {
  facilityId: number
  name: string
  city: string
  type: string
  sport?: string
  phone?: string
  whatsapp?: string
}) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [similar, setSimilar] = useState<Similar[]>([])
  const [rating, setRating] = useState(5)
  const [authorName, setAuthorName] = useState('')
  const [email, setEmail] = useState('')
  const [body, setBody] = useState('')
  const [notice, setNotice] = useState('')
  const [reportName, setReportName] = useState('')
  const [reportEmail, setReportEmail] = useState('')
  const [reportMessage, setReportMessage] = useState('')
  const [reportNotice, setReportNotice] = useState('')

  useEffect(() => {
    trackFacility(facilityId, 'view')
    fetch(`${API_BASE_URL}/facilities/${facilityId}/reviews`).then((response) => response.json()).then((data) => {
      if (data.success) setReviews(data.data)
    }).catch(() => {})
    const params = new URLSearchParams({ city, type, status: 'active' })
    if (sport) params.set('sport', sport)
    fetch(`${API_BASE_URL}/facilities?${params}`).then((response) => response.json()).then((data) => {
      if (data.success) setSimilar((data.data as Similar[]).filter((item) => item.id !== facilityId).slice(0, 3))
    }).catch(() => {})
  }, [facilityId, city, type, sport])

  const share = () => {
    const text = encodeURIComponent(`${name} ${window.location.href}`)
    window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener,noreferrer')
  }

  const sendReview = async (event: FormEvent) => {
    event.preventDefault()
    setNotice('')
    const response = await fetch(`${API_BASE_URL}/facilities/${facilityId}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ authorName, email, body, rating })
    })
    const data = await response.json()
    setNotice(data.message || data.error || 'Nu am putut trimite recenzia.')
    if (data.success) {
      setAuthorName('')
      setEmail('')
      setBody('')
    }
  }

  const sendReport = async (event: FormEvent) => {
    event.preventDefault()
    setReportNotice('')
    const response = await fetch(`${API_BASE_URL}/facilities/${facilityId}/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: reportName, email: reportEmail, message: reportMessage })
    })
    const data = await response.json()
    setReportNotice(data.message || data.error || 'Nu am putut trimite sesizarea.')
    if (data.success) {
      setReportName('')
      setReportEmail('')
      setReportMessage('')
    }
  }

  const average = reviews.length ? (reviews.reduce((sum, review) => sum + Number(review.rating), 0) / reviews.length).toFixed(1) : null
  const cleanPhone = (phone || '').replace(/\s/g, '')
  const cleanWhatsapp = (whatsapp || '').replace(/[^0-9]/g, '')

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 1rem 5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', marginTop: '1.5rem' }}>
        <h2 style={{ margin: 0, color: '#0f172a' }}>Recenzii {average ? `· ${average}` : ''}</h2>
        <button type="button" onClick={share} style={primaryButton}>Trimite pe WhatsApp</button>
      </div>
      {reviews.length === 0 && <p style={{ color: '#64748b' }}>Încă nu sunt recenzii aprobate.</p>}
      <div style={{ display: 'grid', gap: '0.75rem' }}>
        {reviews.map((review) => (
          <article key={review.id} style={surface}>
            <strong style={{ color: '#0f172a' }}>{review.author_name}</strong>
            <span style={{ marginLeft: '0.5rem', color: '#059669' }}>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
            <p style={{ margin: '0.4rem 0 0', color: '#334155' }}>{review.body}</p>
          </article>
        ))}
      </div>

      <form onSubmit={sendReview} style={{ ...surface, marginTop: '1rem' }}>
        <h3 style={{ margin: '0 0 0.75rem', color: '#0f172a' }}>Lasă o recenzie</h3>
        <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '0.75rem' }}>
          {[1, 2, 3, 4, 5].map((value) => (
            <button key={value} type="button" onClick={() => setRating(value)} style={{ border: 0, background: 'transparent', cursor: 'pointer', fontSize: '1.4rem', color: value <= rating ? '#f59e0b' : '#cbd5e1' }}>★</button>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.6rem' }}>
          <input required placeholder="Nume" value={authorName} onChange={(event) => setAuthorName(event.target.value)} style={field} />
          <input required type="email" placeholder="Email" value={email} onChange={(event) => setEmail(event.target.value)} style={field} />
        </div>
        <textarea required minLength={5} placeholder="Cum a fost experiența?" value={body} onChange={(event) => setBody(event.target.value)} rows={4} style={{ ...field, marginTop: '0.6rem', resize: 'vertical' }} />
        <button type="submit" style={{ ...primaryButton, marginTop: '0.75rem' }}>Trimite recenzia</button>
        {notice && <p style={{ color: '#047857' }}>{notice}</p>}
      </form>

      {similar.length > 0 && (
        <section style={{ marginTop: '1.5rem' }}>
          <h2 style={{ color: '#0f172a' }}>Alte opțiuni în {city}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
            {similar.map((item) => (
              <Link key={item.id} to={profileUrl(item)} style={{ ...surface, textDecoration: 'none', color: '#0f172a' }}>
                <strong>{item.name}</strong>
                <p style={{ margin: '0.35rem 0 0', color: '#64748b' }}>
                  {item.ratingAvg ? `${item.ratingAvg} ★ · ` : ''}{item.minPrice ? `de la ${item.minPrice} RON` : item.city}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <form onSubmit={sendReport} style={{ ...surface, marginTop: '1.5rem' }}>
        <h3 style={{ margin: '0 0 0.4rem', color: '#0f172a' }}>Datele nu sunt corecte?</h3>
        <p style={{ margin: '0 0 0.75rem', color: '#64748b' }}>Spune-ne ce trebuie corectat la program, telefon sau adresă.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.6rem' }}>
          <input required placeholder="Nume" value={reportName} onChange={(event) => setReportName(event.target.value)} style={field} />
          <input required type="email" placeholder="Email" value={reportEmail} onChange={(event) => setReportEmail(event.target.value)} style={field} />
        </div>
        <textarea required minLength={10} placeholder="Ce este greșit?" value={reportMessage} onChange={(event) => setReportMessage(event.target.value)} rows={3} style={{ ...field, marginTop: '0.6rem' }} />
        <button type="submit" style={{ ...secondaryButton, marginTop: '0.75rem' }}>Trimite sesizarea</button>
        {reportNotice && <p style={{ color: '#047857' }}>{reportNotice}</p>}
      </form>

      {(cleanPhone || cleanWhatsapp) && (
        <div style={{ position: 'fixed', left: '0.75rem', right: '0.75rem', bottom: '0.75rem', zIndex: 30, display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
          {cleanPhone && (
            <a href={`tel:${cleanPhone}`} onClick={() => trackFacility(facilityId, 'phone')} style={callButton}>Sună</a>
          )}
          {cleanWhatsapp && (
            <a href={`https://wa.me/${cleanWhatsapp}`} target="_blank" rel="noopener noreferrer" onClick={() => trackFacility(facilityId, 'whatsapp')} style={{ ...callButton, background: '#059669' }}>WhatsApp</a>
          )}
        </div>
      )}
    </div>
  )
}

const surface = { ...card, padding: '0.9rem 1rem' }
const callButton = { ...secondaryButton, flex: 1, maxWidth: '220px', padding: '0.8rem 1rem' }
