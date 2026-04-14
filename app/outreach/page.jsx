"use client"
import { useEffect, useState } from 'react'
import { Mail, Send, CheckCircle2, AlertCircle, Loader2, Play, Pause, RefreshCw, Smartphone, Monitor, ChevronRight } from 'lucide-react'

export default function OutreachPage() {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(false)
  const [isAutomating, setIsAutomating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [notices, setNotices] = useState([])

  async function loadLeads() {
    setLoading(true)
    try {
      const res = await fetch('/api/leads')
      const data = await res.json()
      // Filter leads that have emails and haven't been contacted or were contacted long ago
      const actionable = (data.leads || []).filter(l => l.email && l.status !== 'sent')
      setLeads(actionable)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadLeads() }, [])

  async function sendOne(lead) {
     // Generate AI message first
     const genRes = await fetch('/api/generate', {
       method: 'POST',
       body: JSON.stringify({ name: lead.name, type: 'business', location: lead.location || '', tone: 'friendly', leadId: lead._id }),
       headers: { 'Content-Type': 'application/json' }
     })
     const genData = await genRes.json()
     if (genData.error) return { ok: false, error: genData.error }

     // Send the email
     const sendRes = await fetch('/api/send-email', {
       method: 'POST',
       body: JSON.stringify({ 
         to: lead.email, 
         subject: `Modernizing the digital presence for ${lead.name}`, 
         text: genData.message, 
         leadId: lead._id 
       }),
       headers: { 'Content-Type': 'application/json' }
     })
     return await sendRes.json()
  }

  async function startAutomation() {
    if (leads.length === 0) return
    setIsAutomating(true)
    let count = 0
    for (const lead of leads) {
      if (!isAutomating && count > 0) break // stop if paused
      try {
        const res = await sendOne(lead)
        if (res.ok) {
           setLeads(cur => cur.filter(l => l._id !== lead._id))
           setNotices(cur => [{ name: lead.name, status: 'Sent', time: 'Just now' }, ...cur].slice(0, 5))
        }
      } catch (e) {
        console.error(e)
      }
      count++
      setProgress(Math.round((count / leads.length) * 100))
      // Add a small delay between emails to avoid spam filters
      await new Promise(r => setTimeout(r, 2000))
    }
    setIsAutomating(false)
    setProgress(0)
  }

  return (
    <div className="space-y-8 animate-in pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-indigo-950">Outreach Automation</h1>
          <p className="text-slate-500">Automate your "Website Building" offers to startups and cafes.</p>
        </div>
        <div className="flex gap-2">
           <button 
             onClick={loadLeads} 
             className="p-3 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all"
           >
              <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
           </button>
           <button 
             onClick={() => isAutomating ? setIsAutomating(false) : startAutomation()}
             disabled={leads.length === 0}
             className={`btn-premium flex items-center gap-2 px-6 ${isAutomating ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-200' : ''}`}
           >
             {isAutomating ? (
               <><Pause size={20} fill="currentColor" /> Pause Automation</>
             ) : (
               <><Play size={20} fill="currentColor" /> Start Campaign ({leads.length})</>
             )}
           </button>
        </div>
      </div>

      {isAutomating && (
        <div className="bg-indigo-900 rounded-2xl p-6 text-white shadow-xl animate-in">
           <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                    <Loader2 size={24} className="animate-spin text-indigo-300" />
                 </div>
                 <div>
                    <h3 className="font-bold">Automation in Progress</h3>
                    <p className="text-xs text-indigo-300">Sending AI-powered website offers...</p>
                 </div>
              </div>
              <span className="text-2xl font-black">{progress}%</span>
           </div>
           <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-400 transition-all duration-500" style={{ width: `${progress}%` }}></div>
           </div>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        <div className="glass-card p-6 border-b-4 border-b-indigo-500">
           <p className="text-xs font-bold text-slate-500 uppercase mb-2 tracking-widest">Ready to Send</p>
           <h3 className="text-4xl font-extrabold text-indigo-900">{leads.length}</h3>
        </div>
        <div className="glass-card p-6 border-b-4 border-b-emerald-500">
           <p className="text-xs font-bold text-slate-500 uppercase mb-2 tracking-widest">Efficiency</p>
           <h3 className="text-4xl font-extrabold text-emerald-600">92%</h3>
        </div>
        <div className="glass-card p-6 border-b-4 border-b-amber-500">
           <p className="text-xs font-bold text-slate-500 uppercase mb-2 tracking-widest">Today's Goal</p>
           <h3 className="text-4xl font-extrabold text-amber-600">50</h3>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr,350px] gap-8">
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-6 border-b bg-slate-50/50 flex items-center justify-between">
            <h2 className="font-bold text-slate-800">Pending Leads with Emails</h2>
            <span className="text-xs font-bold bg-indigo-100 text-indigo-600 px-2 py-1 rounded-full">{leads.length} found</span>
          </div>
          <div className="divide-y max-h-[600px] overflow-y-auto">
            {leads.length > 0 ? leads.map((l, i) => (
              <div key={l._id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                     <Mail size={18} />
                  </div>
                  <div>
                     <p className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{l.name}</p>
                     <p className="text-xs text-slate-400 font-mono">{l.email}</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
              </div>
            )) : (
              <div className="p-20 text-center text-slate-400">
                 <Mail size={48} className="mx-auto mb-4 opacity-10" />
                 <p className="italic">No pending leads with emails. Go to "Find Leads" and capture some!</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
           <div className="bg-indigo-950 rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl -translate-y-16 translate-x-16"></div>
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                 <Monitor size={18} className="text-indigo-400" />
                 Live Activity
              </h3>
              <div className="space-y-4">
                 {notices.length > 0 ? notices.map((n, i) => (
                   <div key={i} className="flex items-center gap-3 animate-in">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px]">
                         <Send size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                         <p className="text-xs font-bold truncate">{n.name}</p>
                         <p className="text-[10px] text-indigo-400">{n.time}</p>
                      </div>
                      <span className="text-[10px] font-black text-emerald-400 uppercase">{n.status}</span>
                   </div>
                 )) : (
                   <p className="text-xs text-indigo-400 italic">No activity yet in this session.</p>
                 )}
              </div>
           </div>

           <div className="bg-white rounded-3xl p-6 border border-slate-200">
              <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                 <Smartphone size={18} className="text-indigo-600" />
                 Automation Mode
              </h4>
              <ul className="space-y-3">
                 <li className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-600"></div>
                    AI-Personalized drafted per lead
                 </li>
                 <li className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-600"></div>
                    2-second delay between sends
                 </li>
                 <li className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-600"></div>
                    Automatic CRM status update
                 </li>
              </ul>
           </div>
        </div>
      </div>
    </div>
  )
}
