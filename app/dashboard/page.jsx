"use client"
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Mail, Trash2, Send, Wand2, RefreshCw, CheckCircle2, AlertCircle, Calendar, MapPin, X, Zap, Loader2, Search, MessageCircle, MessageSquare, AlertTriangle, Copy } from 'lucide-react'

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div onClick={onClose} className="absolute inset-0 z-0"></div>
      <div className="relative z-10 bg-white w-full max-w-lg rounded-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] animate-in zoom-in-95 duration-300 flex flex-col overflow-hidden border border-white/20">
        <div className="px-6 py-4 border-b flex items-center justify-between bg-white shrink-0">
          <h3 className="font-black text-base text-indigo-950 flex items-center gap-2">
             <div className="p-1 bg-indigo-600 rounded text-white">
                <Mail size={14} />
             </div>
            {title}
          </h3>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-full transition-all text-slate-400">
            <X size={18} />
          </button>
        </div>
        <div className="p-0 overflow-hidden">
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
           <div className="flex items-center gap-1.5 text-xs font-medium">
              <Mail size={12} className={lead.email ? "text-indigo-400" : "text-slate-300"} />
              {lead.email ? (
                <span className="text-slate-600 font-bold">{lead.email}</span>
              ) : lead.phone ? (
                <button 
                  onClick={() => {
                    let cleaned = lead.phone.replace(/[^0-9]/g, '');
                    if (cleaned.startsWith('0')) cleaned = cleaned.substring(1);
                    const final = cleaned.length === 10 ? `91${cleaned}` : cleaned;
                    const url = `https://wa.me/${final}`;
                    window.open(url, '_blank', 'noopener,noreferrer');
                  }}
                  className="text-slate-500 font-bold flex items-center gap-1.5 hover:text-emerald-600 transition-colors"
                >
                   {lead.phone}
                   <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-400 uppercase tracking-tighter">Phone only</span>
                </a>
              ) : (
                <span className="text-rose-300 italic font-medium flex items-center gap-1">
                   No Email Found 
                   <div className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-pulse"></div>
                </span>
              )}
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
          disabled={isMagicLoading || !lead.email}
          className={`p-2.5 rounded-lg text-white shadow-sm transition-all group relative overflow-hidden ${!lead.email ? 'bg-slate-200 cursor-not-allowed grayscale' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100 hover:shadow-indigo-200'}`}
          title={!lead.email ? "Requires Email Address" : "Magic Quick Send (AI Generate + Send)"}
        >
          {isMagicLoading ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} className="group-hover:scale-110 transition-transform" />}
          {lead.email && <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>}
        </button>
        <div className="w-px h-6 bg-slate-200 mx-1"></div>
        {lead.phone && (
          <div className="flex items-center gap-1">
            <button 
              onClick={() => {
                let cleaned = lead.phone.replace(/[^0-9]/g, '');
                if (cleaned.startsWith('0')) cleaned = cleaned.substring(1);
                const final = cleaned.length === 10 ? `91${cleaned}` : cleaned;
                window.open(`https://wa.me/${final}`, '_blank', 'noopener,noreferrer');
              }}
              className="p-2.5 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-all shadow-sm flex items-center justify-center border-none cursor-pointer"
              title="Chat on WhatsApp"
            >
              <MessageSquare size={18} />
            </button>
            <button 
              onClick={() => {
                let cleaned = lead.phone.replace(/[^0-9]/g, '');
                if (cleaned.startsWith('0')) cleaned = cleaned.substring(1);
                const final = cleaned.length === 10 ? `91${cleaned}` : cleaned;
                navigator.clipboard.writeText(final);
                // Simple feedback would be nice here, but we'll stick to the copy for now
              }}
              className="p-2.5 rounded-lg bg-slate-100 text-slate-400 hover:bg-slate-200 transition-all flex items-center justify-center border-none cursor-pointer"
              title="Copy WhatsApp Number"
            >
              <Copy size={16} />
            </button>
          </div>
        )}
        <button 
          onClick={() => onGenerate(lead)} 
          className="p-2.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
          title="Draft AI Message"
        >
          <Wand2 size={18} />
        </button>
        <button 
          onClick={() => onSend(lead)} 
          disabled={!lead.email}
          className={`p-2.5 rounded-lg transition-colors ${!lead.email ? 'bg-slate-50 text-slate-300 cursor-not-allowed' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}
          title={!lead.email ? "No Email Provided" : "Send Manual Outreach"}
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
  const [modalSubject, setModalSubject] = useState('')
  const [modalTone, setModalTone] = useState('friendly')
  const [contactFilter, setContactFilter] = useState('all') // all, email, phone
  const [currentPage, setCurrentPage] = useState(1)
  const [showCleanupModal, setShowCleanupModal] = useState(false)
  const itemsPerPage = 5

  useEffect(() => {
    if (modalOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [modalOpen])

  const filteredLeads = leads.filter(l => {
    const matchesSearch = l.name.toLowerCase().includes(searchQuery) || 
                          l.address?.toLowerCase().includes(searchQuery) ||
                          l.email?.toLowerCase().includes(searchQuery)
    
    if (contactFilter === 'email') return matchesSearch && !!l.email
    if (contactFilter === 'phone') return matchesSearch && !!l.phone
    return matchesSearch
  })

  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedLeads = filteredLeads.slice(startIndex, startIndex + itemsPerPage)

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
          tone: modalOpen ? modalTone : 'friendly', 
          leadId: lead._id,
          channel: selectedChannel 
        }),
        headers: { 'Content-Type': 'application/json' }
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      
      if (modalOpen) {
        setModalMessage(data.message || '')
      } else {
        setPreviewLead(lead)
        setPreviewMessage(data.message || '')
      }
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
        subject: modalSubject || 'Website help', 
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
      setModalSubject('Personalized outreach for ' + lead.name)
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

  async function cleanupIncomplete() {
    const incomplete = leads.filter(l => !l.email && !l.phone)
    if (incomplete.length === 0) {
      setNotice({ type: 'success', message: 'Perfect! No incomplete leads found.' })
      return
    }
    
    setLoading(true)
    setShowCleanupModal(false)
    try {
      for (const lead of incomplete) {
        await fetch('/api/leads', { 
          method: 'DELETE', 
          body: JSON.stringify({ id: lead._id }), 
          headers: { 'Content-Type': 'application/json' } 
        })
      }
      setLeads((cur) => cur.filter(l => l.email || l.phone))
      setNotice({ type: 'success', message: `Cleaned up ${incomplete.length} dead leads.` })
    } catch (err) {
      setNotice({ type: 'error', message: 'Cleanup failed: ' + err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-indigo-950">Welcome, {firstName}!</h1>
          <p className="text-slate-500">Manage your saved leads and track outreach progress.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={() => setShowCleanupModal(true)}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-500 text-xs font-bold hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-all active:scale-95 disabled:opacity-50"
          >
            <Trash2 size={14} />
            Clean Dead Leads
          </button>
          <button 
            onClick={load} 
            disabled={loading}
            className="btn-premium flex items-center gap-2"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            Refresh Pipeline
          </button>
        </div>
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
          <div className="flex flex-col md:flex-row md:items-center justify-between px-2 gap-4">
             <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">{filteredLeads.length} Leads in Pipeline</span>
             
             <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'email', label: 'Has Email' },
                  { id: 'phone', label: 'Has Phone' }
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => { setContactFilter(f.id); setCurrentPage(1); }}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${contactFilter === f.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:bg-white/50'}`}
                  >
                    {f.label}
                  </button>
                ))}
             </div>
          </div>
          
          {loading && leads.length === 0 ? (
            <div className="space-y-4">
               {[1,2,3].map(i => <div key={i} className="h-24 bg-slate-200/50 rounded-2xl animate-pulse"></div>)}
            </div>
          ) : leads.length > 0 ? (
            <div className="animate-in">
              {paginatedLeads.map((l) => (
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

              {totalPages > 1 && (
                <div className="flex items-center justify-between bg-white/50 backdrop-blur-sm p-4 rounded-3xl border border-slate-100 shadow-sm mt-8 animate-in slide-in-from-bottom-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">
                    Page {currentPage} of {totalPages}
                  </p>
                  <div className="flex items-center gap-1.5 font-bold">
                    <button 
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 bg-white rounded-xl border border-slate-100 text-slate-400 hover:text-indigo-600 disabled:opacity-30 transition-all text-xs"
                    >
                      Prev
                    </button>
                    <div className="flex gap-1">
                      {[...Array(totalPages)].map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentPage(i + 1)}
                          className={`w-9 h-9 rounded-xl text-xs transition-all ${currentPage === i + 1 ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white text-slate-400 hover:text-indigo-600'}`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                    <button 
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 bg-white rounded-xl border border-slate-100 text-slate-400 hover:text-indigo-600 disabled:opacity-30 transition-all text-xs"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
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
                     { id: 'dm', icon: MessageCircle, label: 'DM' },
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
        title="Direct Outreach"
      >
        <div className="flex flex-col bg-white">
          {/* Prospect Info Row */}
          <div className="px-5 py-3 bg-slate-50 flex items-center justify-between border-b border-slate-100">
             <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                   {modalLead?.name?.charAt(0)}
                </div>
                <div className="leading-none">
                   <h4 className="font-bold text-slate-900 text-xs">{modalLead?.name}</h4>
                   <p className="text-[10px] text-slate-500 font-medium mt-0.5">{modalLead?.email || 'No email saved'}</p>
                </div>
             </div>
             <span className="bg-indigo-100/50 text-indigo-700 text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider">Prospect</span>
          </div>

          <div className="p-5 space-y-4">
            {/* Subject Field */}
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Subject</label>
              <input 
                type="text"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 outline-none transition-all font-bold text-xs text-slate-800 placeholder:text-slate-300"
                placeholder="Message Subject..."
                value={modalSubject}
                onChange={(e) => setModalSubject(e.target.value)}
              />
            </div>

            {/* Message Body */}
            <div className="space-y-1">
              <div className="flex items-center justify-between ml-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Message</label>
                <div className="flex items-center gap-2">
                   <span className="text-[9px] font-bold text-slate-300">{modalMessage.length} / 1000</span>
                </div>
              </div>
              
              <textarea 
                className="w-full h-32 p-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none transition-all resize-none text-xs leading-relaxed text-slate-700 placeholder:text-slate-300 shadow-sm"
                placeholder="Draft your personalized message here..."
                value={modalMessage}
                onChange={(e) => setModalMessage(e.target.value)}
              />
            </div>

            {/* AI Controls Row */}
            <div className="flex items-center justify-between gap-2">
               <div className="flex items-center gap-2">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Tone:</span>
                  <select 
                    value={modalTone}
                    onChange={(e) => setModalTone(e.target.value)}
                    className="bg-transparent border-none text-[10px] font-black text-indigo-600 outline-none cursor-pointer"
                  >
                     <option value="friendly">Friendly</option>
                     <option value="professional">Professional</option>
                     <option value="assertive">Direct</option>
                  </select>
               </div>
               
               <button 
                onClick={() => handleGenerate(modalLead)}
                disabled={loading}
                className="flex items-center gap-1.5 bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-white border border-indigo-100 transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? <Loader2 size={10} className="animate-spin" /> : <Wand2 size={10} />}
                {modalMessage.length > 0 ? 'Refine' : 'AI Draft'}
              </button>
            </div>
          </div>

          <div className="px-5 py-4 bg-slate-50 border-t border-slate-100 flex gap-2">
            <button 
              onClick={() => setModalOpen(false)}
              className="px-4 h-10 bg-white text-slate-500 text-[11px] font-bold rounded-lg border border-slate-200 hover:bg-slate-50 transition-all active:scale-95"
            >
              Cancel
            </button>
            <button 
              onClick={() => performSend(modalLead, modalMessage)}
              disabled={!modalMessage.trim() || !modalSubject.trim() || loading}
              className="flex-1 h-10 bg-indigo-600 text-white font-black uppercase tracking-widest text-[11px] rounded-lg flex items-center justify-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              Send Outreach
            </button>
          </div>
        </div>
      </Modal>

      {/* Cleanup Confirmation Modal */}
      <Modal 
        isOpen={showCleanupModal}
        onClose={() => setShowCleanupModal(false)}
        title="Sanitize Workspace"
      >
        <div className="p-8 text-center bg-white">
          <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6 text-rose-500">
             <AlertTriangle size={40} className="animate-pulse" />
          </div>
          <h4 className="text-xl font-black text-slate-900 mb-2">Delete Dead Leads?</h4>
          <p className="text-slate-500 text-sm leading-relaxed mb-8">
            You are about to permanently remove <span className="font-black text-rose-600 underline">{(leads.filter(l => !l.email && !l.phone)).length} leads</span> that have no contact information. This action cannot be undone.
          </p>

          <div className="flex flex-col gap-3">
            <button 
               onClick={cleanupIncomplete}
               disabled={loading}
               className="w-full h-14 bg-rose-600 text-white font-black uppercase tracking-widest text-sm rounded-2xl flex items-center justify-center gap-3 hover:bg-rose-700 shadow-xl shadow-rose-500/20 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : <Trash2 size={20} />}
              Confirm Bulk Deletion
            </button>
            <button 
              onClick={() => setShowCleanupModal(false)}
              className="w-full h-12 bg-white text-slate-400 font-bold rounded-xl hover:bg-slate-50 transition-all active:scale-95"
            >
              Cancel & Keep Files
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
