import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default marker icon in React
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

L.Marker.prototype.options.icon = DefaultIcon

interface MapSelectorProps {
  location: string
  coordinates: { lat: number; lng: number } | null
  onLocationChange: (location: string) => void
  onCoordinatesChange: (coordinates: { lat: number; lng: number } | null) => void
  city?: string
}

function MapSelector({ location, coordinates, onLocationChange, onCoordinatesChange, city }: MapSelectorProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)
  const [isGeocoding, setIsGeocoding] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (!mapRef.current) return

    // Initialize map centered on Romania
    const map = L.map(mapRef.current).setView([45.9432, 24.9668], 7)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map)

    mapInstanceRef.current = map

    // Click handler dezactivat - pin-ul se pune doar prin butonul "Găsește pe hartă"
    // map.on('click', (e) => { ... })

    // If coordinates exist, set marker (non-draggable)
    if (coordinates) {
      const marker = L.marker([coordinates.lat, coordinates.lng], {
        draggable: false
      }).addTo(map)
      markerRef.current = marker
      map.setView([coordinates.lat, coordinates.lng], 15)
    }

    return () => {
      map.remove()
    }
  }, [])

  // Update marker when coordinates change
  useEffect(() => {
    if (!mapInstanceRef.current) return

    if (coordinates) {
      if (markerRef.current) {
        markerRef.current.setLatLng([coordinates.lat, coordinates.lng])
      } else {
        const marker = L.marker([coordinates.lat, coordinates.lng], {
          draggable: false
        }).addTo(mapInstanceRef.current)
        markerRef.current = marker
      }
      mapInstanceRef.current.setView([coordinates.lat, coordinates.lng], 15)
    } else {
      if (markerRef.current) {
        mapInstanceRef.current.removeLayer(markerRef.current)
        markerRef.current = null
      }
    }
  }, [coordinates])

  // Auto-geocode dezactivat - pin-ul se pune doar când utilizatorul apasă "Găsește pe hartă"
  // useEffect(() => {
  //   if (!location.trim() || !mapInstanceRef.current) return
  //   
  //   const timeoutId = setTimeout(() => {
  //     handleGeocode()
  //   }, 1000) // Wait 1 second after user stops typing
  //   
  //   return () => clearTimeout(timeoutId)
  // }, [location, city])

  // Geocode address when location changes
  const handleGeocode = async () => {
    if (!location.trim() || !mapInstanceRef.current) {
      console.log('Geocoding skipped: location empty or map not initialized')
      return
    }

    setIsGeocoding(true)
    try {
      // Trimite doar adresa și orașul separat - backend-ul va construi query-ul
      const addressQuery = location.trim()
      console.log('Geocoding request - address:', addressQuery, 'city:', city)
      
      let response = await fetch(
        `/api/geocode?q=${encodeURIComponent(addressQuery)}${city && city.trim() ? `&city=${encodeURIComponent(city.trim())}` : ''}`
      )
      
      if (!response.ok) {
        throw new Error(`Geocoding failed: ${response.status}`)
      }
      
      let data = await response.json()
      console.log('Geocoding response:', data)
      
      // Dacă nu găsește cu adresa completă, încearcă doar cu orașul
      if (Array.isArray(data) && data.length === 0 && city && city.trim()) {
        console.log('Trying fallback search with city only:', city)
        // Pentru fallback, trimitem doar orașul fără adresă
        response = await fetch(
          `/api/geocode?q=${encodeURIComponent(city.trim())}&city=${encodeURIComponent(city.trim())}`
        )
        if (response.ok) {
          data = await response.json()
          console.log('Fallback geocoding response:', data)
        }
      }
      
      // Handle both array response and error object
      if (Array.isArray(data) && data.length > 0) {
        const { lat, lon } = data[0]
        const coords = { lat: parseFloat(lat), lng: parseFloat(lon) }
        console.log('Geocoding coordinates:', coords)
        onCoordinatesChange(coords)
        
        if (markerRef.current) {
          markerRef.current.setLatLng([coords.lat, coords.lng])
          console.log('Marker updated')
        } else {
          markerRef.current = L.marker([coords.lat, coords.lng], {
            draggable: false
          }).addTo(mapInstanceRef.current)
          console.log('Marker created')
        }
        mapInstanceRef.current.setView([coords.lat, coords.lng], 15)
        console.log('Map view updated')
      } else if (data.error) {
        console.error('Geocoding error:', data.error, data.details)
        alert('Nu s-a putut găsi locația. Te rugăm să verifici adresa și să încerci din nou.')
      } else {
        console.warn('Geocoding returned empty or invalid data:', data)
        alert('Nu s-a găsit locația pentru adresa introdusă. Te rugăm să verifici adresa sau să folosești doar numele străzii și orașul.')
      }
    } catch (error) {
      console.error('Geocoding error:', error)
      alert('Eroare la căutarea locației. Te rugăm să încerci din nou.')
    } finally {
      setIsGeocoding(false)
    }
  }

  return (
    <div>
      <div style={{ 
        marginBottom: '0.5rem', 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row',
        gap: '0.5rem' 
      }}>
        <button
          type="button"
          onClick={handleGeocode}
          disabled={isGeocoding || !location.trim()}
          style={{
            padding: isMobile ? '0.75rem 1rem' : '0.5rem 1rem',
            background: isGeocoding || !location.trim() ? '#e5e7eb' : '#0f172a',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: isGeocoding || !location.trim() ? 'not-allowed' : 'pointer',
            fontSize: isMobile ? '0.9375rem' : '0.9rem',
            fontWeight: '600',
            width: isMobile ? '100%' : 'auto',
            touchAction: 'manipulation',
            minHeight: isMobile ? '44px' : 'auto',
            transition: 'all 0.2s ease',
            boxShadow: isGeocoding || !location.trim() ? 'none' : '0 2px 4px rgba(15, 23, 42, 0.2)'
          }}
        >
          {isGeocoding ? 'Căutare...' : 'Găsește pe hartă'}
        </button>
        {coordinates && (
          <button
            type="button"
            onClick={() => {
              onCoordinatesChange(null)
              if (markerRef.current && mapInstanceRef.current) {
                mapInstanceRef.current.removeLayer(markerRef.current)
                markerRef.current = null
              }
            }}
            style={{
              padding: isMobile ? '0.75rem 1rem' : '0.5rem 1rem',
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: isMobile ? '0.9375rem' : '0.9rem',
              fontWeight: '600',
              width: isMobile ? '100%' : 'auto',
              touchAction: 'manipulation',
              minHeight: isMobile ? '44px' : 'auto',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 4px rgba(239, 68, 68, 0.2)'
            }}
          >
            Șterge pin
          </button>
        )}
      </div>
      <div
        ref={mapRef}
        style={{
          width: '100%',
          height: isMobile ? '250px' : '300px',
          borderRadius: '8px',
          border: '2px solid #e0e0e0',
          zIndex: 0
        }}
      />
      {coordinates && (
        <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#666' }}>
          Coordonate: {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
        </p>
      )}
    </div>
  )
}

export default MapSelector

