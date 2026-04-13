"use client"
import { useState } from 'react'
import { useEffect, useRef } from 'react'

function ResultRow({ item, onSave }) {
  return (
    <div className="card mb-3 card-hover">
      <div className="flex justify-between items-center">
        <div>
          <div className="font-semibold">{item.name}</div>
          <div className="text-sm text-slate-600">{item.address}</div>
          <div className="text-sm text-slate-500">{item.phone} {item.email && <span className="ml-2 text-slate-400">• {item.email}</span>}</div>
        </div>
        <div className="flex flex-col items-end">
          <a className="text-sky-600 text-sm mb-2" href={item.link} target="_blank" rel="noreferrer">Link</a>
          <button onClick={() => onSave(item)} className="btn btn-accent">Save</button>
        </div>
      </div>
    </div>
  )
}

export default function FindPage() {
  const [query, setQuery] = useState('cafes in Ghaziabad')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const mapRef = useRef(null)
  const [mapReady, setMapReady] = useState(false)

  // Expose NEXT_PUBLIC_GOOGLE_MAPS_API_KEY at runtime (will be replaced at build)
  const publicKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  useEffect(() => {
    // If a public key is present, load the Maps JS script dynamically
    if (!publicKey) return
    if (typeof window === 'undefined') return
    if (window.google && window.google.maps) {
      setMapReady(true)
      return
    }
    const id = 'gmaps-script'
    if (document.getElementById(id)) {
      // already loading
      const check = setInterval(() => { if (window.google && window.google.maps) { setMapReady(true); clearInterval(check) } }, 200)
      return
    }
    const s = document.createElement('script')
    s.id = id
    s.src = `https://maps.googleapis.com/maps/api/js?key=${publicKey}&libraries=places`
    s.async = true
    s.defer = true
    s.onload = () => setMapReady(true)
    document.head.appendChild(s)
  }, [publicKey])

  async function runSearch(save = false) {
    setLoading(true)
    const res = await fetch('/api/scrape', { method: 'POST', body: JSON.stringify({ query, save }), headers: { 'Content-Type': 'application/json' } })
    const data = await res.json()
    setResults(data.saved ? data.saved : data.data || [])
    setLoading(false)
  }

  async function runPlacesSearch() {
    setLoading(true)
    const res = await fetch(`/api/places-search?q=${encodeURIComponent(query)}`)
    const data = await res.json()
    setResults(data.items || [])
    setLoading(false)

    // plot on map if ready
    if (mapReady && window.google && mapRef.current) {
      const map = new window.google.maps.Map(mapRef.current, { center: { lat: data.items?.[0]?.location?.lat || 0, lng: data.items?.[0]?.location?.lng || 0 }, zoom: 13 })
      data.items?.forEach(item => {
        if (item.location) {
          new window.google.maps.Marker({ position: { lat: item.location.lat, lng: item.location.lng }, map, title: item.name })
        }
      })
    }
  }

  async function saveItem(item) {
    await fetch('/api/leads', { method: 'POST', body: JSON.stringify({ name: item.name, phone: item.phone, address: item.address, website: item.link, location: query }), headers: { 'Content-Type': 'application/json' } })
    alert('Saved')
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Find businesses</h2>

        <div className="card mb-4">
          <label className="block text-sm text-slate-700">Search query</label>
          <div className="flex gap-3 mt-3">
            <input value={query} onChange={(e) => setQuery(e.target.value)} className="border p-3 rounded flex-1" />
            <div className="flex gap-2">
              <button onClick={() => runSearch(false)} className="btn btn-primary">Scrape</button>
              <button onClick={() => runSearch(true)} className="btn btn-accent">Scrape & Save</button>
              <button onClick={() => runPlacesSearch()} className="btn btn-ghost">Places</button>
            </div>
          </div>
        </div>

      {loading && <div>Searching...</div>}

      <div>
        {results.map((r) => (
          <ResultRow key={r._id || r.name + r.address} item={r} onSave={saveItem} />
        ))}
      </div>

      {/* Map preview (shows if NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is set) */}
      <div className="mt-6">
        {!publicKey && (
          <div className="text-sm text-slate-600">To enable the interactive map, add <code>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> to your <code>.env.local</code> and restart the dev server.</div>
        )}
        <div ref={mapRef} id="map" style={{ width: '100%', height: publicKey ? 400 : 0, transition: 'height 200ms' }} />
      </div>
    </div>
  )
}
