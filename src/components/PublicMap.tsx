import { useEffect, useRef } from 'react'
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

interface PublicMapProps {
  coordinates: { lat: number; lng: number } | null
  location?: string
}

function PublicMap({ coordinates, location }: PublicMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)

  useEffect(() => {
    if (!mapRef.current) return

    // Initialize map
    let initialLat = 45.9432 // Romania center
    let initialLng = 24.9668
    let initialZoom = 7

    if (coordinates) {
      initialLat = coordinates.lat
      initialLng = coordinates.lng
      initialZoom = 15
    }

    const map = L.map(mapRef.current).setView([initialLat, initialLng], initialZoom)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map)

    mapInstanceRef.current = map

    // Add marker if coordinates exist
    if (coordinates) {
      const marker = L.marker([coordinates.lat, coordinates.lng]).addTo(map)
      markerRef.current = marker
      
      // Add popup with location if available
      if (location) {
        marker.bindPopup(location).openPopup()
      }
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
      }
    }
  }, [coordinates, location])

  return (
    <div
      ref={mapRef}
      style={{
        width: '100%',
        height: '100%',
        minHeight: '400px',
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid #e2e8f0',
        position: 'relative',
        zIndex: 1
      }}
    />
  )
}

export default PublicMap

