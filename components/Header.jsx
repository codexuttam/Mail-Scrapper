"use client"
import { Search, Menu, Bell, Trash2, CheckCircle2, Info, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import { useSession } from 'next-auth/react'

export default function Header() {
  const router = useRouter()
  const { data: session } = useSession()
  const [query, setQuery] = useState('')
  const [showNotifications, setShowNotifications] = useState(false)
  
  const userName = session?.user?.name || 'User'
  const userInitials = userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()

  const [notifications, setNotifications] = useState([
    { id: 1, type: 'success', message: 'New lead found: "Sunset Cafe"', time: '2 mins ago' },
    { id: 2, type: 'info', message: 'Outreach campaign started', time: '1 hour ago' },
    { id: 3, type: 'success', message: 'Email sent to "Cloud 9 Tech"', time: '3 hours ago' },
  ])
  const dropdownRef = useRef(null)

  const hasNotifications = notifications.length > 0

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      router.push(`/dashboard?q=${encodeURIComponent(query)}`)
    }
  }

  const markAllRead = () => {
    setNotifications([])
    // setShowNotifications(false) 
  }

  const handleNotificationClick = (id) => {
    router.push('/dashboard')
    setShowNotifications(false)
    // Optional: remove just this one
    // setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const viewAllActivity = () => {
    router.push('/dashboard')
    setShowNotifications(false)
  }

  const removeNotification = (e, id) => {
    e.stopPropagation()
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  return (
    <header className="h-16 border-b bg-white/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-50">
      <div className="md:hidden flex items-center gap-2">
        <Menu size={24} className="text-slate-600" />
        <span className="font-bold text-indigo-950">AutoClient</span>
      </div>
      
      <div className="hidden md:flex flex-1 items-center max-w-sm group">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-indigo-500 transition-colors" size={16} />
          <input 
            type="text" 
            placeholder="Search leads..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleSearch}
            className="w-full pl-10 pr-4 py-2 bg-slate-100 border-2 border-transparent rounded-full text-sm focus:bg-white focus:border-indigo-500/20 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className={`p-2 rounded-xl transition-all relative ${showNotifications ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            <Bell size={20} className={showNotifications ? 'animate-pulse' : ''} />
            {hasNotifications && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white shadow-sm animate-bounce"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 bg-white rounded-3xl shadow-2xl border border-indigo-50 overflow-hidden animate-in slide-in-from-top-2 duration-200">
              <div className="px-5 py-4 border-b border-indigo-50 flex items-center justify-between bg-indigo-50/30">
                 <h4 className="font-bold text-indigo-950 text-sm">Notifications</h4>
                 {hasNotifications && (
                   <button 
                     onClick={markAllRead}
                     className="text-[10px] font-bold text-indigo-600 hover:underline"
                   >
                     Mark all read
                   </button>
                 )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {hasNotifications ? (
                  notifications.map((n) => (
                    <div 
                      key={n.id} 
                      onClick={() => handleNotificationClick(n.id)}
                      className="px-5 py-4 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 cursor-pointer group"
                    >
                      <div className="flex gap-3">
                         <div className={`mt-0.5 p-1.5 rounded-lg ${n.type === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-100 text-indigo-600'}`}>
                            {n.type === 'success' ? <CheckCircle2 size={14} /> : <Info size={14} />}
                         </div>
                         <div className="flex-1">
                            <p className="text-sm text-slate-800 leading-snug mb-1 font-medium">{n.message}</p>
                            <p className="text-[10px] text-slate-400 font-bold">{n.time}</p>
                         </div>
                         <button 
                           onClick={(e) => removeNotification(e, n.id)}
                           className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-rose-500 transition-all"
                         >
                            <Trash2 size={14} />
                         </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-5 py-10 text-center">
                     <Bell size={32} className="mx-auto text-slate-200 mb-2" />
                     <p className="text-sm text-slate-400 italic">No new notifications</p>
                  </div>
                )}
              </div>
              <div className="px-5 py-3 border-t border-slate-50 text-center">
                 <button 
                   onClick={viewAllActivity}
                   className="text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors"
                 >
                   See all activity
                 </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="text-right hidden lg:block">
             <p className="text-xs font-bold text-slate-900 leading-none mb-0.5">{userName}</p>
             <p className="text-[10px] font-medium text-emerald-500">Online</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-black border-2 border-white shadow-md cursor-pointer hover:scale-105 active:scale-95 transition-all">
            {userInitials}
          </div>
        </div>
      </div>
    </header>
  )
}

