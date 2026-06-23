'use client'

interface BusPosition {
  id: string
  lat: number
  lon: number
  depot: string
  city: string
  status: string
}

// Simplified UK + Ireland outline (SVG path) — no external tiles needed
const UK_PATH = "M 140 20 L 150 30 L 155 50 L 148 65 L 155 80 L 160 95 L 155 110 L 165 125 L 175 140 L 180 160 L 185 175 L 195 190 L 200 205 L 210 215 L 220 225 L 230 240 L 235 255 L 240 270 L 245 285 L 255 300 L 260 310 L 265 325 L 270 340 L 275 355 L 268 365 L 260 375 L 250 380 L 240 385 L 225 380 L 215 370 L 205 360 L 195 355 L 185 345 L 175 335 L 165 320 L 155 310 L 148 295 L 140 280 L 135 265 L 128 250 L 120 235 L 115 220 L 108 205 L 100 190 L 95 175 L 90 160 L 85 145 L 80 130 L 85 115 L 90 100 L 95 85 L 105 70 L 115 55 L 125 40 L 135 28 Z"
const IRELAND_PATH = "M 45 130 L 55 120 L 65 115 L 75 118 L 82 125 L 85 140 L 82 155 L 78 170 L 75 185 L 70 200 L 65 215 L 58 225 L 50 230 L 42 225 L 35 215 L 30 200 L 28 185 L 30 170 L 32 155 L 35 140 L 40 132 Z"

// Convert lat/lon to SVG coordinates (approximate Mercator for UK)
function latLonToSvg(lat: number, lon: number): { x: number; y: number } {
  // Bounding box: lat 49-60, lon -11 to 3
  const x = ((lon + 11) / 14) * 300 + 10
  const y = ((60 - lat) / 11) * 400 + 10
  return { x, y }
}

export default function FleetMap({ positions }: { positions: BusPosition[] }) {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', background: '#f0f4f8', borderRadius: 8, overflow: 'hidden' }}>
      <svg viewBox="0 0 320 420" style={{ width: '100%', height: '100%' }} preserveAspectRatio="xMidYMid meet">
        {/* Water background */}
        <rect width="320" height="420" fill="#dce8f4" />
        
        {/* Land masses */}
        <path d={UK_PATH} fill="#e8e8e0" stroke="#bbb" strokeWidth="1" />
        <path d={IRELAND_PATH} fill="#e8e8e0" stroke="#bbb" strokeWidth="1" />
        
        {/* Grid lines */}
        {[100, 200, 300].map(y => (
          <line key={`h${y}`} x1="0" y1={y} x2="320" y2={y} stroke="#ccd8e4" strokeWidth="0.3" strokeDasharray="4 4" />
        ))}
        {[80, 160, 240].map(x => (
          <line key={`v${x}`} x1={x} y1="0" x2={x} y2="420" stroke="#ccd8e4" strokeWidth="0.3" strokeDasharray="4 4" />
        ))}

        {/* Vehicle markers */}
        {positions.map(pos => {
          const { x, y } = latLonToSvg(pos.lat, pos.lon)
          const color = pos.status === 'deployed' ? '#00A651' : '#e67e22'
          return (
            <g key={pos.id}>
              <circle cx={x} cy={y} r="5" fill={color} stroke="#fff" strokeWidth="1.5" opacity="0.9" />
              <title>{`${pos.depot} — ${pos.city} (${pos.status})`}</title>
            </g>
          )
        })}
      </svg>
      
      {/* Legend */}
      <div style={{
        position: 'absolute', bottom: 12, left: 12, background: 'rgba(255,255,255,0.92)',
        padding: '8px 14px', borderRadius: 6, fontSize: 12, display: 'flex', gap: 16,
        boxShadow: '0 1px 4px rgba(0,0,0,0.1)'
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#00A651', display: 'inline-block' }} />
          Deployed
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#e67e22', display: 'inline-block' }} />
          In Transit
        </span>
      </div>
    </div>
  )
}
