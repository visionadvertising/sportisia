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
}

function MapSelector({ location, coordinates, onLocationChange, onCoordinatesChange }: MapSelectorProps) {
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

    // Add click handler to place marker
    map.on('click', (e) => {
      const { lat, lng } = e.latlng
      onCoordinatesChange({ lat, lng })
      
      // Reverse geocode to get address
      setIsGeocoding(true)
      fetch(`/api/reverse-geocode?lat=${lat}&lon=${lng}`)
        .then(res => res.json())
        .then(data => {
          if (data.display_name) {
            onLocationChange(data.display_name)
          }
          setIsGeocoding(false)
        })
        .catch(() => {
          setIsGeocoding(false)
        })
    })

    // If coordinates exist, set marker (draggable)
    if (coordinates) {
      const marker = L.marker([coordinates.lat, coordinates.lng], {
        draggable: true
      }).addTo(map)
      markerRef.current = marker
      map.setView([coordinates.lat, coordinates.lng], 15)
      
      // Handle marker drag
      marker.on('dragend', (e) => {
        const { lat, lng } = e.target.getLatLng()
        onCoordinatesChange({ lat, lng })
        
        // Reverse geocode to get address
        setIsGeocoding(true)
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
          .then(res => res.json())
          .then(data => {
            if (data.display_name) {
              onLocationChange(data.display_name)
            }
            setIsGeocoding(false)
          })
          .catch(() => {
            setIsGeocoding(false)
          })
      })
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
          draggable: true
        }).addTo(mapInstanceRef.current)
        markerRef.current = marker
        
        // Handle marker drag
        marker.on('dragend', (e) => {
          const { lat, lng } = e.target.getLatLng()
          onCoordinatesChange({ lat, lng })
          
          // Reverse geocode to get address
          setIsGeocoding(true)
          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
            .then(res => res.json())
            .then(data => {
              if (data.display_name) {
                onLocationChange(data.display_name)
              }
              setIsGeocoding(false)
            })
            .catch(() => {
              setIsGeocoding(false)
            })
        })
      }
      mapInstanceRef.current.setView([coordinates.lat, coordinates.lng], 15)
    } else {
      if (markerRef.current) {
        mapInstanceRef.current.removeLayer(markerRef.current)
        markerRef.current = null
      }
    }
  }, [coordinates])

  // Auto-geocode when location changes (debounced)
  useEffect(() => {
    if (!location.trim() || !mapInstanceRef.current) return
    
    const timeoutId = setTimeout(() => {
      handleGeocode()
    }, 1000) // Wait 1 second after user stops typing
    
    return () => clearTimeout(timeoutId)
  }, [location])

  // Geocode address when location changes
  const handleGeocode = async () => {
    if (!location.trim() || !mapInstanceRef.current) return

    setIsGeocoding(true)
    try {
      const response = await fetch(
        `/api/geocode?q=${encodeURIComponent(location)}`
      )
      const data = await response.json()
      
      if (data.length > 0) {
        const { lat, lon } = data[0]
        const coords = { lat: parseFloat(lat), lng: parseFloat(lon) }
        onCoordinatesChange(coords)
        
        if (markerRef.current) {
          markerRef.current.setLatLng([coords.lat, coords.lng])
        } else {
          markerRef.current = L.marker([coords.lat, coords.lng]).addTo(mapInstanceRef.current)
        }
        mapInstanceRef.current.setView([coords.lat, coords.lng], 15)
      }
    } catch (error) {
      console.error('Geocoding error:', error)
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

