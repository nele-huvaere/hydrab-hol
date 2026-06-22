import { NextResponse } from 'next/server'

const RESPONSES: Record<string, string> = {
  depot: "Based on the fleet data, the largest depots are:\n\n1. Ballymount (Dublin) — 218 vehicles\n2. Olive Grove (Bradford) — 213 vehicles\n3. Queens Road (Manchester) — 189 vehicles\n4. Shepherd's Bush (London) — 176 vehicles\n5. Walworth (London) — 165 vehicles\n\nTotal fleet: 2,166 vehicles across 15 depots in UK & Ireland.",
  customer: "The top customers by fleet size are:\n\n1. Transport for London (TfL) — 341 vehicles\n2. First Bus Group — 298 vehicles\n3. Go-Ahead Group — 245 vehicles\n4. Dublin Bus — 218 vehicles\n5. Stagecoach — 189 vehicles",
  soc: "Vehicles with critically low SOC (below 20%):\n\n• Fleet #82019 (LV73 FFE) — 12% SOC, Ballymount depot\n• Fleet #81445 (BV72 ABC) — 15% SOC, Olive Grove depot\n• Fleet #83201 (LX73 DEF) — 18% SOC, Queens Road depot\n\nThese vehicles need immediate charging attention.",
  pipeline: "Current open pipeline summary:\n\n• Total Open: £450M across 175 opportunities\n• Largest: TfL 200 Electric Buses (£78M, Contract Awarded)\n• By Stage: 60 Leads (£48M), 45 Bids Submitted (£61M), 9 Contracts Awarded (£112M)\n• Regional Split: UK & Ireland 84%, Europe 16%",
  default: "I can help you with fleet operations, vehicle telemetry, sales pipeline, and delivery tracking data. Try asking about:\n\n• Fleet depots and vehicle counts\n• Vehicles with low battery (SOC)\n• Pipeline by stage or region\n• Delivery status updates"
}

function getResponse(question: string): string {
  const q = question.toLowerCase()
  if (q.includes('depot') || q.includes('bus') || q.includes('where') || q.includes('region')) return RESPONSES.depot
  if (q.includes('customer') || q.includes('who') || q.includes('operator')) return RESPONSES.customer
  if (q.includes('soc') || q.includes('battery') || q.includes('charge') || q.includes('low')) return RESPONSES.soc
  if (q.includes('pipeline') || q.includes('opportunity') || q.includes('deal') || q.includes('sales')) return RESPONSES.pipeline
  return RESPONSES.default
}

export async function POST(request: Request) {
  const { question } = await request.json()
  const answer = getResponse(question || '')
  return NextResponse.json({ answer })
}
