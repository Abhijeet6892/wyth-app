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

  // 1. Check Session on Mount
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) router.replace('/')
      else setCheckingSession(false)
    }
    checkSession()
  }, [router])

  // 2. Google Login (Updated with Redirect Logic)
  const handleGoogleLogin = async () => {
    setGoogleLoading(true)
    setErrorMsg('')
    
    // Explicitly redirect to the callback route to handle the session exchange properly
    const redirectTo = `${window.location.origin}/auth/callback`

    const { error } = await supabase.auth.signInWithOAuth({ 
        provider: 'google',
        options: {
            redirectTo: redirectTo,
            queryParams: {
                access_type: 'offline',
                prompt: 'consent',
            },
        }
    })

    if (error) {
      setErrorMsg(error.message)
      setGoogleLoading(false)
    }
  }

  // 3. Email/Password Auth
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.')
      return
    }
    setLoading(true)
    setErrorMsg('')

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        // On signup, we send them to onboarding logic (Middleware handles the rest)
        router.push('/onboarding')
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        
        if (data.user) {
          // Check if profile exists to determine routing
          const { data: profile } = await supabase.from('profiles').select('id').eq('id', data.user.id).maybeSingle()
          router.push(profile ? '/' : '/onboarding')
        }
      }
    } catch (error: any) {
      setErrorMsg(error.message || 'An authentication error occurred')
      setLoading(false)
    }
  }

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-slate-300" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 flex flex-col justify-center px-6 py-12 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sm:mx-auto sm:w-full sm:max-w-md bg-white/70 backdrop-blur-xl border border-white/50 shadow-[0_8px_30px_rgba(0,0,0,0.04)] rounded-[2rem] p-8"
      >
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-slate-900 rounded-2xl shadow-xl shadow-slate-200">
            <span className="text-2xl font-serif font-bold text-white tracking-tight">WYTH</span>
          </div>
        </div>

        <h2 className="text-center text-2xl font-bold text-slate-900 tracking-tight">
          {isSignUp ? 'Join the Vibe' : 'Welcome Back'}
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500 font-medium">
          {isSignUp ? 'Intentional dating starts here.' : 'Continue your journey.'}
        </p>

        <div className="mt-8 space-y-6">
          {/* GOOGLE BUTTON */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={googleLoading || loading}
            className="flex w-full justify-center items-center gap-3 rounded-xl bg-white px-3 py-3.5 text-sm font-bold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-200 hover:bg-slate-50 transition-all active:scale-[0.98]"
          >
            {googleLoading ? (
              <Loader2 className="animate-spin h-5 w-5 text-slate-400" />
            ) : (
              <>
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="h-5 w-5" alt="Google" />
                Continue with Google
              </>
            )}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
            <div className="relative flex justify-center text-sm"><span className="bg-transparent px-2 text-slate-400 font-medium bg-white/50 backdrop-blur">or email</span></div>
          </div>

          {/* EMAIL FORM */}
          <form className="space-y-4" onSubmit={handleAuth}>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 text-slate-400" size={18} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="w-full rounded-xl py-3 pl-12 bg-slate-50 border-transparent focus:bg-white focus:border-slate-300 focus:ring-0 transition-all font-medium placeholder:text-slate-400"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-3.5 text-slate-400" size={18} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full rounded-xl py-3 pl-12 bg-slate-50 border-transparent focus:bg-white focus:border-slate-300 focus:ring-0 transition-all font-medium placeholder:text-slate-400"
              />
            </div>

            {errorMsg && (
              <div className="text-rose-600 text-xs bg-rose-50 p-3 rounded-xl flex gap-2 font-medium border border-rose-100">
                <AlertCircle size={16} /> {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white rounded-xl py-3.5 font-bold shadow-lg shadow-slate-200 hover:scale-[1.02] active:scale-[0.98] transition-all flex justify-center items-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" /> : isSignUp ? 'Create Account' : 'Sign In'}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <div className="text-center">
            <button
              onClick={() => { setIsSignUp(!isSignUp); setErrorMsg(''); }}
              className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors"
            >
              {isSignUp ? 'Already have an account? Sign in' : 'New here? Create an account'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}