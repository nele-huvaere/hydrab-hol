import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { z: string; x: string; y: string } }
) {
  const { z, x, y } = params
  const tileUrl = `https://tile.openstreetmap.org/${z}/${x}/${y}`

  try {
    const response = await fetch(tileUrl, {
      headers: { 'User-Agent': 'HydraB-Fleet-App/1.0' },
    })

    if (!response.ok) {
      return new NextResponse(null, { status: response.status })
    }

    const buffer = await response.arrayBuffer()
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400',
      },
    })
  } catch {
    return new NextResponse(null, { status: 502 })
  }
}
