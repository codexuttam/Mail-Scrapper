"use client"
import { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Mail, Trash2, Send, Wand2, RefreshCw, CheckCircle2, AlertCircle, Calendar, MapPin, X, Zap, Loader2, Search, MessageCircle, MessageSquare, AlertTriangle, Copy, TrendingUp, ExternalLink, Tag, Plus, PieChart, Download, Stethoscope, Utensils, Dumbbell, Store, Briefcase } from 'lucide-react'
import { LeadSkeleton } from '../../components/Skeleton'

function formatDate(iso) {
  try {
    const date = new Date(iso)
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date)
  } catch (e) { return iso }
}

function formatRelativeTime(iso) {
  try {
    const date = new Date(iso)
    const now = new Date()
    const diffInSeconds = Math.floor((now - date) / 1000)
    
    if (diffInSeconds < 60) return 'just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
    
    return formatDate(iso)
  } catch (e) { return iso }
}

function getLeadIcon(name = '', type = '') {
  const n = (name || '').toLowerCase()
  const t = (type || '').toLowerCase()
  if (n.includes('dental') || n.includes('clinic') || t.includes('health')) return <Stethoscope size={16} />
  if (n.includes('restaurant') || n.includes('cafe') || n.includes('food') || t.includes('food')) return <Utensils size={16} />
  if (n.includes('gym') || n.includes('fitness') || t.includes('gym')) return <Dumbbell size={16} />
  if (n.includes('store') || n.includes('shop') || t.includes('retail')) return <Store size={16} />
  return <Briefcase size={16} />
}
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

