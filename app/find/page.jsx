import { useState } from 'react'

function ResultRow({ item, onSave }) {
  return (
    <div className="card mb-3">
      <div className="flex justify-between">
        <div>
          <div className="font-semibold">{item.name}</div>
          <div className="text-sm text-slate-600">{item.address}</div>
          <div className="text-sm text-slate-500">{item.phone}</div>
        </div>
        <div className="flex flex-col items-end">
          <a className="text-sky-600 text-sm" href={item.link} target="_blank" rel="noreferrer">Link</a>
          <button onClick={() => onSave(item)} className="mt-2 bg-green-600 text-white px-3 py-1 rounded text-sm">Save</button>
        </div>
      </div>
    </div>
  )
}

export default function FindPage() {
  const [query, setQuery] = useState('cafes in Ghaziabad')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  async function runSearch(save = false) {
    setLoading(true)
    const res = await fetch('/api/scrape', { method: 'POST', body: JSON.stringify({ query, save }), headers: { 'Content-Type': 'application/json' } })
    const data = await res.json()
    setResults(data.saved ? data.saved : data.data || [])
    setLoading(false)
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
        <div className="flex gap-2 mt-2">
          <input value={query} onChange={(e) => setQuery(e.target.value)} className="border p-2 rounded flex-1" />
          <button onClick={() => runSearch(false)} className="bg-sky-600 text-white px-3 py-2 rounded">Search</button>
          <button onClick={() => runSearch(true)} className="bg-emerald-600 text-white px-3 py-2 rounded">Search & Save</button>
        </div>
      </div>

      {loading && <div>Searching...</div>}

      <div>
        {results.map((r) => (
          <ResultRow key={r._id || r.name + r.address} item={r} onSave={saveItem} />
        ))}
      </div>
    </div>
  )
}
