import { useEffect, useState } from 'react'
import API_BASE_URL from '../../config'
import { card, colors, dangerButton, primaryButton } from '../../ui/theme'

interface ReviewRow {
  id: number
  facility_name: string
  author_name: string
  email: string
  body: string
  rating: number
  status: string
}

export default function FacilityReviewsAdmin() {
  const [rows, setRows] = useState<ReviewRow[]>([])

  const load = () => {
    fetch(`${API_BASE_URL}/admin/facility-reviews`).then((response) => response.json()).then((data) => {
      if (data.success) setRows(data.data)
    })
  }

  useEffect(() => { load() }, [])

  const setStatus = async (id: number, status: string) => {
    await fetch(`${API_BASE_URL}/admin/facility-reviews/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    })
    load()
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ margin: '0 0 1.25rem', color: colors.ink, fontSize: '2rem' }}>Recenzii</h1>
      <div style={{ display: 'grid', gap: '0.75rem' }}>
        {rows.map((row) => (
          <article key={row.id} style={{ ...card, padding: '1rem 1.15rem' }}>
            <strong style={{ color: colors.ink }}>{row.facility_name}</strong>
            <span style={{ color: colors.muted }}> · {row.author_name} · {row.rating}★ · {row.status}</span>
            <p style={{ margin: '0.55rem 0', color: '#334155' }}>{row.body}</p>
            <p style={{ margin: 0, color: colors.muted }}>{row.email}</p>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
              <button type="button" onClick={() => setStatus(row.id, 'approved')} style={primaryButton}>Aprobă</button>
              <button type="button" onClick={() => setStatus(row.id, 'rejected')} style={dangerButton}>Respinge</button>
            </div>
          </article>
        ))}
        {rows.length === 0 && (
          <p style={{ ...card, margin: 0, padding: '1.25rem', color: colors.muted }}>Nu sunt recenzii.</p>
        )}
      </div>
    </div>
  )
}
