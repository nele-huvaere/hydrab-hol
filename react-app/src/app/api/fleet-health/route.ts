import { NextResponse } from 'next/server'

const fleetHealth = {
  socDistribution: [
    { range: '80-100%', count: 812, color: '#00A651' },
    { range: '50-80%', count: 624, color: '#0077b6' },
    { range: '20-50%', count: 498, color: '#e67e22' },
    { range: '0-20%', count: 232, color: '#dc3545' },
  ],
  depotHealth: [
    { depot: 'Ballymount', city: 'Dublin', avgSoc: 68, vehiclesLow: 12, avgTemp: 22.1 },
    { depot: 'Olive Grove', city: 'Bradford', avgSoc: 72, vehiclesLow: 8, avgTemp: 24.3 },
    { depot: 'Queens Road', city: 'Manchester', avgSoc: 61, vehiclesLow: 15, avgTemp: 25.8 },
    { depot: "Shepherd's Bush", city: 'London', avgSoc: 74, vehiclesLow: 6, avgTemp: 26.2 },
    { depot: 'Walworth', city: 'London', avgSoc: 71, vehiclesLow: 9, avgTemp: 26.4 },
    { depot: 'Yardley Wood', city: 'Birmingham', avgSoc: 65, vehiclesLow: 11, avgTemp: 23.7 },
    { depot: 'Lawrence Hill', city: 'Bristol', avgSoc: 77, vehiclesLow: 4, avgTemp: 21.5 },
    { depot: 'Annandale St', city: 'Edinburgh', avgSoc: 70, vehiclesLow: 7, avgTemp: 18.9 },
    { depot: 'Bramley', city: 'Leeds', avgSoc: 66, vehiclesLow: 9, avgTemp: 22.4 },
    { depot: 'Falls Road', city: 'Belfast', avgSoc: 73, vehiclesLow: 5, avgTemp: 19.2 },
    { depot: 'Cathcart', city: 'Glasgow', avgSoc: 69, vehiclesLow: 6, avgTemp: 17.8 },
    { depot: 'Green Lane', city: 'Liverpool', avgSoc: 63, vehiclesLow: 8, avgTemp: 23.1 },
    { depot: 'Byker', city: 'Newcastle', avgSoc: 75, vehiclesLow: 3, avgTemp: 19.6 },
    { depot: 'Cardiff Bay', city: 'Cardiff', avgSoc: 71, vehiclesLow: 4, avgTemp: 20.3 },
    { depot: 'Conway St', city: 'Brighton', avgSoc: 78, vehiclesLow: 2, avgTemp: 22.8 },
  ],
  summary: {
    totalVehicles: 2166,
    vehiclesNeedingCharge: 232,
    avgFleetSoc: 69,
    avgBatteryTemp: 22.4,
  },
}

export async function GET() {
  return NextResponse.json(fleetHealth)
}
