import { useParams, Navigate } from 'react-router-dom'
import { citySlugToName } from '../utils/seo'
import { ROMANIAN_CITIES } from '../data/romanian-cities'
import AllFacilitiesByCity from './AllFacilitiesByCity'
import AllFacilitiesBySport from './AllFacilitiesBySport'

// List of known sport slugs
const KNOWN_SPORTS = ['tenis', 'fotbal', 'baschet', 'volei', 'handbal', 'badminton', 'squash', 'ping-pong', 'atletism', 'inot', 'fitness', 'box', 'karate', 'judo', 'dans']

function AllFacilitiesByCityOrSport() {
  const params = useParams<{ cityOrSport: string }>()
  const slug = params.cityOrSport || ''
  
  if (!slug) {
    return <Navigate to="/" replace />
  }

  // Check if it's a known sport slug first
  const isSport = KNOWN_SPORTS.includes(slug.toLowerCase())
  
  if (isSport) {
    // It's a sport - render AllFacilitiesBySport
    // AllFacilitiesBySport will read from cityOrSport param
    return <AllFacilitiesBySport />
  } else {
    // Try to determine if it's a city
    const cityName = citySlugToName(slug)
    const isCity = ROMANIAN_CITIES.some(city => 
      city.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') === slug.toLowerCase() ||
      city === cityName
    )

    if (isCity) {
      // It's a city - render AllFacilitiesByCity
      // AllFacilitiesByCity will read from cityOrSport param
      return <AllFacilitiesByCity />
    } else {
      // Unknown - redirect to home
      return <Navigate to="/" replace />
    }
  }
}

export default AllFacilitiesByCityOrSport

