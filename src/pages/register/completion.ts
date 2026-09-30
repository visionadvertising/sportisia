import API_BASE_URL from '../../config'

export interface ProfileCompletion {
  claimId: string
  username: string
  facility: Record<string, unknown>
  onDone: () => void
}

const DAY_KEYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
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

export const DEFAULT_FIELD_FEATURES = {
  hasParking: false,
  hasShower: false,
  hasChangingRoom: false,
  hasAirConditioning: false,
  hasLighting: false,
  hasWiFi: false,
  hasBar: false,
  hasFirstAid: false,
  hasEquipmentRental: false,
  hasLocker: false,
  hasTowelService: false,
  hasWaterFountain: false,
  hasSeating: false,
  hasScoreboard: false,
  hasSoundSystem: false,
  hasHeating: false,
  hasCover: false,
  hasGrass: false,
  hasArtificialGrass: false,
  hasIndoor: false,
  hasOutdoor: false
}

const SOCIAL_KEYS = ['facebook', 'instagram', 'x', 'tiktok', 'youtube', 'linkedin'] as const

function parsed(value: unknown): unknown {
  if (typeof value !== 'string') return value
  const text = value.trim()
  if (!text) return null
  try { return JSON.parse(text) } catch { return value }
}

function textList(value: unknown, single: unknown): string[] {
  const source = parsed(value)
  const items = Array.isArray(source)
    ? source.map((item) => String(item || '').trim())
    : String(single || '').trim() ? [String(single).trim()] : []
  const clean = items.filter((item) => item && item !== '0000000000')
  return clean.length > 0 ? clean : ['']
}

export function readProfile(facility: Record<string, unknown> | null | undefined) {
  const row = facility || {}
  const socialRaw = parsed(row.social_media ?? row.socialMedia)
  const socialMedia = Object.fromEntries(SOCIAL_KEYS.map((key) => [key, ''])) as Record<(typeof SOCIAL_KEYS)[number], string>
  if (socialRaw && typeof socialRaw === 'object') {
    for (const key of SOCIAL_KEYS) {
      socialMedia[key] = String((socialRaw as Record<string, unknown>)[key] || '')
    }
  }
  const mapRaw = parsed(row.map_coordinates ?? row.mapCoordinates)
  const mapCoordinates = mapRaw && typeof mapRaw === 'object' && 'lat' in (mapRaw as object) && 'lng' in (mapRaw as object)
    ? { lat: Number((mapRaw as { lat: number }).lat), lng: Number((mapRaw as { lng: number }).lng) }
    : null
  const fieldsRaw = parsed(row.sportsFields)
  const sportsFields = Array.isArray(fieldsRaw)
    ? fieldsRaw.map((field) => {
        const item = field as Record<string, unknown>
        const features = parsed(item.features)
        return {
          fieldName: String(item.fieldName || item.field_name || ''),
          sportType: String(item.sportType || item.sport_type || ''),
          description: String(item.description || ''),
          features: { ...DEFAULT_FIELD_FEATURES, ...(features && typeof features === 'object' ? features : {}) },
          slotSize: Number(item.slotSize || item.slot_size || 60),
          timeSlots: Array.isArray(parsed(item.timeSlots || item.time_slots)) ? parsed(item.timeSlots || item.time_slots) as unknown[] : []
        }
      })
    : []
  const categoriesRaw = parsed(row.repair_categories ?? row.repairCategories)
  const recoveryRaw = parsed(row.recovery_services ?? row.recoveryServices)
  return {
    name: String(row.name || ''),
    city: String(row.city || ''),
    county: String(row.county || ''),
    location: String(row.location || ''),
    locationNotSpecified: Number(row.location_not_specified) === 1,
    contactPerson: String(row.contact_person || ''),
    phones: textList(row.phones, row.phone),
    whatsapps: textList(row.whatsapps, row.whatsapp),
    emails: textList(row.emails, row.email),
    description: String(row.description || ''),
    website: String(row.website || ''),
    socialMedia,
    mapCoordinates,
    sport: String(row.sport || ''),
    specialization: String(row.specialization || ''),
    experienceYears: row.experience_years == null ? '' : String(row.experience_years),
    pricePerLesson: row.price_per_lesson == null ? '' : String(row.price_per_lesson),
    certifications: String(row.certifications || ''),
    languages: String(row.languages || ''),
    openingHours: readOpeningHours(row.opening_hours),
    productsCategories: String(row.products_categories || ''),
    brandsAvailable: String(row.brands_available || ''),
    deliveryAvailable: Number(row.delivery_available) === 1,
    repairCategories: Array.isArray(categoriesRaw) ? categoriesRaw.map(String) : [],
    recoveryServices: Array.isArray(recoveryRaw) ? recoveryRaw.map(String) : [],
    servicesOffered: String(row.services_offered || row.servicesOffered || ''),
    sportsFields
  }
}

export function readOpeningHours(raw: unknown) {
  const hours = Object.fromEntries(DAY_KEYS.map((day) => [day, { isOpen: null as boolean | null, openTime: '09:00', closeTime: '18:00' }]))
  const text = String(raw || '').trim()
  if (!text || text === 'null') return null
  let matched = false
  for (const part of text.split(';').map((item) => item.trim()).filter(Boolean)) {
    const splitAt = part.indexOf(':')
    if (splitAt < 0) continue
    const label = part.slice(0, splitAt).trim().toLowerCase()
    const value = part.slice(splitAt + 1).trim()
    const key = DAY_KEYS.includes(label) ? label : DAY_LABELS[label]
    if (!key) continue
    matched = true
    if (/closed|închis|inchis/i.test(value)) {
      hours[key] = { isOpen: false, openTime: '09:00', closeTime: '18:00' }
    } else {
      const times = value.match(/(\d{2}:\d{2}).*?(\d{2}:\d{2})/)
      hours[key] = { isOpen: true, openTime: times?.[1] || '09:00', closeTime: times?.[2] || '18:00' }
    }
  }
  return matched ? hours : null
}

export async function sendProfile(completion: ProfileCompletion, body: FormData | Record<string, unknown>) {
  const headers: Record<string, string> = {}
  let payload: BodyInit
  if (body instanceof FormData) {
    body.append('username', completion.username)
    payload = body
  } else {
    headers['Content-Type'] = 'application/json'
    payload = JSON.stringify({ ...body, username: completion.username })
  }
  const response = await fetch(`${API_BASE_URL}/claims/${completion.claimId}/onboarding`, {
    method: 'POST',
    headers,
    body: payload
  })
  const raw = await response.text()
  let data: { success?: boolean; error?: string } = {}
  try { data = JSON.parse(raw) } catch { data = { error: raw } }
  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Nu am putut salva profilul.')
  }
  return data
}
