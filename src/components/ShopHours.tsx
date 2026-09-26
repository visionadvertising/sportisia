import type { CSSProperties } from 'react'

export const SHOP_DAYS = [
  { key: 'monday', label: 'Luni' },
  { key: 'tuesday', label: 'Marți' },
  { key: 'wednesday', label: 'Miercuri' },
  { key: 'thursday', label: 'Joi' },
  { key: 'friday', label: 'Vineri' },
  { key: 'saturday', label: 'Sâmbătă' },
  { key: 'sunday', label: 'Duminică' }
] as const

const DAY_LABELS: Record<string, string> = {
  luni: 'monday',
  marti: 'tuesday',
  marți: 'tuesday',
  miercuri: 'wednesday',
  joi: 'thursday',
  vineri: 'friday',
  sambata: 'saturday',
  sâmbătă: 'saturday',
  duminica: 'sunday',
  duminică: 'sunday'
}

export interface ShopDayHours {
  closed: boolean
  from: string
  to: string
}

export type ShopHoursMap = Record<string, ShopDayHours>

export function defaultShopHours(): ShopHoursMap {
  return Object.fromEntries(SHOP_DAYS.map((day) => [day.key, {
    closed: day.key === 'sunday',
    from: '09:00',
    to: '18:00'
  }]))
}

export function shopHoursFromText(raw: unknown): ShopHoursMap {
  const hours = defaultShopHours()
  const text = String(raw || '').trim()
  if (!text || text === 'null') return hours
  let matched = false
  for (const part of text.split(';').map((item) => item.trim()).filter(Boolean)) {
    const splitAt = part.indexOf(':')
    if (splitAt < 0) continue
    const label = part.slice(0, splitAt).trim().toLowerCase()
    const value = part.slice(splitAt + 1).trim()
    const key = SHOP_DAYS.some((day) => day.key === label) ? label : DAY_LABELS[label]
    if (!key) continue
    matched = true
    if (/closed|închis|inchis/i.test(value)) {
      hours[key] = { closed: true, from: '09:00', to: '18:00' }
    } else {
      const times = value.match(/(\d{2}:\d{2}).*?(\d{2}:\d{2})/)
      hours[key] = { closed: false, from: times?.[1] || '09:00', to: times?.[2] || '18:00' }
    }
  }
  return matched ? hours : defaultShopHours()
}

export function formatShopHours(hours: ShopHoursMap) {
  return SHOP_DAYS.map((day) => {
    const item = hours[day.key]
    return item?.closed ? `${day.label}: închis` : `${day.label}: ${item?.from || '09:00'}–${item?.to || '18:00'}`
  }).join('; ')
}

const timeStyle: CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  border: '1px solid #e2e8f0',
  borderRadius: '10px',
  padding: '0.55rem 0.7rem',
  fontSize: '0.95rem',
  fontFamily: 'inherit',
  background: 'white'
}

export default function ShopHours({
  hours,
  onChange,
  isMobile
}: {
  hours: ShopHoursMap
  onChange: (next: ShopHoursMap) => void
  isMobile: boolean
}) {
  const update = (key: string, patch: Partial<ShopDayHours>) => {
    onChange({ ...hours, [key]: { ...hours[key], ...patch } })
  }

  return (
    <div style={{ marginTop: '1.5rem' }}>
      <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>Program</div>
      <p style={{ margin: '0 0 0.75rem', color: '#64748b', fontSize: '0.875rem' }}>
        Orele în care magazinul este deschis. Bifează o zi dacă e închisă.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {SHOP_DAYS.map((day) => {
          const item = hours[day.key] || { closed: false, from: '09:00', to: '18:00' }
          return (
            <div key={day.key} style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr 1fr' : '120px 100px 1fr 1fr',
              gap: '0.5rem',
              alignItems: 'center',
              background: item.closed ? '#f8fafc' : 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '0.55rem 0.7rem'
            }}>
              <strong style={{ color: '#0f172a', fontSize: '0.92rem' }}>{day.label}</strong>
              <label style={{ fontSize: '0.85rem', color: '#475569', display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                <input type="checkbox" checked={item.closed} onChange={(event) => update(day.key, { closed: event.target.checked })} />
                Închis
              </label>
              <input type="time" value={item.from} disabled={item.closed} onChange={(event) => update(day.key, { from: event.target.value })} style={timeStyle} />
              <input type="time" value={item.to} disabled={item.closed} onChange={(event) => update(day.key, { to: event.target.value })} style={timeStyle} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
