import { NextResponse } from 'next/server'

const opportunities = [
  { NAME: "TfL - 200 Electric Buses (Batch 3)", STAGE: "5. Contract Awarded", AMOUNT: 78000000, CLOSE_DATE: "2026-06-30", REGION: "UK & Ireland", TERRITORY: "London", NUM_ASSETS: 200 },
  { NAME: "First Bus - 150 BYD EV", STAGE: "4. Bid Submitted", AMOUNT: 52500000, CLOSE_DATE: "2026-09-15", REGION: "UK & Ireland", TERRITORY: "South West", NUM_ASSETS: 150 },
  { NAME: "Dublin Bus - 100 Electric (Phase 2)", STAGE: "10. Future Products", AMOUNT: 42000000, CLOSE_DATE: "2027-03-01", REGION: "UK & Ireland", TERRITORY: "Ireland", NUM_ASSETS: 100 },
  { NAME: "Stagecoach Manchester - 80 Hydrogen", STAGE: "1. Lead", AMOUNT: 38000000, CLOSE_DATE: "2027-06-30", REGION: "UK & Ireland", TERRITORY: "Northern", NUM_ASSETS: 80 },
  { NAME: "Go-Ahead London - 120 EV Replenishment", STAGE: "5. Contract Awarded", AMOUNT: 33690798, CLOSE_DATE: "2026-08-01", REGION: "UK & Ireland", TERRITORY: "London", NUM_ASSETS: 120 },
  { NAME: "Translink NI - 60 Hydrogen FC", STAGE: "2. Prospecting", AMOUNT: 31200000, CLOSE_DATE: "2027-01-15", REGION: "UK & Ireland", TERRITORY: "Northern Ireland", NUM_ASSETS: 60 },
  { NAME: "Hamburg Hochbahn - 45 Articulated EV", STAGE: "4. Bid Submitted", AMOUNT: 28800000, CLOSE_DATE: "2026-12-01", REGION: "Europe", TERRITORY: "Germany", NUM_ASSETS: 45 },
  { NAME: "Arriva Yorkshire - 55 BYD", STAGE: "3. Bid In Progress", AMOUNT: 18987125, CLOSE_DATE: "2026-10-30", REGION: "UK & Ireland", TERRITORY: "Central", NUM_ASSETS: 55 },
  { NAME: "National Express WM - 40 EV", STAGE: "1. Lead", AMOUNT: 16400000, CLOSE_DATE: "2027-04-01", REGION: "UK & Ireland", TERRITORY: "Central", NUM_ASSETS: 40 },
  { NAME: "Bus Éireann - 35 Single Deck EV", STAGE: "2. Prospecting", AMOUNT: 12950000, CLOSE_DATE: "2026-11-15", REGION: "UK & Ireland", TERRITORY: "Ireland", NUM_ASSETS: 35 },
]

export async function GET() {
  return NextResponse.json(opportunities)
}
