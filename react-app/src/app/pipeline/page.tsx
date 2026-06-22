'use client'

import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

interface FunnelStage {
  stage: string
  count: number
  amount: number
  customers: number
}

interface RegionData {
  region: string
  opportunities: number
  amount: number
  openPipeline: number
}

interface Opportunity {
  NAME: string
  STAGE: string
  AMOUNT: number
  CLOSE_DATE: string
  REGION: string
  TERRITORY: string
  NUM_ASSETS: number | null
}

const COLORS = ['#00A651', '#0077b6', '#e67e22']

export default function PipelinePage() {
  const [funnel, setFunnel] = useState<FunnelStage[]>([])
  const [regions, setRegions] = useState<RegionData[]>([])
  const [opps, setOpps] = useState<Opportunity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/pipeline-funnel').then(r => r.json()),
      fetch('/api/opportunities').then(r => r.json()),
    ]).then(([pipelineData, oppsData]) => {
      setFunnel(pipelineData.funnel)
      setRegions(pipelineData.regions)
      setOpps(oppsData)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const openPipeline = funnel
    .filter(f => !f.stage.includes('Won') && !f.stage.includes('Lost'))
    .reduce((s, f) => s + f.amount, 0)
  const totalWon = funnel.find(f => f.stage.includes('Won'))?.amount || 0

  const funnelForChart = funnel
    .filter(f => !f.stage.includes('Lost') && !f.stage.includes('Demonstrator'))
    .map(f => ({ name: f.stage.replace(/^\d+\.\s*/, ''), amount: f.amount / 1_000_000, count: f.count }))

  const pieData = regions.map(r => ({ name: r.region, value: r.amount }))

  if (loading) return <div className="loading">Loading pipeline data...</div>

  return (
    <main className="container">
      <h1 className="page-title">Sales Pipeline</h1>
      <p className="page-subtitle">Opportunity data from Salesforce CRM — unified in Snowflake</p>

      <div className="context-box">
        <p><strong>What you&apos;re seeing:</strong> HydraB&apos;s complete sales pipeline for electric and hydrogen bus orders. Each opportunity represents a deal with a public transit operator (e.g. Transport for London, Dublin Bus, First Bus). Stages range from early leads through to contracts awarded and orders won. Amounts are in British Pounds.</p>
        <div className="context-sources">
          <span className="source-tag source-salesforce">Salesforce CRM</span> Opportunity records (stages, amounts, close dates, regions)
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-value">£{(openPipeline / 1_000_000).toFixed(0)}M</div>
          <div className="stat-label">Open Pipeline</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#00A651' }}>£{(totalWon / 1_000_000_000).toFixed(2)}B</div>
          <div className="stat-label">Orders Won</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{funnel.reduce((s, f) => s + f.count, 0)}</div>
          <div className="stat-label">Total Opportunities</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{funnel.reduce((s, f) => s + f.customers, 0)}</div>
          <div className="stat-label">Customers</div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">Pipeline by Stage (£M)</div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={360}>
              <BarChart data={funnelForChart} layout="vertical" margin={{ left: 20, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => `£${v.toFixed(1)}M`} />
                <Bar dataKey="amount" fill="#00A651" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header">Revenue by Region</div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={360}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%" cy="50%"
                  innerRadius={60}
                  outerRadius={110}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={false}
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => `£${(v / 1_000_000).toFixed(0)}M`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">Top Open Opportunities</div>
        <table>
          <thead>
            <tr>
              <th>Opportunity</th>
              <th>Stage</th>
              <th>Amount</th>
              <th>Close Date</th>
              <th>Region</th>
              <th>Territory</th>
            </tr>
          </thead>
          <tbody>
            {opps.map((o, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 500 }}>{o.NAME}</td>
                <td><span className="badge badge-open">{o.STAGE}</span></td>
                <td className="amount">£{(o.AMOUNT || 0).toLocaleString()}</td>
                <td>{o.CLOSE_DATE}</td>
                <td>{o.REGION || '—'}</td>
                <td>{o.TERRITORY || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}
