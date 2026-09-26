import { Link } from 'react-router-dom'

interface CardFacility {
  id: number
  name: string
  city?: string
  location?: string
  phone?: string
  map_coordinates?: { lat: number; lng: number } | string | null
  can_claim?: boolean
  profile_tier?: 'recommended' | 'verified' | 'unverified'
}

function mapsUrl(facility: CardFacility) {
  let coords = facility.map_coordinates
  if (typeof coords === 'string') {
    try {
      coords = JSON.parse(coords)
    } catch {
      coords = null
    }
  }
  if (coords && typeof coords === 'object' && coords.lat && coords.lng) {
    return `https://www.google.com/maps?q=${coords.lat},${coords.lng}`
  }
  const query = [facility.name, facility.location, facility.city].filter(Boolean).join(', ')
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}

const buttonStyle = {
  flex: 1,
  textAlign: 'center' as const,
  textDecoration: 'none',
  borderRadius: '8px',
  padding: '0.6rem 0.5rem',
  fontSize: '0.78rem',
  fontWeight: 600,
  lineHeight: 1.2
}

export default function FacilityCardActions({ facility, profileUrl, compact = false }: { facility: CardFacility; profileUrl: string; compact?: boolean }) {
  const phone = (facility.phone || '').replace(/\s/g, '')
  const compactButton = compact ? { ...buttonStyle, padding: '0.4rem 0.3rem', fontSize: '0.68rem' } : buttonStyle

  return (
    <div style={{
      marginTop: 'auto',
      paddingTop: compact ? '0.45rem' : '0.75rem',
      borderTop: '1px solid #f1f5f9',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.4rem'
    }}>
      <div style={{ display: 'flex', gap: '0.4rem' }}>
        {phone && (
          <a href={`tel:${phone}`} style={{ ...compactButton, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #dbeafe' }}>
            Sună acum
          </a>
        )}
        <a href={mapsUrl(facility)} target="_blank" rel="noopener noreferrer" style={{ ...compactButton, background: '#fefce8', color: '#a16207', border: '1px solid #fef08a' }}>
          Spre locație
        </a>
      </div>
      {facility.profile_tier === 'recommended' ? (
        <Link to={profileUrl} style={{ ...compactButton, background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0' }}>
          Facilitate recomandată
        </Link>
      ) : facility.profile_tier === 'verified' ? (
        <Link to={profileUrl} style={{ ...compactButton, background: '#fff7ed', color: '#c2410c', border: '1px solid #fed7aa' }}>
          Facilitate verificată
        </Link>
      ) : (
        <Link to={`/revendica/${facility.id}`} style={{ ...compactButton, background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' }}>
          Revendică profilul
        </Link>
      )}
    </div>
  )
}
