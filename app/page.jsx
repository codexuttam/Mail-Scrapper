import Link from 'next/link'
import { ArrowRight, Search, Users, Mail, TrendingUp, Zap } from 'lucide-react'

export default function Page() {
  return (
    <div className="space-y-10">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-indigo-600 p-12 text-white shadow-2xl">
        <div className="flex-1 space-y-8">
          <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 mb-4 animate-in slide-in-from-bottom duration-700">
            <img src="/logo.png" alt="AutoClient" className="w-8 h-8 object-contain" />
            <span className="text-white text-sm font-black tracking-widest uppercase">AutoClient AI</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white leading-tight tracking-tight">
            Find and convert your <br />
            <span className="text-indigo-200">perfect clients</span> today.
          </h1>
          <p className="text-lg text-indigo-100 mb-8 opacity-90 max-w-lg">
            Powerful tools to scrape local business data, generate personalized AI outreach, and manage your sales pipeline in one place.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/find" className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-50 transition-all hover:scale-105 active:scale-95 shadow-lg">
              Start Finding Leads <ArrowRight size={18} />
            </Link>
            <Link href="/how-to-use" className="bg-indigo-500/30 backdrop-blur-md border border-indigo-400/30 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-500/40 transition-all flex items-center justify-center">
              Explore How to Use
            </Link>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 translate-y-24 translate-x-24 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl"></div>
      </section>

      {/* Stats/Features Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="glass-card p-6 flex flex-col gap-4">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shadow-inner">
            <Search size={24} />
          </div>
          <div>
            <h3 className="font-bold text-lg mb-1">Local Search</h3>
            <p className="text-sm text-slate-500 leading-relaxed">Extract deep data from businesses in any area with just a few keywords.</p>
          </div>
        </div>

        <div className="glass-card p-6 flex flex-col gap-4">
          <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center shadow-inner">
            <Users size={24} />
          </div>
          <div>
            <h3 className="font-bold text-lg mb-1">Lead Management</h3>
            <p className="text-sm text-slate-500 leading-relaxed">Organize and tag your leads to keep your sales funnel clean and efficient.</p>
          </div>
        </div>

        <div className="glass-card p-6 flex flex-col gap-4">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center shadow-inner">
            <TrendingUp size={24} />
          </div>
          <div>
            <h3 className="font-bold text-lg mb-1">AI Outreach</h3>
            <p className="text-sm text-slate-500 leading-relaxed">Generate personalized emails that actually get replies using GPT-4 technology.</p>
          </div>
        </div>
      </div>

      {/* Secondary Section */}
      <div className="grid md:grid-cols-2 gap-8 items-center bg-white rounded-3xl p-8 border border-slate-200">
        <div>
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Efficiency first</span>
          <h3 className="text-3xl font-extrabold mt-2 mb-4 leading-snug">Stop manually hunting <br />for contact info.</h3>
          <p className="text-slate-600 mb-6 leading-relaxed">Our scraper finds emails, phone numbers, and social links in seconds, so you can spend your time closing instead of searching.</p>
          <ul className="space-y-3 mb-8">
            <li className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <div className="w-5 h-5 bg-emerald-500 text-white rounded-full flex items-center justify-center"><Zap size={12} fill="currentColor"/></div>
              Real-time Google Maps extraction
            </li>
            <li className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <div className="w-5 h-5 bg-emerald-500 text-white rounded-full flex items-center justify-center"><Zap size={12} fill="currentColor"/></div>
              Automated email validation
            </li>
            <li className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <div className="w-5 h-5 bg-emerald-500 text-white rounded-full flex items-center justify-center"><Zap size={12} fill="currentColor"/></div>
              One-click CRM export
            </li>
          </ul>
        </div>
        <div className="relative">
          <div className="aspect-video bg-indigo-50 rounded-2xl border-4 border-white shadow-xl flex items-center justify-center overflow-hidden group">
             {/* Mock UI snippet */}
             <div className="w-4/5 h-3/4 bg-white rounded-lg shadow-2xl border border-slate-100 p-4 space-y-3 group-hover:scale-105 transition-transform duration-500">
                <div className="h-4 w-1/3 bg-slate-100 rounded"></div>
                <div className="h-8 w-full bg-slate-50 rounded border border-slate-100"></div>
                <div className="space-y-2">
                  <div className="h-3 w-full bg-slate-100 rounded"></div>
                  <div className="h-3 w-3/4 bg-slate-100 rounded"></div>
                </div>
                <div className="pt-2 flex justify-end">
                  <div className="h-8 w-20 bg-indigo-600 rounded"></div>
                </div>
             </div>
          </div>
          {/* Decorative floating badge */}
          <div className="absolute -bottom-4 -right-4 bg-white p-3 rounded-xl shadow-lg border border-slate-100 animate-bounce">
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
               <span className="text-xs font-bold font-mono">2,412 LEADS FOUND TODAY</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
