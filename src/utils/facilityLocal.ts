import API_BASE_URL from '../config'

const KEY = 'sportisia-saved'

export function readSaved(): number[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || '[]')
    return Array.isArray(parsed) ? parsed.map(Number).filter((id) => id > 0) : []
  } catch {
    return []
  }
}

export function isSaved(id: number) {
  return readSaved().includes(id)
}

export function toggleSaved(id: number) {
  const current = readSaved()
  const next = current.includes(id) ? current.filter((item) => item !== id) : [id, ...current]
  localStorage.setItem(KEY, JSON.stringify(next))
  window.dispatchEvent(new Event('sportisia-saved'))
  return next.includes(id)
}

export function trackFacility(id: number, type: 'view' | 'phone' | 'whatsapp' | 'map') {
  fetch(`${API_BASE_URL}/facilities/${id}/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type })
  }).catch(() => {})
}
