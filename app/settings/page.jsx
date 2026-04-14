"use client"
import { useState } from 'react'
import { Settings, User, Bell, Shield, Key, Mail, Save, Zap } from 'lucide-react'

export default function SettingsPage() {
  const [loading, setLoading] = useState(false)

  return (
    <div className="space-y-8 animate-in max-w-4xl">
      <div>
        <h1 className="text-3xl font-extrabold text-indigo-950">Settings</h1>
        <p className="text-slate-500">Manage your account preferences and API integrations.</p>
      </div>

      <div className="grid md:grid-cols-[240px,1fr] gap-8">
        <aside className="space-y-1">
          <button className="w-full flex items-center gap-3 px-4 py-2 text-sm font-bold text-indigo-600 bg-indigo-50 rounded-lg text-left">
            <User size={18} /> General
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg text-left transition-colors">
            <Mail size={18} /> Email Provider
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg text-left transition-colors">
            <Key size={18} /> API Keys
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg text-left transition-colors">
            <Bell size={18} /> Notifications
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg text-left transition-colors">
            <Shield size={18} /> Security
          </button>
        </aside>

        <div className="space-y-6">
          <div className="glass-card p-6 space-y-6">
            <div className="space-y-4">
              <h3 className="font-bold text-lg text-slate-900 border-b pb-2">Profile Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
                  <input type="text" defaultValue="John Smith" className="input-modern" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Email Address</label>
                  <input type="email" defaultValue="john@example.com" className="input-modern" />
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <h3 className="font-bold text-lg text-slate-900 border-b pb-2">API Integrations</h3>
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Google Maps API Key</label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="password" 
                    placeholder="AIza..." 
                    defaultValue={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}
                    className="input-modern pl-10" 
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Required for "Google Places" search and interactive maps. In development, add this to .env.local as <code className="text-indigo-600">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code>.</p>
              </div>

              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold text-slate-500 uppercase">OpenAI API Key</label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input type="password" placeholder="sk-..." className="input-modern pl-10" />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Used for generating personalized outreach messages.</p>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
               <button 
                 onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 1000) }}
                 className="btn-premium flex items-center gap-2 px-8"
               >
                 {loading ? <Zap size={18} className="animate-spin" /> : <Save size={18} />}
                 Save Changes
               </button>
            </div>
          </div>
          
          <div className="bg-rose-50 border border-rose-100 rounded-2xl p-6">
             <h4 className="font-bold text-rose-900 mb-1">Danger Zone</h4>
             <p className="text-sm text-rose-700 mb-4">Deleting your account will permanently erase all lead data and campaign history.</p>
             <button className="text-sm font-bold text-rose-600 hover:text-rose-700 underline">Delete My Account</button>
          </div>
        </div>
      </div>
    </div>
  )
}
