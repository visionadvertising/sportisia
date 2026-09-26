import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { slugify } from '../utils/seo'
import FacilityCardActions from './FacilityCardActions'
import SportPlaceholder from './SportPlaceholder'

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

type SortKey = 'recommended' | 'name-asc' | 'name-desc' | 'newest' | 'oldest'
type ViewMode = 'card' | 'grid'

function createSlug(name: string, city: string) {
  return `${name} ${city}`
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
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
  const topRef = useRef<HTMLDivElement>(null)
  const skipScroll = useRef(true)

  useEffect(() => {
    setPage(1)
  }, [facilities, sort, view])

  useEffect(() => {
    if (skipScroll.current) {
      skipScroll.current = false
      return
    }
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [page])

  const sorted = useMemo(() => {
    const list = [...facilities]
    list.sort((a, b) => {
      if (sort === 'name-asc') return a.name.localeCompare(b.name, 'ro')
      if (sort === 'name-desc') return b.name.localeCompare(a.name, 'ro')
      if (sort === 'newest') return createdTime(b) - createdTime(a)
      if (sort === 'oldest') return createdTime(a) - createdTime(b)
      return tierRank(a) - tierRank(b) || a.name.localeCompare(b.name, 'ro')
    })
    return list
  }, [facilities, sort])

  const pageSize = view === 'grid' ? 24 : 12
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const start = (safePage - 1) * pageSize
  const visible = sorted.slice(start, start + pageSize)
  const pages = pageList(safePage, totalPages)

  return (
    <div ref={topRef}>
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
            </select>
          </label>
          {!isMobile && <ViewSwitch view={view} onChange={setView} />}
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: view === 'grid'
          ? (isMobile ? '1fr' : 'repeat(3, 1fr)')
          : (isMobile ? '1fr' : 'repeat(2, 1fr)'),
        columnGap: view === 'grid' ? (isMobile ? '1rem' : '1.5rem') : (isMobile ? '1.25rem' : '1.75rem'),
        rowGap: view === 'grid' ? (isMobile ? '1.5rem' : '2rem') : (isMobile ? '1.75rem' : '2.25rem')
      }}>
        {visible.map((facility) => (
          <FacilityCard key={facility.id} facility={facility} compact={view === 'grid'} isMobile={isMobile} />
        ))}
      </div>

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

function FacilityCard({ facility, compact, isMobile }: { facility: ResultFacility; compact: boolean; isMobile: boolean }) {
  const facilityUrl = facility.facility_type === 'field'
    ? `/baza-sportiva/${createSlug(facility.name, facility.city)}`
    : `/facility/${facility.id}/${slugify(facility.name)}`
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
      <Link to={facilityUrl} aria-label={facility.name} style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
        <div style={{
          width: '100%',
          height: compact ? (isMobile ? '168px' : '210px') : (isMobile ? '230px' : '270px'),
          overflow: 'hidden',
          background: displayImage
            ? `url(${displayImage}) center/cover`
            : 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)'
        }}>
          {!displayImage && <SportPlaceholder sports={sports} compact={compact} />}
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
          <Link to={facilityUrl} style={{ color: 'inherit', textDecoration: 'none' }}>{facility.name}</Link>
          {facility.profile_tier === 'recommended' && <TierBadge compact={compact} label="Recomandată" background="#ecfdf5" color="#047857" />}
          {facility.profile_tier === 'verified' && <TierBadge compact={compact} label="Verificată" background="#fff7ed" color="#c2410c" />}
        </h3>
        <div style={{ color: '#64748b', fontSize: compact ? '0.75rem' : '0.8125rem', lineHeight: 1.4 }}>
          {facility.city}{facility.location ? `, ${facility.location}` : ''}
        </div>
        {!compact && sports.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {sports.slice(0, 3).map((sport) => (
              <span key={sport} style={{ padding: '0.3rem 0.55rem', background: '#f0fdf4', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, color: '#059669' }}>
                {SPORT_NAMES[sport] || sport}
              </span>
            ))}
          </div>
        )}
        <FacilityCardActions facility={facility} profileUrl={facilityUrl} compact={compact} />
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
