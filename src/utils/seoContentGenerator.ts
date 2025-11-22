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
  
  return parts.join(' ')
}

export function generateSEODescription(filters: FilterParams, count?: number): string {
  const parts: string[] = []
  
  if (filters.type && filters.sport && filters.city) {
    const typeLabel = FACILITY_TYPE_LABELS_LOWER[filters.type]
    const sportName = SPORT_NAMES[filters.sport]?.toLowerCase() || filters.sport
    parts.push(`Găsește ${typeLabel} pentru ${sportName} în ${filters.city}.`)
    if (count !== undefined && count > 0) {
      parts.push(`${count} ${typeLabel} disponibile.`)
    }
    parts.push(`Explorează facilități sportive de calitate.`)
  } else if (filters.type && filters.city) {
    const typeLabel = FACILITY_TYPE_LABELS_LOWER[filters.type]
    parts.push(`Găsește ${typeLabel} în ${filters.city}.`)
    if (count !== undefined && count > 0) {
      parts.push(`${count} ${typeLabel} disponibile.`)
    }
    parts.push(`Explorează facilități sportive de calitate în ${filters.city}.`)
  } else if (filters.sport && filters.type) {
    const typeLabel = FACILITY_TYPE_LABELS_LOWER[filters.type]
    const sportName = SPORT_NAMES[filters.sport]?.toLowerCase() || filters.sport
    parts.push(`Găsește ${typeLabel} pentru ${sportName} în România.`)
    if (count !== undefined && count > 0) {
      parts.push(`${count} ${typeLabel} disponibile.`)
    }
    parts.push(`Explorează facilități sportive pentru ${sportName}.`)
  } else if (filters.city) {
    parts.push(`Găsește facilități sportive în ${filters.city}.`)
    if (count !== undefined && count > 0) {
      parts.push(`${count} facilități disponibile.`)
    }
    parts.push(`Explorează terenuri, antrenori și servicii sportive în ${filters.city}.`)
  } else if (filters.sport) {
    const sportName = SPORT_NAMES[filters.sport]?.toLowerCase() || filters.sport
    parts.push(`Găsește facilități sportive pentru ${sportName} în România.`)
    if (count !== undefined && count > 0) {
      parts.push(`${count} facilități disponibile.`)
    }
    parts.push(`Explorează terenuri și antrenori pentru ${sportName}.`)
  } else if (filters.type) {
    const typeLabel = FACILITY_TYPE_LABELS_LOWER[filters.type]
    parts.push(`Găsește ${typeLabel} în România.`)
    if (count !== undefined && count > 0) {
      parts.push(`${count} ${typeLabel} disponibile.`)
    }
    parts.push(`Explorează ${typeLabel} de calitate.`)
  } else {
    parts.push(`Găsește facilități sportive în România.`)
    if (count !== undefined && count > 0) {
      parts.push(`${count} facilități disponibile.`)
    }
    parts.push(`Explorează terenuri, antrenori și servicii sportive.`)
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
  // Generate HTML content with proper links (400-500 words, 2-3 paragraphs)
  const paragraphs: string[] = []
  
  // First paragraph - main description (150-200 words)
  if (filters.type && filters.sport && filters.city) {
    const typeLabel = FACILITY_TYPE_LABELS_LOWER[filters.type]
    const sportName = SPORT_NAMES[filters.sport] || filters.sport
    paragraphs.push(`<p>Descoperă cele mai bune ${typeLabel} pentru ${sportName} în ${filters.city}. ${count !== undefined && count > 0 ? `Platforma noastră oferă acces la ${count} ${typeLabel} de calitate, fiecare selectat pentru a îndeplini standardele de excelență. ` : `Platforma noastră oferă acces la o selecție diversă de ${typeLabel} de calitate, fiecare selectat pentru a îndeplini standardele de excelență. `}Fie că ești un sportiv amator sau profesionist, găsești facilități care se potrivesc nevoilor tale. Explorează opțiunile disponibile, compară caracteristicile și alege cea mai potrivită facilitate pentru activitatea ta sportivă. Fiecare ${typeLabel === 'terenuri sportive' ? 'teren' : typeLabel} este prezentat cu detalii complete despre echipamente, accesibilitate și servicii oferite.</p>`)
  } else if (filters.type && filters.city) {
    const typeLabel = FACILITY_TYPE_LABELS_LOWER[filters.type]
    paragraphs.push(`<p>Găsește ${typeLabel} în ${filters.city} și descoperă o gamă variată de opțiuni pentru activitățile tale sportive. ${count !== undefined && count > 0 ? `Platforma noastră listează ${count} ${typeLabel} din ${filters.city}, fiecare cu caracteristici unice și servicii specializate. ` : `Platforma noastră listează o selecție diversă de ${typeLabel} din ${filters.city}, fiecare cu caracteristici unice și servicii specializate. `}Fie că cauți un teren pentru antrenamente regulate, un antrenor pentru îmbunătățirea performanțelor sau servicii de întreținere pentru echipamente, ${filters.city} oferă soluții complete. Explorează facilitățile disponibile, citește recenziile și descoperă cea mai potrivită opțiune pentru nevoile tale sportive.</p>`)
  } else if (filters.sport && filters.type) {
    const typeLabel = FACILITY_TYPE_LABELS_LOWER[filters.type]
    const sportName = SPORT_NAMES[filters.sport] || filters.sport
    paragraphs.push(`<p>Explorează ${typeLabel} pentru ${sportName} în toată România și descoperă o rețea extinsă de facilități dedicate acestui sport. ${count !== undefined && count > 0 ? `Platforma noastră conectează sportivii cu ${count} ${typeLabel} specializate pentru ${sportName}, distribuite în principalele orașe din țară. ` : `Platforma noastră conectează sportivii cu o rețea extinsă de ${typeLabel} specializate pentru ${sportName}, distribuite în principalele orașe din țară. `}Fie că practici ${sportName} la nivel amator sau competițional, găsești facilități care îți oferă condițiile optime pentru dezvoltare. Fiecare facilitate este prezentată cu detalii despre echipamente, program, prețuri și servicii suplimentare disponibile.</p>`)
  } else if (filters.city) {
    paragraphs.push(`<p>Descoperă facilități sportive în ${filters.city} și accesează o gamă completă de servicii pentru activitățile tale sportive. ${count !== undefined && count > 0 ? `Platforma noastră oferă acces la ${count} facilități din ${filters.city}, incluzând terenuri, antrenori, magazine de articole sportive și servicii de reparații. ` : `Platforma noastră oferă acces la o selecție diversă de facilități din ${filters.city}, incluzând terenuri, antrenori, magazine de articole sportive și servicii de reparații. `}Fie că ești interesat de tenis, fotbal, baschet sau orice alt sport, ${filters.city} oferă soluții complete. Explorează opțiunile disponibile, compară caracteristicile și găsește facilitățile care se potrivesc cel mai bine stilului tău de viață și obiectivelor sportive.</p>`)
  } else if (filters.sport) {
    const sportName = SPORT_NAMES[filters.sport] || filters.sport
    paragraphs.push(`<p>Găsește facilități sportive pentru ${sportName} în toată România și conectează-te cu o rețea extinsă de servicii specializate. ${count !== undefined && count > 0 ? `Platforma noastră listează ${count} facilități dedicate ${sportName}, distribuite în principalele orașe din țară. ` : `Platforma noastră listează o rețea extinsă de facilități dedicate ${sportName}, distribuite în principalele orașe din țară. `}Fie că cauți terenuri pentru antrenamente, antrenori pentru îmbunătățirea tehnicii sau echipamente specializate, găsești soluții complete pentru nevoile tale. Explorează facilitățile disponibile, citește informațiile detaliate și alege opțiunile care îți oferă cea mai bună experiență în practicarea ${sportName}.</p>`)
  } else if (filters.type) {
    const typeLabel = FACILITY_TYPE_LABELS_LOWER[filters.type]
    paragraphs.push(`<p>Explorează ${typeLabel} în România și descoperă o selecție diversă de opțiuni pentru activitățile tale sportive. ${count !== undefined && count > 0 ? `Platforma noastră oferă acces la ${count} ${typeLabel} din toată țara, fiecare cu caracteristici și servicii unice. ` : `Platforma noastră oferă acces la o rețea extinsă de ${typeLabel} din toată țara, fiecare cu caracteristici și servicii unice. `}Fie că ești un sportiv amator sau profesionist, găsești facilități care îți oferă condițiile optime pentru dezvoltare. Fiecare facilitate este prezentată cu detalii complete despre locație, echipamente, program și prețuri, permițându-ți să faci alegeri informate.</p>`)
  } else {
    paragraphs.push(`<p>Descoperă facilități sportive în România și accesează o rețea completă de servicii pentru toate activitățile tale sportive. ${count !== undefined && count > 0 ? `Platforma noastră conectează sportivii cu ${count} facilități din toată țara, incluzând terenuri, antrenori, magazine de articole sportive și servicii de reparații. ` : `Platforma noastră conectează sportivii cu o rețea extinsă de facilități din toată țara, incluzând terenuri, antrenori, magazine de articole sportive și servicii de reparații. `}Fie că practici tenis, fotbal, baschet sau orice alt sport, găsești soluții complete pentru nevoile tale. Explorează opțiunile disponibile, compară caracteristicile și descoperă facilitățile care se potrivesc cel mai bine stilului tău de viață și obiectivelor sportive.</p>`)
  }
  
  // Second paragraph - recommendations with internal links (150-200 words)
  if (filters.type === 'field' && filters.sport) {
    const sportName = SPORT_NAMES[filters.sport] || filters.sport
    const sportSlug = filters.sport
    const citySlug = filters.city ? cityNameToSlug(filters.city) : ''
    const cityText = filters.city ? ` din ${filters.city}` : ''
    const linkAntrenori = filters.city ? `/${citySlug}/${sportSlug}/antrenori` : `/${sportSlug}/antrenori`
    const linkMagazine = filters.city ? `/${citySlug}/magazine-articole` : '/magazine-articole'
    const linkReparatii = filters.city ? `/${citySlug}/magazine-reparatii` : '/magazine-reparatii'
    paragraphs.push(`<p>Căutând antrenori pentru ${sportName}? Explorează <a href="${linkAntrenori}" style="color: #10b981; text-decoration: underline;">antrenorii de ${sportName}${cityText}</a> disponibili pe platformă. Un antrenor specializat poate face diferența în dezvoltarea tehnicii și performanțelor tale. Fie că ești începător sau avansat, găsești antrenori care se adaptează nivelului tău și îți oferă programe personalizate de antrenament. De asemenea, dacă ai nevoie de echipamente sau servicii de întreținere, explorează <a href="${linkMagazine}" style="color: #10b981; text-decoration: underline;">magazinele de articole sportive</a> și <a href="${linkReparatii}" style="color: #10b981; text-decoration: underline;">serviciile de reparații</a> disponibile în zona ta.</p>`)
  } else if (filters.type === 'coach' && filters.sport) {
    const sportName = SPORT_NAMES[filters.sport] || filters.sport
    const sportSlug = filters.sport
    const citySlug = filters.city ? cityNameToSlug(filters.city) : ''
    const cityText = filters.city ? ` din ${filters.city}` : ''
    const linkTerenuri = filters.city ? `/${citySlug}/${sportSlug}/terenuri` : `/${sportSlug}/terenuri`
    const linkMagazine = filters.city ? `/${citySlug}/magazine-articole` : '/magazine-articole'
    const linkReparatii = filters.city ? `/${citySlug}/magazine-reparatii` : '/magazine-reparatii'
    paragraphs.push(`<p>Ai nevoie de un teren pentru ${sportName}? Vezi <a href="${linkTerenuri}" style="color: #10b981; text-decoration: underline;">terenurile de ${sportName}${cityText}</a> disponibile pe platformă. Fiecare teren este prezentat cu detalii despre suprafață, echipamente disponibile și facilități oferite. De asemenea, pentru echipamente și accesorii, explorează <a href="${linkMagazine}" style="color: #10b981; text-decoration: underline;">magazinele de articole sportive</a> din zona ta, unde găsești tot ce ai nevoie pentru practicarea ${sportName}. Pentru întreținerea echipamentelor, <a href="${linkReparatii}" style="color: #10b981; text-decoration: underline;">serviciile de reparații</a> sunt disponibile pentru a-ți menține echipamentele în stare optimă.</p>`)
  } else if (filters.type === 'field' && filters.city) {
    const citySlug = cityNameToSlug(filters.city)
    paragraphs.push(`<p>Căutând antrenori în ${filters.city}? Explorează <a href="/${citySlug}/antrenori" style="color: #10b981; text-decoration: underline;">antrenorii disponibili</a> din oraș, care oferă programe personalizate pentru diverse sporturi. Fie că ești interesat de tenis, fotbal, baschet sau alte activități, găsești antrenori specializați care îți pot ajuta să-ți atingi obiectivele. Pentru echipamente și accesorii, <a href="/${citySlug}/magazine-articole" style="color: #10b981; text-decoration: underline;">magazinele de articole sportive</a> din ${filters.city} oferă o gamă variată de produse. De asemenea, dacă ai nevoie de servicii de întreținere, <a href="/${citySlug}/magazine-reparatii" style="color: #10b981; text-decoration: underline;">magazinele de reparații</a> sunt disponibile pentru a-ți menține echipamentele în stare optimă.</p>`)
  } else if (filters.type === 'coach' && filters.city) {
    const citySlug = cityNameToSlug(filters.city)
    paragraphs.push(`<p>Ai nevoie de un teren în ${filters.city}? Vezi <a href="/${citySlug}/terenuri" style="color: #10b981; text-decoration: underline;">terenurile disponibile</a> din oraș, fiecare cu caracteristici unice și servicii specializate. Fie că cauți un teren de tenis, fotbal, baschet sau alt sport, ${filters.city} oferă opțiuni diverse. Pentru echipamente și accesorii, explorează <a href="/${citySlug}/magazine-articole" style="color: #10b981; text-decoration: underline;">magazinele de articole sportive</a> din oraș. De asemenea, pentru întreținerea echipamentelor, <a href="/${citySlug}/magazine-reparatii" style="color: #10b981; text-decoration: underline;">serviciile de reparații</a> sunt disponibile pentru a-ți menține echipamentele în stare optimă și a prelungi durata de viață a acestora.</p>`)
  } else if (filters.sport && !filters.type) {
    const sportName = SPORT_NAMES[filters.sport] || filters.sport
    const sportSlug = filters.sport
    paragraphs.push(`<p>Explorează <a href="/${sportSlug}/terenuri" style="color: #10b981; text-decoration: underline;">terenurile de ${sportName}</a> și <a href="/${sportSlug}/antrenori" style="color: #10b981; text-decoration: underline;">antrenorii de ${sportName}</a> disponibili pe platformă. Fie că ești începător sau avansat, găsești facilități care se adaptează nivelului tău. Terenurile sunt prezentate cu detalii despre suprafață, echipamente și facilități, iar antrenorii oferă programe personalizate pentru dezvoltarea tehnicii și performanțelor. Pentru echipamente specializate, explorează <a href="/magazine-articole" style="color: #10b981; text-decoration: underline;">magazinele de articole sportive</a> din țară, unde găsești tot ce ai nevoie pentru practicarea ${sportName}.</p>`)
  } else if (filters.city && !filters.type) {
    const citySlug = cityNameToSlug(filters.city)
    paragraphs.push(`<p>În ${filters.city} găsești o gamă completă de facilități sportive. Explorează <a href="/${citySlug}/terenuri" style="color: #10b981; text-decoration: underline;">terenurile sportive</a> disponibile pentru diverse activități, de la tenis și fotbal la baschet și alte sporturi. Pentru îmbunătățirea performanțelor, <a href="/${citySlug}/antrenori" style="color: #10b981; text-decoration: underline;">antrenorii</a> din ${filters.city} oferă programe personalizate adaptate nevoilor tale. Pentru echipamente și accesorii, <a href="/${citySlug}/magazine-articole" style="color: #10b981; text-decoration: underline;">magazinele de articole sportive</a> oferă o selecție variată de produse. De asemenea, pentru întreținerea echipamentelor, <a href="/${citySlug}/magazine-reparatii" style="color: #10b981; text-decoration: underline;">serviciile de reparații</a> sunt disponibile pentru a-ți menține echipamentele în stare optimă.</p>`)
  }
  
  // Third paragraph - additional information (100-150 words)
  paragraphs.push(`<p>Platforma noastră oferă informații detaliate despre fiecare facilitate, incluzând locație, program, prețuri și servicii disponibile. Explorează opțiunile, compară caracteristicile și alege facilitățile care se potrivesc cel mai bine nevoilor și bugetului tău. Fie că ești interesat de activități individuale sau de grup, găsești soluții adaptate pentru fiecare situație. Bucură-te de o experiență completă în practicarea sportului preferat și descoperă facilitățile care îți oferă condițiile optime pentru dezvoltare și performanță.</p>`)
  
  return paragraphs.join('')
}
