'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabase/client'
import Link from 'next/link'
import { ArrowLeft, Zap, Shield, Loader2, Sparkles, Crown } from 'lucide-react'

export default function WalletPage() {
  const [balance, setBalance] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(false)

  const refreshBalance = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data, error } = await supabase
        .from('profiles')
        .select('wallet_balance')
        .eq('id', user.id)
        .single()
      
      if (error) console.error("Balance Fetch Error:", error.message)
      setBalance(data?.wallet_balance || 0)
    }
    setLoading(false)
  }

  useEffect(() => { refreshBalance() }, [])

  const handleBuy = async (amount: number, cost: number) => {
    setPurchasing(true)
    
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
        alert("Error: Please log in again.")
        setPurchasing(false)
        return
    }

    const { error } = await supabase.rpc('buy_coins', { amount: amount })
    
    if (!error) {
        alert(`✅ Success! Added ${amount} Coins.`)
        await refreshBalance()
    } else {
        console.error("RPC Error:", error)
        alert(`❌ Failed: ${error.message}`)
    }
    setPurchasing(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #E0E7FF 0%, #DBEAFE 25%, #FFFFFF 50%, #E0F2FE 75%, #DBEAFE 100%)',
      paddingBottom: '96px',
      position: 'relative'
    }}>
      
      {/* Background Orbs */}
      <div style={{ 
        position: 'fixed', 
        top: '-10%', 
        left: '-10%', 
        width: '50%', 
        height: '50%', 
        background: 'radial-gradient(circle, rgba(30, 58, 138, 0.15) 0%, transparent 70%)', 
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

      {/* Header - Glassmorphism */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        background: 'rgba(255, 255, 255, 0.75)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.5)',
        boxShadow: '0 4px 16px rgba(31, 41, 55, 0.08)',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
      }}>
        <Link 
          href="/"
          style={{
            padding: '8px',
            borderRadius: '12px',
            background: 'transparent',
            border: 'none',
            color: '#1E3A8A',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(30, 58, 138, 0.1)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#1E3A8A', flex: 1 }}>
          Wallet
        </h1>
      </header>

      <div style={{
        maxWidth: '640px',
        margin: '0 auto',
        padding: '24px 16px',
        position: 'relative',
        zIndex: 10
      }}>

        {/* Balance Card - Premium Gradient */}
        <div style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
          borderRadius: '24px',
          padding: '40px 32px',
          boxShadow: '0 20px 60px rgba(30, 58, 138, 0.3)',
          marginBottom: '32px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Decorative orb */}
          <div style={{
            position: 'absolute',
            top: '-20%',
            right: '-10%',
            width: '200px',
            height: '200px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
            filter: 'blur(40px)'
          }} />
          
          <p style={{ 
            fontSize: '11px', 
            color: 'rgba(255, 255, 255, 0.7)',
            fontWeight: '600',
            marginBottom: '12px',
            textTransform: 'uppercase',
            letterSpacing: '1.5px',
            position: 'relative',
            zIndex: 10
          }}>
            Current Balance
          </p>
          
          <div style={{ 
            display: 'flex', 
            alignItems: 'baseline', 
            gap: '12px', 
            position: 'relative', 
            zIndex: 10,
            marginBottom: '8px'
          }}>
            {loading ? (
              <Loader2 size={56} style={{ color: 'white', animation: 'spin 1s linear infinite' }} />
            ) : (
              <>
                <span style={{ 
                  fontSize: '64px', 
                  fontWeight: '700', 
                  color: 'white',
                  lineHeight: '1'
                }}>
                  {balance}
                </span>
                <span style={{ 
                  fontSize: '24px', 
                  fontWeight: '600', 
                  color: '#D4AF37',
                  marginBottom: '8px'
                }}>
                  Coins
                </span>
              </>
            )}
          </div>
        </div>

        {/* Section Header */}
        <h2 style={{ 
          fontSize: '18px', 
          fontWeight: '700', 
          color: '#1e3a8a', 
          marginBottom: '20px',
          marginLeft: '4px'
        }}>
          Coin Packs
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Starter Pack */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.75)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.5)',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 4px 16px rgba(31, 41, 55, 0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            transition: 'all 0.2s',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(31, 41, 55, 0.12)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(31, 41, 55, 0.08)';
          }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <div style={{
                  padding: '10px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Zap size={20} style={{ color: '#ef4444' }} />
                </div>
                <div>
                  <span style={{ 
                    fontWeight: '700', 
                    color: '#1e3a8a', 
                    fontSize: '17px',
                    display: 'block'
                  }}>
                    Starter Pack
                  </span>
                  <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                    100 Coins • Good for basics
                  </p>
                </div>
              </div>
            </div>
            <button 
              disabled={purchasing} 
              onClick={() => handleBuy(100, 99)}
              style={{
                background: purchasing ? 'rgba(30, 58, 138, 0.5)' : 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
                color: 'white',
                padding: '14px 28px',
                borderRadius: '14px',
                fontSize: '16px',
                fontWeight: '700',
                border: 'none',
                cursor: purchasing ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                boxShadow: purchasing ? 'none' : '0 4px 12px rgba(30, 58, 138, 0.3)',
                fontFamily: 'inherit'
              }}
              onMouseEnter={(e) => {
                if (!purchasing) {
                  e.currentTarget.style.transform = 'scale(1.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (!purchasing) {
                  e.currentTarget.style.transform = 'scale(1)';
                }
              }}
            >
              {purchasing ? "..." : "₹99"}
            </button>
          </div>

          {/* Gold Pack - RECOMMENDED */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(245, 158, 11, 0.15) 100%)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '2px solid rgba(212, 175, 55, 0.4)',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 8px 24px rgba(212, 175, 55, 0.25)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.2s',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 10px 28px rgba(212, 175, 55, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(212, 175, 55, 0.25)';
          }}
          >
            <div style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              background: '#D4AF37',
              color: 'white',
              fontSize: '9px',
              fontWeight: '700',
              padding: '6px 12px',
              borderRadius: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              boxShadow: '0 2px 8px rgba(212, 175, 55, 0.3)'
            }}>
              ⭐ BEST VALUE
            </div>
            
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <div style={{
                  padding: '10px',
                  background: 'rgba(212, 175, 55, 0.2)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Crown size={20} style={{ color: '#D4AF37' }} />
                </div>
                <div>
                  <span style={{ 
                    fontWeight: '700', 
                    color: '#1e3a8a', 
                    fontSize: '17px',
                    display: 'block'
                  }}>
                    Gold Pack
                  </span>
                  <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                    500 Coins • Most popular
                  </p>
                </div>
              </div>
            </div>
            <button 
              disabled={purchasing} 
              onClick={() => handleBuy(500, 399)}
              style={{
                background: purchasing ? 'rgba(212, 175, 55, 0.5)' : '#D4AF37',
                color: 'white',
                padding: '14px 28px',
                borderRadius: '14px',
                fontSize: '16px',
                fontWeight: '700',
                border: 'none',
                cursor: purchasing ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                boxShadow: purchasing ? 'none' : '0 4px 12px rgba(212, 175, 55, 0.4)',
                fontFamily: 'inherit'
              }}
              onMouseEnter={(e) => {
                if (!purchasing) {
                  e.currentTarget.style.transform = 'scale(1.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (!purchasing) {
                  e.currentTarget.style.transform = 'scale(1)';
                }
              }}
            >
              {purchasing ? "..." : "₹399"}
            </button>
          </div>

          {/* Premium Pack */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.75)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.5)',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 4px 16px rgba(31, 41, 55, 0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            transition: 'all 0.2s',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(31, 41, 55, 0.12)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(31, 41, 55, 0.08)';
          }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <div style={{
                  padding: '10px',
                  background: 'rgba(99, 102, 241, 0.1)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Shield size={20} style={{ color: '#6366f1' }} />
                </div>
                <div>
                  <span style={{ 
                    fontWeight: '700', 
                    color: '#1e3a8a', 
                    fontSize: '17px',
                    display: 'block'
                  }}>
                    Premium Pack
                  </span>
                  <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                    1000 Coins • Power user
                  </p>
                </div>
              </div>
            </div>
            <button 
              disabled={purchasing} 
              onClick={() => handleBuy(1000, 699)}
              style={{
                background: purchasing ? 'rgba(30, 58, 138, 0.5)' : 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
                color: 'white',
                padding: '14px 28px',
                borderRadius: '14px',
                fontSize: '16px',
                fontWeight: '700',
                border: 'none',
                cursor: purchasing ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                boxShadow: purchasing ? 'none' : '0 4px 12px rgba(30, 58, 138, 0.3)',
                fontFamily: 'inherit'
              }}
              onMouseEnter={(e) => {
                if (!purchasing) {
                  e.currentTarget.style.transform = 'scale(1.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (!purchasing) {
                  e.currentTarget.style.transform = 'scale(1)';
                }
              }}
            >
              {purchasing ? "..." : "₹699"}
            </button>
          </div>

        </div>

        {/* Info Card */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.6)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid rgba(226, 232, 240, 0.5)',
          borderRadius: '20px',
          padding: '20px',
          marginTop: '32px'
        }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <Sparkles size={24} style={{ color: '#D4AF37', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <h3 style={{ 
                fontSize: '14px', 
                fontWeight: '700', 
                color: '#1e3a8a', 
                marginBottom: '8px' 
              }}>
                What are Coins?
              </h3>
              <p style={{ 
                fontSize: '13px', 
                color: '#475569', 
                fontWeight: '400', 
                lineHeight: '1.6' 
              }}>
                Coins unlock premium features like priority comments (199 coins), 
                sharing contact cards, and unlocking locked profiles. They're your 
                currency for meaningful connections.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Spin animation */}
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}