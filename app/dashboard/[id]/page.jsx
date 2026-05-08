"use client"
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Mail, Phone, MapPin, Globe, Calendar, Tag, MessageSquare, Save, Trash2, Loader2, ExternalLink } from 'lucide-react'
import Link from 'next/link'

export default function LeadDetailsPage() {
  const { id } = useParams()
  const router = useRouter()
  const [lead, setLead] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [notes, setNotes] = useState('')

  useEffect(() => {
    async function fetchLead() {
      try {
        const res = await fetch(`/api/leads/${id}`)
        const data = await res.json()
        if (data.lead) {
          setLead(data.lead)
          setNotes(data.lead.notes || '')
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchLead()
  }, [id])

  const handleSaveNotes = async () => {
    setSaving(true)
    try {
      await fetch('/api/leads', {
        method: 'PATCH',
        body: JSON.stringify({ id, updates: { notes } }),
        headers: { 'Content-Type': 'application/json' }
      })
    } catch (err) {
      alert('Failed to save notes')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-8 text-center animate-pulse text-slate-400">Loading lead details...</div>
  if (!lead) return <div className="p-8 text-center text-rose-500 font-bold">Lead not found.</div>

  return (
    <div className="space-y-6 pb-12">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors mb-4 group">
         <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
         Back to Pipeline
      </Link>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
           <div className="glass-card p-8 dark:bg-slate-900/50">
              <div className="flex items-start justify-between mb-8">
                 <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">{lead.name}</h1>
                    <div className="flex items-center gap-2">
                       <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                         lead.status === 'sent' ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400'
                       }`}>
                          {lead.status || 'New'}
                       </span>
                       <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                          <Calendar size={12} />
                          Found on {new Date(lead.createdAt).toLocaleDateString()}
                       </span>
                    </div>
                 </div>
                 <div className="flex gap-2">
                    {lead.website && (
                      <a href={lead.website} target="_blank" rel="noreferrer" className="p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all dark:bg-slate-800 dark:text-slate-400">
                         <Globe size={20} />
                      </a>
                    )}
                 </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                 <div className="space-y-4">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-2 dark:border-slate-800">Contact Info</h3>
                    <div className="space-y-3">
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center dark:bg-indigo-900/30 dark:text-indigo-400">
                             <Mail size={16} />
                          </div>
                          <div>
                             <p className="text-[10px] font-bold text-slate-400 uppercase">Email</p>
                             <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{lead.email || 'Not found'}</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center dark:bg-emerald-900/30 dark:text-emerald-400">
                             <Phone size={16} />
                          </div>
                          <div>
                             <p className="text-[10px] font-bold text-slate-400 uppercase">Phone</p>
                             <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{lead.phone || 'Not found'}</p>
                          </div>
                       </div>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-2 dark:border-slate-800">Location</h3>
                    <div className="flex items-start gap-3">
                       <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center dark:bg-rose-900/30 dark:text-rose-400">
                          <MapPin size={16} />
                       </div>
                       <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Address</p>
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">{lead.address}</p>
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           <div className="glass-card p-8 dark:bg-slate-900/50">
              <div className="flex items-center justify-between mb-6">
                 <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <MessageSquare size={16} className="text-indigo-600" />
                    Internal Notes
                 </h3>
                 {saving && <Loader2 size={14} className="animate-spin text-indigo-600" />}
              </div>
              <textarea 
                className="w-full h-40 p-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all resize-none text-sm leading-relaxed text-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:placeholder:text-slate-600"
                placeholder="Keep track of your interactions with this lead..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                onBlur={handleSaveNotes}
              />
              <p className="mt-3 text-[10px] text-slate-400 italic">Changes are saved automatically when you click away.</p>
           </div>
        </div>

        <div className="space-y-6">
           <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              <h3 className="text-lg font-black mb-4">Quick Actions</h3>
              <div className="space-y-3">
                 <button className="w-full py-3 bg-white text-indigo-600 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-indigo-50 transition-all active:scale-95 shadow-lg">
                    <Mail size={16} />
                    Send AI Outreach
                 </button>
                 {lead.phone && (
                   <button className="w-full py-3 bg-emerald-500 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all active:scale-95 shadow-lg">
                      <MessageSquare size={16} />
                      Chat on WhatsApp
                   </button>
                 )}
                 <button className="w-full py-3 bg-white/10 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-white/20 transition-all active:scale-95 border border-white/10">
                    <Tag size={16} />
                    Change Status
                 </button>
              </div>
           </div>

           <div className="glass-card p-6 border-2 border-dashed border-slate-200 dark:border-slate-800 text-center">
              <Trash2 size={32} className="mx-auto mb-4 text-rose-200" />
              <p className="text-sm font-bold text-slate-400 mb-4">No longer interested?</p>
              <button 
                onClick={() => {
                  if (confirm('Delete this lead?')) {
                    fetch('/api/leads', { 
                      method: 'DELETE', 
                      body: JSON.stringify({ id }), 
                      headers: { 'Content-Type': 'application/json' } 
                    }).then(() => router.push('/dashboard'))
                  }
                }}
                className="text-xs font-black text-rose-500 uppercase tracking-widest hover:underline"
              >
                Delete Lead Permanently
              </button>
           </div>
        </div>
      </div>
    </div>
  )
}
