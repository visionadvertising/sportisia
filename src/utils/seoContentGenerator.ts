import { citySlugToName, sportSlugToName, slugToFacilityType, cityNameToSlug } from './seo'

interface FilterParams {
  city?: string
  sport?: string
  type?: string
}

const FACILITY_TYPE_LABELS: Record<string, string> = {
  'field': 'Terenuri Sportive',
  'coach': 'Antrenori',
  'repair_shop': 'Magazine Reparații',
  'equipment_shop': 'Magazine Articole Sportive'
}

const FACILITY_TYPE_LABELS_LOWER: Record<string, string> = {
  'field': 'terenuri sportive',
  'coach': 'antrenori',
  'repair_shop': 'magazine reparații',
  'equipment_shop': 'magazine articole sportive'
}

const SPORT_NAMES: Record<string, string> = {
  'tenis': 'Tenis',
  'fotbal': 'Fotbal',
  'baschet': 'Baschet',
  'volei': 'Volei',
  'handbal': 'Handbal',
  'badminton': 'Badminton',
  'squash': 'Squash',
  'ping-pong': 'Ping Pong',
  'atletism': 'Atletism',
  'inot': 'Înot',
  'fitness': 'Fitness',
  'box': 'Box',
  'karate': 'Karate',
  'judo': 'Judo',
  'dans': 'Dans'
}

const FACILITY_TYPE_SLUGS: Record<string, string> = {
  'field': 'terenuri',
  'coach': 'antrenori',
  'repair_shop': 'magazine-reparatii',
  'equipment_shop': 'magazine-articole'
}

export function parseURLToFilters(url: string): FilterParams {
  const parts = url.split('/').filter(p => p && p !== 'toate')
  const params: FilterParams = {}

  // Check for known sports
  const knownSports = Object.keys(SPORT_NAMES)
  // Check for facility types
  const facilityTypeSlugs = Object.values(FACILITY_TYPE_SLUGS)
  
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]
    
    // Check if it's a facility type
    const typeKey = Object.keys(FACILITY_TYPE_SLUGS).find(
      key => FACILITY_TYPE_SLUGS[key] === part
    )
    if (typeKey) {
      params.type = typeKey
      continue
    }
    
    // Check if it's a sport
    if (knownSports.includes(part)) {
      params.sport = part
      continue
    }
    
    // Otherwise, it's likely a city
    if (!params.city) {
      params.city = citySlugToName(part)
    }
  }
  
  return params
}

export async function getFacilityCount(filters: FilterParams, apiBaseUrl: string): Promise<number> {
  try {
    const queryParams = new URLSearchParams()
    if (filters.type) {
      queryParams.append('type', filters.type)
    }
    if (filters.city) {
      queryParams.append('city', filters.city)
    }
    if (filters.sport) {
      queryParams.append('sport', filters.sport)
    }
    queryParams.append('status', 'active')

    const response = await fetch(`${apiBaseUrl}/facilities?${queryParams}`)
    const data = await response.json()
    return data.success ? (data.data?.length || 0) : 0
  } catch {
    return 0
  }
}

export function generateSEOTitle(filters: FilterParams, count?: number): string {
  const parts: string[] = []
  
  if (filters.type) {
    parts.push(FACILITY_TYPE_LABELS[filters.type])
  } else {
    parts.push('Facilități Sportive')
  }
  
  if (filters.sport) {
    parts.push(SPORT_NAMES[filters.sport] || filters.sport)
  }
  
  if (filters.city) {
    parts.push(`în ${filters.city}`)
  }
  
  if (count !== undefined && count > 0) {
    parts.push(`(${count} disponibile)`)
  }
  
  return parts.join(' - ')
}

