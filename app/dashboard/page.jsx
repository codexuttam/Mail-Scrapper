import { useEffect, useState } from 'react'

function LeadRow({ lead, onGenerate, onSend }) {
  return (
    <div className="card mb-3 flex items-center justify-between">
      <div>
        <div className="font-semibold">{lead.name}</div>
        <div className="text-sm text-slate-600">{lead.address}</div>
        <div className="text-sm text-slate-500">{lead.phone}</div>
      </div>
      <div className="flex gap-2">
        <button onClick={() => onGenerate(lead)} className="bg-sky-600 text-white px-3 py-1 rounded text-sm">Generate</button>
        <button onClick={() => onSend(lead)} className="bg-emerald-600 text-white px-3 py-1 rounded text-sm">Send</button>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(false)

  async function load() {
    setLoading(true)
    const res = await fetch('/api/leads')
    const data = await res.json()
    setLeads(data.leads || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleGenerate(lead) {
    const res = await fetch('/api/generate', { method: 'POST', body: JSON.stringify({ name: lead.name, type: lead.type || 'business', location: lead.location || '', tone: 'friendly', leadId: lead._id }), headers: { 'Content-Type': 'application/json' } })
    const data = await res.json()
    alert('Generated message:\n\n' + (data.message || data.error))
  }

  async function handleSend(lead) {
    const msg = prompt('Paste message to send to ' + lead.name)
    if (!msg) return
    const res = await fetch('/api/send-email', { method: 'POST', body: JSON.stringify({ to: lead.email || lead.contact || lead.phone || '', subject: 'Website help', text: msg, leadId: lead._id }), headers: { 'Content-Type': 'application/json' } })
    const data = await res.json()
    if (data.ok) alert('Sent')
    else alert('Error: ' + (data.error || JSON.stringify(data)))
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
      <div className="mb-4">
        <button onClick={load} className="bg-sky-600 text-white px-3 py-2 rounded">Refresh</button>
      </div>

      {loading && <div>Loading leads...</div>}

      <div>
        {leads.map((l) => (
          <LeadRow key={l._id} lead={l} onGenerate={handleGenerate} onSend={handleSend} />
        ))}
      </div>
    </div>
  )
}
