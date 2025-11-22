import { useParams, Navigate } from 'react-router-dom'
import { citySlugToName, sportSlugToName } from '../utils/seo'
import { ROMANIAN_CITIES } from '../data/romanian-cities'
import AllFacilitiesByCity from './AllFacilitiesByCity'
import AllFacilitiesBySport from './AllFacilitiesBySport'

function AllFacilitiesByCityOrSport() {
  const params = useParams<{ cityOrSport: string }>()
  const slug = params.cityOrSport || ''
  
  if (!slug) {
    return <Navigate to="/" replace />
  }

  // Try to determine if it's a city or sport
  // First, try to convert to city name
  const cityName = citySlugToName(slug)
  const isCity = ROMANIAN_CITIES.some(city => 
    city.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') === slug.toLowerCase() ||
    city === cityName
  )

  if (isCity) {
    // It's a city - render AllFacilitiesByCity with city param
    return <AllFacilitiesByCity />
  } else {
    // It's a sport - render AllFacilitiesBySport with sport param
    return <AllFacilitiesBySport />
  }
}

export default AllFacilitiesByCityOrSport