export function generateSEODescription(filters: FilterParams, count?: number): string {
  const parts: string[] = []
  
  if (filters.type && filters.sport && filters.city) {
    const typeLabel = FACILITY_TYPE_LABELS_LOWER[filters.type]
    const sportName = SPORT_NAMES[filters.sport]?.toLowerCase() || filters.sport
    parts.push(`Găsește ${typeLabel} pentru ${sportName} în ${filters.city}.`)
    if (count !== undefined && count > 0) {
      parts.push(`${count} ${typeLabel} disponibile pentru rezervare.`)
    }
    parts.push(`Rezervă online terenuri, antrenori și servicii sportive de calitate.`)
  } else if (filters.type && filters.city) {
    const typeLabel = FACILITY_TYPE_LABELS_LOWER[filters.type]
    parts.push(`Găsește ${typeLabel} în ${filters.city}.`)
    if (count !== undefined && count > 0) {
      parts.push(`${count} ${typeLabel} disponibile.`)
    }
    parts.push(`Rezervă online facilități sportive de calitate în ${filters.city}.`)
  } else if (filters.sport && filters.type) {
    const typeLabel = FACILITY_TYPE_LABELS_LOWER[filters.type]
    const sportName = SPORT_NAMES[filters.sport]?.toLowerCase() || filters.sport
    parts.push(`Găsește ${typeLabel} pentru ${sportName} în România.`)
    if (count !== undefined && count > 0) {
      parts.push(`${count} ${typeLabel} disponibile.`)
    }
    parts.push(`Rezervă online facilități sportive pentru ${sportName}.`)
  } else if (filters.city) {
    parts.push(`Găsește facilități sportive în ${filters.city}.`)
    if (count !== undefined && count > 0) {
      parts.push(`${count} facilități disponibile.`)
    }
    parts.push(`Rezervă online terenuri, antrenori și servicii sportive în ${filters.city}.`)
  } else if (filters.sport) {
    const sportName = SPORT_NAMES[filters.sport]?.toLowerCase() || filters.sport
    parts.push(`Găsește facilități sportive pentru ${sportName} în România.`)
    if (count !== undefined && count > 0) {
      parts.push(`${count} facilități disponibile.`)
    }
    parts.push(`Rezervă online terenuri și antrenori pentru ${sportName}.`)
  } else if (filters.type) {
    const typeLabel = FACILITY_TYPE_LABELS_LOWER[filters.type]
    parts.push(`Găsește ${typeLabel} în România.`)
    if (count !== undefined && count > 0) {
      parts.push(`${count} ${typeLabel} disponibile.`)
    }
    parts.push(`Rezervă online ${typeLabel} de calitate.`)
  } else {
    parts.push(`Găsește facilități sportive în România.`)
    if (count !== undefined && count > 0) {
      parts.push(`${count} facilități disponibile.`)
    }
    parts.push(`Rezervă online terenuri, antrenori și servicii sportive.`)
  }
  
  return parts.join(' ')
}

export function generateH1Title(filters: FilterParams): string {
  const parts: string[] = []
  
  if (filters.type) {
    parts.push(FACILITY_TYPE_LABELS[filters.type])
  } else {
    parts.push('Facilități Sportive')
  }
  
  if (filters.sport) {
    parts.push(`- ${SPORT_NAMES[filters.sport] || filters.sport}`)
  }
  
  if (filters.city) {
    parts.push(`în ${filters.city}`)
  }
  
  return parts.join(' ')
}

