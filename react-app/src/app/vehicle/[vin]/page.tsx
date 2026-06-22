'use client'

import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine, Area, AreaChart } from 'recharts'

interface TelemetryPoint {
  time: string
  soc: number
  temp: number
  speed: number
  charge_kwh: number
}

type Signal = 'soc' | 'temp' | 'speed' | 'charge_kwh'

const SIGNAL_CONFIG: Record<Signal, { label: string; unit: string; color: string; warning?: number; danger?: number }> = {
  soc: { label: 'State of Charge', unit: '%', color: '#00A651', warning: 30, danger: 15 },
  temp: { label: 'Avg Cell Temperature', unit: '°C', color: '#e67e22', warning: 30, danger: 35 },
  speed: { label: 'Vehicle Speed', unit: 'km/h', color: '#0077b6' },
  charge_kwh: { label: 'Charge Energy', unit: 'kWh', color: '#8b5cf6' },
}

export default function VehicleDetail({ params }: { params: { vin: string } }) {
  const [telemetry, setTelemetry] = useState<TelemetryPoint[]>([])
  const [signal, setSignal] = useState<Signal>('soc')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/telemetry-history')
      .then(r => r.json())
      .then(data => { setTelemetry(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const config = SIGNAL_CONFIG[signal]
  const latestSoc = telemetry.length > 0 ? telemetry[telemetry.length - 1].soc : 0
  const latestTemp = telemetry.length > 0 ? telemetry[telemetry.length - 1].temp : 0
  const maxSpeed = Math.max(...telemetry.map(t => t.speed), 0)
  const totalCharge = telemetry.reduce((s, t) => s + t.charge_kwh, 0)

  return (
    <main className="container">
      <h1 className="page-title">Vehicle: {params.vin}</h1>
      <p className="page-subtitle">Telemetry data from Odos API — unified in Snowflake</p>

      <div className="context-box">
        <p><strong>What you&apos;re seeing:</strong> Real-time telemetry for a single electric bus. SOC (State of Charge) shows battery level like a fuel gauge. Temperature monitoring prevents thermal runaway. Speed and energy data help fleet managers optimise routes and charging schedules. The chart shows a full day: morning depletion during service, midday charging, then afternoon service.</p>
        <div className="context-sources">
          <span className="source-tag source-telemetry">Odos Telemetry API</span> Battery SOC, temperature, speed, energy consumed
          <span className="source-tag source-salesforce">Salesforce CRM</span> Vehicle master data (VIN, depot, customer)
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-value" style={{ color: latestSoc < 30 ? '#dc3545' : '#00A651' }}>{latestSoc}%</div>
          <div className="stat-label">Current SOC</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: latestTemp > 30 ? '#e67e22' : '#0077b6' }}>{latestTemp}°C</div>
          <div className="stat-label">Battery Temp</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{maxSpeed}</div>
          <div className="stat-label">Max Speed (km/h)</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#8b5cf6' }}>{totalCharge.toFixed(0)}</div>
          <div className="stat-label">Energy Charged (kWh)</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Telemetry — {config.label}</span>
          <select
            className="signal-select"
            value={signal}
            onChange={e => setSignal(e.target.value as Signal)}
          >
            {Object.entries(SIGNAL_CONFIG).map(([key, cfg]) => (
              <option key={key} value={key}>{cfg.label} ({cfg.unit})</option>
            ))}
          </select>
        </div>
        <div className="chart-container">
          {loading ? (
            <div className="loading">Loading telemetry...</div>
          ) : (
            <ResponsiveContainer width="100%" height={450}>
              <AreaChart data={telemetry} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                <defs>
                  <linearGradient id="colorSignal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={config.color} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={config.color} stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
                <XAxis dataKey="time" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} unit={config.unit === '%' ? '%' : ''} />
                <Tooltip
                  formatter={(v: number) => [`${v} ${config.unit}`, config.label]}
                  labelStyle={{ fontWeight: 600 }}
                />
                {config.warning && (
                  <ReferenceLine y={config.warning} stroke="#e67e22" strokeDasharray="5 5" label={{ value: 'Warning', fill: '#e67e22', fontSize: 11 }} />
                )}
                {config.danger && (
                  <ReferenceLine y={config.danger} stroke="#dc3545" strokeDasharray="5 5" label={{ value: 'Critical', fill: '#dc3545', fontSize: 11 }} />
                )}
                <Area
                  type="monotone"
                  dataKey={signal}
                  stroke={config.color}
                  strokeWidth={2}
                  fill="url(#colorSignal)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </main>
  )
}
