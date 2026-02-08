'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Loader2, Mail, Lock, AlertCircle } from 'lucide-react'

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
      if (session) {
        router.replace('/') 
      } else {
        setCheckingSession(false)
      }
    }
    checkSession()
  }, [router])

  const handleGoogleLogin = async () => {
    setGoogleLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // Redirect to your current page after login
        redirectTo: 'https://wyth-app.vercel.app/auth/callback',
      },
    })
    
    if (error) {
        setErrorMsg(error.message)
        setGoogleLoading(false)
    }
    // Note: If successful, Google takes over and redirects user.
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
        setErrorMsg("Please enter both email and password.")
        return
    }
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
                const { data: profile } = await supabase.from('profiles').select('id').eq('id', data.user.id).single()
                router.push(profile ? '/' : '/onboarding')
            }
        }
    } catch (error: any) {
        setErrorMsg(error.message || "An authentication error occurred")
        setLoading(false)
    }
  }

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
          Join the high-intent community.
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <div className="space-y-6">
            
          {/* GOOGLE LOGIN BUTTON */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={googleLoading || loading}
            className="flex w-full justify-center items-center gap-3 rounded-xl bg-white px-3 py-3 text-sm font-semibold leading-6 text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 transition-all"
          >
             {googleLoading ? <Loader2 className="animate-spin h-5 w-5" /> : (
                 <>
                   <svg className="h-5 w-5" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                   </svg>
                   Continue with Google
                 </>
             )}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-slate-500">Or continue with</span>
            </div>
          </div>

          {/* EMAIL FORM (Existing) */}
          <form className="space-y-6" onSubmit={handleAuth}>
            <div>
                <label className="block text-sm font-medium leading-6 text-slate-900">Email address</label>
                <div className="mt-2 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Mail size={16} className="text-slate-400"/></div>
                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="block w-full rounded-xl border-0 py-3 pl-10 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-slate-900 sm:text-sm sm:leading-6" placeholder="you@example.com"/>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium leading-6 text-slate-900">Password</label>
                <div className="mt-2 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock size={16} className="text-slate-400"/></div>
                    <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="block w-full rounded-xl border-0 py-3 pl-10 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-slate-900 sm:text-sm sm:leading-6" placeholder="••••••••"/>
                </div>
            </div>

            {errorMsg && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-100 flex items-start gap-2">
                    <AlertCircle size={16} className="mt-0.5 shrink-0" /><span>{errorMsg}</span>
                </div>
            )}

            <button type="submit" disabled={loading} className="flex w-full justify-center items-center gap-2 rounded-xl bg-slate-900 px-3 py-3.5 text-sm font-semibold leading-6 text-white shadow-lg hover:bg-slate-800 disabled:opacity-70 transition-all active:scale-95">
                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : (isSignUp ? "Sign Up" : "Sign In")}
            </button>
          </form>
          
          <div className="text-center mt-6">
              <p className="text-sm text-slate-500">
                  {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                  <button type="button" onClick={() => { setIsSignUp(!isSignUp); setErrorMsg(''); }} className="font-semibold text-slate-900 hover:text-blue-600 transition-colors underline decoration-slate-300 underline-offset-4">
                      {isSignUp ? "Sign In" : "Sign Up"}
                  </button>
              </p>
          </div>

        </div>
      </div>
    </div>
  )
}