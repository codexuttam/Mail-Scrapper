"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Mail, Lock, ArrowRight, Zap, CheckCircle2, ChevronLeft, Shield } from 'lucide-react'

export default function AuthPage() {
  const router = useRouter()
  const [mode, setMode] = useState('login') 
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [pickerType, setPickerType] = useState('Google')

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    otp: ['', '', '', '', '', '']
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return
    const newOtp = [...formData.otp]
    newOtp[index] = value
    setFormData({ ...formData, otp: newOtp })
    
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      if (nextInput) nextInput.focus()
    }
  }

  const handleSubmit = (e) => {
    e?.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      if (mode === 'signup') setMode('otp')
      else router.push('/dashboard')
    }, 1500)
  }

  const openPicker = async (type) => {
    setPickerType(type)
    setFetching(true)
    
    try {
      // Direct redirect to real provider
      await signIn(type.toLowerCase(), { callbackUrl: '/dashboard' })
    } catch (error) {
      console.error("Auth Error:", error)
      setFetching(false)
    }
  }

  const googleLogo = (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335"/>
    </svg>
  )

  const appleLogo = (
    <svg width="20" height="20" viewBox="0 0 256 315">
      <path d="M213.803 167.03c.442 47.58 41.74 63.413 42.147 63.615-.35 1.116-6.599 22.563-21.757 44.716-13.103 19.146-26.685 38.214-48.243 38.612-21.168.398-28.016-12.518-52.213-12.518-24.192 0-31.755 12.12-51.815 12.915-20.457.795-35.807-20.73-48.995-39.81-26.98-39.04-47.608-110.153-19.83-158.267 13.79-23.89 38.38-39.027 65.048-39.426 20.364-.403 39.544 13.722 52.016 13.722 12.484 0 35.792-16.945 60.18-14.45 10.203.42 38.855 4.103 57.25 31.066-1.488.924-34.205 19.945-33.888 59.646M173.1 47.243c10.984-13.305 18.375-31.778 16.36-50.21-15.845.64-35.034 10.55-46.39 23.82-10.18 11.774-19.1 30.704-16.73 48.653 17.65 1.366 35.776-8.958 46.76-22.263" fill="currentColor"/>
    </svg>
  )

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4 selection:bg-indigo-100 relative overflow-hidden font-sans">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full animate-pulse delay-700"></div>
      </div>

      <div className="w-full max-w-[1100px] grid lg:grid-cols-2 bg-white rounded-[40px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] overflow-hidden border border-white relative animate-in zoom-in duration-500">
        
        {/* Left Side */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 text-white relative">
           <div className="flex items-center gap-2 group cursor-pointer">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-lg group-hover:scale-110 transition-transform font-bold">
                <Zap size={24} fill="currentColor" />
              </div>
              <span className="text-2xl font-black tracking-tight">AutoClient</span>
           </div>

           <div>
              <h2 className="text-5xl font-black leading-[1.1] mb-6 tracking-tight">Automate your outreach in <span className="text-indigo-200 underline decoration-indigo-400/50 underline-offset-8">seconds.</span></h2>
              <p className="text-indigo-100 text-lg leading-relaxed max-w-md opacity-90">Scale your business with AI-powered lead generation and personalized automated messaging.</p>
              
              <div className="mt-12 space-y-4">
                 {['Deep AI Lead Search', 'One-Click Magic outreach', 'Persistent CRM Settings'].map((feature, i) => (
                   <div key={i} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center border border-white/30 backdrop-blur-sm">
                         <CheckCircle2 size={14} className="text-indigo-200" />
                      </div>
                      <span className="font-bold text-sm text-indigo-50">{feature}</span>
                   </div>
                 ))}
              </div>
           </div>

           <div className="pt-8 border-t border-white/10 flex items-center justify-between text-[10px] uppercase font-black tracking-widest text-indigo-300">
              <span>Next Gen CRM</span>
              <span>© 2026 AutoClient Inc.</span>
           </div>
        </div>

        {/* Right Side */}
        <div className="p-8 md:p-16 flex flex-col justify-center relative">
           <div className="max-w-sm mx-auto w-full animate-in slide-in-from-right duration-500">
              
              <div className="mb-10">
                {mode === 'otp' ? (
                  <>
                    <button onClick={() => setMode('signup')} className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-bold text-xs mb-4 transition-colors group">
                      <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Signup
                    </button>
                    <h1 className="text-3xl font-black text-indigo-950 mb-2 flex items-center gap-3">
                      Verify OTP <Shield size={32} className="text-indigo-600 animate-pulse" />
                    </h1>
                    <p className="text-slate-500 font-medium">We've sent a 6-digit code to your email.</p>
                  </>
                ) : (
                  <>
                    <h1 className="text-4xl font-black text-indigo-950 mb-2 tracking-tight">
                       {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                    </h1>
                    <p className="text-slate-500 font-medium">
                       {mode === 'login' ? 'Sign in to access your dashboard' : 'Join thousands of growth hackers today'}
                    </p>
                  </>
                )}
              </div>

              {mode === 'otp' ? (
                <form onSubmit={handleSubmit} className="space-y-8">
                   <div className="flex justify-between gap-2">
                      {formData.otp.map((digit, i) => (
                        <input 
                          key={i} id={`otp-${i}`} type="text" inputMode="numeric" maxLength={1} value={digit}
                          onChange={(e) => handleOtpChange(i, e.target.value)}
                          className="w-12 h-14 bg-slate-50 border-2 border-slate-100 rounded-xl text-center text-xl font-bold focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-600/5 outline-none transition-all"
                        />
                      ))}
                   </div>
                   <button type="submit" disabled={loading} className="w-full h-14 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50">
                     {loading ? <Zap className="animate-spin" size={20} /> : 'Verify Account'}
                   </button>
                </form>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                   {mode === 'signup' && (
                     <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-300">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Full Name</label>
                        <input type="text" name="fullName" placeholder="Uttamraj Singh" required value={formData.fullName} onChange={handleChange}
                          className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 text-sm font-bold focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-600/5 outline-none transition-all" />
                     </div>
                   )}

                   <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Email Address</label>
                      <div className="relative group">
                         <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                         <input type="email" name="email" placeholder="name@company.com" required value={formData.email} onChange={handleChange}
                           className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl pl-14 pr-5 text-sm font-bold focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-600/5 outline-none transition-all" />
                      </div>
                   </div>

                   <div className="space-y-1.5">
                      <div className="flex items-center justify-between pl-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Password</label>
                        {mode === 'login' && <button type="button" className="text-[10px] font-bold text-indigo-600 hover:underline">Forgot Password?</button>}
                      </div>
                      <div className="relative group">
                         <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                         <input type="password" name="password" placeholder="••••••••" required value={formData.password} onChange={handleChange}
                           className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl pl-14 pr-5 text-sm font-bold focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-600/5 outline-none transition-all" />
                      </div>
                   </div>

                   <button type="submit" disabled={loading} className="w-full h-14 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50">
                     {loading ? <Zap className="animate-spin" size={20} /> : (mode === 'login' ? 'Sign In to Dashboard' : 'Create Account')}
                     {!loading && <ArrowRight size={20} />}
                   </button>

                   <div className="relative flex items-center py-4">
                      <div className="flex-grow border-t border-slate-100"></div>
                      <span className="flex-shrink mx-4 text-[10px] font-black text-slate-300 uppercase tracking-tighter shrink-0">or continue with</span>
                      <div className="flex-grow border-t border-slate-100"></div>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <button onClick={() => openPicker('Google')} type="button" className="h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm text-slate-700 hover:bg-white hover:border-indigo-600/20 transition-all active:scale-95">
                        {googleLogo} Google
                      </button>
                      <button onClick={() => openPicker('Apple')} type="button" className="h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm text-slate-700 hover:bg-white hover:border-indigo-600/20 transition-all active:scale-95">
                        {appleLogo} Apple
                      </button>
                   </div>

                   <p className="text-center text-sm font-bold text-slate-400 pt-4">
                      {mode === 'login' ? "Don't have an account?" : "Already have an account?"}
                      <button type="button" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} className="text-indigo-600 hover:underline ml-1.5">
                         {mode === 'login' ? 'Create Account' : 'Sign In Now'}
                      </button>
                   </p>
                </form>
              )}
           </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {(loading || fetching) && (
        <div className="fixed inset-0 z-[200] bg-white/60 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-300">
           <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-2xl animate-bounce">
                 <Zap size={32} fill="currentColor" />
              </div>
              <p className="text-sm font-black text-indigo-950 uppercase tracking-[0.2em] animate-pulse">
                {fetching ? `Connecting to ${pickerType}...` : 'Authenticating...'}
              </p>
           </div>
        </div>
      )}
    </div>
  )
}
