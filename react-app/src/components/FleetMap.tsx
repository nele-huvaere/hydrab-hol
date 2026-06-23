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

    const map = L.map('fleet-map').setView([54.0, -2.5], 6)

    // Tiles are bundled in /public/tiles/ — served from same origin, no CSP issues
    L.tileLayer('/tiles/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
      minZoom: 6,
      maxZoom: 10,
    }).addTo(map)

    positions.forEach(pos => {
      const color = pos.status === 'deployed' ? '#00A651' : '#e67e22'
      const marker = L.circleMarker([pos.lat, pos.lon], {
        radius: 8,
        fillColor: color,
        color: '#fff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.9,
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
