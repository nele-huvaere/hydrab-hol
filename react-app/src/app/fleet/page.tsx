'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

const FleetMap = dynamic(() => import('@/components/FleetMap'), { ssr: false })

interface BusPosition {
  id: string
  lat: number
  lon: number
  depot: string
  city: string
  status: string
}

interface Depot {
  DEPOT: string
  CITY: string
  VEHICLE_COUNT: number
  DEPLOYED: number
  IN_PRODUCTION: number
}

interface SocBucket {
  range: string
  count: number
  color: string
}

interface DepotHealth {
  depot: string
  city: string
  avgSoc: number
  vehiclesLow: number
  avgTemp: number
}

interface FleetHealthData {
  socDistribution: SocBucket[]
  depotHealth: DepotHealth[]
  summary: { totalVehicles: number; vehiclesNeedingCharge: number; avgFleetSoc: number; avgBatteryTemp: number }
}

interface DepotWeather {
  depot: string
  city: string
  temp: number
  wind: number
  precipitation: number
  avgSoc: number
  condition: string
}

export default function FleetPage() {
  const [positions, setPositions] = useState<BusPosition[]>([])
  const [depots, setDepots] = useState<Depot[]>([])
  const [health, setHealth] = useState<FleetHealthData | null>(null)
  const [weather, setWeather] = useState<DepotWeather[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/fleet-map').then(r => r.json()),
      fetch('/api/fleet-by-depot').then(r => r.json()),
      fetch('/api/fleet-health').then(r => r.json()),
      fetch('/api/depot-weather').then(r => r.json()),
    ]).then(([mapData, depotData, healthData, weatherData]) => {
      setPositions(mapData)
      setDepots(depotData)
      setHealth(healthData)
      setWeather(weatherData)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const deployed = positions.filter(p => p.status === 'deployed').length
  const inTransit = positions.filter(p => p.status === 'in_transit').length
  const cities = new Set(positions.map(p => p.city)).size

  const depotChart = depots.slice(0, 12).map(d => ({
    name: d.DEPOT.length > 14 ? d.DEPOT.substring(0, 12) + '...' : d.DEPOT,
    vehicles: d.VEHICLE_COUNT,
    deployed: d.DEPLOYED,
  }))

  if (loading) return <div className="loading">Loading fleet data...</div>

  return (
    <main className="container">
      <h1 className="page-title">Fleet Operations</h1>
      <p className="page-subtitle">Vehicle positions, depot distribution, battery health, and weather conditions</p>

      <div className="context-box">
        <p><strong>What you&apos;re seeing:</strong> HydraB&apos;s complete fleet view combining GPS telemetry, battery state-of-charge from the Odos API, and live weather data from Open-Meteo. This unified view helps fleet managers make informed decisions about charging schedules, route planning, and depot capacity.</p>
        <div className="context-sources">
          <span className="source-tag source-telemetry">Odos Telemetry API</span> GPS + battery SOC + temperature
          <span className="source-tag source-salesforce">Salesforce CRM</span> Vehicle master &amp; depot assignments
          <span className="source-tag" style={{ background: '#eef6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }}>Open-Meteo API</span> Weather conditions per depot
        </div>
      </div>

      {/* Top-level stats */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-value">{health?.summary.totalVehicles.toLocaleString()}</div>
          <div className="stat-label">Total Fleet</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#00A651' }}>{deployed}</div>
          <div className="stat-label">Deployed</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#0077b6' }}>{health?.summary.avgFleetSoc}%</div>
          <div className="stat-label">Avg Fleet SOC</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#dc3545' }}>{health?.summary.vehiclesNeedingCharge}</div>
          <div className="stat-label">Need Charging (&lt;20%)</div>
        </div>
      </div>

      {/* Depot vehicle counts + SOC distribution */}
      <div className="grid-2">
        <div className="card">
          <div className="card-header">Vehicles by Depot</div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={380}>
              <BarChart data={depotChart} layout="vertical" margin={{ left: 10, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="deployed" stackId="a" fill="#00A651" name="Deployed" radius={[0, 0, 0, 0]} />
                <Bar dataKey="vehicles" stackId="b" fill="#0077b6" name="Total" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header">Fleet Battery Distribution (SOC)</div>
          <div className="chart-container">
            {health && (
              <ResponsiveContainer width="100%" height={380}>
                <PieChart>
                  <Pie
                    data={health.socDistribution}
                    cx="50%" cy="50%"
                    innerRadius={70}
                    outerRadius={120}
                    dataKey="count"
                    label={({ range, count }) => `${range}: ${count}`}
                    labelLine={false}
                  >
                    {health.socDistribution.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => [`${v} vehicles`, 'Count']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Fleet map */}
      <div className="card" style={{ marginBottom: 28 }}>
        <div className="card-header">
          Live Fleet Positions
          <span style={{ float: 'right', fontSize: 12, color: '#6c757d' }}>
            {positions.length} vehicles tracked &middot; {cities} cities &middot; {inTransit} in transit
          </span>
        </div>
        <div className="map-container">
          <FleetMap positions={positions} />
        </div>
      </div>

      {/* Weather + Battery correlation */}
      <div className="card" style={{ marginBottom: 28 }}>
        <div className="card-header">Weather &amp; Battery Performance by Depot</div>
        <div style={{ padding: '20px 24px' }}>
          <p style={{ fontSize: 13, color: '#6c757d', marginBottom: 16 }}>
            Combining Open-Meteo weather data with Odos battery telemetry. Colder, wetter conditions correlate with faster battery drain - helping plan charging capacity.
          </p>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e9ecef' }}>
                <th style={{ textAlign: 'left', padding: '10px 12px', fontSize: 12, textTransform: 'uppercase', color: '#6c757d' }}>Depot</th>
                <th style={{ textAlign: 'left', padding: '10px 12px', fontSize: 12, textTransform: 'uppercase', color: '#6c757d' }}>Conditions</th>
                <th style={{ textAlign: 'right', padding: '10px 12px', fontSize: 12, textTransform: 'uppercase', color: '#6c757d' }}>Temp</th>
                <th style={{ textAlign: 'right', padding: '10px 12px', fontSize: 12, textTransform: 'uppercase', color: '#6c757d' }}>Wind</th>
                <th style={{ textAlign: 'right', padding: '10px 12px', fontSize: 12, textTransform: 'uppercase', color: '#6c757d' }}>Rain</th>
                <th style={{ textAlign: 'right', padding: '10px 12px', fontSize: 12, textTransform: 'uppercase', color: '#6c757d' }}>Avg SOC</th>
                <th style={{ textAlign: 'center', padding: '10px 12px', fontSize: 12, textTransform: 'uppercase', color: '#6c757d' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {weather.slice(0, 12).map((w, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 500 }}>{w.depot}<br/><span style={{ fontSize: 11, color: '#6c757d' }}>{w.city}</span></td>
                  <td style={{ padding: '10px 12px', color: '#555' }}>{w.condition}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'right' }}>{w.temp}°C</td>
                  <td style={{ padding: '10px 12px', textAlign: 'right' }}>{w.wind} km/h</td>
                  <td style={{ padding: '10px 12px', textAlign: 'right' }}>{w.precipitation > 0 ? `${w.precipitation} mm` : '-'}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600, color: w.avgSoc < 65 ? '#dc3545' : w.avgSoc < 70 ? '#e67e22' : '#00A651' }}>{w.avgSoc}%</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '3px 10px',
                      borderRadius: 12,
                      fontSize: 11,
                      fontWeight: 600,
                      background: w.avgSoc < 65 ? '#fde8e8' : w.avgSoc < 70 ? '#fef3e8' : '#e6f7ee',
                      color: w.avgSoc < 65 ? '#dc3545' : w.avgSoc < 70 ? '#b45309' : '#00A651',
                    }}>
                      {w.avgSoc < 65 ? 'At Risk' : w.avgSoc < 70 ? 'Monitor' : 'Healthy'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Depot health detail */}
      <div className="card" style={{ marginBottom: 28 }}>
        <div className="card-header">Battery Health by Depot (Odos Telemetry)</div>
        <div style={{ padding: '20px 24px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e9ecef' }}>
                <th style={{ textAlign: 'left', padding: '10px 12px', fontSize: 12, textTransform: 'uppercase', color: '#6c757d' }}>Depot</th>
                <th style={{ textAlign: 'right', padding: '10px 12px', fontSize: 12, textTransform: 'uppercase', color: '#6c757d' }}>Vehicles</th>
                <th style={{ textAlign: 'right', padding: '10px 12px', fontSize: 12, textTransform: 'uppercase', color: '#6c757d' }}>Avg SOC</th>
                <th style={{ textAlign: 'right', padding: '10px 12px', fontSize: 12, textTransform: 'uppercase', color: '#6c757d' }}>Below 20%</th>
                <th style={{ textAlign: 'right', padding: '10px 12px', fontSize: 12, textTransform: 'uppercase', color: '#6c757d' }}>Avg Temp</th>
              </tr>
            </thead>
            <tbody>
              {depots.map((d, i) => {
                const h = health?.depotHealth.find(dh => dh.depot === d.DEPOT)
                return (
                  <tr key={i} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 500 }}>{d.DEPOT}<br/><span style={{ fontSize: 11, color: '#6c757d' }}>{d.CITY}</span></td>
                    <td style={{ padding: '10px 12px', textAlign: 'right' }}>{d.VEHICLE_COUNT}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600, color: (h?.avgSoc || 0) < 65 ? '#dc3545' : '#00A651' }}>{h?.avgSoc || '-'}%</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: (h?.vehiclesLow || 0) > 10 ? '#dc3545' : '#6c757d' }}>{h?.vehiclesLow || '-'}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right' }}>{h?.avgTemp || '-'}°C</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}
