"use client"
import './globals.css'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Search, Mail, Settings, Zap, LogOut } from 'lucide-react'
import Header from '../components/Header'
import Providers from '../components/Providers'
import { signOut } from "next-auth/react"

export default function RootLayout({ children }) {
  const pathname = usePathname()
  const router = useRouter()
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
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossOrigin="" />
      </head>
      <body className="bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
        <Providers>
          <div className="flex min-h-screen">
            {/* Sidebar */}
            <aside className="w-64 border-r bg-white flex flex-col hidden md:flex sticky top-0 h-screen">
              <div className="p-6">
                <div className="flex items-center gap-2 mb-8">
                  <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                    <Zap size={20} fill="currentColor" />
                  </div>
                  <h1 className="text-xl font-bold tracking-tight">Auto<span className="text-indigo-600">Client</span></h1>
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
              <Header />

              <main className="flex-1 p-8 bg-slate-50/50">
                <div className="max-w-5xl mx-auto animate-in">
                  {children}
                </div>
              </main>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  )
}
