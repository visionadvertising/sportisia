import type { IconType } from 'react-icons'
import {
  MdDirectionsRun,
  MdFitnessCenter,
  MdPool,
  MdSportsBasketball,
  MdSportsHandball,
  MdSportsMartialArts,
  MdSportsSoccer,
  MdSportsTennis,
  MdSportsVolleyball
} from 'react-icons/md'
import {
  PiBoxingGlove,
  PiMedal,
  PiPersonSimple,
  PiPingPong,
  PiRacquet
} from 'react-icons/pi'

function normalizeSport(sport?: string) {
  if (!sport) return ''
  const value = sport
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()

  if (value.includes('tenis de masa') || value.includes('ping')) return 'ping-pong'
  if (value.includes('fotbal') || value.includes('soccer')) return 'fotbal'
  if (value.includes('baschet') || value.includes('basket')) return 'baschet'
  if (value.includes('volei') || value.includes('volley')) return 'volei'
  if (value.includes('handbal')) return 'handbal'
  if (value.includes('badminton')) return 'badminton'
  if (value.includes('squash')) return 'squash'
  if (value.includes('tenis') || value.includes('tennis')) return 'tenis'
  if (value.includes('atlet') || value.includes('alerg')) return 'atletism'
  if (value.includes('inot') || value.includes('natat') || value.includes('swim')) return 'inot'
  if (value.includes('fitness') || value.includes('sala') || value.includes('gym')) return 'fitness'
  if (value.includes('box')) return 'box'
  if (value.includes('karate') || value.includes('judo') || value.includes('arte martiale')) return 'karate'
  if (value.includes('dans')) return 'dans'
  return value
}

const SPORT_ICONS: Record<string, IconType> = {
  tenis: MdSportsTennis,
  fotbal: MdSportsSoccer,
  baschet: MdSportsBasketball,
  volei: MdSportsVolleyball,
  handbal: MdSportsHandball,
  badminton: PiRacquet,
  squash: PiRacquet,
  'ping-pong': PiPingPong,
  atletism: MdDirectionsRun,
  inot: MdPool,
  fitness: MdFitnessCenter,
  box: PiBoxingGlove,
  karate: MdSportsMartialArts,
  dans: PiPersonSimple
}

export default function SportPlaceholder({ sport, sports, compact = false }: { sport?: string; sports?: string[]; compact?: boolean }) {
  const source = sports && sports.length > 0 ? sports : sport ? [sport] : []
  const seen = new Set<string>()
  const icons: IconType[] = []
  for (const item of source) {
    const key = normalizeSport(item)
    if (!key || seen.has(key)) continue
    seen.add(key)
    icons.push(SPORT_ICONS[key] || PiMedal)
  }
  if (icons.length === 0) icons.push(PiMedal)
  const shown = icons.slice(0, 4)
  const box = shown.length === 1 ? (compact ? 64 : 84) : shown.length === 2 ? (compact ? 48 : 64) : (compact ? 40 : 52)
  const iconSize = Math.round(box * 0.5)

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: shown.length > 1 ? '0.45rem' : 0,
      flexWrap: 'wrap',
      color: '#059669',
      padding: '0.5rem'
    }}>
      {shown.map((Icon, index) => (
        <div
          key={index}
          style={{
            width: `${box}px`,
            height: `${box}px`,
            borderRadius: '50%',
            background: 'rgba(16, 185, 129, 0.14)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          <Icon size={iconSize} />
        </div>
      ))}
    </div>
  )
}
