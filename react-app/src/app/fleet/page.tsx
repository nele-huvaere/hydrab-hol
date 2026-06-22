'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

const FleetMap = dynamic(() => import('@/components/FleetMap'), { ssr: false })

interface BusPosition {
  id: string
  lat: number
  lon: number
  depot: string
  city: string
  status: string
}

export default function FleetPage() {
  const [positions, setPositions] = useState<BusPosition[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/fleet-map')
      .then(r => r.json())
      .then(data => { setPositions(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const deployed = positions.filter(p => p.status === 'deployed').length
  const inTransit = positions.filter(p => p.status === 'in_transit').length
  const cities = new Set(positions.map(p => p.city)).size

  return (
    <main className="container">
      <h1 className="page-title">Fleet Map</h1>
      <p className="page-subtitle">Real-time vehicle positions from GPS telemetry — {positions.length} vehicles tracked</p>

      <div className="context-box">
        <p><strong>What you&apos;re seeing:</strong> Live GPS positions of HydraB&apos;s electric buses deployed across the UK &amp; Ireland. Each pin is a vehicle reporting its location via the onboard telematics unit. Green pins are actively deployed on routes; orange pins are in transit between depots or to customers.</p>
        <div className="context-sources">
          <span className="source-tag source-telemetry">Odos Telemetry API</span> Real-time GPS coordinates from onboard telematics
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-value">{deployed}</div>
          <div className="stat-label">Deployed</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#e67e22' }}>{inTransit}</div>
          <div className="stat-label">In Transit</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{cities}</div>
          <div className="stat-label">Cities</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">2,166</div>
          <div className="stat-label">Total Fleet</div>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading fleet positions...</div>
      ) : (
        <div className="map-container">
          <FleetMap positions={positions} />
        </div>
      )}
    </main>
  )
}
