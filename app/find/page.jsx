"use client"
import { useState, useEffect, useRef } from 'react'
import { Search, MapPin, Phone, Globe, Save, Loader2, Compass, Layers, Filter, Zap, Info, Camera, Users, MessageSquare } from 'lucide-react'

function ResultRow({ item, onSave }) {
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    await onSave(item)
    setIsSaving(false)
    setSaved(true)
  }

  const WA_ICON = <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>;
  const IG_ICON = <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>;
  const FB_ICON = <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>;
  const X_ICON = <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>;
  const IN_ICON = <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 mb-4 p-5 hover:shadow-lg hover:border-indigo-300 transition-all duration-300 animate-in group">
      <div className="flex flex-col lg:flex-row justify-between gap-5">
        <div className="flex-1 space-y-3">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <h3 className="font-extrabold text-xl text-slate-900 group-hover:text-indigo-600 transition-colors">{item.name}</h3>
              {item.rating && (
                <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-md flex items-center gap-1 border border-amber-200 shadow-sm">
                  ★ {item.rating}
                </span>
              )}
            </div>
            <div className="flex items-start gap-2 text-sm text-slate-500 font-medium">
              <MapPin size={16} className="text-indigo-400 mt-0.5 shrink-0" />
              <span className="line-clamp-2 leading-snug">{item.address}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-1">
            {/* Phone & WhatsApp */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Phone size={16} className={item.phone ? "text-indigo-500" : "text-slate-300"} />
                <span className={item.phone ? "text-slate-700" : "text-slate-400 italic font-medium"}>
                  {item.phone || "No phone"}
                </span>
              </div>
              
              {item.phone && (() => {
                let cleaned = item.phone.replace(/\D/g, '');
                if (cleaned.startsWith('0')) cleaned = cleaned.substring(1);
                if (cleaned.length === 10) cleaned = '91' + cleaned;
                return (
                  <a 
                    href={`https://web.whatsapp.com/send?phone=${cleaned}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-500 hover:text-white hover:shadow-lg hover:shadow-emerald-200 transition-all"
                    title="Chat on WhatsApp"
                  >
                    {WA_ICON}
                  </a>
                );
              })()}
            </div>

            {/* Emails */}
            {item.emails && item.emails.filter(e => !!e).length > 0 && (
              <div className="flex items-center gap-2 text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                {item.emails.filter(e => !!e)[0]}
              </div>
            )}

            {/* Website */}
            {(item.website || item.link) && (
              <a href={item.website || item.link} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg">
                <Globe size={16} />
                Website
              </a>
            )}

            {/* Socials */}
            {item.socials && Object.values(item.socials).some(Boolean) && (
              <div className="flex items-center gap-2.5 border-l-2 border-slate-100 pl-5">
                {item.socials.instagram && (
                  <a href={item.socials.instagram} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-pink-600 transition-colors" title="Instagram">{IG_ICON}</a>
                )}
                {item.socials.facebook && (
                  <a href={item.socials.facebook} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-blue-600 transition-colors" title="Facebook">{FB_ICON}</a>
                )}
                {item.socials.linkedin && (
                  <a href={item.socials.linkedin} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-blue-500 transition-colors" title="LinkedIn">{IN_ICON}</a>
                )}
                {item.socials.twitter && (
                  <a href={item.socials.twitter} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-sky-500 transition-colors" title="Twitter">{X_ICON}</a>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex lg:flex-col items-center justify-end gap-3 shrink-0 border-t lg:border-t-0 lg:border-l border-slate-100 pt-4 lg:pt-0 lg:pl-6">
          <button 
            disabled={isSaving || saved}
            onClick={handleSave} 
            className={`w-full lg:w-36 h-11 flex items-center justify-center gap-2 rounded-xl font-bold transition-all ${
              saved 
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 active:scale-95'
            }`}
          >
            {isSaving ? <Loader2 size={18} className="animate-spin" /> : saved ? <><Save size={18} /> Saved</> : <><Save size={18} /> Save Lead</>}
          </button>
          
          <a 
            href={item.link || '#'} 
            target="_blank" 
            rel="noreferrer" 
            className="w-full lg:w-36 h-11 flex items-center justify-center rounded-xl bg-slate-50 text-slate-600 border border-slate-200 font-bold hover:bg-slate-100 hover:text-slate-900 transition-all active:scale-95"
          >
            <MapPin size={16} className="mr-2" /> View Map
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
        website: item.website || item.link || '', 
        socials: item.socials,
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
                <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex items-center gap-3 mb-4 animate-pulse">
                   <Loader2 size={20} className="text-indigo-600 animate-spin" />
                   <p className="text-sm font-bold text-indigo-700">
                      {searchMethod === 'scrape' 
                        ? 'Deep scraping business details & emails... this may take 15-30 seconds.' 
                        : 'Connecting to Google Places API...'}
                   </p>
                </div>
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

        <div className="order-1 lg:order-2 space-y-6 lg:sticky lg:top-24 h-fit">
           <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-lg">
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

