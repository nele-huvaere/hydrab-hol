import { NextResponse } from 'next/server'

const funnelData = [
  { stage: "1. Lead", count: 60, amount: 47934605, customers: 54 },
  { stage: "2. Prospecting", count: 38, amount: 44209419, customers: 36 },
  { stage: "3. Bid In Progress", count: 4, amount: 18987125, customers: 4 },
  { stage: "4. Bid Submitted", count: 45, amount: 60672610, customers: 36 },
  { stage: "5. Contract Awarded", count: 9, amount: 111690798, customers: 7 },
  { stage: "6. Order Won", count: 290, amount: 2113029273, customers: 37 },
  { stage: "6. Closed Lost", count: 28, amount: 80176714, customers: 25 },
  { stage: "9. Demonstrator", count: 8, amount: 459100, customers: 1 },
  { stage: "10. Future Products", count: 19, amount: 166485127, customers: 16 },
]

const regionSplit = [
  { region: "UK & Ireland", opportunities: 371, amount: 2215406760, openPipeline: 177912072 },
  { region: "Europe", opportunities: 129, amount: 426800517, openPipeline: 272067612 },
  { region: "Australasia", opportunities: 1, amount: 1437494, openPipeline: 0 },
]

export async function GET() {
  return NextResponse.json({ funnel: funnelData, regions: regionSplit })
}
