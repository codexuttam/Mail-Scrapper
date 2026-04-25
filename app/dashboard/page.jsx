"use client"
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Mail, Trash2, Send, Wand2, RefreshCw, CheckCircle2, AlertCircle, Calendar, MapPin, X, Zap, Loader2, Search, Instagram, MessageSquare } from 'lucide-react'

function formatDate(iso) {
  try {
    const date = new Date(iso)
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date)
  } catch (e) { return iso }
}

// Wrap Dashboard in Suspense since useSearchParams is used
export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center animate-pulse text-slate-400">Loading Dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  )
}

function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-300 border border-indigo-50">
        <div className="px-6 py-5 border-b flex items-center justify-between bg-indigo-50/30">
          <h3 className="font-bold text-indigo-950 flex items-center gap-2">
            <Mail size={18} className="text-indigo-500" />
            {title}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-xl transition-all shadow-sm">
            <X size={20} className="text-slate-400" />
          </button>
        </div>
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  )
}

function LeadRow({ lead, onGenerate, onSend, onDelete, onMagic, isMagicLoading }) {
  return (
    <div className="glass-card mb-4 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 card-hover border-l-4 border-l-transparent hover:border-l-indigo-500 transition-all">
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
          onClick={() => onMagic(lead)} 
          disabled={isMagicLoading}
          className="p-2.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm hover:shadow transition-all group relative overflow-hidden"
          title="Magic Quick Send (AI Generate + Send)"
        >
          {isMagicLoading ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} className="group-hover:scale-110 transition-transform" />}
          <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
        </button>
        <div className="w-px h-6 bg-slate-200 mx-1"></div>
        <button 
          onClick={() => onGenerate(lead)} 
          className="p-2.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
          title="Draft AI Message"
        >
          <Wand2 size={18} />
        </button>
        <button 
          onClick={() => onSend(lead)} 
          className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
          title="Send Manual Outreach"
        >
          <Send size={18} />
        </button>
        <button 
          onClick={() => onDelete(lead)} 
          className="p-2.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
          title="Delete Lead"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  )
}

