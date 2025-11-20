export const ROMANIAN_CITIES = [
  'București',
  'Cluj-Napoca',
  'Timișoara',
  'Iași',
  'Constanța',
  'Craiova',
  'Brașov',
  'Galați',
  'Ploiești',
  'Oradea',
  'Brăila',
  'Arad',
  'Pitești',
  'Sibiu',
  'Bacău',
  'Târgu Mureș',
  'Baia Mare',
  'Buzău',
  'Botoșani',
  'Satu Mare',
  'Râmnicu Vâlcea',
  'Suceava',
  'Piatra Neamț',
  'Drobeta-Turnu Severin',
  'Focșani',
  'Târgoviște',
  'Tulcea',
  'Târgu Jiu',
  'Reșița',
  'Bistrița',
  'Slatina',
  'Călărași',
  'Alba Iulia',
  'Giurgiu',
  'Deva',
  'Hunedoara',
  'Zalău',
  'Sfântu Gheorghe',
  'Bârlad',
  'Vaslui',
  'Turda',
  'Mediaș',
  'Slobozia',
  'Onești',
  'Alexandria',
  'Lugoj',
  'Pașcani',
  'Sighișoara',
  'Mangalia',
  'Petroșani',
];

export const CITY_SLUGS: Record<string, string> = {
  'București': 'bucuresti',
  'Cluj-Napoca': 'cluj-napoca',
  'Timișoara': 'timisoara',
  'Iași': 'iasi',
  'Constanța': 'constanta',
  'Craiova': 'craiova',
  'Brașov': 'brasov',
  'Galați': 'galati',
  'Ploiești': 'ploiesti',
  'Oradea': 'oradea',
  'Brăila': 'braila',
  'Arad': 'arad',
  'Pitești': 'pitesti',
  'Sibiu': 'sibiu',
  'Bacău': 'bacau',
  'Târgu Mureș': 'targu-mures',
  'Baia Mare': 'baia-mare',
  'Buzău': 'buzau',
  'Botoșani': 'botosani',
  'Satu Mare': 'satu-mare',
  'Râmnicu Vâlcea': 'ramnicu-valcea',
  'Suceava': 'suceava',
  'Piatra Neamț': 'piatra-neamt',
  'Drobeta-Turnu Severin': 'drobeta-turnu-severin',
  'Focșani': 'focsani',
  'Târgoviște': 'targoviste',
  'Tulcea': 'tulcea',
  'Târgu Jiu': 'targu-jiu',
  'Reșița': 'resita',
  'Bistrița': 'bistrita',
  'Slatina': 'slatina',
  'Călărași': 'calarasi',
  'Alba Iulia': 'alba-iulia',
  'Giurgiu': 'giurgiu',
  'Deva': 'deva',
  'Hunedoara': 'hunedoara',
  'Zalău': 'zalau',
  'Sfântu Gheorghe': 'sfantu-gheorghe',
  'Bârlad': 'barlad',
  'Vaslui': 'vaslui',
  'Turda': 'turda',
  'Mediaș': 'medias',
  'Slobozia': 'slobozia',
  'Onești': 'onesti',
  'Alexandria': 'alexandria',
  'Lugoj': 'lugoj',
  'Pașcani': 'pascani',
  'Sighișoara': 'sighisoara',
  'Mangalia': 'mangalia',
  'Petroșani': 'petrosani',
};

export const SLUG_TO_CITY: Record<string, string> = Object.fromEntries(
  Object.entries(CITY_SLUGS).map(([city, slug]) => [slug, city])
);

export function getCityFromSlug(slug: string): string | null {
  return SLUG_TO_CITY[slug] || null;
}

export function getSlugFromCity(city: string): string {
  return CITY_SLUGS[city] || city.toLowerCase().replace(/\s+/g, '-');
}

export function isValidCity(city: string): boolean {
  return ROMANIAN_CITIES.includes(city);
}

export function isValidCitySlug(slug: string): boolean {
  return slug in SLUG_TO_CITY;
}


