import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'

const pin = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

export interface MapPoint {
  id: number
  name: string
  city: string
  lat: number
  lng: number
  url: string
}

export default function ResultsMap({ points }: { points: MapPoint[] }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return
    const map = L.map(ref.current)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap'
    }).addTo(map)
    const markers = points.map((point) => L.marker([point.lat, point.lng], { icon: pin }).bindPopup(
      `<strong>${point.name}</strong><br>${point.city}<br><a href="${point.url}">Vezi profilul</a>`
    ))
    if (markers.length) {
      const group = L.featureGroup(markers).addTo(map)
      map.fitBounds(group.getBounds().pad(0.2))
    } else {
      map.setView([45.94, 24.97], 6)
    }
    return () => { map.remove() }
  }, [points])

  return <div ref={ref} style={{ height: '520px', borderRadius: '16px', overflow: 'hidden', border: '1px solid #eef2f6' }} />
}
