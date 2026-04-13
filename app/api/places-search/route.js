import { NextResponse } from 'next/server'

export async function GET(req) {
  try {
    const url = new URL(req.url)
    const q = url.searchParams.get('q') || 'coffee near me'
    const key = process.env.GOOGLE_MAPS_API_KEY
    if (!key) return NextResponse.json({ error: 'GOOGLE_MAPS_API_KEY not set' }, { status: 400 })

    const apiUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(q)}&key=${key}`
    const r = await fetch(apiUrl)
    const data = await r.json()

    // Map to a small shape for the frontend
    const items = (data.results || []).map(p => ({
      name: p.name,
      address: p.formatted_address,
      place_id: p.place_id,
      location: p.geometry?.location,
      rating: p.rating
    }))

    return NextResponse.json({ items, raw: data })
  } catch (err) {
    console.error('places-search error', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
