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
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[400px] space-y-8"
      >
        {/* Header Section (ChatGPT Style) */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-serif font-bold text-slate-900 tracking-tighter">WYTH</h1>
          <div className="space-y-1 pt-4">
            <p className="text-slate-500 font-medium tracking-tight">Observe the vibe.</p>
            <p className="text-slate-500 font-medium tracking-tight">Understand the person.</p>
            <p className="text-slate-900 font-bold tracking-tight">Then Decide.</p>
          </div>
          <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] pt-4 font-bold">
            A social space for serious intentions.
          </p>
        </div>

        <div className="space-y-4 pt-6">
          {/* GOOGLE BUTTON - Iron-Clad Layout */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={googleLoading || loading}
            className="group relative flex w-full items-center justify-center gap-3 rounded-2xl bg-white border border-slate-200 px-4 py-4 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all active:scale-[0.98] shadow-sm"
          >
            {googleLoading ? (
              <Loader2 className="animate-spin h-5 w-5 text-slate-400" />
            ) : (
              <div className="flex items-center gap-3">
                <img 
                  src="https://www.svgrepo.com/show/475656/google-color.svg" 
                  style={{ width: '20px', height: '20px' }} // Inline style for maximum enforcement
                  className="shrink-0"
                  alt="Google" 
                />
                <span>Continue with Google</span>
              </div>
            )}
          </button>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold text-slate-300"><span className="bg-white px-4">or email</span></div>
          </div>

          {/* EMAIL FORM */}
          <form className="space-y-3" onSubmit={handleAuth}>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="w-full rounded-2xl py-4 px-5 bg-slate-50 border-transparent focus:bg-white focus:border-slate-200 focus:ring-0 transition-all text-sm font-medium"
            />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full rounded-2xl py-4 px-5 bg-slate-50 border-transparent focus:bg-white focus:border-slate-200 focus:ring-0 transition-all text-sm font-medium"
            />

            {errorMsg && (
              <div className="text-rose-600 text-[11px] bg-rose-50 p-3 rounded-xl border border-rose-100 font-medium">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white rounded-2xl py-4 font-bold shadow-lg shadow-slate-200 hover:opacity-90 transition-all flex justify-center items-center gap-2 mt-2"
            >
              {loading ? <Loader2 className="animate-spin" /> : isSignUp ? 'Login or Get Started' : 'Sign In'}
            </button>
          </form>

          <button
            onClick={() => { setIsSignUp(!isSignUp); setErrorMsg(''); }}
            className="w-full text-center text-[11px] font-bold text-slate-400 hover:text-slate-900 uppercase tracking-widest pt-4"
          >
            {isSignUp ? 'Already have an account? Sign in' : 'New here? Create account'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}