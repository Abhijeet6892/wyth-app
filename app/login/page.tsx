'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Loader2, Mail, Lock, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)
  const router = useRouter()

  // 1. REVERSE ROUTE PROTECTION
  // If user is already logged in, kick them to Home immediately.
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.replace('/') // Use replace so they can't 'back' into login
      } else {
        setCheckingSession(false)
      }
    }
    checkSession()
  }, [router])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault() // Prevent form refresh
    if (!email || !password) {
        setErrorMsg("Please enter both email and password.")
        return
    }
    setLoading(true)
    setErrorMsg('')

    try {
        if (isSignUp) {
            // --- SCENARIO A: NEW USER ---
            const { error } = await supabase.auth.signUp({
                email,
                password,
            })
            if (error) throw error
            
            // New users MUST go to Onboarding
            router.push('/onboarding')
        
        } else {
            // --- SCENARIO B: RETURNING USER ---
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })
            if (error) throw error

            // Check if this user actually has a profile setup
            if (data.user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('id')
                    .eq('id', data.user.id)
                    .single()

                // Logic: Profile exists? -> Home. No profile? -> Onboarding.
                if (profile) {
                    router.push('/')
                } else {
                    router.push('/onboarding')
                }
            }
        }
    } catch (error: any) {
        setErrorMsg(error.message || "An authentication error occurred")
        setLoading(false)
    }
  }

  // Show a blank/loader while we check if they are already logged in
  if (checkingSession) return <div className="min-h-screen bg-white flex items-center justify-center"><Loader2 className="animate-spin text-slate-400"/></div>

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <div className="flex justify-center">
            <div className="p-3 bg-slate-900 rounded-xl shadow-lg">
                <span className="text-2xl font-serif font-bold text-white tracking-tight">WYTH</span>
            </div>
        </div>
        <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-slate-900">
          {isSignUp ? "Create your account" : "Sign in to your account"}
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500">
          {isSignUp ? "Join the high-intent community." : "Welcome back."}
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form className="space-y-6" onSubmit={handleAuth}>
          
          {/* EMAIL INPUT */}
          <div>
            <label className="block text-sm font-medium leading-6 text-slate-900">Email address</label>
            <div className="mt-2 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail size={16} className="text-slate-400"/>
                </div>
                <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full rounded-xl border-0 py-3 pl-10 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-slate-900 sm:text-sm sm:leading-6"
                    placeholder="you@example.com"
                />
            </div>
          </div>

          {/* PASSWORD INPUT */}
          <div>
            <label className="block text-sm font-medium leading-6 text-slate-900">Password</label>
            <div className="mt-2 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={16} className="text-slate-400"/>
                </div>
                <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full rounded-xl border-0 py-3 pl-10 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-slate-900 sm:text-sm sm:leading-6"
                    placeholder="••••••••"
                />
            </div>
          </div>

          {/* ERROR MESSAGE UI */}
          {errorMsg && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-100 flex items-start gap-2">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <span>{errorMsg}</span>
            </div>
          )}

          {/* ACTION BUTTON (Disabled while loading) */}
          <button
            type="submit"
            disabled={loading}
            className="flex w-full justify-center items-center gap-2 rounded-xl bg-slate-900 px-3 py-3.5 text-sm font-semibold leading-6 text-white shadow-lg hover:bg-slate-800 disabled:opacity-70 transition-all active:scale-95"
          >
            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : (isSignUp ? "Sign Up" : "Sign In")}
          </button>
          
          {/* TOGGLE LINK */}
          <div className="text-center mt-6">
              <p className="text-sm text-slate-500">
                  {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                  <button 
                    type="button"
                    onClick={() => { setIsSignUp(!isSignUp); setErrorMsg(''); }}
                    className="font-semibold text-slate-900 hover:text-blue-600 transition-colors underline decoration-slate-300 underline-offset-4"
                  >
                      {isSignUp ? "Sign In" : "Sign Up"}
                  </button>
              </p>
          </div>

        </form>
      </div>
    </div>
  )
}