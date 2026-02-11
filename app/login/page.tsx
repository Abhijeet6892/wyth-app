'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  
  const router = useRouter()

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) router.replace('/')
    }
    check()
  }, [router])

  const handleGoogleLogin = async () => {
    setGoogleLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({ 
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    })
    if (error) { setErrorMsg(error.message); setGoogleLoading(false); }
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
      setErrorMsg(error.message); setLoading(false);
    }
  }

  // --- RESPONSIVE STYLES ---
  const containerStyle: React.CSSProperties = {
    minHeight: '100dvh', // Uses Dynamic Viewport Height for Mobile support
    width: '100%',
    backgroundColor: '#020617', 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    justifyContent: 'center',
    padding: '20px',
    position: 'relative',
    overflow: 'hidden'
  }

  // UPDATED: Invisible Box
  const boxStyle: React.CSSProperties = {
    width: '100%', 
    maxWidth: '380px', 
    backgroundColor: 'transparent', // Transparent background
    border: 'none',                 // No border
    padding: '24px 0',              // Removed side padding for cleaner alignment
    zIndex: 10,
    marginTop: '30px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  }

  return (
    <div style={containerStyle}>
      
      {/* Background Gradients */}
      <div style={{ position: 'fixed', top: '-20%', left: '-20%', width: '70%', height: '70%', background: '#4f46e5', filter: 'blur(150px)', borderRadius: '50%', opacity: 0.15, pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '-20%', right: '-20%', width: '70%', height: '70%', background: '#2563eb', filter: 'blur(150px)', borderRadius: '50%', opacity: 0.1, pointerEvents: 'none' }} />

      {/* 1. BRAND SECTION */}
      <div style={{ textAlign: 'center', zIndex: 10, marginTop: '-20px' }}>
        <h1 style={{ fontFamily: 'serif', fontSize: '3.5rem', fontWeight: 'bold', color: 'white', letterSpacing: '-1px', marginBottom: '0' }}>
          WYTH
        </h1>
        <p style={{ fontFamily: 'sans-serif', fontSize: '1.2rem', color: '#6366f1', marginTop: '0px', fontStyle: 'italic', opacity: 0.9 }}>
          "A Social Space for Serious Intentions"
        </p>

        <div style={{ marginTop: '25px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <p style={{ fontSize: '1.05rem', color: '#cbd5e1', letterSpacing: '0.5px', margin: 0 }}>Feel the Vibe.</p>
          <p style={{ fontSize: '1.05rem', color: '#cbd5e1', letterSpacing: '0.5px', margin: 0 }}>Understand the Person.</p>
          <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'white', textDecoration: 'underline', textDecorationColor: '#6366f1', textUnderlineOffset: '6px', marginTop: '4px' }}>
            Decide.
          </p>
        </div>
      </div>

      {/* 2. INVISIBLE FORM CONTAINER */}
      <div style={boxStyle}>

        {/* GOOGLE BUTTON */}
        <button
          onClick={handleGoogleLogin}
          disabled={googleLoading}
          style={{ 
            width: '100%', 
            padding: '14px', 
            backgroundColor: 'white', 
            borderRadius: '12px', 
            border: 'none', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '12px',
            cursor: 'pointer',
            transition: 'transform 0.1s'
          }}
        >
          {googleLoading ? <Loader2 className="animate-spin text-slate-900"/> : (
            <>
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" style={{ width: '20px', height: '20px' }} alt="G" />
              <span style={{ color: '#0f172a', fontWeight: 'bold', fontSize: '14px' }}>Continue with Google</span>
            </>
          )}
        </button>

        {/* DIVIDER */}
        <div style={{ display: 'flex', alignItems: 'center', width: '100%', margin: '24px 0', opacity: 0.4 }}>
          <div style={{ height: '1px', flex: 1, backgroundColor: 'white' }}></div>
          <span style={{ padding: '0 10px', fontSize: '11px', color: 'white', letterSpacing: '1px' }}>OR</span>
          <div style={{ height: '1px', flex: 1, backgroundColor: 'white' }}></div>
        </div>

        {/* SIGN IN FORM */}
        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
          <input 
            type="email" 
            placeholder="Email Address" 
            value={email} 
            onChange={e => setEmail(e.target.value)}
            style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.15)', backgroundColor: 'rgba(255,255,255,0.03)', color: 'white', fontSize: '14px', outline: 'none' }}
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={e => setPassword(e.target.value)}
            style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.15)', backgroundColor: 'rgba(255,255,255,0.03)', color: 'white', fontSize: '14px', outline: 'none' }}
          />

          {errorMsg && <p style={{ color: '#fb7185', fontSize: '12px', textAlign: 'center', marginTop: '5px' }}>{errorMsg}</p>}

          <button 
            type="submit" 
            disabled={loading}
            style={{ width: '100%', padding: '14px', marginTop: '10px', backgroundColor: '#4f46e5', borderRadius: '12px', border: 'none', color: 'white', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)' }}
          >
            {loading ? <Loader2 className="animate-spin mx-auto"/> : (isSignUp ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        {/* NEW HERE? */}
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <button 
            onClick={() => setIsSignUp(!isSignUp)}
            style={{ background: 'none', border: 'none', color: '#a5b4fc', fontSize: '13px', cursor: 'pointer', textDecoration: 'none' }}
          >
            {isSignUp ? 'Already have an account? Sign In' : 'New Here? Sign Up'}
          </button>
        </div>

      </div>
    </div>
  )
}