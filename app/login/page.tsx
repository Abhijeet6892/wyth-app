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

  // ✅ Check if user is already logged in
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

  // ✅ GOOGLE LOGIN (FIXED — NO redirectTo, NO PKCE handling)
  const handleGoogleLogin = async () => {
    setGoogleLoading(true)
    setErrorMsg('')

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    })

    if (error) {
      setErrorMsg(error.message)
      setGoogleLoading(false)
    }
  }

  // ✅ EMAIL / PASSWORD LOGIN
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
        const { error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error
        router.push('/onboarding')
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error

        if (data.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', data.user.id)
            .single()

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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="animate-spin text-slate-400" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <div className="flex justify-center">
          <div className="p-3 bg-slate-900 rounded-xl shadow-lg">
            <span className="text-2xl font-serif font-bold text-white tracking-tight">
              WYTH
            </span>
          </div>
        </div>

        <h2 className="mt-6 text-center text-2xl font-bold text-slate-900">
          {isSignUp ? 'Create your account' : 'Sign in to your account'}
        </h2>

        <p className="mt-2 text-center text-sm text-slate-500">
          {isSignUp
            ? 'Join the high-intent community.'
            : 'Welcome back.'}
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <div className="space-y-6">

          {/* GOOGLE LOGIN */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={googleLoading || loading}
            className="flex w-full justify-center items-center gap-3 rounded-xl bg-white px-3 py-3 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 transition-all"
          >
            {googleLoading ? (
              <Loader2 className="animate-spin h-5 w-5" />
            ) : (
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

          {/* EMAIL LOGIN */}
          <form className="space-y-6" onSubmit={handleAuth}>
            <div>
              <label className="block text-sm font-medium text-slate-900">
                Email address
              </label>
              <div className="mt-2 relative">
                <Mail className="absolute left-3 top-3.5 text-slate-400" size={16} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl py-3 pl-10 ring-1 ring-slate-300"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900">
                Password
              </label>
              <div className="mt-2 relative">
                <Lock className="absolute left-3 top-3.5 text-slate-400" size={16} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl py-3 pl-10 ring-1 ring-slate-300"
                />
              </div>
            </div>

            {errorMsg && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg flex gap-2">
                <AlertCircle size={16} />
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white rounded-xl py-3 font-bold"
            >
              {loading ? <Loader2 className="animate-spin mx-auto" /> : isSignUp ? 'Sign Up' : 'Sign In'}
            </button>
          </form>

          <div className="text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp)
                setErrorMsg('')
              }}
              className="text-sm underline"
            >
              {isSignUp ? 'Sign in instead' : 'Create an account'}
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
