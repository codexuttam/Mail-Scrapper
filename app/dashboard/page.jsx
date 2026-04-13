"use client"
import { useEffect, useState } from 'react'

function formatDate(iso) {
  try { return new Date(iso).toLocaleString() } catch (e) { return iso }
}

function LeadRow({ lead, onGenerate, onSend, onDelete }) {
  return (
    <div className="card mb-3 flex items-center justify-between card-hover">
      <div>
        <div className="font-semibold flex items-center gap-3">
          {lead.name}
          {lead.status === 'sent' ? <span className="badge badge-sent">Sent</span> : <span className="badge badge-new">New</span>}
        </div>
        <div className="text-sm text-slate-600">{lead.address}</div>
        <div className="text-sm text-slate-500">{lead.email || lead.phone} {lead.lastSentAt && <span className="text-xs text-slate-400">• {formatDate(lead.lastSentAt)}</span>}</div>
      </div>
      <div className="flex gap-2">
        <button onClick={() => onGenerate(lead)} className="btn btn-primary">Generate</button>
        <button onClick={() => onSend(lead)} className="btn btn-accent">Send</button>
        <button onClick={() => onDelete(lead)} className="btn btn-ghost">Delete</button>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(false)
  const [previewLead, setPreviewLead] = useState(null)
  const [previewMessage, setPreviewMessage] = useState('')
  const [notice, setNotice] = useState(null)

  async function load() {
    setLoading(true)
    const res = await fetch('/api/leads')
    const data = await res.json()
    setLeads(data.leads || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleGenerate(lead) {
    const res = await fetch('/api/generate', {
      method: 'POST',
      body: JSON.stringify({ name: lead.name, type: lead.type || 'business', location: lead.location || '', tone: 'friendly', leadId: lead._id }),
      headers: { 'Content-Type': 'application/json' }
    })
    const data = await res.json()
    if (data.error) {
      setNotice({ type: 'error', message: 'Error generating message: ' + data.error })
      setTimeout(() => setNotice(null), 4000)
      return
    }
    setPreviewLead(lead)
    setPreviewMessage(data.message || '')
  }

  async function handleSend(lead) {
    const msg = (previewLead && previewLead._id === lead._id) ? previewMessage : prompt('Paste message to send to ' + lead.name)
    if (!msg) return
    const res = await fetch('/api/send-email', { method: 'POST', body: JSON.stringify({ to: lead.email || lead.contact || lead.phone || '', subject: 'Website help', text: msg, leadId: lead._id }), headers: { 'Content-Type': 'application/json' } })
    const data = await res.json()
    if (data.ok) {
      setNotice({ type: 'success', message: 'Email sent to ' + (lead.email || lead.phone || 'recipient'), url: data.previewUrl || null })
      setLeads((cur) => cur.map(l => l._id === lead._id ? { ...l, status: 'sent', lastSentAt: new Date().toISOString() } : l))
      if (previewLead && previewLead._id === lead._id) {
        setPreviewLead(null)
        setPreviewMessage('')
      }
      setTimeout(() => setNotice(null), 6000)
    } else {
      setNotice({ type: 'error', message: 'Send failed: ' + (data.error || JSON.stringify(data)) })
      setTimeout(() => setNotice(null), 6000)
    }
  }

  async function handleDelete(lead) {
    if (!confirm('Delete lead "' + lead.name + '"?')) return
    const res = await fetch('/api/leads', { method: 'DELETE', body: JSON.stringify({ id: lead._id }), headers: { 'Content-Type': 'application/json' } })
    const data = await res.json()
    if (data.ok) {
      setLeads((cur) => cur.filter(l => l._id !== lead._id))
      if (previewLead && previewLead._id === lead._id) {
        setPreviewLead(null)
        setPreviewMessage('')
      }
    } else {
      setNotice({ type: 'error', message: 'Delete failed: ' + (data.error || JSON.stringify(data)) })
      setTimeout(() => setNotice(null), 4000)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <button onClick={load} className="btn btn-primary">Refresh</button>
        </div>
        {notice && (
          <div className={`px-4 py-2 rounded ${notice.type === 'success' ? 'bg-emerald-50 text-emerald-800' : notice.type === 'error' ? 'bg-red-50 text-red-800' : 'bg-sky-50 text-sky-800'}`}>
            <div>{notice.message} {notice.url && <a className="underline ml-2" target="_blank" rel="noreferrer" href={notice.url}>Preview</a>}</div>
          </div>
        )}
      </div>

      {loading && <div>Loading leads...</div>}

      <div>
        {leads.map((l) => (
          <LeadRow key={l._id} lead={l} onGenerate={handleGenerate} onSend={handleSend} onDelete={handleDelete} />
        ))}
      </div>

      {/* Preview pane */}
      {previewLead && (
        <div className="card mt-6 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold">Preview for: {previewLead.name}</div>
              <div className="text-sm text-slate-600">{previewLead.address}</div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleSend(previewLead)} className="btn btn-accent">Send</button>
              <button onClick={() => { setPreviewLead(null); setPreviewMessage('') }} className="btn btn-ghost">Close</button>
            </div>
          </div>
          <div className="mt-3 whitespace-pre-wrap text-sm bg-slate-50 p-3 rounded border">{previewMessage}</div>
        </div>
      )}
    </div>
  )
}
