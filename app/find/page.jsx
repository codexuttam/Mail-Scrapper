"use client"
import { useState, useEffect, useRef } from 'react'
import { Search, MapPin, Phone, Globe, Save, Loader2, Compass, Layers, Filter, Zap, Info } from 'lucide-react'

function ResultRow({ item, onSave }) {
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    await onSave(item)
    setIsSaving(false)
    setSaved(true)
  }

  return (
    <div className="glass-card mb-4 p-5 card-hover group transition-all duration-300 hover:border-indigo-200 animate-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-lg text-indigo-950">{item.name}</h3>
            {item.rating && (
              <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                ★ {item.rating}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-sm text-slate-500 mb-2">
            <MapPin size={14} className="text-slate-400" />
            <span className="line-clamp-1">{item.address}</span>
          </div>
          <div className="flex flex-wrap gap-4 items-center mt-3">
            <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600">
              <Phone size={14} className="text-indigo-400" />
              {item.phone || <span className="text-slate-300">No phone</span>}
            </div>
            {item.emails && item.emails.filter(e => !!e).length > 0 && (
              <div className="flex items-center gap-1.5 text-sm font-medium text-emerald-600">
                 <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                 {item.emails.filter(e => !!e)[0]}
              </div>
            )}
            {(item.website || item.link) && (
              <a href={item.website || item.link} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:underline">
                <Globe size={14} />
                Visit Website
              </a>
            )}
          </div>
        </div>
        
        <div className="flex md:flex-col items-center gap-3">
          <button 
            disabled={isSaving || saved}
            onClick={handleSave} 
            className={`btn-premium w-full md:w-32 flex justify-center gap-2 ${saved ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200' : ''}`}
          >
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : saved ? <><Save size={16}/> Saved</> : <><Save size={16}/> Save Lead</>}
          </button>
          
          <a 
            href={item.link || '#'} 
            target="_blank" 
            rel="noreferrer" 
            className="flex items-center justify-center h-10 px-4 rounded-lg bg-slate-100 text-slate-700 text-sm font-bold hover:bg-slate-200 transition-colors"
          >
            View Map
          </a>
        </div>
      </div>
    </div>
  )
}

