const WEEKDAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
const RO_DAYS = ['duminica', 'luni', 'marti', 'miercuri', 'joi', 'vineri', 'sambata']

function strip(value) {
  return String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

function minutes(value) {
  const [hour, minute] = String(value || '').split(':').map((part) => parseInt(part, 10))
  if (!Number.isFinite(hour)) return null
  return hour * 60 + (Number.isFinite(minute) ? minute : 0)
}

function inRange(start, end, now) {
  const from = minutes(start)
  const to = minutes(end)
  if (from == null || to == null) return false
  if (to >= from) return now >= from && now <= to
  return now >= from || now <= to
}

function shopOpen(text, now) {
  const dayName = RO_DAYS[now.getDay()]
  const parts = String(text).split(';').map((part) => part.trim()).filter(Boolean)
  const row = parts.find((part) => strip(part.split(':')[0]) === dayName)
  if (!row) return false
  if (/inchis|closed/.test(strip(row))) return false
  const times = row.match(/(\d{1,2}:\d{2}).*?(\d{1,2}:\d{2})/)
  if (!times) return false
  return inRange(times[1], times[2], now.getHours() * 60 + now.getMinutes())
}

export function decorateFacility(facility, now = new Date()) {
  const day = WEEKDAYS[now.getDay()]
  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  const fields = Array.isArray(facility.sportsFields) ? facility.sportsFields : []
  const slots = fields.flatMap((field) => Array.isArray(field.timeSlots) ? field.timeSlots : [])
  const prices = []

  for (const field of fields) {
    const hourly = Number(field.pricePerHour ?? field.price_per_hour)
    if (hourly > 0) prices.push(hourly)
  }
  for (const slot of slots) {
    const price = Number(slot.price)
    if (slot.status === 'open' && price > 0) prices.push(price)
  }
  const lesson = Number(facility.price_per_lesson)
  const hourlyFacility = Number(facility.price_per_hour)
  if (lesson > 0) prices.push(lesson)
  if (hourlyFacility > 0) prices.push(hourlyFacility)
  facility.minPrice = prices.length ? Math.min(...prices) : null

  const todaySlots = slots.filter((slot) => strip(slot.day) === day)
  if (todaySlots.length) {
    facility.openNow = todaySlots.some((slot) => slot.status === 'open' && inRange(slot.startTime, slot.endTime, nowMinutes))
  } else if (facility.opening_hours) {
    facility.openNow = shopOpen(facility.opening_hours, now)
  } else {
    facility.openNow = null
  }

  const aliases = {
    parking: 'hasParking',
    showers: 'hasShower',
    shower: 'hasShower',
    lighting: 'hasLighting',
    cover: 'hasCover',
    covered: 'hasCover',
    indoor: 'hasIndoor',
    outdoor: 'hasOutdoor',
    changingroom: 'hasChangingRoom',
    vestiar: 'hasChangingRoom'
  }
  const amenityKey = (key) => {
    if (key.startsWith('has')) return key
    return aliases[String(key).toLowerCase()] || null
  }
  const amenities = new Set()
  for (const field of fields) {
    const features = field.features || {}
    for (const [key, value] of Object.entries(features)) {
      if (!(value === true || value === 1 || value === '1' || value === 'true')) continue
      const normalized = amenityKey(key)
      if (normalized) amenities.add(normalized)
    }
  }
  const columns = [
    ['has_parking', 'hasParking'],
    ['has_shower', 'hasShower'],
    ['has_changing_room', 'hasChangingRoom'],
    ['has_lighting', 'hasLighting'],
    ['has_air_conditioning', 'hasAirConditioning']
  ]
  for (const [column, key] of columns) {
    if (facility[column] === 1 || facility[column] === true) amenities.add(key)
  }
  facility.amenities = [...amenities]

  let audience = facility.audience
  if (typeof audience === 'string') {
    try { audience = JSON.parse(audience) } catch { audience = [] }
  }
  facility.audienceList = Array.isArray(audience) ? audience : []
  return facility
}
