import { NextResponse } from 'next/server'

const deliveryStatus = [
  { status: "Delivered to Customer", count: 5928, color: "#00A651" },
  { status: "Belfast Harbour", count: 260, color: "#0077b6" },
  { status: "Port of Birkenhead", count: 201, color: "#0077b6" },
  { status: "Collected", count: 160, color: "#e67e22" },
  { status: "Graysons Charging Park", count: 39, color: "#6c757d" },
  { status: "Bicester Breakdown Park", count: 18, color: "#dc3545" },
  { status: "Collection Aborted", count: 12, color: "#dc3545" },
]

export async function GET() {
  return NextResponse.json(deliveryStatus)
}
