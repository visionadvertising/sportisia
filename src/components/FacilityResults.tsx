import { lazy, Suspense, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { slugify } from '../utils/seo'
import FacilityCardActions from './FacilityCardActions'
import SportPlaceholder from './SportPlaceholder'
import type { MapPoint } from './ResultsMap'
import { useNavigate } from 'react-router-dom'
import { HeartIcon } from './icons/HeartIcon'
import { AUTH_EVENT, isMemberSession } from '../utils/memberSession'
import { isSaved, toggleSaved } from '../utils/savedFacilities'

const ResultsMap = lazy(() => import('./ResultsMap'))

export interface ResultFacility {
  id: number
  facility_type: string
  name: string
  city: string
  location?: string
  phone?: string
  image_url?: string
  logo_url?: string
  sport?: string
  gallery?: string | string[]
  created_at?: string
  profile_tier?: 'recommended' | 'verified' | 'unverified'
  can_claim?: boolean
  map_coordinates?: { lat: number; lng: number } | string | null
  sportsFields?: Array<{ sport_type?: string; sportType?: string }>
  minPrice?: number | null
  openNow?: boolean | null
  amenities?: string[]
  ratingAvg?: number | null
  ratingCount?: number
  audienceList?: string[]
  whatsapp?: string
  repair_categories?: string[] | string
  recovery_services?: string[] | string
  price_per_lesson?: number | null
}

const SPORT_NAMES: Record<string, string> = {
  tenis: 'Tenis',
  fotbal: 'Fotbal',
  baschet: 'Baschet',
  volei: 'Volei',
  handbal: 'Handbal',
  badminton: 'Badminton',
  squash: 'Squash'
}

type SortKey = 'recommended' | 'name-asc' | 'name-desc' | 'newest' | 'oldest' | 'price' | 'distance'
type ViewMode = 'card' | 'grid' | 'map'

const AMENITY_FILTERS = [
  { key: 'hasLighting', label: 'Iluminat' },
  { key: 'hasCover', label: 'Acoperiș' },
  { key: 'hasIndoor', label: 'Interior' },
  { key: 'hasChangingRoom', label: 'Vestiar' },
  { key: 'hasParking', label: 'Parcare' },
  { key: 'hasShower', label: 'Duș' }
]

const AUDIENCE_FILTERS = [
  { key: 'copii', label: 'Copii' },
  { key: 'adulti', label: 'Adulți' },
  { key: 'incepatori', label: 'Începători' }
]

function coordsOf(facility: ResultFacility) {
  let coords = facility.map_coordinates
  if (typeof coords === 'string') {
    try { coords = JSON.parse(coords) } catch { coords = null }
  }
  if (coords && typeof coords === 'object' && Number.isFinite(Number(coords.lat)) && Number.isFinite(Number(coords.lng))) {
    return { lat: Number(coords.lat), lng: Number(coords.lng) }
  }
  return null
}

function distanceKm(from: { lat: number; lng: number }, to: { lat: number; lng: number }) {
  const radius = 6371
  const dLat = (to.lat - from.lat) * Math.PI / 180
  const dLng = (to.lng - from.lng) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(from.lat * Math.PI / 180) * Math.cos(to.lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  return 2 * radius * Math.asin(Math.sqrt(a))
}

function createSlug(name: string, city: string) {
  return `${name} ${city}`
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function facilityUrl(facility: ResultFacility) {
  return facility.facility_type === 'field'
    ? `/baza-sportiva/${createSlug(facility.name, facility.city)}`
    : `/facility/${facility.id}/${slugify(facility.name)}`
}

function tierRank(facility: ResultFacility) {
  if (facility.profile_tier === 'recommended') return 0
  if (facility.profile_tier === 'verified') return 1
  return 2
}

function createdTime(facility: ResultFacility) {
  const time = facility.created_at ? new Date(facility.created_at).getTime() : facility.id
  return Number.isNaN(time) ? facility.id : time
}

function pageList(current: number, total: number) {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1)
  const pages = new Set([1, total, current - 1, current, current + 1])
  return [...pages].filter((page) => page >= 1 && page <= total).sort((a, b) => a - b)
}

export default function FacilityResults({ facilities, isMobile }: { facilities: ResultFacility[]; isMobile: boolean }) {
  const [sort, setSort] = useState<SortKey>('recommended')
  const [view, setView] = useState<ViewMode>('grid')
  const [page, setPage] = useState(1)
  const [openOnly, setOpenOnly] = useState(false)
  const [amenities, setAmenities] = useState<string[]>([])
  const [audience, setAudience] = useState('')
  const [origin, setOrigin] = useState<{ lat: number; lng: number } | null>(null)
  const [savedTick, setSavedTick] = useState(0)
  const topRef = useRef<HTMLDivElement>(null)
  const skipScroll = useRef(true)

  useEffect(() => {
    setPage(1)
  }, [facilities, sort, view, openOnly, amenities, audience])

  useEffect(() => {
    const refresh = () => setSavedTick((value) => value + 1)
    window.addEventListener('sportisia-saved', refresh)
    return () => window.removeEventListener('sportisia-saved', refresh)
  }, [])

  useEffect(() => {
    if (skipScroll.current) {
      skipScroll.current = false
      return
    }
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [page])

  const sorted = useMemo(() => {
    const list = facilities.filter((facility) => {
      if (openOnly && facility.openNow !== true) return false
      if (amenities.length && !amenities.every((key) => (facility.amenities || []).includes(key))) return false
      if (audience && !(facility.audienceList || []).includes(audience)) return false
      return true
    })
    list.sort((a, b) => {
      if (sort === 'name-asc') return a.name.localeCompare(b.name, 'ro')
      if (sort === 'name-desc') return b.name.localeCompare(a.name, 'ro')
      if (sort === 'newest') return createdTime(b) - createdTime(a)
      if (sort === 'oldest') return createdTime(a) - createdTime(b)
      if (sort === 'price') return (a.minPrice ?? 999999) - (b.minPrice ?? 999999)
      if (sort === 'distance' && origin) {
        const aPoint = coordsOf(a)
        const bPoint = coordsOf(b)
        const aDistance = aPoint ? distanceKm(origin, aPoint) : 999999
        const bDistance = bPoint ? distanceKm(origin, bPoint) : 999999
        return aDistance - bDistance
      }
      return tierRank(a) - tierRank(b) || a.name.localeCompare(b.name, 'ro')
    })
    return list
  }, [facilities, sort, openOnly, amenities, audience, origin])

  const pageSize = view === 'grid' ? 24 : 12
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const start = (safePage - 1) * pageSize
  const visible = sorted.slice(start, start + pageSize)
  const pages = pageList(safePage, totalPages)
  const mapPoints: MapPoint[] = sorted.flatMap((facility) => {
    const point = coordsOf(facility)
    if (!point) return []
    return [{
      id: facility.id,
      name: facility.name,
      city: facility.city,
      lat: point.lat,
      lng: point.lng,
      url: facilityUrl(facility)
    }]
  })
  const chip = (active: boolean): CSSProperties => ({
    border: active ? '1px solid #10b981' : '1px solid #e2e8f0',
    background: active ? '#ecfdf5' : 'white',
    color: active ? '#047857' : '#334155',
    borderRadius: '999px',
    padding: '0.4rem 0.75rem',
    fontWeight: 700,
    cursor: 'pointer'
  })

  return (
    <div ref={topRef}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', marginBottom: '0.9rem' }}>
        <button type="button" onClick={() => setOpenOnly((value) => !value)} style={chip(openOnly)}>Deschis acum</button>
        <button type="button" onClick={() => {
          if (!navigator.geolocation) return
          navigator.geolocation.getCurrentPosition((position) => {
            setOrigin({ lat: position.coords.latitude, lng: position.coords.longitude })
            setSort('distance')
          })
        }} style={chip(sort === 'distance')}>Cele mai apropiate</button>
        {AMENITY_FILTERS.map((item) => (
          <button key={item.key} type="button" onClick={() => setAmenities((current) => current.includes(item.key) ? current.filter((key) => key !== item.key) : [...current, item.key])} style={chip(amenities.includes(item.key))}>{item.label}</button>
        ))}
        {AUDIENCE_FILTERS.map((item) => (
          <button key={item.key} type="button" onClick={() => setAudience((current) => current === item.key ? '' : item.key)} style={chip(audience === item.key)}>{item.label}</button>
        ))}
      </div>
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        flexWrap: 'wrap',
        alignItems: isMobile ? 'stretch' : 'center',
        justifyContent: 'space-between',
        gap: '0.65rem',
        marginBottom: '1.25rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
          <span style={{ color: '#64748b', fontSize: '0.92rem', fontWeight: 600 }}>
            {sorted.length} {sorted.length === 1 ? 'rezultat' : 'rezultate'}
          </span>
          {isMobile && (
            <ViewSwitch view={view} onChange={setView} iconsOnly />
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', width: isMobile ? '100%' : 'auto' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#334155', fontSize: '0.88rem', fontWeight: 600, flex: isMobile ? 1 : undefined, minWidth: 0 }}>
            {isMobile ? <span className="sr-only" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>Sortare</span> : 'Sortare'}
            <select
              aria-label="Sortare"
              value={sort}
              onChange={(event) => setSort(event.target.value as SortKey)}
              style={{
                border: '1px solid #e7eef5',
                background: 'white',
                borderRadius: '10px',
                padding: '0.6rem 0.75rem',
                font: 'inherit',
                fontSize: '0.92rem',
                color: '#0f172a',
                width: isMobile ? '100%' : 'auto',
                minHeight: '42px'
              }}
            >
              <option value="recommended">Recomandate</option>
              <option value="name-asc">Alfabetic crescător</option>
              <option value="name-desc">Alfabetic descrescător</option>
              <option value="newest">Cele mai noi</option>
              <option value="oldest">Cele mai vechi</option>
              <option value="price">Preț crescător</option>
              <option value="distance">Distanță</option>
            </select>
          </label>
          {!isMobile && <ViewSwitch view={view} onChange={setView} />}
        </div>
      </div>

      {view === 'map' ? (
        <Suspense fallback={<p style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>Se încarcă harta...</p>}>
          <ResultsMap points={mapPoints} />
        </Suspense>
      ) : (
      <div style={{
        display: 'grid',
        gridTemplateColumns: view === 'grid'
          ? (isMobile ? '1fr' : 'repeat(3, 1fr)')
          : (isMobile ? '1fr' : 'repeat(2, 1fr)'),
        columnGap: view === 'grid' ? (isMobile ? '1rem' : '1.5rem') : (isMobile ? '1.25rem' : '1.75rem'),
        rowGap: view === 'grid' ? (isMobile ? '1.5rem' : '2rem') : (isMobile ? '1.75rem' : '2.25rem')
      }}>
        {visible.map((facility) => (
          <FacilityCard key={facility.id} facility={facility} compact={view === 'grid'} isMobile={isMobile} savedTick={savedTick} />
        ))}
      </div>
      )}

      {totalPages > 1 && (
        <nav style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.4rem', marginTop: '1.75rem', flexWrap: 'wrap' }}>
          <PageButton disabled={safePage === 1} onClick={() => setPage(safePage - 1)}>Înapoi</PageButton>
          {pages.map((item, index) => (
            <span key={item} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              {index > 0 && item - pages[index - 1] > 1 && <span style={{ color: '#94a3b8' }}>…</span>}
              <PageButton active={item === safePage} onClick={() => setPage(item)}>{item}</PageButton>
            </span>
          ))}
          <PageButton disabled={safePage === totalPages} onClick={() => setPage(safePage + 1)}>Înainte</PageButton>
        </nav>
      )}
    </div>
  )
}

function FacilityCard({ facility, compact, isMobile, savedTick }: { facility: ResultFacility; compact: boolean; isMobile: boolean; savedTick: number }) {
  const navigate = useNavigate()
  const facilityLink = facilityUrl(facility)
  void savedTick
  const [canSave, setCanSave] = useState(isMemberSession())
  const saved = canSave ? isSaved(facility.id) : false

  useEffect(() => {
    const sync = () => setCanSave(isMemberSession())
    sync()
    window.addEventListener(AUTH_EVENT, sync)
    return () => window.removeEventListener(AUTH_EVENT, sync)
  }, [])
  let displayImage = facility.image_url || facility.logo_url
  if (facility.gallery) {
    const gallery = typeof facility.gallery === 'string'
      ? (() => { try { return JSON.parse(facility.gallery) } catch { return [] } })()
      : facility.gallery
    if (Array.isArray(gallery) && gallery.length > 0) displayImage = gallery[0]
  }
  const sports: string[] = []
  const seenSports = new Set<string>()
  for (const value of [
    ...(facility.sportsFields || []).map((field) => field.sportType || field.sport_type || ''),
    facility.sport || ''
  ]) {
    const key = value.trim().toLowerCase()
    if (!key || seenSports.has(key)) continue
    seenSports.add(key)
    sports.push(value.trim())
  }

  const parseJsonList = (raw: string[] | string | undefined): string[] => {
    if (!raw) return []
    if (Array.isArray(raw)) return raw.filter(Boolean)
    try {
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed.filter(Boolean) : []
    } catch {
      return []
    }
  }

  const recoveryBadges =
    facility.facility_type === 'sports_recovery' ? parseJsonList(facility.recovery_services).slice(0, 3) : []
  const repairBadges =
    facility.facility_type === 'repair_shop' ? parseJsonList(facility.repair_categories).slice(0, 3) : []
  const categoryBadges = recoveryBadges.length > 0 ? recoveryBadges : repairBadges
  const sessionPrice =
    facility.facility_type === 'sports_recovery' || facility.facility_type === 'coach'
      ? (facility.price_per_lesson ?? (facility.facility_type === 'sports_recovery' ? facility.minPrice : null))
      : null

  return (
    <div style={{
      background: 'white',
      borderRadius: compact ? '12px' : '16px',
      overflow: 'hidden',
      border: '1px solid #eef2f6',
      display: 'flex',
      flexDirection: 'column',
      height: '100%'
    }}>
      <Link to={facilityLink} aria-label={facility.name} style={{ display: 'block', textDecoration: 'none', color: 'inherit', position: 'relative' }}>
        <div style={{
          width: '100%',
          height: compact ? (isMobile ? '168px' : '210px') : (isMobile ? '230px' : '270px'),
          overflow: 'hidden',
          background: displayImage ? '#f8fafc' : 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)'
        }}>
          {displayImage
            ? <img src={displayImage} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            : <SportPlaceholder sports={sports} compact={compact} />}
          {canSave ? (
            <button
              type="button"
              aria-label={saved ? 'Elimină din salvate' : 'Salvează'}
              onClick={async (event) => {
                event.preventDefault()
                event.stopPropagation()
                const result = await toggleSaved(facility.id)
                if (result.needsLogin) {
                  navigate(`/login/membru?next=${encodeURIComponent(window.location.pathname + window.location.search)}`)
                }
              }}
              style={{
                position: 'absolute',
                top: '0.6rem',
                right: '0.6rem',
                border: 0,
                background: 'white',
                borderRadius: '999px',
                width: 34,
                height: 34,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(15,23,42,0.12)'
              }}
            >
              <HeartIcon size={18} color={saved ? '#e11d48' : '#94a3b8'} strokeWidth={saved ? 2.25 : 2} />
            </button>
          ) : null}
        </div>
      </Link>
      <div style={{ padding: compact ? '1rem' : (isMobile ? '1.35rem' : '1.6rem'), display: 'flex', flexDirection: 'column', flex: 1, gap: compact ? '0.65rem' : '0.85rem' }}>
        <h3 style={{
          margin: 0,
          fontSize: compact ? '0.92rem' : (isMobile ? '1.125rem' : '1.25rem'),
          color: '#0f172a',
          fontWeight: 700,
          lineHeight: 1.35,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          <Link to={facilityLink} style={{ color: 'inherit', textDecoration: 'none' }}>{facility.name}</Link>
          {facility.profile_tier === 'recommended' && <TierBadge compact={compact} label="Recomandată" background="#ecfdf5" color="#047857" />}
          {facility.profile_tier === 'verified' && <TierBadge compact={compact} label="Verificată" background="#fff7ed" color="#c2410c" />}
        </h3>
        <div style={{ color: '#64748b', fontSize: compact ? '0.75rem' : '0.8125rem', lineHeight: 1.4 }}>
          {facility.city}{facility.location ? `, ${facility.location}` : ''}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', color: '#334155', fontSize: compact ? '0.75rem' : '0.82rem', fontWeight: 700 }}>
          {sessionPrice != null && (
            <span>
              De la {sessionPrice} RON{facility.facility_type === 'sports_recovery' ? '/ședință' : '/lecție'}
            </span>
          )}
          {sessionPrice == null && facility.minPrice != null && <span>De la {facility.minPrice} RON</span>}
          {facility.ratingAvg != null && <span>{facility.ratingAvg} ★</span>}
          {facility.openNow === true && <span style={{ color: '#059669' }}>Deschis</span>}
          {facility.openNow === false && <span style={{ color: '#b91c1c' }}>Închis</span>}
        </div>
        {!compact && (sports.length > 0 || categoryBadges.length > 0) && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {sports.slice(0, 3).map((sport) => (
              <span key={sport} style={{ padding: '0.3rem 0.55rem', background: '#f0fdf4', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, color: '#059669' }}>
                {SPORT_NAMES[sport] || sport}
              </span>
            ))}
            {categoryBadges.map((label) => (
              <span key={label} style={{ padding: '0.3rem 0.55rem', background: '#eff6ff', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, color: '#1d4ed8' }}>
                {label}
              </span>
            ))}
          </div>
        )}
        <FacilityCardActions facility={facility} profileUrl={facilityLink} compact={compact} />
      </div>
    </div>
  )
}

function TierBadge({ label, background, color, compact }: { label: string; background: string; color: string; compact: boolean }) {
  return (
    <span style={{ display: 'inline-block', marginLeft: '0.4rem', background, color, borderRadius: '999px', padding: compact ? '0.05rem 0.35rem' : '0.1rem 0.45rem', fontSize: compact ? '0.65rem' : '0.75rem', fontWeight: 700 }}>
      {label}
    </span>
  )
}

function ViewSwitch({ view, onChange, iconsOnly = false }: { view: ViewMode; onChange: (view: ViewMode) => void; iconsOnly?: boolean }) {
  return (
    <div style={{ display: 'flex', border: '1px solid #e7eef5', borderRadius: '10px', overflow: 'hidden', background: 'white', flexShrink: 0 }}>
      <ViewButton active={view === 'card'} label="Carduri" iconsOnly={iconsOnly} onClick={() => onChange('card')}>
        <rect x="3" y="4" width="18" height="7" rx="1.5" />
        <rect x="3" y="13" width="18" height="7" rx="1.5" />
      </ViewButton>
      <ViewButton active={view === 'grid'} label="Grilă" iconsOnly={iconsOnly} onClick={() => onChange('grid')}>
        <rect x="3" y="3" width="7" height="7" rx="1.2" />
        <rect x="14" y="3" width="7" height="7" rx="1.2" />
        <rect x="3" y="14" width="7" height="7" rx="1.2" />
        <rect x="14" y="14" width="7" height="7" rx="1.2" />
      </ViewButton>
      <ViewButton active={view === 'map'} label="Hartă" iconsOnly={iconsOnly} onClick={() => onChange('map')}>
        <path d="M12 21s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10z" />
        <circle cx="12" cy="11" r="1.6" />
      </ViewButton>
    </div>
  )
}

function ViewButton({ active, label, onClick, iconsOnly, children }: { active: boolean; label: string; onClick: () => void; iconsOnly?: boolean; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      title={label}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.35rem',
        border: 'none',
        background: active ? '#0f172a' : 'white',
        color: active ? 'white' : '#334155',
        padding: iconsOnly ? '0' : '0.5rem 0.7rem',
        width: iconsOnly ? '42px' : undefined,
        height: iconsOnly ? '42px' : undefined,
        cursor: 'pointer',
        fontWeight: 700,
        fontSize: '0.82rem'
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{children}</svg>
      {!iconsOnly && label}
    </button>
  )
}

function PageButton({ children, onClick, disabled, active }: { children: ReactNode; onClick: () => void; disabled?: boolean; active?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        minWidth: '38px',
        height: '38px',
        padding: '0 0.7rem',
        borderRadius: '10px',
        border: `1px solid ${active ? '#0f172a' : '#e7eef5'}`,
        background: active ? '#0f172a' : 'white',
        color: disabled ? '#cbd5e1' : active ? 'white' : '#0f172a',
        fontWeight: 700,
        cursor: disabled ? 'default' : 'pointer'
      }}
    >
      {children}
    </button>
  )
}
