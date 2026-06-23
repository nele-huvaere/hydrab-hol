'use client'

import { useEffect } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface BusPosition {
  id: string
  lat: number
  lon: number
  depot: string
  city: string
  status: string
}

export default function FleetMap({ positions }: { positions: BusPosition[] }) {
  useEffect(() => {
    const existing = document.getElementById('fleet-map')
    if (existing && (existing as any)._leaflet_id) return

    const map = L.map('fleet-map').setView([53.5, -3.5], 6)

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map)

    positions.forEach(pos => {
      const color = pos.status === 'deployed' ? '#00A651' : '#e67e22'
      const marker = L.circleMarker([pos.lat, pos.lon], {
        radius: 7,
        fillColor: color,
        color: '#fff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.85,
      }).addTo(map)

      marker.bindPopup(`
        <div style="font-family: sans-serif; font-size: 13px; line-height: 1.6;">
          <strong style="color: ${color};">${pos.depot}</strong><br/>
          ${pos.city}<br/>
          <span style="text-transform: capitalize; color: ${color}; font-weight: 600;">
            ${pos.status.replace('_', ' ')}
          </span>
        </div>
      `)
    })

    return () => { map.remove() }
  }, [positions])

  return <div id="fleet-map" style={{ width: '100%', height: '100%' }} />
}
