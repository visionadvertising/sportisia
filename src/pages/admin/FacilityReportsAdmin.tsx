import { useEffect, useState } from 'react'
import API_BASE_URL from '../../config'
import { card, colors, primaryButton } from '../../ui/theme'

interface ReportRow {
  id: number
  facility_name: string
  name: string
  email: string
  message: string
  status: string
}

export default function FacilityReportsAdmin() {
  const [rows, setRows] = useState<ReportRow[]>([])

  const load = () => {
    fetch(`${API_BASE_URL}/admin/facility-reports`).then((response) => response.json()).then((data) => {
      if (data.success) setRows(data.data)
    })
  }

  useEffect(() => { load() }, [])

  const resolve = async (id: number) => {
    await fetch(`${API_BASE_URL}/admin/facility-reports/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'resolved' })
    })
    load()
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ margin: '0 0 1.25rem', color: colors.ink, fontSize: '2rem' }}>Sesizări</h1>
      <div style={{ display: 'grid', gap: '0.75rem' }}>
        {rows.map((row) => (
          <article key={row.id} style={{ ...card, padding: '1rem 1.15rem' }}>
            <strong style={{ color: colors.ink }}>{row.facility_name}</strong>
            <span style={{ color: colors.muted }}> · {row.name} · {row.status}</span>
            <p style={{ margin: '0.55rem 0', color: '#334155' }}>{row.message}</p>
            <p style={{ margin: 0, color: colors.muted }}>{row.email}</p>
            {row.status !== 'resolved' && (
              <button type="button" onClick={() => resolve(row.id)} style={{ ...primaryButton, marginTop: '0.75rem' }}>Marchează rezolvată</button>
            )}
          </article>
        ))}
        {rows.length === 0 && (
          <p style={{ ...card, margin: 0, padding: '1.25rem', color: colors.muted }}>Nu sunt sesizări.</p>
        )}
      </div>
    </div>
  )
}
