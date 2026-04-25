"use client"
import { Search, Mail, LayoutDashboard, Zap, CheckCircle2, ArrowRight, PlayCircle, Globe, Filter } from 'lucide-react'
import Link from 'next/link'

export default function HowToUsePage() {
  const steps = [
    {
      title: "1. Find Businesses",
      desc: "Go to the 'Find Leads' page and enter a niche and location (e.g., 'Cafes in Ghaziabad'). Our scraper will pull deep data including socials and emails.",
      icon: Search,
      color: "bg-blue-500",
      image: "https://images.unsplash.com/photo-1542744094-24638eff58bb?auto=format&fit=crop&q=80&w=600"
    },
    {
      title: "2. Save to CRM",
      desc: "Once you find a lead you like, click 'Save Lead'. This moves them into your private 'Dashboard' where you can track progress.",
      icon: LayoutDashboard,
      color: "bg-purple-500",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=600"
    },
    {
      title: "3. Generate AI Outreach",
      desc: "In the Dashboard, click 'Generate'. Our Llama-3 powered AI will draft a highly personalized cold email based on the business details.",
      icon: Zap,
      color: "bg-amber-500",
      image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=600"
    },
    {
      title: "4. Send & Track",
      desc: "Review the draft and click 'Send'. You can track which leads have been contacted and manage your entire sales funnel from one place.",
      icon: Mail,
      color: "bg-emerald-500",
      image: "https://images.unsplash.com/photo-1557200134-90327ee9fafa?auto=format&fit=crop&q=80&w=600"
    }
  ]

  return (
    <div className="space-y-12 pb-20 animate-in fade-in duration-700">
      <div className="max-w-3xl">
        <div className="flex items-center gap-4 mb-6">
          <img src="/logo.png" alt="AutoClient Logo" className="w-14 h-14 object-contain shadow-xl shadow-indigo-100 rounded-2xl" />
          <span className="text-sm font-black text-indigo-600 uppercase tracking-[0.2em] bg-indigo-50 px-3 py-1 rounded-lg">Official Guide</span>
        </div>
        <h1 className="text-4xl font-black text-indigo-950 mb-4 tracking-tight">How to use <span className="text-indigo-600">AutoClient</span></h1>
        <p className="text-lg text-slate-500 leading-relaxed font-medium">Follow this 4-step sequence to start closing deals with AI-powered outreach.</p>
      </div>

      <div className="grid gap-12">
        {steps.map((step, i) => (
          <div key={i} className="group relative">
            <div className={`absolute left-0 top-0 w-1 h-full ${step.color} opacity-20 rounded-full`}></div>
            <div className="pl-8 grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <div className={`w-14 h-14 ${step.color} text-white rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-200 group-hover:scale-110 transition-transform duration-500`}>
                  <step.icon size={28} />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">{step.title}</h2>
                <p className="text-slate-600 leading-relaxed text-sm lg:text-base">{step.desc}</p>
                <div className="flex items-center gap-3 pt-2">
                  <div className="flex items-center gap-1.5 text-xs font-black text-indigo-600 uppercase tracking-widest px-3 py-1 bg-indigo-50 rounded-full">
                    <CheckCircle2 size={12} />
                    Verified Method
                  </div>
                </div>
              </div>
              <div className="relative overflow-hidden rounded-3xl border-8 border-white shadow-2xl">
                 <img src={step.image} alt={step.title} className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-1000" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-indigo-900 rounded-[40px] p-8 md:p-16 text-center text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full -z-10 overflow-hidden">
          <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/20 blur-[120px] rounded-full"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/20 blur-[120px] rounded-full"></div>
        </div>
        
        <h2 className="text-3xl md:text-5xl font-black mb-6 tracking-tight">Ready to find your <br />next big client?</h2>
        <p className="text-indigo-200 text-lg mb-10 opacity-90 max-w-xl mx-auto">Skip the manual search and let AI find the high-intent businesses for you.</p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/find" className="w-full sm:w-auto bg-white text-indigo-600 px-10 py-5 rounded-2xl font-black text-lg hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 shadow-xl hover:scale-105 active:scale-95">
            Launch Finder <Zap size={20} fill="currentColor" />
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
         <div className="p-8 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
               <Globe className="text-indigo-600" size={24} />
               Scraping Coverage
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed italic">"AutoClient works globally. Whether you need 'Plumbers in London' or 'Bakeries in Sydney', our scraper navigates local Places listings to extract confirmed business details including verified emails."</p>
         </div>
         <div className="p-8 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
               <Filter className="text-indigo-600" size={24} />
               AI Precision
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed italic">"Our Groq-powered AI doesn't just send templates. It reads business descriptions, locations, and ratings to craft contextually aware messages that significantly outperform generic cold emails."</p>
         </div>
      </div>
    </div>
  )
}