export default function FindPage() {
  const [query, setQuery] = useState('cafes in Ghaziabad')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchMethod, setSearchMethod] = useState('scrape')
  const [emailOnly, setEmailOnly] = useState(false)
  
  const mapRef = useRef(null)
  const leafletMap = useRef(null)
  const markersGroup = useRef(null)
  const [leafletReady, setLeafletReady] = useState(false)

  // Load Leaflet dynamically
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.L) {
      setLeafletReady(true)
      return
    }
    const script = document.createElement('script')
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.async = true
    script.onload = () => setLeafletReady(true)
    document.head.appendChild(script)
  }, [])

  // Initialize Map
  useEffect(() => {
    if (leafletReady && mapRef.current && !leafletMap.current) {
      const L = window.L
      const map = L.map(mapRef.current).setView([28.6692, 77.4538], 13)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
      }).addTo(map)
      markersGroup.current = L.layerGroup().addTo(map)
      leafletMap.current = map
    }
  }, [leafletReady])

  async function runSearch(save = false) {
    setLoading(true)
    try {
      const res = await fetch('/api/scrape', { 
        method: 'POST', 
        body: JSON.stringify({ query, save }), 
        headers: { 'Content-Type': 'application/json' } 
      })
      const data = await res.json()
      const finalItems = data.saved ? data.saved : data.data || []
      setResults(finalItems)
      updateMapMarkers(finalItems)
    } finally {
      setLoading(false)
    }
  }

  async function runPlacesSearch() {
    setLoading(true)
    try {
      const res = await fetch(`/api/places-search?q=${encodeURIComponent(query)}`)
      const data = await res.json()
      
      if (data.error) {
        alert(`Search Error: ${data.error}`)
        return
      }
      
      const items = data.items || []
      setResults(items)
      updateMapMarkers(items)
    } catch (err) {
      console.error('places-search error', err)
      alert('Places search failed. Check your API Key and billing settings.')
    } finally {
      setLoading(false)
    }
  }

  function updateMapMarkers(items) {
    if (!leafletMap.current || !window.L) return
    const L = window.L
    markersGroup.current.clearLayers()
    
    const validMarkers = items.filter(i => i.location && i.location.lat)
    if (validMarkers.length === 0) return

    validMarkers.forEach(item => {
      L.marker([item.location.lat, item.location.lng])
        .bindPopup(`<b>${item.name}</b><br>${item.address}`)
        .addTo(markersGroup.current)
    })

    // Center map on first result
    const first = validMarkers[0].location
    leafletMap.current.setView([first.lat, first.lng], 13)
  }

  async function saveItem(item) {
    await fetch('/api/leads', { 
      method: 'POST', 
      body: JSON.stringify({ 
        name: item.name, 
        email: (item.emails && item.emails.length > 0) ? item.emails[0] : '',
        phone: item.phone, 
        address: item.address, 
        website: item.link || item.website || '', 
        location: query 
      }), 
      headers: { 'Content-Type': 'application/json' } 
    })
  }

  const toggleSort = () => {
    const sorted = [...results].sort((a, b) => (b.rating || 0) - (a.rating || 0))
    setResults(sorted)
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-indigo-950">Find Businesses</h1>
          <p className="text-slate-500">Extract verified business data directly from Google Maps without API limits.</p>
        </div>
        <div className="flex bg-white rounded-lg p-1 border shadow-sm">
          <button 
            onClick={() => setSearchMethod('scrape')}
            className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${searchMethod === 'scrape' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-900'}`}
          >
            Deep Scrape (Free)
          </button>
          <button 
            onClick={() => setSearchMethod('places')}
            className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${searchMethod === 'places' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-900'}`}
          >
            Google Places API
          </button>
        </div>
      </div>

      <div className="glass-card p-2 md:p-3 overflow-hidden shadow-2xl shadow-indigo-500/10">
        <div className="flex flex-col md:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
            <input 
              value={query} 
              onChange={(e) => setQuery(e.target.value)} 
              placeholder="What are you looking for? (e.g. Cafes in Ghaziabad)"
              className="w-full pl-12 pr-4 py-4 bg-transparent text-lg font-medium focus:outline-none placeholder:text-slate-300" 
              onKeyDown={(e) => e.key === 'Enter' && (searchMethod === 'places' ? runPlacesSearch() : runSearch())}
            />
          </div>
          <button 
            onClick={searchMethod === 'places' ? runPlacesSearch : () => runSearch(false)} 
            disabled={loading}
            className="btn-premium h-auto py-4 px-10 text-base"
          >
            {loading ? <Loader2 size={24} className="animate-spin" /> : 'Search Now'}
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr,350px] gap-8">
        <div className="order-2 lg:order-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-800 flex items-center gap-2">
              <Layers size={18} className="text-indigo-600" />
              Search Results {results.length > 0 && `(${results.filter(r => emailOnly ? (r.emails && r.emails.length > 0) : true).length})`}
            </h2>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={emailOnly} 
                  onChange={(e) => setEmailOnly(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300" 
                />
                <span className="text-sm font-bold text-slate-600 group-hover:text-indigo-600 transition-colors">Emails Only</span>
              </label>
              {results.length > 0 && (
                <button onClick={toggleSort} className="text-sm font-bold text-indigo-600 flex items-center gap-1 hover:underline active:scale-95 transition-all">
                   <Filter size={14} /> Sort by Rating
                </button>
              )}
            </div>
          </div>

          {loading ? (
             <div className="space-y-4">
                {[1,2,3].map(i => (
                   <div key={i} className="h-32 bg-white rounded-2xl border border-slate-100 animate-pulse flex p-5 gap-4">
                      <div className="flex-1 space-y-3">
                         <div className="h-6 w-1/2 bg-slate-100 rounded"></div>
                         <div className="h-4 w-3/4 bg-slate-50 rounded"></div>
                         <div className="h-4 w-1/4 bg-slate-50 rounded"></div>
                      </div>
                      <div className="w-32 h-10 bg-slate-100 rounded-lg"></div>
                   </div>
                ))}
             </div>
          ) : results.length > 0 ? (
            <div className="animate-in">
              {results
                .filter(r => emailOnly ? (r.emails && r.emails.length > 0) : true)
                .map((r, idx) => (
                   <ResultRow key={idx} item={r} onSave={saveItem} />
                ))
              }
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200 text-slate-400">
               <Compass size={48} className="mb-4 opacity-20" />
               <p className="font-medium italic">No results found yet. Start a search above.</p>
            </div>
          )}
        </div>

        <div className="order-1 lg:order-2 space-y-6">
           <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-lg sticky top-24">
              <div className="p-4 border-b bg-slate-50 flex items-center justify-between">
                 <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                   <MapPin size={12} /> Interactive Map
                 </span>
                 <div className="flex items-center gap-1.5">
                   <span className="text-[10px] text-slate-400 font-bold">OPENSTREETMAP</span>
                   <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                 </div>
              </div>
              <div className="relative h-[400px] bg-slate-100 flex items-center justify-center overflow-hidden">
                <div ref={mapRef} id="map" className="absolute inset-0 w-full h-full z-10" />
                <div className="space-y-3 relative z-0">
                  <Loader2 size={32} className="mx-auto text-slate-300 animate-spin" />
                  <p className="text-xs text-slate-500">Loading Map Engine...</p>
                </div>
              </div>
              <div className="p-3 bg-indigo-50 border-t border-indigo-100 flex items-start gap-2">
                 <Info size={14} className="text-indigo-600 mt-0.5" />
                 <p className="text-[10px] text-indigo-700 leading-tight">Map markers show business locations scraped in real-time. No API key required for this map.</p>
              </div>
           </div>
           
           <div className="bg-indigo-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-500"></div>
              <Zap size={32} className="mb-4 text-indigo-400 fill-indigo-400/20" />
              <h3 className="font-bold text-lg mb-2">Deep Scraping Active</h3>
              <p className="text-sm text-indigo-200/80 leading-relaxed mb-4">You are using the browser-based scraper. It bypasses Google API costs and extracts more data like emails and social links.</p>
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                 <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                 100% FREE MODE
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}

