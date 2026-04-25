"use client"
import './globals.css'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Search, Mail, Settings, Zap, LogOut, HelpCircle, Menu, X } from 'lucide-react'
import Header from '../components/Header'
import Providers from '../components/Providers'
import { signOut } from "next-auth/react"
import { useState } from 'react'

export default function RootLayout({ children }) {
  const pathname = usePathname()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const isAuthPage = pathname === '/login'

  const handleLogout = () => {
    signOut({ callbackUrl: '/login' })
  }

  if (isAuthPage) {
    return (
      <html lang="en">
        <body className="bg-slate-50 text-slate-900 font-sans">
          <Providers>
            {children}
          </Providers>
        </body>
      </html>
    )
  }

  return (
    <html lang="en">
      <head>
        <title>AutoClient | AI-Powered Lead Generation</title>
        <link rel="icon" href="/logo.png" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossOrigin="" />
      </head>
      <body className="bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
        <Providers>
          <div className="flex min-h-screen">
            {/* Sidebar */}
            <aside className="w-64 border-r bg-white flex flex-col hidden lg:flex sticky top-0 h-screen">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-8">
                  <img src="/logo.png" alt="AutoClient Logo" className="w-10 h-10 object-contain" />
                  <h1 className="text-xl font-black tracking-tight text-slate-900">Auto<span className="text-indigo-600">Client</span></h1>
                </div>
                
                <nav className="space-y-1">
                  <Link href="/" className={`nav-link ${pathname === '/' ? 'bg-indigo-50 text-indigo-600' : ''}`}>
                    <Search size={18} />
                    <span>Find Leads</span>
                  </Link>
                  <Link href="/dashboard" className={`nav-link ${pathname === '/dashboard' ? 'bg-indigo-50 text-indigo-600' : ''}`}>
                    <LayoutDashboard size={18} />
                    <span>Dashboard</span>
                  </Link>
                  <Link href="/outreach" className={`nav-link ${pathname === '/outreach' ? 'bg-indigo-50 text-indigo-600' : ''}`}>
                    <Mail size={18} />
                    <span>Outreach</span>
                  </Link>
                  <Link href="/settings" className={`nav-link ${pathname === '/settings' ? 'bg-indigo-50 text-indigo-600' : ''}`}>
                    <Settings size={18} />
                    <span>Settings</span>
                  </Link>
                  <Link href="/how-to-use" className={`nav-link ${pathname === '/how-to-use' ? 'bg-indigo-50 text-indigo-600' : ''}`}>
                    <HelpCircle size={18} />
                    <span>How to Use</span>
                  </Link>
                </nav>
              </div>
              
              <div className="mt-auto p-6 space-y-4">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <LogOut size={18} />
                  <span>Log Out</span>
                </button>

                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                     <Zap size={16} fill="currentColor" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase">System Status</p>
                    <p className="text-xs font-medium text-emerald-600">All services online</p>
                  </div>
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-h-screen">
              <Header onMenuClick={() => setIsMobileMenuOpen(true)} />

              <main className="flex-1 p-4 md:p-8 bg-slate-50/50">
                <div className="max-w-5xl mx-auto animate-in">
                  {children}
                </div>
              </main>
            </div>
          </div>

          {/* Mobile Navigation Backdrop */}
          {isMobileMenuOpen && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[99] lg:hidden" onClick={() => setIsMobileMenuOpen(false)}>
               {/* Mobile Sidebar */}
               <aside className="w-72 bg-white h-full flex flex-col animate-in slide-in-from-left duration-300" onClick={(e) => e.stopPropagation()}>
                  <div className="p-6 border-b flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <img src="/logo.png" alt="AutoClient Logo" className="w-8 h-8 object-contain" />
                       <h1 className="text-xl font-black text-slate-900">AutoClient</h1>
                    </div>
                    <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500">
                      <X size={20} />
                    </button>
                  </div>

                  <nav className="p-4 space-y-1 flex-1">
                    {[
                      { href: '/', label: 'Find Leads', icon: Search },
                      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
                      { href: '/outreach', label: 'Outreach', icon: Mail },
                      { href: '/settings', label: 'Settings', icon: Settings },
                      { href: '/how-to-use', label: 'How to Use', icon: HelpCircle }
                    ].map((item) => (
                      <Link 
                        key={item.href} 
                        href={item.href} 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${pathname === item.href ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-600 hover:bg-slate-50'}`}
                      >
                        <item.icon size={20} />
                        <span>{item.label}</span>
                      </Link>
                    ))}
                  </nav>

                  <div className="p-4 border-t">
                     <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-rose-500 font-bold hover:bg-rose-50 rounded-xl transition-colors">
                        <LogOut size={20} />
                        <span>Log Out</span>
                     </button>
                  </div>
               </aside>
            </div>
          )}
        </Providers>
      </body>
    </html>
  )
}
