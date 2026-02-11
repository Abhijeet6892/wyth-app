'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Loader2, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)

  const router = useRouter()

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) router.replace('/')
      else setCheckingSession(false)
    }
    checkSession()
  }, [router])

  const handleGoogleLogin = async () => {
    setGoogleLoading(true)
    setErrorMsg('')
    const redirectTo = `${window.location.origin}/auth/callback`
    const { error } = await supabase.auth.signInWithOAuth({ 
        provider: 'google',
        options: { redirectTo }
    })
    if (error) {
      setErrorMsg(error.message)
      setGoogleLoading(false)
    }
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        router.push('/onboarding')
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        if (data.user) {
          const { data: profile } = await supabase.from('profiles').select('id').eq('id', data.user.id).maybeSingle()
          router.push(profile ? '/' : '/onboarding')
        }
      }
    } catch (error: any) {
      setErrorMsg(error.message || 'An error occurred')
      setLoading(false)
    }
  }

  if (checkingSession) return null

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Background Animated Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[400px] z-10"
      >
        {/* Header Section */}
        <div className="text-center space-y-4 mb-10">
          <h1 className="text-5xl font-serif font-bold text-white tracking-tighter">WYTH</h1>
          <div className="space-y-1">
            <p className="text-indigo-200/70 font-medium tracking-tight">Observe the vibe.</p>
            <p className="text-indigo-200/70 font-medium tracking-tight">Understand the person.</p>
            <p className="text-white font-bold text-lg tracking-tight">Then Decide.</p>
          </div>
        </div>

        {/* Glassmorphic Form Container */}
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl">
          <div className="space-y-6">
            {/* GOOGLE BUTTON - Iron-Clad Layout */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={googleLoading || loading}
              className="flex w-full items-center justify-center gap-3 rounded-2xl bg-white px-4 py-4 text-sm font-bold text-slate-900 transition-all active:scale-[0.98] shadow-lg"
            >
              {googleLoading ? (
                <Loader2 className="animate-spin h-5 w-5 text-indigo-600" />
              ) : (
                <div className="flex items-center gap-3">
                  <img 
                    src="https://www.svgrepo.com/show/475656/google-color.svg" 
                    style={{ width: '20px', height: '20px' }} 
                    className="shrink-0"
                    alt="Google" 
                  />
                  <span>Continue with Google</span>
                </div>
              )}
            </button>

            <div className="relative flex items-center gap-4 py-2">
              <div className="h-px w-full bg-white/10" />
              <span className="text-[10px] uppercase tracking-widest font-bold text-white/30 whitespace-nowrap">or email</span>
              <div className="h-px w-full bg-white/10" />
            </div>

            {/* EMAIL FORM */}
            <form className="space-y-3" onSubmit={handleAuth}>
              <div className="space-y-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  className="w-full rounded-xl py-4 px-5 bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
                />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full rounded-xl py-4 px-5 bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
                />
              </div>

              {errorMsg && (
                <div className="text-rose-400 text-[11px] bg-rose-500/10 p-3 rounded-xl border border-rose-500/20 font-medium text-center">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-4 font-bold shadow-xl shadow-indigo-600/20 transition-all active:scale-[0.98] flex justify-center items-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : (isSignUp ? 'Create Account' : 'Sign In')}
                {!loading && <ArrowRight size={16} />}
              </button>
            </form>

            <button
              onClick={() => { setIsSignUp(!isSignUp); setErrorMsg(''); }}
              className="w-full text-center text-[11px] font-bold text-white/40 hover:text-white uppercase tracking-widest pt-2 transition-colors"
            >
              {isSignUp ? 'Already have an account? Sign in' : 'New here? Create account'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}