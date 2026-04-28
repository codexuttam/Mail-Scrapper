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
                    const url = `https://web.whatsapp.com/send?phone=${final}`;
                    window.open(url, '_blank', 'noopener,noreferrer');
                  }}
                  className="text-slate-500 font-bold flex items-center gap-1.5 hover:text-emerald-600 transition-colors"
                >
                   {lead.phone}
                </button>
              ) : (
                <span className="text-rose-300 italic font-medium flex items-center gap-1">
                   No Email Found 
                   <span className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-pulse inline-block"></span>
                </span>
              )}
           </div>
           {lead.lastSentAt && (
             <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                <Calendar size={12} />
                {formatDate(lead.lastSentAt)}
             </div>
           )}
           {lead.website && (
             <a href={lead.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs font-bold text-indigo-500 hover:text-indigo-700 transition-colors bg-indigo-50 px-2 py-1 rounded-md">
               Website
             </a>
           )}
           {lead.socials && Object.values(lead.socials).some(Boolean) && (
             <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
                {lead.socials.instagram && (
                  <a href={lead.socials.instagram} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-pink-600 transition-colors" title="Instagram">
                    <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                  </a>
                )}
                {lead.socials.facebook && (
                  <a href={lead.socials.facebook} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-blue-600 transition-colors" title="Facebook">
                    <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                  </a>
                )}
                {lead.socials.linkedin && (
                  <a href={lead.socials.linkedin} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-blue-500 transition-colors" title="LinkedIn">
                    <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                  </a>
                )}
                {lead.socials.twitter && (
                  <a href={lead.socials.twitter} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-sky-500 transition-colors" title="Twitter/X">
                    <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>
                  </a>
                )}
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
                window.open(`https://web.whatsapp.com/send?phone=${final}`, '_blank', 'noopener,noreferrer');
              }}
              className="p-2.5 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-all shadow-sm flex items-center justify-center border-none cursor-pointer group"
              title="Chat on WhatsApp"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="relative">
          <div className="absolute -left-4 top-0 w-1 h-full bg-indigo-600 rounded-full shadow-[0_0_15px_rgba(79,70,229,0.5)]"></div>
          <h1 className="text-4xl font-black text-indigo-950 tracking-tight">Welcome, {firstName}!</h1>
          <p className="text-slate-500 font-medium mt-1">Your lead generation pipeline is looking sharp.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={() => setShowCleanupModal(true)}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl border border-slate-200 text-slate-500 text-xs font-bold hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-all active:scale-95 disabled:opacity-50"
          >
            <Trash2 size={14} />
            Clean Dead Leads
          </button>
          <button 
            onClick={load} 
            disabled={loading}
            className="px-6 py-3 rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-100 hover:shadow-indigo-300 hover:bg-indigo-700 transition-all flex items-center gap-2 font-bold text-sm active:scale-95"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            Refresh Pipeline
          </button>
        </div>
      </div>

      {/* Premium Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         {[
           { label: 'Total Leads', value: leads.length, color: 'indigo', icon: Search },
           { label: 'Contacted', value: leads.filter(l => l.status === 'sent').length, color: 'emerald', icon: Send },
           { label: 'Success Rate', value: leads.length ? Math.round((leads.filter(l => l.status === 'sent').length / leads.length) * 100) + '%' : '0%', color: 'amber', icon: Zap },
           { label: 'Pending', value: leads.length - leads.filter(l => l.status === 'sent').length, color: 'blue', icon: Mail },
         ].map((stat, i) => (
           <div key={i} className="glass-card p-4 border-none shadow-sm flex items-center gap-4 group hover:bg-white transition-all cursor-default">
              <div className={`p-3 rounded-xl bg-${stat.color}-50 text-${stat.color}-600 group-hover:scale-110 transition-transform`}>
                 <stat.icon size={20} />
              </div>
              <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                 <p className="text-xl font-black text-slate-900">{stat.value}</p>
              </div>
           </div>
         ))}
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
               {[1,2,3].map(i => (
                 <div key={i} className="h-28 bg-white/50 backdrop-blur-sm rounded-3xl border border-slate-100 flex items-center p-6 gap-4 animate-pulse">
                    <div className="w-12 h-12 bg-slate-200 rounded-2xl"></div>
                    <div className="flex-1 space-y-2">
                       <div className="h-4 bg-slate-200 rounded-full w-1/3"></div>
                       <div className="h-3 bg-slate-100 rounded-full w-1/4"></div>
                    </div>
                 </div>
               ))}
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
        <div className="bg-white">
          {/* Compact Lead Header */}
          <div className="px-4 py-2.5 bg-slate-50/50 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-[10px] shadow-sm">
                {modalLead?.name?.charAt(0)}
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-[11px] leading-tight">{modalLead?.name}</h4>
                <p className="text-[9px] text-slate-400 font-medium">{modalLead?.email || (modalLead?.phone ? modalLead.phone : 'No info')}</p>
              </div>
            </div>
            <div className="flex bg-slate-200/50 p-0.5 rounded-lg">
              {['email', 'whatsapp'].map(ch => (
                <button
                  key={ch}
                  onClick={() => setSelectedChannel(ch)}
                  className={`px-2 py-1 rounded-md text-[9px] font-bold transition-all ${selectedChannel === ch ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
                >
                  {ch === 'email' ? <Mail size={10} className="inline mr-1"/> : <MessageCircle size={10} className="inline mr-1"/>}
                  {ch.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 space-y-3">
            {selectedChannel === 'email' && (
              <div className="space-y-1">
                <input 
                  type="text"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all font-bold text-xs text-slate-800 placeholder:text-slate-300"
                  placeholder="Subject Line..."
                  value={modalSubject}
                  onChange={(e) => setModalSubject(e.target.value)}
                />
              </div>
            )}

            <div className="relative group">
              <textarea 
                className="w-full h-40 p-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all resize-none text-xs leading-relaxed text-slate-700 placeholder:text-slate-300"
                placeholder="Draft your message..."
                value={modalMessage}
                onChange={(e) => setModalMessage(e.target.value)}
              />
              <div className="absolute bottom-3 right-3 flex items-center gap-2">
                <span className="text-[9px] font-bold text-slate-300 bg-white/50 px-1.5 py-0.5 rounded-full">{modalMessage.length}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex bg-slate-100 p-1 rounded-xl">
                {['friendly', 'professional', 'assertive'].map(t => (
                  <button
                    key={t}
                    onClick={() => setModalTone(t)}
                    className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${modalTone === t ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <button 
                onClick={() => handleGenerate(modalLead)}
                disabled={loading}
                className="flex items-center gap-1.5 bg-indigo-600 text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-100/50 transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? <Loader2 size={10} className="animate-spin" /> : <Wand2 size={10} />}
                {modalMessage.length > 0 ? 'Refine AI' : 'Draft With AI'}
              </button>
            </div>
          </div>

          <div className="px-4 py-3 bg-slate-50 border-t flex gap-2">
            <button 
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 bg-white text-slate-400 text-[10px] font-bold rounded-xl border hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button 
              onClick={() => selectedChannel === 'whatsapp' ? (() => {
                  let cleaned = modalLead.phone?.replace(/[^0-9]/g, '') || '';
                  if (cleaned.startsWith('0')) cleaned = cleaned.substring(1);
                  const final = cleaned.length === 10 ? `91${cleaned}` : cleaned;
                  window.open(`https://web.whatsapp.com/send?phone=${final}&text=${encodeURIComponent(modalMessage)}`, '_blank');
                  setModalOpen(false);
              })() : performSend(modalLead, modalMessage)}
              disabled={!modalMessage.trim() || (selectedChannel === 'email' && !modalSubject.trim()) || loading}
              className="flex-1 py-2 bg-indigo-600 text-white font-black uppercase tracking-widest text-[10px] rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
              {selectedChannel === 'email' ? 'Send Email' : 'Open WhatsApp'}
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
