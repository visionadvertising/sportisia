// Helper functions for SEO-friendly URLs

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

export function deslugify(slug: string): string {
  // Convert slug back to readable format
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Map common city names to their proper forms
const CITY_MAP: Record<string, string> = {
  'bucuresti': 'București',
  'cluj-napoca': 'Cluj-Napoca',
  'timisoara': 'Timișoara',
  'iasi': 'Iași',
  'constanta': 'Constanța',
  'craiova': 'Craiova',
  'brasov': 'Brașov',
  'galati': 'Galați',
  'ploiesti': 'Ploiești',
  'oradea': 'Oradea',
  'braila': 'Brăila',
  'arad': 'Arad',
  'pitesti': 'Pitești',
  'sibiu': 'Sibiu',
  'bacau': 'Bacău',
  'targu-mures': 'Târgu Mureș',
  'baia-mare': 'Baia Mare',
  'buzau': 'Buzău',
  'botosani': 'Botoșani',
  'satu-mare': 'Satu Mare',
  'ramnicu-valcea': 'Râmnicu Vâlcea',
  'suceava': 'Suceava',
  'piatra-neamt': 'Piatra Neamț',
  'drobeta-turnu-severin': 'Drobeta-Turnu Severin',
  'focsani': 'Focșani',
  'targu-jiu': 'Târgu Jiu',
  'tulcea': 'Tulcea',
  'targoviste': 'Târgoviște',
  'resita': 'Reșița',
  'bistrita': 'Bistrița',
  'slatina': 'Slatina',
  'hunedoara': 'Hunedoara',
  'calarasi': 'Călărași',
  'giurgiu': 'Giurgiu',
  'deva': 'Deva',
  'alba-iulia': 'Alba Iulia',
  'zalau': 'Zalău',
  'sfantu-gheorghe': 'Sfântu Gheorghe',
  'turda': 'Turda',
  'medias': 'Mediaș',
  'slobozia': 'Slobozia',
  'onesti': 'Onești',
  'miercurea-ciuc': 'Miercurea Ciuc',
  'sighetu-marmatiei': 'Sighetu Marmației',
  'petrosani': 'Petroșani',
  'mangalia': 'Mangalia',
  'tecuci': 'Tecuci',
  'ramnicu-sarat': 'Râmnicu Sărat',
  'pascani': 'Pașcani',
  'caracal': 'Caracal',
  'campina': 'Câmpina',
  'lugoj': 'Lugoj',
  'campulung': 'Câmpulung',
  'barlad': 'Bârlad',
  'fagaras': 'Făgăraș',
  'sighisoara': 'Sighișoara',
  'bailesti': 'Băilești',
  'campia-turzii': 'Câmpia Turzii',
  'vaslui': 'Vaslui',
  'dej': 'Dej',
  'reghin': 'Reghin',
  'curtea-de-arges': 'Curtea de Argeș',
  'sebes': 'Sebeș',
  'husi': 'Huși',
  'dorohoi': 'Dorohoi',
  'falticeni': 'Fălticeni',
  'turnu-magurele': 'Turnu Măgurele',
  'caransebes': 'Caransebeș',
  'radauti': 'Rădăuți',
  'lupeni': 'Lupeni',
  'sacele': 'Săcele',
  'campulung-moldovenesc': 'Câmpulung Moldovenesc',
  'motru': 'Motru',
  'tarnaveni': 'Târnăveni',
  'moreni': 'Moreni',
  'gherla': 'Gherla',
  'baicoi': 'Băicoi',
  'dragasani': 'Drăgășani',
  'salonta': 'Salonta',
  'baile-herculane': 'Băile Herculane',
  'beclean': 'Beclean',
  'cisnadie': 'Cisnădie',
  'cugir': 'Cugir',
  'calan': 'Călan',
  'calafat': 'Calafat',
  'toplita': 'Toplița',
  'gheorgheni': 'Gheorgheni',
  'comanesti': 'Comănești',
  'carei': 'Carei',
  'moinesti': 'Moinești',
  'targu-neamt': 'Târgu Neamț',
  'orastie': 'Orăștie',
  'simeria': 'Simeria',
  'moldova-noua': 'Moldova Nouă',
  'sannicolau-mare': 'Sânnicolau Mare',
  'adjud': 'Adjud',
  'zarnesti': 'Zărnești',
  'odorheiu-secuiesc': 'Odorheiu Secuiesc',
  'rovinari': 'Rovinari',
  'darmanesti': 'Dărmănești',
  'calimanesti': 'Călimănești',
  'vatra-dornei': 'Vatra Dornei',
  'bocsa': 'Bocșa',
  'negresti-oas': 'Negrești-Oaș',
  'targu-secuiesc': 'Târgu Secuiesc'
}

export function citySlugToName(slug: string): string {
  return CITY_MAP[slug.toLowerCase()] || deslugify(slug)
}

export function cityNameToSlug(city: string): string {
  const normalized = city.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  const reverseMap: Record<string, string> = {}
  Object.entries(CITY_MAP).forEach(([slug, name]) => {
    reverseMap[name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')] = slug
  })
  return reverseMap[normalized] || slugify(city)
}

const SPORT_SLUG_MAP: Record<string, string> = {
  'tenis': 'tenis',
  'fotbal': 'fotbal',
  'baschet': 'baschet',
  'volei': 'volei',
  'handbal': 'handbal',
  'badminton': 'badminton',
  'squash': 'squash',
  'ping-pong': 'ping-pong',
  'atletism': 'atletism',
  'inot': 'inot',
  'fitness': 'fitness',
  'box': 'box',
  'karate': 'karate',
  'judo': 'judo',
  'dans': 'dans'
}

export function sportSlugToName(slug: string): string {
  const sportNames: Record<string, string> = {
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
  return sportNames[slug.toLowerCase()] || slug.charAt(0).toUpperCase() + slug.slice(1)
}

export function sportNameToSlug(sport: string): string {
  const normalized = sport.toLowerCase()
  return SPORT_SLUG_MAP[normalized] || slugify(sport)
}

const FACILITY_TYPE_SLUGS: Record<string, string> = {
  'field': 'terenuri',
  'coach': 'antrenori',
  'repair_shop': 'magazine-reparatii',
  'equipment_shop': 'magazine-articole'
}

export function facilityTypeToSlug(type: string): string {
  return FACILITY_TYPE_SLUGS[type] || slugify(type)
}

export function slugToFacilityType(slug: string): string {
  const reverseMap: Record<string, string> = {
    'terenuri': 'field',
    'antrenori': 'coach',
    'magazine-reparatii': 'repair_shop',
    'magazine-articole': 'equipment_shop'
  }
  return reverseMap[slug] || slug
}

// Generate SEO-friendly URL
export function generateFacilityURL(
  city: string,
  sport: string | null,
  facilityType: string
): string {
  const citySlug = cityNameToSlug(city)
  const typeSlug = facilityTypeToSlug(facilityType)
  
  if (facilityType === 'equipment_shop') {
    // Magazine articole: doar oraș
    return `/${citySlug}/${typeSlug}`
  } else if (sport) {
    // Terenuri, antrenori, magazine reparații: oraș + sport + tip
    const sportSlug = sportNameToSlug(sport)
    return `/${citySlug}/${sportSlug}/${typeSlug}`
  } else {
    // Fără sport: oraș + tip
    return `/${citySlug}/${typeSlug}`
  }
}

// Generate URL for sport without city (for sports listing page)
export function generateSportURL(
  sport: string,
  facilityType: string
): string {
  const sportSlug = sportNameToSlug(sport)
  const typeSlug = facilityTypeToSlug(facilityType)
  return `/${sportSlug}/${typeSlug}`
}

