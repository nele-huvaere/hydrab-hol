'use client'

import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import dynamic from 'next/dynamic'
import ChatPanel from '@/components/ChatPanel'

const FleetMapMini = dynamic(() => import('@/components/FleetMap'), { ssr: false })

interface DeliveryStatus {
  status: string
  count: number
  color: string
}

interface BusPosition {
  id: string
  lat: number
  lon: number
  depot: string
  city: string
  status: string
}

interface FunnelStage {
  stage: string
  count: number
  amount: number
}

export default function OverviewDashboard() {
  const [deliveries, setDeliveries] = useState<DeliveryStatus[]>([])
  const [positions, setPositions] = useState<BusPosition[]>([])
  const [funnel, setFunnel] = useState<FunnelStage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/delivery-status').then(r => r.json()),
      fetch('/api/fleet-map').then(r => r.json()),
      fetch('/api/pipeline-funnel').then(r => r.json()),
    ]).then(([deliveryData, mapData, pipelineData]) => {
      setDeliveries(deliveryData)
      setPositions(mapData)
      setFunnel(pipelineData.funnel)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const totalDelivered = deliveries.find(d => d.status === 'Delivered to Customer')?.count || 0
  const inTransit = deliveries.filter(d => d.status !== 'Delivered to Customer').reduce((s, d) => s + d.count, 0)
  const openPipeline = funnel
    .filter(f => !f.stage.includes('Won') && !f.stage.includes('Lost'))
    .reduce((s, f) => s + f.amount, 0)

  const funnelChart = funnel
    .filter(f => !f.stage.includes('Lost') && !f.stage.includes('Demonstrator'))
    .map(f => ({ name: f.stage.replace(/^\d+\.\s*/, ''), amount: Math.round(f.amount / 1_000_000) }))

  if (loading) return <div className="loading">Loading dashboard...</div>

  return (
    <div style={{ display: 'flex' }}>
      <main className="container" style={{ marginRight: '380px' }}>
        <h1 className="page-title">HydraB Fleet Intelligence</h1>
        <p className="page-subtitle">Unified view of fleet operations, sales pipeline, and vehicle telemetry</p>

        <div className="context-box">
          <p><strong>What you&apos;re seeing:</strong> This is HydraB Power&apos;s single-pane-of-glass for their electric bus fleet operations. HydraB manufactures and delivers zero-emission buses to public transit operators across the UK &amp; Ireland. This dashboard brings together their sales pipeline, live vehicle positions, and delivery logistics into one view.</p>
          <div className="context-sources">
            <span className="source-tag source-salesforce">Salesforce CRM</span> Pipeline funnel &amp; delivery status
            <span className="source-tag source-telemetry">Odos Telemetry API</span> Fleet positions (GPS)
          </div>
        </div>

        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-value">2,166</div>
            <div className="stat-label">Vehicles Tracked</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ color: '#00A651' }}>£{(openPipeline / 1_000_000).toFixed(0)}M</div>
            <div className="stat-label">Open Pipeline</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{totalDelivered.toLocaleString()}</div>
            <div className="stat-label">Delivered</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ color: '#e67e22' }}>{inTransit}</div>
            <div className="stat-label">In Transit</div>
          </div>
        </div>

        <div className="grid-2">
          <div className="card">
            <div className="card-header">Pipeline Funnel (£M)</div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={funnelChart} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => `£${v}M`} />
                  <Bar dataKey="amount" fill="#00A651" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card" style={{ position: 'relative' }}>
            <div className="card-header">
              Fleet Positions
              <a href="/fleet" className="link" style={{ float: 'right', fontSize: 12 }}>View full map →</a>
            </div>
            <div className="map-container-mini">
              <FleetMapMini positions={positions} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">Delivery Status</div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={deliveries} margin={{ left: 10, right: 20 }}>
                <XAxis dataKey="status" tick={{ fontSize: 10 }} interval={0} height={60} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {deliveries.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </main>

      <ChatPanel />
    </div>
  )
}