export function generateDescription(
  filters: FilterParams,
  count?: number,
  url?: string
): string {
  const lines: string[] = []
  
  // First paragraph - main description
  if (filters.type && filters.sport && filters.city) {
    const typeLabel = FACILITY_TYPE_LABELS_LOWER[filters.type]
    const sportName = SPORT_NAMES[filters.sport] || filters.sport
    lines.push(`Descoperă cele mai bune ${typeLabel} pentru ${sportName} în ${filters.city}.`)
    if (count !== undefined && count > 0) {
      lines.push(`Avem ${count} ${typeLabel} disponibile pentru rezervare online.`)
    } else {
      lines.push(`Găsește ${typeLabel} de calitate pentru ${sportName} în ${filters.city}.`)
    }
    lines.push(`Rezervă-ți terenul sau antrenorul preferat cu câteva click-uri.`)
  } else if (filters.type && filters.city) {
    const typeLabel = FACILITY_TYPE_LABELS_LOWER[filters.type]
    lines.push(`Găsește ${typeLabel} în ${filters.city}.`)
    if (count !== undefined && count > 0) {
      lines.push(`Avem ${count} ${typeLabel} disponibile pentru rezervare.`)
    }
    lines.push(`Rezervă online facilități sportive de calitate în ${filters.city}.`)
  } else if (filters.sport && filters.type) {
    const typeLabel = FACILITY_TYPE_LABELS_LOWER[filters.type]
    const sportName = SPORT_NAMES[filters.sport] || filters.sport
    lines.push(`Găsește ${typeLabel} pentru ${sportName} în România.`)
    if (count !== undefined && count > 0) {
      lines.push(`Avem ${count} ${typeLabel} disponibile.`)
    }
    lines.push(`Rezervă online facilități sportive pentru ${sportName}.`)
  } else if (filters.city) {
    lines.push(`Găsește facilități sportive în ${filters.city}.`)
    if (count !== undefined && count > 0) {
      lines.push(`Avem ${count} facilități disponibile pentru rezervare.`)
    }
    lines.push(`Rezervă online terenuri, antrenori și servicii sportive în ${filters.city}.`)
  } else if (filters.sport) {
    const sportName = SPORT_NAMES[filters.sport] || filters.sport
    lines.push(`Găsește facilități sportive pentru ${sportName} în România.`)
    if (count !== undefined && count > 0) {
      lines.push(`Avem ${count} facilități disponibile.`)
    }
    lines.push(`Rezervă online terenuri și antrenori pentru ${sportName}.`)
  } else if (filters.type) {
    const typeLabel = FACILITY_TYPE_LABELS_LOWER[filters.type]
    lines.push(`Găsește ${typeLabel} în România.`)
    if (count !== undefined && count > 0) {
      lines.push(`Avem ${count} ${typeLabel} disponibile.`)
    }
    lines.push(`Rezervă online ${typeLabel} de calitate.`)
  } else {
    lines.push(`Găsește facilități sportive în România.`)
    if (count !== undefined && count > 0) {
      lines.push(`Avem ${count} facilități disponibile pentru rezervare.`)
    }
    lines.push(`Rezervă online terenuri, antrenori și servicii sportive.`)
  }
  
  // Second paragraph - recommendations with internal links
  if (filters.type === 'field' && filters.sport) {
    const sportName = SPORT_NAMES[filters.sport] || filters.sport
    const sportSlug = filters.sport
    const cityPart = filters.city ? `/${citySlugToName(filters.city).toLowerCase().replace(/\s+/g, '-')}` : ''
    lines.push('')
    lines.push(`Căutând antrenori pentru ${sportName}? Explorează [antrenorii de ${sportName}${cityPart ? ` din ${filters.city}` : ''}](${cityPart}/${sportSlug}/antrenori) disponibili pe platformă.`)
  } else if (filters.type === 'coach' && filters.sport) {
    const sportName = SPORT_NAMES[filters.sport] || filters.sport
    const sportSlug = filters.sport
    const cityPart = filters.city ? `/${citySlugToName(filters.city).toLowerCase().replace(/\s+/g, '-')}` : ''
    lines.push('')
    lines.push(`Ai nevoie de un teren pentru ${sportName}? Vezi [terenurile de ${sportName}${cityPart ? ` din ${filters.city}` : ''}](${cityPart}/${sportSlug}/terenuri) disponibile pentru rezervare.`)
  } else if (filters.type === 'field' && filters.city) {
    lines.push('')
    lines.push(`Căutând antrenori în ${filters.city}? Explorează [antrenorii disponibili](${cityNameToSlug(filters.city)}/antrenori) sau [magazinele de articole sportive](${cityNameToSlug(filters.city)}/magazine-articole) din oraș.`)
  } else if (filters.type === 'coach' && filters.city) {
    lines.push('')
    lines.push(`Ai nevoie de un teren în ${filters.city}? Vezi [terenurile disponibile](${cityNameToSlug(filters.city)}/terenuri) sau [magazinele de reparații](${cityNameToSlug(filters.city)}/magazine-reparatii) din oraș.`)
  } else if (filters.sport && !filters.type) {
    const sportName = SPORT_NAMES[filters.sport] || filters.sport
    const sportSlug = filters.sport
    lines.push('')
    lines.push(`Explorează [terenurile de ${sportName}](${sportSlug}/terenuri) și [antrenorii de ${sportName}](${sportSlug}/antrenori) disponibili pe platformă.`)
  } else if (filters.city && !filters.type) {
    const citySlug = cityNameToSlug(filters.city)
    lines.push('')
    lines.push(`În ${filters.city} găsești [terenuri sportive](${citySlug}/terenuri), [antrenori](${citySlug}/antrenori), [magazine reparații](${citySlug}/magazine-reparatii) și [magazine articole sportive](${citySlug}/magazine-articole).`)
  }
  
  // Third paragraph - call to action
  lines.push('')
  lines.push(`Rezervă online cu ușurință și bucură-te de cele mai bune facilități sportive.`)
  
  return lines.join('\n')
}

import { citySlugToName as getCityNameFromSlug } from './seo'

