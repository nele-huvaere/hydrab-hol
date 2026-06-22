import { NextResponse } from 'next/server'

const telemetryHistory = [
  { time: "06:00", soc: 92, temp: 18.2, speed: 0, charge_kwh: 0 },
  { time: "06:30", soc: 91, temp: 18.5, speed: 0, charge_kwh: 0 },
  { time: "07:00", soc: 89, temp: 19.1, speed: 22, charge_kwh: 0 },
  { time: "07:30", soc: 85, temp: 21.3, speed: 35, charge_kwh: 0 },
  { time: "08:00", soc: 80, temp: 23.8, speed: 28, charge_kwh: 0 },
  { time: "08:30", soc: 74, temp: 25.2, speed: 42, charge_kwh: 0 },
  { time: "09:00", soc: 68, temp: 26.1, speed: 38, charge_kwh: 0 },
  { time: "09:30", soc: 62, temp: 27.4, speed: 31, charge_kwh: 0 },
  { time: "10:00", soc: 55, temp: 28.1, speed: 45, charge_kwh: 0 },
  { time: "10:30", soc: 48, temp: 28.8, speed: 40, charge_kwh: 0 },
  { time: "11:00", soc: 41, temp: 29.2, speed: 33, charge_kwh: 0 },
  { time: "11:30", soc: 35, temp: 29.5, speed: 25, charge_kwh: 0 },
  { time: "12:00", soc: 28, temp: 28.9, speed: 0, charge_kwh: 12.5 },
  { time: "12:30", soc: 38, temp: 27.1, speed: 0, charge_kwh: 45.2 },
  { time: "13:00", soc: 52, temp: 25.4, speed: 0, charge_kwh: 78.8 },
  { time: "13:30", soc: 68, temp: 24.2, speed: 0, charge_kwh: 112.3 },
  { time: "14:00", soc: 82, temp: 23.1, speed: 0, charge_kwh: 138.0 },
  { time: "14:30", soc: 91, temp: 22.5, speed: 0, charge_kwh: 155.6 },
  { time: "15:00", soc: 95, temp: 21.8, speed: 18, charge_kwh: 0 },
  { time: "15:30", soc: 92, temp: 22.4, speed: 32, charge_kwh: 0 },
  { time: "16:00", soc: 87, temp: 24.1, speed: 41, charge_kwh: 0 },
  { time: "16:30", soc: 81, temp: 25.7, speed: 38, charge_kwh: 0 },
  { time: "17:00", soc: 74, temp: 26.3, speed: 29, charge_kwh: 0 },
  { time: "17:30", soc: 68, temp: 25.1, speed: 15, charge_kwh: 0 },
]

export async function GET() {
  return NextResponse.json(telemetryHistory)
}
