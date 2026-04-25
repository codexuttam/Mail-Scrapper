"use client"
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Settings as SettingsIcon, User, Bell, Shield, Key, Mail, Save, Zap, CheckCircle2, Globe, Lock } from 'lucide-react'

export default function SettingsPage() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState('general')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    googleMapsApiKey: '',
    openaiApiKey: '',
    leadAlerts: true,
    outreachAlerts: true,
    milestoneAlerts: true
  })

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch('/api/settings')
        const data = await res.json()
        if (data.settings) {
          setFormData({
            fullName: data.settings.fullName || '',
            email: data.settings.email || '',
            googleMapsApiKey: data.settings.googleMapsApiKey || '',
            openaiApiKey: data.settings.openaiApiKey || '',
            leadAlerts: data.settings.leadAlerts ?? true,
            outreachAlerts: data.settings.outreachAlerts ?? true,
            milestoneAlerts: data.settings.milestoneAlerts ?? true
          })
        }
      } catch (err) {
        console.error('Failed to fetch settings', err)
      }
    }
    fetchSettings()
  }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    setLoading(true)
    setSuccess(false)
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      if (res.ok) {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      }
    } catch (err) {
      console.error('Failed to save settings', err)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleToggle = async (field) => {
    const newValue = !formData[field]
    const updatedData = { ...formData, [field]: newValue }
    setFormData(updatedData)
    
    // Auto-save toggle changes
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      })
    } catch (err) {
      console.error('Failed to save toggle', err)
    }
  }

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      alert("This browser does not support desktop notification")
      return
    }

    if (Notification.permission === "granted") {
      new Notification("Notifications already enabled!", {
        body: "You will receive alerts here.",
        icon: "/favicon.ico"
      })
      return
    }

    const permission = await Notification.requestPermission()
    if (permission === "granted") {
      new Notification("Aww yeah!", {
        body: "Notifications are now active.",
        icon: "/favicon.ico"
      })
    }
  }

  const navItems = [
    { id: 'general', label: 'General', icon: User },
    { id: 'api', label: 'API Keys', icon: Key },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
  ]

  return (
    <div className="space-y-8 animate-in max-w-4xl pb-20">
      <div>
        <h1 className="text-3xl font-extrabold text-indigo-950">Settings</h1>
        <p className="text-slate-500">Manage your account preferences and API integrations.</p>
      </div>

      <div className="grid md:grid-cols-[240px,1fr] gap-8">
        <aside className="space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-lg text-left transition-all ${
                activeTab === item.id 
                  ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-200' 
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <item.icon size={18} /> {item.label}
            </button>
          ))}
        </aside>

        <div className="space-y-6">
          {activeTab === 'general' && (
            <form onSubmit={handleSave} className="animate-in slide-in-from-right-4 duration-300">
              <div className="glass-card p-6 space-y-6">
                <div className="space-y-4">
                  <h3 className="font-bold text-lg text-slate-900 border-b pb-2">Profile Information</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
                      <input 
                        type="text" 
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder={session?.user?.name || "Uttamraj Singh"}
                        className="input-modern" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase">Email Address</label>
                      <input 
                        type="email" 
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder={session?.user?.email || "uttam@example.com"}
                        className="input-modern" 
                      />
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 flex items-center justify-end gap-4">
                  {success && (
                    <div className="flex items-center gap-1.5 text-emerald-600 text-sm font-bold animate-in zoom-in">
                      <CheckCircle2 size={16} /> Saved Successfully
                    </div>
                  )}
                  <button 
                    type="submit"
                    disabled={loading}
                    className="btn-premium flex items-center gap-2 px-8"
                  >
                    {loading ? <Zap size={18} className="animate-spin" /> : <Save size={18} />}
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </form>
          )}

          {activeTab === 'api' && (
            <form onSubmit={handleSave} className="animate-in slide-in-from-right-4 duration-300">
              <div className="glass-card p-6 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-2">
                    <h3 className="font-bold text-lg text-slate-900">API Integrations</h3>
                    <span className="text-[10px] font-bold bg-amber-50 text-amber-600 px-2 py-0.5 rounded border border-amber-100 uppercase tracking-tighter text-center">Required for Core Features</span>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Google Maps API Key</label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input 
                        type="password" 
                        name="googleMapsApiKey"
                        placeholder="AIza..." 
                        value={formData.googleMapsApiKey}
                        onChange={handleChange}
                        className="input-modern pl-10" 
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">Required for "Google Places" search and interactive maps.</p>
                  </div>

                  <div className="space-y-2 pt-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">OpenAI API Key</label>
                    <div className="relative">
                      <Zap className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input 
                        type="password" 
                        name="openaiApiKey"
                        placeholder="sk-..." 
                        value={formData.openaiApiKey}
                        onChange={handleChange}
                        className="input-modern pl-10" 
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">Used for generating personalized outreach messages with GPT-4.</p>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-end gap-4">
                  {success && (
                    <div className="flex items-center gap-1.5 text-emerald-600 text-sm font-bold animate-in zoom-in">
                      <CheckCircle2 size={16} /> Saved
                    </div>
                  )}
                  <button type="submit" disabled={loading} className="btn-premium flex items-center gap-2 px-8">
                    {loading ? <Zap size={18} className="animate-spin" /> : <Save size={18} />}
                    Update Keys
                  </button>
                </div>
              </div>
            </form>
          )}

          {activeTab === 'notifications' && (
            <div className="animate-in slide-in-from-right-4 duration-300 space-y-6">
              <div className="glass-card p-6">
                <h3 className="font-bold text-lg text-slate-900 border-b pb-2 mb-4">Notification Preferences</h3>
                <div className="space-y-4">
                  {[
                    { id: 'leadAlerts', label: 'New Lead Alerts', desc: 'Get notified when a new lead is found in your area.' },
                    { id: 'outreachAlerts', label: 'Outreach Success', desc: 'Receive a report when an outreach email is sent successfully.' },
                    { id: 'milestoneAlerts', label: 'Campaign Milestones', desc: 'Alerts for when your campaign reaches target goals.' }
                  ].map((pref) => (
                    <div key={pref.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{pref.label}</p>
                        <p className="text-xs text-slate-500">{pref.desc}</p>
                      </div>
                      <button 
                        onClick={() => handleToggle(pref.id)}
                        className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors duration-300 shadow-inner ${formData[pref.id] ? 'bg-indigo-600' : 'bg-slate-200'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300 ${formData[pref.id] ? 'right-1' : 'left-1'}`}></div>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Globe size={20} className="text-indigo-600" />
                  <h4 className="font-bold text-indigo-900">Push Notifications</h4>
                </div>
                <p className="text-sm text-indigo-700 mb-4">Stay updated even when you're away from the dashboard.</p>
                <button 
                  onClick={requestNotificationPermission}
                  className="text-sm font-bold bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Enable Browser Notifications
                </button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="animate-in slide-in-from-right-4 duration-300 space-y-6">
              <div className="glass-card p-6">
                <h3 className="font-bold text-lg text-slate-900 border-b pb-2 mb-4">Account Security</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-800 text-sm">Two-Factor Authentication</p>
                      <p className="text-xs text-slate-500">Secure your account with an extra layer of protection.</p>
                    </div>
                    <button className="text-xs font-bold text-indigo-600 hover:underline">Setup 2FA</button>
                  </div>
                  <div className="pt-4 space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase">Current Password</label>
                      <input type="password" placeholder="••••••••" className="input-modern" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase">New Password</label>
                      <input type="password" placeholder="New password" className="input-modern" />
                    </div>
                    <button className="btn-premium text-sm py-2 px-6">Update Password</button>
                  </div>
                </div>
              </div>

              <div className="bg-rose-50 border border-rose-100 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Lock size={20} className="text-rose-600" />
                  <h4 className="font-bold text-rose-900">Danger Zone</h4>
                </div>
                <p className="text-sm text-rose-700 mb-4">Deleting your account will permanently erase all lead data and campaign history.</p>
                <button type="button" className="text-sm font-bold text-rose-600 hover:text-rose-700 underline">Delete My Account</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


