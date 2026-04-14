"use client"
import { useEffect, useState } from 'react'
import { Mail, Trash2, Send, Wand2, RefreshCw, CheckCircle2, AlertCircle, Calendar, MapPin, X } from 'lucide-react'

function formatDate(iso) {
  try {
    const date = new Date(iso)
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date)
  } catch (e) { return iso }
}

function LeadRow({ lead, onGenerate, onSend, onDelete }) {
  return (
    <div className="glass-card mb-4 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 card-hover border-l-4 border-l-transparent hover:border-l-indigo-500">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-1">
          <h3 className="font-bold text-lg text-slate-900">{lead.name}</h3>
          {lead.status === 'sent' ? (
            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-100 uppercase tracking-wider">
              <CheckCircle2 size={10} /> Sent
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-100 uppercase tracking-wider">
              <RefreshCw size={10} /> New
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
          <MapPin size={14} className="text-slate-400" />
          <span className="truncate max-w-xs">{lead.address}</span>
        </div>
        <div className="flex flex-wrap gap-4 items-center">
           <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
              <Mail size={12} className="text-indigo-400" />
              {lead.email || lead.phone || <span className="text-slate-300 italic">No contact info</span>}
           </div>
           {lead.lastSentAt && (
             <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                <Calendar size={12} />
                {formatDate(lead.lastSentAt)}
             </div>
           )}
        </div>
      </div>
      
      <div className="flex items-center gap-2 self-end md:self-center">
        <button 
          onClick={() => onGenerate(lead)} 
          className="p-2.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors title='Generate AI Message'"
        >
          <Wand2 size={18} />
        </button>
        <button 
          onClick={() => onSend(lead)} 
          className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors title='Send Outreach'"
        >
          <Send size={18} />
        </button>
        <button 
          onClick={() => onDelete(lead)} 
          className="p-2.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors title='Delete Lead'"
        >
          <Trash2 size={18} />
        </button>
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
    try {
      const res = await fetch('/api/leads')
      const data = await res.json()
      setLeads(data.leads || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function handleGenerate(lead) {
    setLoading(true)
    const res = await fetch('/api/generate', {
      method: 'POST',
      body: JSON.stringify({ name: lead.name, type: lead.type || 'business', location: lead.location || '', tone: 'friendly', leadId: lead._id }),
      headers: { 'Content-Type': 'application/json' }
    })
    const data = await res.json()
    setLoading(false)
    
    if (data.error) {
      setNotice({ type: 'error', message: 'Generation failed: ' + data.error })
      return
    }
    setPreviewLead(lead)
    setPreviewMessage(data.message || '')
  }

  async function handleSend(lead) {
    const msg = (previewLead && previewLead._id === lead._id) ? previewMessage : prompt('Paste message to send to ' + lead.name)
    if (!msg) return
    
    setLoading(true)
    const res = await fetch('/api/send-email', { 
      method: 'POST', 
      body: JSON.stringify({ 
        to: lead.email || lead.contact || lead.phone || '', 
        subject: 'Website help', 
        text: msg, 
        leadId: lead._id 
      }), 
      headers: { 'Content-Type': 'application/json' } 
    })
    const data = await res.json()
    setLoading(false)

    if (data.ok) {
      setNotice({ type: 'success', message: 'Email sent successfully!', url: data.previewUrl })
      setLeads((cur) => cur.map(l => l._id === lead._id ? { ...l, status: 'sent', lastSentAt: new Date().toISOString() } : l))
      setPreviewLead(null)
      setPreviewMessage('')
    } else {
      setNotice({ type: 'error', message: 'Send failed: ' + (data.error || 'Check console') })
    }
  }

  async function handleDelete(lead) {
    if (!confirm('Discard lead "' + lead.name + '"?')) return
    const res = await fetch('/api/leads', { 
      method: 'DELETE', 
      body: JSON.stringify({ id: lead._id }), 
      headers: { 'Content-Type': 'application/json' } 
    })
    const data = await res.json()
    if (data.ok) {
      setLeads((cur) => cur.filter(l => l._id !== lead._id))
      if (previewLead && previewLead._id === lead._id) setPreviewLead(null)
    }
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-indigo-950">Lead Dashboard</h1>
          <p className="text-slate-500">Manage your saved leads and track outreach progress.</p>
        </div>
        <button 
          onClick={load} 
          disabled={loading}
          className="btn-premium flex items-center gap-2"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          Refresh Pipeline
        </button>
      </div>

      {notice && (
        <div className={`animate-in p-4 rounded-xl border flex items-center justify-between ${notice.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-rose-50 border-rose-100 text-rose-800'}`}>
          <div className="flex items-center gap-3 font-medium">
            {notice.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <span>{notice.message}</span>
            {notice.url && <a href={notice.url} target="_blank" rel="noreferrer" className="underline font-bold ml-2">Review Email</a>}
          </div>
          <button onClick={() => setNotice(null)} className="p-1 hover:bg-black/5 rounded-full"><X size={16}/></button>
        </div>
      )}

      <div className="grid lg:grid-cols-[1fr,400px] gap-8">
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
             <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">{leads.length} Leads in Pipeline</span>
          </div>
          
          {loading && leads.length === 0 ? (
            <div className="space-y-4">
               {[1,2,3].map(i => <div key={i} className="h-24 bg-slate-200/50 rounded-2xl animate-pulse"></div>)}
            </div>
          ) : leads.length > 0 ? (
            <div className="animate-in">
              {leads.map((l) => (
                <LeadRow key={l._id} lead={l} onGenerate={handleGenerate} onSend={handleSend} onDelete={handleDelete} />
              ))}
            </div>
          ) : (
            <div className="py-20 flex flex-col items-center justify-center bg-white rounded-3xl border-2 border-dashed border-slate-200 text-slate-400">
               <Mail size={48} className="mb-4 opacity-20" />
               <p className="font-medium italic">Your pipeline is empty. Go find some leads!</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {previewLead ? (
            <div className="bg-indigo-950 text-white rounded-2xl shadow-2xl p-6 sticky top-24 animate-in overflow-hidden">
              {/* Decorative background circle */}
              <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-40 h-40 bg-indigo-500/20 rounded-full blur-2xl"></div>
              
              <div className="relative">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-xl">AI Draft</h3>
                  <button onClick={() => setPreviewLead(null)} className="text-indigo-300 hover:text-white transition-colors"><X size={20}/></button>
                </div>
                
                <div className="bg-white/10 rounded-xl p-4 mb-6 border border-white/10">
                   <p className="text-xs text-indigo-300 mb-1">To: {previewLead.name}</p>
                   <p className="text-xs text-indigo-300 font-mono italic truncate">{previewLead.email || 'No email address found'}</p>
                </div>

                <div className="bg-white text-slate-900 rounded-xl p-5 mb-6 max-h-[400px] overflow-y-auto text-sm leading-relaxed whitespace-pre-wrap selection:bg-indigo-100 italic">
                  {previewMessage}
                </div>

                <button 
                  onClick={() => handleSend(previewLead)}
                  className="w-full h-12 bg-white text-indigo-950 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-slate-100 transition-all active:scale-[0.98]"
                >
                  <Send size={18} />
                  Send to Prospect
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center sticky top-24">
               <Wand2 size={40} className="mx-auto mb-4 text-slate-200" />
               <p className="text-slate-400 text-sm italic">Select "Generate" on a lead to draft an AI-powered outreach message here.</p>
            </div>
          )}

          <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100">
             <h4 className="font-bold text-indigo-900 mb-2">Campaign Tip</h4>
             <p className="text-sm text-indigo-700 leading-relaxed">Follow-ups increase conversion rates by up to 3x. Use the "New" filter to find leads you haven't contacted yet.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
