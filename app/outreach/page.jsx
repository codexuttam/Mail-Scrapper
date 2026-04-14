import { Mail, Send, CheckCircle2, AlertCircle } from 'lucide-react'

export default function OutreachPage() {
  return (
    <div className="space-y-8 animate-in">
      <div>
        <h1 className="text-3xl font-extrabold text-indigo-950">Outreach Campaigns</h1>
        <p className="text-slate-500">Track and manage your automated outreach efforts.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="glass-card p-6 border-b-4 border-b-indigo-500">
           <p className="text-sm font-bold text-slate-500 uppercase mb-2">Total Sent</p>
           <h3 className="text-4xl font-extrabold text-indigo-900">1,284</h3>
        </div>
        <div className="glass-card p-6 border-b-4 border-b-emerald-500">
           <p className="text-sm font-bold text-slate-500 uppercase mb-2">Open Rate</p>
           <h3 className="text-4xl font-extrabold text-emerald-600">64.2%</h3>
        </div>
        <div className="glass-card p-6 border-b-4 border-b-amber-500">
           <p className="text-sm font-bold text-slate-500 uppercase mb-2">Replies</p>
           <h3 className="text-4xl font-extrabold text-amber-600">42</h3>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-6 border-b bg-slate-50/50 flex items-center justify-between">
          <h2 className="font-bold text-slate-800">Recent Activity</h2>
          <button className="text-sm font-bold text-indigo-600 hover:underline">View All</button>
        </div>
        <div className="divide-y">
          {[
            { name: 'Cafe Coffee Day', status: 'Opened', time: '2 hours ago', icon: CheckCircle2, color: 'text-emerald-500' },
            { name: 'Blue Tokai Roasters', status: 'Sent', time: '5 hours ago', icon: Send, color: 'text-indigo-500' },
            { name: 'The Artful Baker', status: 'Bounced', time: '1 day ago', icon: AlertCircle, color: 'text-rose-500' },
          ].map((item, i) => (
            <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg bg-slate-100 ${item.color}`}>
                   <item.icon size={20} />
                </div>
                <div>
                   <p className="font-bold text-slate-900">{item.name}</p>
                   <p className="text-xs text-slate-500">{item.time}</p>
                </div>
              </div>
              <div className="text-right">
                 <span className={`text-xs font-bold uppercase tracking-wider ${item.color}`}>{item.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