function LeadRow({ lead, onGenerate, onSend, onDelete, onMagic, isMagicLoading, onUpdate, isSelected, onToggleSelect }) {
  const [notes, setNotes] = useState(lead.notes || '')
  const [isUpdating, setIsUpdating] = useState(false)

  const handleNotesBlur = async () => {
    if (notes !== lead.notes) {
      setIsUpdating(true)
      await onUpdate(lead._id, { notes })
      setIsUpdating(false)
    }
  }

  const handleStatusChange = async (newStatus) => {
    setIsUpdating(true)
    await onUpdate(lead._id, { status: newStatus })
    setIsUpdating(false)
  }

  const [tagInput, setTagInput] = useState('')
  const [showTagInput, setShowTagInput] = useState(false)

  const handleAddTag = async (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      const newTags = [...(lead.tags || []), tagInput.trim()]
      setIsUpdating(true)
      await onUpdate(lead._id, { tags: newTags })
      setTagInput('')
      setShowTagInput(false)
      setIsUpdating(false)
    }
  }

  const removeTag = async (tagToRemove) => {
    const newTags = (lead.tags || []).filter(t => t !== tagToRemove)
    setIsUpdating(true)
    await onUpdate(lead._id, { tags: newTags })
    setIsUpdating(false)
  }

  return (
    <div className={`glass-card mb-4 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 card-hover border-l-4 transition-all ${isSelected ? 'border-l-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/10' : 'border-l-transparent hover:border-l-indigo-500'}`}>
      <div className="flex items-start gap-4 flex-1">
        <div className="pt-1.5">
           <input 
             type="checkbox" 
             checked={isSelected} 
             onChange={() => onToggleSelect(lead._id)}
             className="w-5 h-5 rounded-lg text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-700 dark:bg-slate-800 cursor-pointer"
           />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <Link href={`/dashboard/${lead._id}`} className="hover:underline flex items-center gap-2">
              <div className="p-1 bg-slate-100 dark:bg-slate-800 rounded text-slate-500">
                {getLeadIcon(lead.name, lead.type)}
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">{lead.name}</h3>
            </Link>
            
            <select 
              value={lead.status || 'new'} 
              onChange={(e) => handleStatusChange(e.target.value)}
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider outline-none cursor-pointer transition-all ${
                lead.status === 'sent' ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800' :
                lead.status === 'interested' ? 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800' :
                lead.status === 'replied' ? 'bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800' :
                lead.status === 'rejected' ? 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800' :
                'bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800'
              }`}
            >
              <option value="new">New</option>
              <option value="sent">Sent</option>
              <option value="interested">Interested</option>
              <option value="replied">Replied</option>
              <option value="rejected">Rejected</option>
            </select>

            {isUpdating && <Loader2 size={12} className="animate-spin text-slate-400" />}
            
            {lead.score > 0 && (
              <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-100 text-[10px] font-black dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800">
                <Zap size={10} fill="currentColor" />
                {lead.score}/100
              </div>
            )}

            {lead.source && (
              <div className="flex items-center gap-1 bg-slate-50 text-slate-500 px-2 py-0.5 rounded-full border border-slate-100 text-[10px] font-black dark:bg-slate-900/20 dark:text-slate-400 dark:border-slate-800">
                <Search size={10} />
                {lead.source}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-2">
            <MapPin size={14} className="text-slate-400" />
            <span className="truncate max-w-xs">{lead.address}</span>
          </div>
          
          {lead.summary && (
            <div className="mb-3 p-2 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-lg border border-indigo-100/50 dark:border-indigo-800/50">
               <p className="text-[11px] font-medium text-indigo-900 dark:text-indigo-200 leading-relaxed italic">"{lead.summary}"</p>
            </div>
          )}
          
          <div className="mb-3 flex flex-wrap gap-2 items-center">
             {(lead.tags || []).map((tag, i) => (
               <span key={i} className="flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold dark:bg-slate-800 dark:text-slate-400">
                 {tag}
                 <button onClick={() => removeTag(tag)} className="hover:text-rose-500"><X size={10} /></button>
               </span>
             ))}
             {showTagInput ? (
               <input 
                 autoFocus
                 type="text" 
                 className="bg-slate-50 border border-indigo-200 text-[10px] py-0.5 px-2 rounded outline-none w-24 dark:bg-slate-800 dark:border-indigo-900"
                 value={tagInput}
                 onChange={(e) => setTagInput(e.target.value)}
                 onKeyDown={handleAddTag}
                 onBlur={() => setShowTagInput(false)}
                 placeholder="Press Enter"
               />
             ) : (
               <button 
                 onClick={() => setShowTagInput(true)}
                 className="text-slate-400 hover:text-indigo-600 flex items-center gap-1 text-[10px] font-bold"
               >
                 <Plus size={12} /> Add Tag
               </button>
             )}
          </div>

          <div className="mb-3">
            <input 
              type="text" 
              placeholder="Add a private note..." 
              className="w-full bg-slate-50 border-none text-[11px] py-1 px-2 rounded focus:ring-1 focus:ring-indigo-200 outline-none placeholder:italic placeholder:text-slate-300 text-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:placeholder:text-slate-600"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={handleNotesBlur}
            />
          </div>

          <div className="flex flex-wrap gap-4 items-center">
             <Link href={`/dashboard/${lead._id}`} className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-md transition-colors">
                <ExternalLink size={12} />
                View Details
             </Link>
             <div className="flex items-center gap-1.5 text-xs font-medium">
                <Mail size={12} className={lead.email ? "text-indigo-400" : "text-slate-300"} />
                {lead.email ? (
                  <span className="text-slate-600 font-bold dark:text-slate-400">{lead.email}</span>
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
                  {formatRelativeTime(lead.lastSentAt)}
               </div>
             )}
             {lead.website && (
               <a href={lead.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs font-bold text-indigo-500 hover:text-indigo-700 transition-colors bg-indigo-50 px-2 py-1 rounded-md dark:bg-indigo-900/30 dark:text-indigo-400">
                 Website
               </a>
             )}
             {lead.socials && Object.values(lead.socials).some(Boolean) && (
               <div className="flex items-center gap-2 border-l border-slate-200 pl-3 dark:border-slate-800">
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
          onClick={() => {
            const details = `Name: ${lead.name}\nEmail: ${lead.email || 'N/A'}\nPhone: ${lead.phone || 'N/A'}\nAddress: ${lead.address || 'N/A'}\nWebsite: ${lead.website || 'N/A'}\nStatus: ${lead.status || 'new'}\nScore: ${lead.score || 0}/100\nTags: ${(lead.tags || []).join(', ')}\nNotes: ${lead.notes || ''}`;
            navigator.clipboard.writeText(details);
            alert('Lead details copied to clipboard!');
          }} 
          className="p-2.5 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
          title="Copy Details to Clipboard"
        >
          <Copy size={18} />
        </button>
        <button 
          onClick={async () => {
            setIsUpdating(true)
            const res = await fetch('/api/leads/score', {
              method: 'POST',
              body: JSON.stringify({ id: lead._id }),
              headers: { 'Content-Type': 'application/json' }
            })
            const data = await res.json()
            if (data.lead) onUpdate(lead._id, data.lead)
            setIsUpdating(false)
          }} 
          className="p-2.5 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors"
          title="Calculate Lead Score"
        >
          <TrendingUp size={18} />
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

function LeadGrowthChart({ leads }) {
  const last7Days = [...Array(7)].map((_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - i)
    return d.toISOString().split('T')[0]
  }).reverse()

  const data = last7Days.map(date => ({
    date,
    count: leads.filter(l => l.createdAt?.split('T')[0] === date).length
  }))

  const max = Math.max(...data.map(d => d.count), 5)

  return (
    <div className="glass-card p-6 border-none shadow-sm h-full flex flex-col">
       <div className="flex items-center justify-between mb-6">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Lead Growth (7D)</h4>
          <TrendingUp size={14} className="text-emerald-500" />
       </div>
       <div className="flex-1 flex items-end gap-2 px-2">
          {data.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
               <div 
                 className="w-full bg-indigo-100 rounded-t-md group-hover:bg-indigo-500 transition-all relative"
                 style={{ height: `${(d.count / max) * 100}%`, minHeight: '4px' }}
               >
                 <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    {d.count}
                 </div>
               </div>
               <span className="text-[8px] font-bold text-slate-300 uppercase">{d.date.split('-')[2]}</span>
            </div>
          ))}
       </div>
    </div>
  )
}

function StatusDistributionChart({ leads }) {
  const statuses = ['new', 'sent', 'interested', 'replied', 'rejected']
  const data = statuses.map(s => ({
    status: s,
    count: leads.filter(l => (l.status || 'new') === s).length
  }))

  const colors = {
    new: 'bg-indigo-400',
    sent: 'bg-emerald-400',
    interested: 'bg-blue-400',
    replied: 'bg-purple-400',
    rejected: 'bg-rose-400'
  }

  return (
    <div className="glass-card p-6 border-none shadow-sm h-full flex flex-col">
       <div className="flex items-center justify-between mb-6">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status Distribution</h4>
          <PieChart size={14} className="text-indigo-500" />
       </div>
       <div className="space-y-3">
          {data.map((d, i) => (
            <div key={i} className="space-y-1">
               <div className="flex justify-between text-[10px] font-bold uppercase tracking-tight">
                  <span className="text-slate-500">{d.status}</span>
                  <span className="text-slate-900">{d.count}</span>
               </div>
               <div className="w-full bg-slate-100 rounded-full h-1.5 dark:bg-slate-800">
                  <div 
                    className={`${colors[d.status]} h-full rounded-full transition-all duration-1000`} 
                    style={{ width: `${(d.count / (leads.length || 1)) * 100}%` }}
                  ></div>
               </div>
            </div>
          ))}
       </div>
    </div>
  )
}

function DashboardContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
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
  const [contactFilter, setContactFilter] = useState(searchParams.get('filter') || 'all') // all, email, phone
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest')
  const [currentPage, setCurrentPage] = useState(1)

  const updateFilters = (key, value) => {
    const params = new URLSearchParams(searchParams)
    if (value && value !== 'all') {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`${pathname}?${params.toString()}`)
  }
  const [showCleanupModal, setShowCleanupModal] = useState(false)
  const itemsPerPage = 5
  const itemsPerPageGrid = 5

  useEffect(() => {
    const f = searchParams.get('filter') || 'all'
    setContactFilter(f)
  }, [searchParams])

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

  const sortedLeads = [...filteredLeads].sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt)
    if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt)
    if (sortBy === 'score') return (b.score || 0) - (a.score || 0)
    if (sortBy === 'contacted') return new Date(b.lastSentAt || 0) - new Date(a.lastSentAt || 0)
    return 0
  })

  const totalPages = Math.ceil(sortedLeads.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedLeads = sortedLeads.slice(startIndex, startIndex + itemsPerPage)

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

  const [campaignType, setCampaignType] = useState('intro')

  async function handleGenerate(lead, type = campaignType) {
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
          channel: selectedChannel,
          campaignType: type
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
        body: JSON.stringify({ 
          name: lead.name, 
          type: lead.type || 'business', 
          location: lead.location || '', 
          tone: 'friendly', 
          leadId: lead._id,
          campaignType: 'intro'
        }),
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

  const [selectedLeads, setSelectedLeads] = useState([])

  const toggleSelect = (id) => {
    setSelectedLeads(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const toggleSelectAll = () => {
    if (selectedLeads.length === paginatedLeads.length) {
      setSelectedLeads([])
    } else {
      setSelectedLeads(paginatedLeads.map(l => l._id))
    }
  }

  const handleExport = () => {
    const selectedData = leads.filter(l => selectedLeads.includes(l._id))
    const headers = ['Name', 'Email', 'Phone', 'Address', 'Website', 'Status', 'Score', 'Tags', 'Notes']
    const csvContent = [
      headers.join(','),
      ...selectedData.map(l => [
        `"${l.name || ''}"`,
        `"${l.email || ''}"`,
        `"${l.phone || ''}"`,
        `"${l.address || ''}"`,
        `"${l.website || ''}"`,
        `"${l.status || ''}"`,
        `"${l.score || 0}"`,
        `"${(l.tags || []).join('; ')}"`,
        `"${l.notes || ''}"`
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `leads_export_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    setNotice({ type: 'success', message: `Exported ${selectedData.length} leads to CSV.` })
  }

  async function handleBulkDelete() {
    if (!confirm(`Delete ${selectedLeads.length} selected leads?`)) return
    setLoading(true)
    try {
      await Promise.all(selectedLeads.map(id => 
        fetch('/api/leads', { 
          method: 'DELETE', 
          body: JSON.stringify({ id }), 
          headers: { 'Content-Type': 'application/json' } 
        })
      ))
      setLeads(cur => cur.filter(l => !selectedLeads.includes(l._id)))
      setSelectedLeads([])
      setNotice({ type: 'success', message: `Successfully deleted ${selectedLeads.length} leads.` })
    } catch (err) {
      setNotice({ type: 'error', message: 'Bulk delete failed: ' + err.message })
    } finally {
      setLoading(false)
    }
  }

  async function handleBulkStatusUpdate(newStatus) {
    if (!confirm(`Update status to "${newStatus}" for ${selectedLeads.length} leads?`)) return
    setLoading(true)
    try {
      const res = await fetch('/api/leads', {
        method: 'PATCH',
        body: JSON.stringify({ ids: selectedLeads, updates: { status: newStatus } }),
        headers: { 'Content-Type': 'application/json' }
      })
      const data = await res.json()
      if (data.ok) {
        setLeads(cur => cur.map(l => selectedLeads.includes(l._id) ? { ...l, status: newStatus } : l))
        setSelectedLeads([])
        setNotice({ type: 'success', message: `Successfully updated ${selectedLeads.length} leads to ${newStatus}.` })
      } else {
        throw new Error(data.error)
      }
    } catch (err) {
      setNotice({ type: 'error', message: 'Bulk status update failed: ' + err.message })
    } finally {
      setLoading(false)
    }
  }

  async function handleUpdateLead(id, updates) {
    try {
      const res = await fetch('/api/leads', {
        method: 'PATCH',
        body: JSON.stringify({ id, updates }),
        headers: { 'Content-Type': 'application/json' }
      })
      const data = await res.json()
      if (data.lead) {
        setLeads(cur => cur.map(l => l._id === id ? data.lead : l))
      }
    } catch (err) {
      setNotice({ type: 'error', message: 'Update failed: ' + err.message })
    }
  }

  return (
    <div className="space-y-8 pb-12">
      {selectedLeads.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[90] animate-in slide-in-from-bottom-8">
           <div className="bg-indigo-600 text-white px-6 py-4 rounded-3xl shadow-2xl flex items-center gap-6 border border-white/20 backdrop-blur-xl">
              <div className="flex items-center gap-2">
                 <span className="w-6 h-6 rounded-full bg-white text-indigo-600 flex items-center justify-center text-xs font-black">{selectedLeads.length}</span>
                 <span className="text-sm font-bold">Leads Selected</span>
              </div>
              <div className="w-px h-6 bg-white/20"></div>
              <div className="flex items-center gap-3">
                  <button 
                    onClick={handleExport}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-xl transition-all text-sm font-bold border border-emerald-500/20"
                  >
                    <Download size={16} />
                    Export CSV
                  </button>
                 <button 
                   onClick={handleBulkDelete}
                   className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all text-sm font-bold"
                 >
                   <Trash2 size={16} />
                   Delete Selected
                 </button>
                 <button 
                   onClick={async () => {
                     if (!confirm(`Start AI outreach for ${selectedLeads.length} leads?`)) return;
                     setLoading(true);
                     try {
                       const res = await fetch('/api/bulk-outreach', {
                         method: 'POST',
                         body: JSON.stringify({ leadIds: selectedLeads }),
                         headers: { 'Content-Type': 'application/json' }
                       });
                       const data = await res.json();
                       if (data.ok) {
                         setNotice({ type: 'success', message: `Bulk outreach complete! Processed ${data.results.length} leads.` });
                         load();
                         setSelectedLeads([]);
                       } else {
                         throw new Error(data.error);
                       }
                     } catch (err) {
                       setNotice({ type: 'error', message: 'Bulk outreach failed: ' + err.message });
                     } finally {
                       setLoading(false);
                     }
                   }}
                   className="flex items-center gap-2 px-4 py-2 bg-white text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all text-sm font-bold shadow-xl"
                 >
                   <Zap size={16} fill="currentColor" />
                   AI Bulk Outreach
                 </button>
                 <button 
                   onClick={async () => {
                     setLoading(true);
                     try {
                       const res = await fetch('/api/webhooks/push', {
                         method: 'POST',
                         body: JSON.stringify({ leadIds: selectedLeads }),
                         headers: { 'Content-Type': 'application/json' }
                       });
                       const data = await res.json();
                       if (data.ok) {
                         setNotice({ type: 'success', message: data.message });
                         setSelectedLeads([]);
                       } else {
                         throw new Error(data.error);
                       }
                     } catch (err) {
                       setNotice({ type: 'error', message: 'CRM Push failed: ' + err.message });
                     } finally {
                       setLoading(false);
                     }
                   }}
                   className="flex items-center gap-2 px-4 py-2 bg-indigo-500/20 hover:bg-indigo-500/30 text-white rounded-xl transition-all text-sm font-bold border border-white/10"
                 >
                   <ExternalLink size={16} />
                   Push to CRM
                 </button>
                  <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-xl border border-white/5">
                     <span className="text-[10px] font-black uppercase opacity-60">Status:</span>
                     <select 
                       onChange={(e) => handleBulkStatusUpdate(e.target.value)}
                       className="bg-transparent text-sm font-bold outline-none cursor-pointer"
                       defaultValue=""
                     >
                       <option value="" disabled className="text-slate-900">Change...</option>
                       <option value="new" className="text-slate-900">New</option>
                       <option value="sent" className="text-slate-900">Sent</option>
                       <option value="interested" className="text-slate-900">Interested</option>
                       <option value="replied" className="text-slate-900">Replied</option>
                       <option value="rejected" className="text-slate-900">Rejected</option>
                     </select>
                  </div>
                  <button 
                    onClick={() => setSelectedLeads([])}
                    className="text-white/60 hover:text-white transition-colors"
                  >
                    <X size={20} />
                  </button>
              </div>
           </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="relative">
          <div className="absolute -left-4 top-0 w-1 h-full bg-indigo-600 rounded-full shadow-[0_0_15px_rgba(79,70,229,0.5)]"></div>
          <h1 className="text-4xl font-black text-indigo-950 tracking-tight">Welcome, {firstName}!</h1>
          <p className="text-slate-500 font-medium mt-1">Your lead generation pipeline is looking sharp.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={() => {
              const headers = ['Name', 'Email', 'Phone', 'Address', 'Website', 'Status', 'Date Found'];
              const rows = leads.map(l => [
                l.name,
                l.email || '',
                l.phone || '',
                l.address || '',
                l.website || '',
                l.status || 'new',
                l.createdAt || ''
              ]);
              
              const csvContent = [
                headers.join(','),
                ...rows.map(r => r.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
              ].join('\n');
              
              const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.setAttribute('href', url);
              link.setAttribute('download', `leads_export_${new Date().toISOString().split('T')[0]}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            disabled={loading || leads.length === 0}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl border border-slate-200 text-slate-500 text-xs font-bold hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 transition-all active:scale-95 disabled:opacity-50"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Export CSV
          </button>
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
          <button 
            onClick={() => {
              const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(leads, null, 2));
              const downloadAnchorNode = document.createElement('a');
              downloadAnchorNode.setAttribute("href", dataStr);
              downloadAnchorNode.setAttribute("download", `leads_export_${new Date().toISOString().split('T')[0]}.json`);
              document.body.appendChild(downloadAnchorNode);
              downloadAnchorNode.click();
              downloadAnchorNode.remove();
            }}
            disabled={loading || leads.length === 0}
            className="p-3 rounded-2xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-all"
            title="Export JSON"
          >
            <div className="flex items-center gap-2 text-xs font-bold">
               <span className="uppercase text-[10px]">JSON</span>
            </div>
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-6 gap-4">
        <div className="lg:col-span-4 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
           {[
             { label: 'Total Leads', value: leads.length, color: 'indigo', icon: Search },
             { label: 'Contacted', value: leads.filter(l => l.status === 'sent').length, color: 'emerald', icon: Send },
             { label: 'Interested', value: leads.filter(l => l.status === 'interested').length, color: 'blue', icon: MessageSquare },
             { label: 'High Potential', value: leads.filter(l => l.score >= 80).length, color: 'rose', icon: Zap },
             { label: 'Pending', value: leads.length - leads.filter(l => l.status === 'sent').length, color: 'amber', icon: Mail },
             { label: 'Success Rate', value: leads.length ? Math.round((leads.filter(l => l.status === 'sent').length / leads.length) * 100) + '%' : '0%', color: 'emerald', icon: TrendingUp },
           ].map((stat, i) => (
             <div key={i} className="glass-card p-4 border-none shadow-sm flex items-center gap-4 group hover:bg-white transition-all cursor-default">
                <div className={`p-3 rounded-xl bg-${stat.color}-50 text-${stat.color}-600 group-hover:scale-110 transition-transform`}>
                   <stat.icon size={20} />
                </div>
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">{stat.label}</p>
                   <p className="text-xl font-black text-slate-900">{stat.value}</p>
                </div>
             </div>
           ))}
        </div>
        <div className="lg:col-span-1">
           <StatusDistributionChart leads={leads} />
        </div>
        <div className="lg:col-span-1">
           <LeadGrowthChart leads={leads} />
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
             <div className="flex items-center gap-4">
                <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">{filteredLeads.length} Leads in Pipeline</span>
                <button 
                  onClick={toggleSelectAll}
                  className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline"
                >
                  {selectedLeads.length === paginatedLeads.length && paginatedLeads.length > 0 ? 'Deselect All' : 'Select Page'}
                </button>
             </div>
             
             <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'email', label: 'Has Email' },
                  { id: 'phone', label: 'Has Phone' }
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => { updateFilters('filter', f.id); setCurrentPage(1); }}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${contactFilter === f.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:bg-white/50'}`}
                  >
                    {f.label}
                  </button>
                ))}
             </div>
             <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
                <select 
                  value={sortBy}
                  onChange={(e) => { setSortBy(e.target.value); updateFilters('sort', e.target.value); setCurrentPage(1); }}
                  className="bg-transparent text-[10px] font-black uppercase tracking-wider px-3 py-1.5 outline-none cursor-pointer text-slate-500"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="score">Highest Score</option>
                  <option value="contacted">Last Contacted</option>
                </select>
             </div>
          </div>
          
          {loading && leads.length === 0 ? (
            <div className="space-y-4">
               {[1,2,3,4,5].map(i => (
                 <LeadSkeleton key={i} />
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
                  onUpdate={handleUpdateLead}
                  isSelected={selectedLeads.includes(l._id)}
                  onToggleSelect={toggleSelect}
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

                <div className="flex bg-white/10 rounded-xl p-1 mb-4 border border-white/5">
                   {[
                     { id: 'intro', label: 'Intro' },
                     { id: 'offer', label: 'Offer' },
                     { id: 'partnership', label: 'Partnership' },
                     { id: 'followup', label: 'Follow-up' }
                   ].map(ct => (
                     <button
                       key={ct.id}
                       onClick={() => { setCampaignType(ct.id); handleGenerate(previewLead, ct.id); }}
                       className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${campaignType === ct.id ? 'bg-indigo-500 text-white shadow-sm' : 'text-indigo-300 hover:bg-white/5'}`}
                     >
                       {ct.label}
                     </button>
                   ))}
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
