"use client"
import { Search, Menu, Bell } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function Header() {
  const router = useRouter()
  const [query, setQuery] = useState('')

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      router.push(`/dashboard?q=${encodeURIComponent(query)}`)
    }
  }

  return (
    <header className="h-16 border-b bg-white/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-50">
      <div className="md:hidden flex items-center gap-2">
        <Menu size={24} />
        <span className="font-bold">AutoClient</span>
      </div>
      
      <div className="hidden md:flex flex-1 items-center max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Search leads..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleSearch}
            className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold border-2 border-white shadow-sm cursor-pointer">
          JS
        </div>
      </div>
    </header>
  )
}