function DashboardContent() {
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const searchQuery = searchParams.get('q')?.toLowerCase() || ''
  
  const firstName = session?.user?.name?.split(' ')[0] || 'User'
  
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(false)
  const [magicLoadingId, setMagicLoadingId] = useState(null)
  
  const [previewLead, setPreviewLead] = useState(null)
  const [previewMessage, setPreviewMessage] = useState('')
  
  const [modalOpen, setModalOpen] = useState(false)
  const [modalLead, setModalLead] = useState(null)
  const [modalMessage, setModalMessage] = useState('')
  
  const [notice, setNotice] = useState(null)
  const [selectedChannel, setSelectedChannel] = useState('email')

  const filteredLeads = leads.filter(l => 
    l.name.toLowerCase().includes(searchQuery) || 
    l.address?.toLowerCase().includes(searchQuery) ||
    l.email?.toLowerCase().includes(searchQuery)
  )
// ... lines 39 to 184 remain similar, update leads.map to filteredLeads.map ...

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
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        body: JSON.stringify({ 
          name: lead.name, 
          type: lead.type || 'business', 
          location: lead.location || '', 
          tone: 'friendly', 
          leadId: lead._id,
          channel: selectedChannel 
        }),
        headers: { 'Content-Type': 'application/json' }
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      
      setPreviewLead(lead)
      setPreviewMessage(data.message || '')
    } catch (err) {
      setNotice({ type: 'error', message: 'Generation failed: ' + err.message })
    } finally {
      setLoading(false)
    }
  }

  async function handleMagic(lead) {
    setMagicLoadingId(lead._id)
    try {
      // 1. Generate
      const genRes = await fetch('/api/generate', {
        method: 'POST',
        body: JSON.stringify({ name: lead.name, type: lead.type || 'business', location: lead.location || '', tone: 'friendly', leadId: lead._id }),
        headers: { 'Content-Type': 'application/json' }
      })
      const genData = await genRes.json()
      if (genData.error) throw new Error(genData.error)

      // 2. Send
      await performSend(lead, genData.message)
      
    } catch (err) {
      setNotice({ type: 'error', message: 'Magic Send failed: ' + err.message })
    } finally {
      setMagicLoadingId(null)
    }
  }

  async function performSend(lead, message) {
    const res = await fetch('/api/send-email', { 
      method: 'POST', 
      body: JSON.stringify({ 
        to: lead.email || lead.contact || lead.phone || '', 
        subject: 'Website help', 
        text: message, 
        leadId: lead._id 
      }), 
      headers: { 'Content-Type': 'application/json' } 
    })
    const data = await res.json()

    if (data.ok) {
      setNotice({ type: 'success', message: 'Email sent successfully!', url: data.previewUrl })
      setLeads((cur) => cur.map(l => l._id === lead._id ? { ...l, status: 'sent', lastSentAt: new Date().toISOString() } : l))
      if (previewLead?._id === lead._id) {
        setPreviewLead(null)
        setPreviewMessage('')
      }
      setModalOpen(false)
    } else {
      throw new Error(data.error || 'Check console')
    }
  }

  async function handleSendClick(lead) {
    if (previewLead && previewLead._id === lead._id) {
      // Use existing preview
      setLoading(true)
      try {
        await performSend(lead, previewMessage)
      } catch (err) {
        setNotice({ type: 'error', message: 'Send failed: ' + err.message })
      } finally {
        setLoading(false)
      }
    } else {
      // Open modal for manual input
      setModalLead(lead)
      setModalMessage('')
      setModalOpen(true)
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
          <h1 className="text-3xl font-extrabold text-indigo-950">Welcome, {firstName}!</h1>
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
        <div className={`animate-in p-4 rounded-xl border flex items-center justify-between shadow-lg mb-6 ${notice.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-rose-50 border-rose-100 text-rose-800'}`}>
          <div className="flex items-start gap-3 font-medium max-w-[90%]">
            {notice.type === 'success' ? <CheckCircle2 size={20} className="mt-0.5 shrink-0" /> : <AlertCircle size={20} className="mt-0.5 shrink-0" />}
            <div>
              <p className="font-bold">{notice.message.split(':')[0]}</p>
              <p className="text-sm opacity-90 leading-snug">
                {notice.message.includes('429') 
                  ? "OpenAI Quota Exceeded. Please check your billing at platform.openai.com. You need a paid plan or active credits to generate messages." 
                  : notice.message.split(':').slice(1).join(':')}
              </p>
              {notice.url && <a href={notice.url} target="_blank" rel="noreferrer" className="inline-block mt-2 text-xs font-black uppercase tracking-widest bg-white/50 px-3 py-1 rounded-full hover:bg-white transition-all">Review Email Output</a>}
            </div>
          </div>
          <button onClick={() => setNotice(null)} className="p-2 hover:bg-black/5 rounded-full self-start"><X size={16}/></button>
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
              {filteredLeads.map((l) => (
                <LeadRow 
                  key={l._id} 
                  lead={l} 
                  onGenerate={handleGenerate} 
                  onSend={handleSendClick} 
                  onDelete={handleDelete}
                  onMagic={handleMagic}
                  isMagicLoading={magicLoadingId === l._id} 
                />
              ))}
              {filteredLeads.length === 0 && (
                <div className="py-20 flex flex-col items-center justify-center bg-white rounded-3xl border-2 border-dashed border-slate-200 text-slate-400">
                   <Search size={48} className="mb-4 opacity-20" />
                   <p className="font-medium italic">No leads match "{searchQuery}"</p>
                </div>
              )}
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
              <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-40 h-40 bg-indigo-500/20 rounded-full blur-2xl"></div>
              
              <div className="relative">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-xl flex items-center gap-2">
                    <Wand2 size={20} className="text-indigo-400" />
                    AI Draft
                  </h3>
                  <button onClick={() => setPreviewLead(null)} className="text-indigo-300 hover:text-white transition-colors"><X size={20}/></button>
                </div>

                <div className="flex bg-white/10 rounded-xl p-1 mb-6 border border-white/5">
                   {[
                     { id: 'email', icon: Mail, label: 'Email' },
                     { id: 'dm', icon: Instagram, label: 'DM' },
                     { id: 'whatsapp', icon: MessageSquare, label: 'WhatsApp' }
                   ].map(ch => (
                     <button
                       key={ch.id}
                       onClick={() => { setSelectedChannel(ch.id); handleGenerate(previewLead); }}
                       className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${selectedChannel === ch.id ? 'bg-white text-indigo-950 shadow-lg' : 'text-indigo-300 hover:bg-white/5'}`}
                     >
                       <ch.icon size={14} />
                       {ch.label}
                     </button>
                   ))}
                </div>
                
                <div className="bg-white/10 rounded-xl p-4 mb-6 border border-white/10">
                   <p className="text-xs text-indigo-300 mb-1">To: {previewLead.name}</p>
                   <p className="text-[10px] text-indigo-400 font-mono italic truncate">{previewLead.email || 'No email address found'}</p>
                </div>

                <div className="bg-white text-slate-900 rounded-xl p-5 mb-6 max-h-[400px] overflow-y-auto text-sm leading-relaxed whitespace-pre-wrap selection:bg-indigo-100 italic">
                  {previewMessage}
                </div>

                <button 
                  onClick={() => handleSendClick(previewLead)}
                  disabled={loading}
                  className="w-full h-12 bg-white text-indigo-950 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-slate-100 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
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

      <Modal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title={`Outreach for ${modalLead?.name}`}
      >
        <div className="space-y-6">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-2">
             <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Prospect Details</div>
             <p className="text-sm font-bold text-slate-700">{modalLead?.name}</p>
             <p className="text-xs text-slate-500 italic">{modalLead?.email || 'No email saved'}</p>
          </div>

          <div className="space-y-2 relative">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Message Content</label>
              <span className={`text-[10px] font-bold ${modalMessage.length > 500 ? 'text-amber-500' : 'text-slate-400'}`}>
                {modalMessage.length} characters
              </span>
            </div>
            <textarea 
              className="w-full h-56 p-5 rounded-2xl border-2 border-slate-100 focus:border-indigo-500 focus:ring-8 focus:ring-indigo-500/5 outline-none transition-all resize-none text-sm leading-relaxed text-slate-700 placeholder:italic shadow-inner"
              placeholder="What would you like to say? Personalized messages get 3x higher response rates."
              value={modalMessage}
              onChange={(e) => setModalMessage(e.target.value)}
            />
            {modalMessage.length === 0 && (
              <button 
                onClick={() => { handleGenerate(modalLead); setModalOpen(false); }}
                className="absolute bottom-4 right-4 flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-all border border-indigo-100"
              >
                <Wand2 size={14} /> Draft with AI
              </button>
            )}
          </div>

          <div className="flex gap-4">
            <button 
              onClick={() => setModalOpen(false)}
              className="flex-1 h-12 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all"
            >
              Cancel
            </button>
            <button 
              onClick={() => performSend(modalLead, modalMessage)}
              disabled={!modalMessage.trim() || loading}
              className="flex-[2] h-12 bg-indigo-600 text-white font-bold rounded-xl flex items-center justify-center gap-3 hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
              Confirm & Send to Prospect
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
