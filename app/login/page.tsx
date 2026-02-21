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
  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '')
  const justDeleted = searchParams.get('deleted') === 'true'

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
  
      // Check if returning user has a soft deleted account
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_deleted, deletion_grace_until, deleted_by')
        .eq('id', session.user.id)
        .maybeSingle()
  
      if (profile?.is_deleted) {
        if (profile.deleted_by === 'admin') {
          router.replace('/banned')
        } else if (profile.deletion_grace_until && new Date(profile.deletion_grace_until) > new Date()) {
          router.replace('/recover-account')
        } else {
          router.replace('/account-not-found')
        }
      } else {
        router.replace('/')
      }
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
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, is_deleted, deletion_grace_until, deleted_by')
            .eq('id', data.user.id)
            .maybeSingle()
  
          if (!profile) {
            router.push('/onboarding')
            return
          }
  
          if (profile.is_deleted) {
            if (profile.deleted_by === 'admin') {
              router.push('/banned')
            } else if (profile.deletion_grace_until && new Date(profile.deletion_grace_until) > new Date()) {
              router.push('/recover-account')
            } else {
              router.push('/account-not-found')
            }
          } else {
            router.push('/')
          }
        }
      }
    } catch (error: any) {
      setErrorMsg(error.message)
      setLoading(false)
    }
  }

  
  // === PREMIUM GLASSMORPHISM STYLES ===
  const containerStyle: React.CSSProperties = {
    minHeight: '100dvh',
    width: '100%',
    background: 'linear-gradient(135deg, #E0E7FF 0%, #DBEAFE 25%, #FFFFFF 50%, #E0F2FE 75%, #DBEAFE 100%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    position: 'relative',
    overflow: 'hidden'
  }

  const glassCardStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: '420px',
    background: 'rgba(255, 255, 255, 0.75)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.5)',
    borderRadius: '24px',
    padding: '40px',
    boxShadow: '0 8px 32px rgba(31, 41, 55, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.5)',
    zIndex: 10,
    marginTop: '30px',
    boxSizing: 'border-box'
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '14px 16px',
    borderRadius: '12px',
    border: '1.5px solid rgba(99, 102, 241, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    color: '#1e3a8a',
    fontSize: '15px',
    outline: 'none',
    transition: 'all 0.2s ease',
    fontFamily: 'inherit',
    textAlign: 'left',
    boxSizing: 'border-box'
  }

  const googleButtonStyle: React.CSSProperties = {
    width: '100%',
    padding: '14px 16px',
    backgroundColor: 'white',
    borderRadius: '12px',
    border: '1.5px solid rgba(99, 102, 241, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 8px rgba(79, 70, 229, 0.1)',
    fontFamily: 'inherit',
    boxSizing: 'border-box'
  }

  const submitButtonStyle: React.CSSProperties = {
    width: '100%',
    padding: '14px 16px',
    marginTop: '10px',
    background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
    borderRadius: '12px',
    border: 'none',
    color: 'white',
    fontWeight: '600',
    fontSize: '15px',
    cursor: 'pointer',
    boxShadow: '0 4px 16px rgba(79, 70, 229, 0.3)',
    transition: 'all 0.2s ease',
    fontFamily: 'inherit',
    boxSizing: 'border-box'
  }

  return (
    <div style={containerStyle}>
      
      {/* Gradient Orbs */}
      <div style={{ 
        position: 'fixed', 
        top: '-10%', 
        left: '-10%', 
        width: '50%', 
        height: '50%', 
        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)', 
        filter: 'blur(60px)', 
        pointerEvents: 'none',
        zIndex: 1
      }} />
      <div style={{ 
        position: 'fixed', 
        bottom: '-10%', 
        right: '-10%', 
        width: '50%', 
        height: '50%', 
        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.12) 0%, transparent 70%)', 
        filter: 'blur(60px)', 
        pointerEvents: 'none',
        zIndex: 1
      }} />

      {/* Logo Section */}
      <div style={{ 
        textAlign: 'center', 
        zIndex: 10, 
        marginBottom: '20px',
        width: '100%',
        maxWidth: '420px'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '280px',
          margin: '0 auto 20px'
        }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 340 100" width="100%" height="auto" preserveAspectRatio="xMidYMid meet" aria-label="WYTH Logo">
            <defs>
              <linearGradient id="weldShine" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{stopColor: '#1E3A8A', stopOpacity: 1}} />
                <stop offset="50%" style={{stopColor: '#2E4F9E', stopOpacity: 1}} />
                <stop offset="100%" style={{stopColor: '#1E3A8A', stopOpacity: 1}} />
              </linearGradient>
            </defs>
            <style>
              {`
                .brand-blue { fill: #1E3A8A; }
                .anchor-letter {
                  opacity: 0;
                  animation: riseUp 1s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
                }
                .letter-y {
                  opacity: 0;
                  animation: riseUp 1s cubic-bezier(0.2, 0.8, 0.2, 1) 0.1s forwards;
                }
                .letter-t {
                  opacity: 0;
                  transform: translateX(20px) translateY(10px);
                  animation: slideConnect 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) 0.3s forwards;
                }
                .fusion-joint {
                  opacity: 0;
                  fill: url(#weldShine);
                  animation: weldFlash 1s ease-out 1.2s forwards;
                }
                @keyframes riseUp {
                  from { opacity: 0; transform: translateY(15px); }
                  to { opacity: 1; transform: translateY(0); }
                }
                @keyframes slideConnect {
                  0% { opacity: 0; transform: translateX(25px) translateY(15px); }
                  20% { opacity: 1; }
                  100% { opacity: 1; transform: translateX(0) translateY(0); }
                }
                @keyframes weldFlash {
                  0% { opacity: 0; }
                  50% { opacity: 1; }
                  100% { opacity: 0; }
                }
              `}
            </style>
            <g>
              <path className="brand-blue anchor-letter" d="M10,30 Q10,28 12,28 L22,28 Q24,28 24.5,30 L34,68 L43.5,30 Q44,28 46,28 L54,28 Q56,28 56.5,30 L66,68 L75.5,30 Q76,28 78,28 L88,28 Q90,28 90,30 L80,78 Q79,82 75,82 L65,82 Q61,82 60,78 L50,42 L40,78 Q39,82 35,82 L25,82 Q21,82 20,78 Z" />
              <path className="brand-blue letter-y" d="M105,30 Q105,28 107,28 L118,28 Q120,28 121,30 L134,55 L149,30 Q150,28 152,28 L166,28 Q168,28 168,30 L148,62 L148,78 Q148,82 144,82 L132,82 Q128,82 128,78 L128,62 Z" />
              <path className="brand-blue letter-t" d="M163,28 L210,28 Q212,28 212,30 L212,40 Q212,42 210,42 L196,42 L196,78 Q196,82 192,82 L180,82 Q176,82 176,78 L176,42 L163,42 Q161,42 161,40 L161,30 Q161,28 163,28 Z" />
              <path className="brand-blue anchor-letter" style={{animationDelay: '0.2s'}} d="M225,30 Q225,28 227,28 L239,28 Q241,28 241,30 L241,48 L274,48 L274,30 Q274,28 276,28 L288,28 Q290,28 290,30 L290,78 Q290,82 286,82 L274,82 Q270,82 270,78 L270,60 L241,60 L241,78 Q241,82 237,82 L225,82 Q221,82 221,78 Z" />
              <rect className="fusion-joint" x="160" y="28" width="10" height="14" rx="2" />
            </g>
          </svg>
        </div>

        <p style={{ 
          fontFamily: 'Georgia, serif', 
          fontSize: 'clamp(1rem, 2.5vw, 1.15rem)',
          color: '#4f46e5', 
          marginTop: '12px',
          fontStyle: 'bold',
          fontWeight: '500',
          letterSpacing: '0.3px'
        }}>
          "A Social Space for Serious Intentions"
        </p>

        <div style={{ 
          marginTop: '20px', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '4px' 
        }}>
          <p style={{ 
            fontSize: 'clamp(0.9rem, 2vw, 1rem)', 
            color: '#475569', 
            letterSpacing: '0.3px', 
            margin: 0,
            fontWeight: '500'
          }}>Sense the Vibe.</p>
          <p style={{ 
            fontSize: 'clamp(0.9rem, 2vw, 1rem)', 
            color: '#475569', 
            letterSpacing: '0.3px', 
            margin: 0,
            fontWeight: '500'
          }}>Know the Person.</p>
          <p style={{ 
            fontSize: 'clamp(1rem, 2.2vw, 1.15rem)', 
            fontWeight: '700', 
            color: '#1e3a8a', 
            textDecoration: 'underline', 
            textDecorationColor: '#6366f1', 
            textUnderlineOffset: '6px', 
            marginTop: '4px' 
          }}>
            'FIND THE ONE'.
          </p>
        </div>
      </div>
      {justDeleted && (
  <div style={{
    width: '100%',
    maxWidth: '420px',
    padding: '16px',
    borderRadius: '12px',
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
    border: '1px solid rgba(99, 102, 241, 0.2)',
    marginBottom: '16px',
    zIndex: 10,
    textAlign: 'center'
  }}>
    <p style={{ color: '#4f46e5', fontSize: '14px', margin: 0, fontWeight: '500' }}>
      Your account has been scheduled for deletion.
    </p>
    <p style={{ color: '#64748b', fontSize: '13px', margin: '4px 0 0', }}>
      You have 30 days to recover it by logging back in.
    </p>
  </div>
)}

      {/* Glassmorphism Form Card */}
      <div style={glassCardStyle}>

        {/* Google Button */}
        <button
          onClick={handleGoogleLogin}
          disabled={googleLoading}
          style={googleButtonStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(79, 70, 229, 0.2)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(79, 70, 229, 0.1)'
          }}
        >
          {googleLoading ? (
            <Loader2 className="animate-spin" style={{ color: '#1e3a8a', width: '20px', height: '20px' }}/>
          ) : (
            <>
              <img 
                src="https://www.svgrepo.com/show/475656/google-color.svg" 
                style={{ width: '20px', height: '20px' }} 
                alt="Google"
              />
              <span style={{ 
                color: '#1e3a8a', 
                fontWeight: '600', 
                fontSize: '15px' 
              }}>
                Continue with Google
              </span>
            </>
          )}
        </button>

        {/* Divider */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          width: '100%', 
          margin: '24px 0' 
        }}>
          <div style={{ 
            height: '1px', 
            flex: 1, 
            background: 'linear-gradient(to right, transparent, rgba(99, 102, 241, 0.3), transparent)' 
          }}></div>
          <span style={{ 
            padding: '0 12px', 
            fontSize: '12px', 
            color: '#64748b', 
            letterSpacing: '1px',
            fontWeight: '500'
          }}>OR</span>
          <div style={{ 
            height: '1px', 
            flex: 1, 
            background: 'linear-gradient(to right, transparent, rgba(99, 102, 241, 0.3), transparent)' 
          }}></div>
        </div>

        {/* Sign In Form */}
        <form onSubmit={handleAuth} style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '14px', 
          width: '100%' 
        }}>
          <input 
            type="email" 
            placeholder="Email Address" 
            value={email} 
            onChange={e => setEmail(e.target.value)}
            required
            style={inputStyle}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.5)'
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)'
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.2)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={e => setPassword(e.target.value)}
            required
            style={inputStyle}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.5)'
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)'
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.2)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          />

          {errorMsg && (
            <div style={{
              padding: '12px',
              borderRadius: '8px',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)'
            }}>
              <p style={{ 
                color: '#dc2626', 
                fontSize: '13px', 
                textAlign: 'center',
                margin: 0,
                fontWeight: '500'
              }}>
                {errorMsg}
              </p>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            style={submitButtonStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(30, 58, 138, 0.4)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(30, 58, 138, 0.3)'
            }}
          >
            {loading ? (
              <Loader2 className="animate-spin" style={{ margin: '0 auto', width: '20px', height: '20px' }}/>
            ) : (
              isSignUp ? 'Create Account' : 'Sign In'
            )}
          </button>
        </form>

        {/* Toggle Sign Up/Sign In */}
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <button 
            onClick={() => setIsSignUp(!isSignUp)}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: '#6366f1', 
              fontSize: '14px', 
              cursor: 'pointer', 
              textDecoration: 'none',
              fontWeight: '500',
              transition: 'color 0.2s ease',
              fontFamily: 'inherit'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#4f46e5'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#6366f1'}
          >
            {isSignUp ? 'Already have an account? Sign In' : 'New Here? Sign Up'}
          </button>
        </div>

      </div>

      {/* Responsive Media Queries */}
      <style jsx>{`
        @media (max-width: 480px) {
          input, button {
            font-size: 14px !important;
          }
        }
        
        @media (max-width: 390px) {
          div[style*="padding: 40px"] {
            padding: 32px 24px !important;
          }
        }
        
        input::placeholder {
          color: #94a3b8;
          opacity: 1;
        }
        
        input:focus::placeholder {
          color: #cbd5e1;
        }
      `}</style>

    </div>
  )
}