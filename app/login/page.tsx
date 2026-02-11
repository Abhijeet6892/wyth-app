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

  // Check Session
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

  // --- STYLES ---
  const containerStyle: React.CSSProperties = {
    minHeight: '100vh', 
    backgroundColor: '#020617', // Deep Dark Blue
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    justifyContent: 'center', // Centers everything vertically
    padding: '20px',
    position: 'relative',
    overflow: 'hidden'
  }

  return (
    <div style={containerStyle}>
      
      {/* 1. BRAND SECTION */}
      <div style={{ textAlign: 'center', marginBottom: '40px', zIndex: 10 }}>
        {/* WYTH: Serif Font */}
        <h1 style={{ fontFamily: 'serif', fontSize: '3.5rem', fontWeight: 'bold', color: 'white', letterSpacing: '-1px', marginBottom: '0' }}>
          WYTH
        </h1>
        
        {/* Tagline: Cursive */}
        <p style={{ fontFamily: 'cursive', fontSize: '1.2rem', color: '#a5b4fc', marginTop: '5px', fontStyle: 'italic' }}>
          Connect for Life
        </p>

        {/* The 3 Lines: Distinct Vibe */}
        <div style={{ marginTop: '30px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <p style={{ fontSize: '1.1rem', color: '#e0e7ff', letterSpacing: '0.5px' }}>Feel the Vibe.</p>
          <p style={{ fontSize: '1.1rem', color: '#e0e7ff', letterSpacing: '0.5px' }}>Understand the Person.</p>
          <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white', textDecoration: 'underline', textDecorationColor: '#6366f1', textUnderlineOffset: '4px' }}>
            Decide.
          </p>
        </div>
      </div>

      {/* 2. RECTANGULAR BOX SECTION */}
      <div style={{ 
        width: '100%', 
        maxWidth: '380px', 
        backgroundColor: 'rgba(255, 255, 255, 0.05)', // Subtle Glass
        border: '1px solid rgba(255, 255, 255, 0.1)', 
        borderRadius: '16px', // Rectangular but slightly soft
        padding: '24px',
        zIndex: 10
      }}>

        {/* GOOGLE BUTTON (Simple) */}
        <button
          onClick={handleGoogleLogin}
          disabled={googleLoading}
          style={{ 
            width: '100%', 
            padding: '12px', 
            backgroundColor: 'white', 
            borderRadius: '8px', 
            border: 'none', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '10px',
            cursor: 'pointer'
          }}
        >
          {googleLoading ? <Loader2 className="animate-spin text-slate-900"/> : (
            <>
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" style={{ width: '20px', height: '20px' }} alt="G" />
              <span style={{ color: '#0f172a', fontWeight: 'bold', fontSize: '14px' }}>Continue with Google</span>
            </>
          )}
        </button>

        {/* OR DIVIDER */}
        <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0', opacity: 0.5 }}>
          <div style={{ height: '1px', flex: 1, backgroundColor: 'white' }}></div>
          <span style={{ padding: '0 10px', fontSize: '12px', color: 'white' }}>OR</span>
          <div style={{ height: '1px', flex: 1, backgroundColor: 'white' }}></div>
        </div>

        {/* SIGN IN FORM */}
        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input 
            type="email" 
            placeholder="Email Address" 
            value={email} 
            onChange={e => setEmail(e.target.value)}
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', backgroundColor: 'transparent', color: 'white', fontSize: '14px' }}
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={e => setPassword(e.target.value)}
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', backgroundColor: 'transparent', color: 'white', fontSize: '14px' }}
          />

          {errorMsg && <p style={{ color: '#fb7185', fontSize: '12px', textAlign: 'center' }}>{errorMsg}</p>}

          <button 
            type="submit" 
            disabled={loading}
            style={{ width: '100%', padding: '12px', marginTop: '10px', backgroundColor: '#4f46e5', borderRadius: '8px', border: 'none', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}
          >
            {loading ? <Loader2 className="animate-spin mx-auto"/> : (isSignUp ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        {/* NEW HERE? */}
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button 
            onClick={() => setIsSignUp(!isSignUp)}
            style={{ background: 'none', border: 'none', color: '#a5b4fc', fontSize: '13px', cursor: 'pointer', textDecoration: 'underline' }}
          >
            {isSignUp ? 'Already have an account? Sign In' : 'New Here? Sign Up'}
          </button>
        </div>

      </div>
    </div>
  )
}