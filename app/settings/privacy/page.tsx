'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Eye, Shield, Ghost, Loader2, Lock, EyeOff } from 'lucide-react'
import { motion } from 'framer-motion'

export default function PrivacySettings() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [ghostMode, setGhostMode] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/login')
      setUser(user)

      const { data } = await supabase
        .from('profiles')
        .select('ghost_mode')
        .eq('id', user.id)
        .single()
      
      if (data) setGhostMode(data.ghost_mode || false)
      setLoading(false)
    }
    fetchData()
  }, [router])

  const toggleGhostMode = async () => {
    if (!user) return

    setUpdating(true)
    const newValue = !ghostMode
    setGhostMode(newValue) // Optimistic update

    const { error } = await supabase
        .from('profiles')
        .update({ ghost_mode: newValue })
        .eq('id', user.id)

    if (error) {
        alert("Error updating privacy settings")
        setGhostMode(!newValue) // Rollback
    }
    
    setUpdating(false)
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #E0E7FF 0%, #DBEAFE 25%, #FFFFFF 50%, #E0F2FE 75%, #DBEAFE 100%)'
      }}>
        <Loader2 size={32} style={{ color: '#1e3a8a', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #E0E7FF 0%, #DBEAFE 25%, #FFFFFF 50%, #E0F2FE 75%, #DBEAFE 100%)',
      paddingBottom: '120px',
      maxWidth: '640px',
      margin: '0 auto',
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

      {/* Header */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        padding: '16px',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        borderBottom: '1px solid rgba(226, 232, 240, 0.6)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        boxShadow: '0 2px 12px rgba(31, 41, 55, 0.05)'
      }}>
        <Link
          href="/settings"
          style={{
            padding: '8px',
            marginLeft: '-8px',
            borderRadius: '50%',
            color: '#64748b',
            transition: 'background 0.2s',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(241, 245, 249, 0.8)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 style={{
          fontSize: '18px',
          fontWeight: '700',
          color: '#1e3a8a'
        }}>
          Visibility Controls
        </h1>
      </div>

      <div style={{
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        position: 'relative',
        zIndex: 10
      }}>
        
        {/* Main Toggle Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'rgba(255, 255, 255, 0.75)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            padding: '24px',
            borderRadius: '24px',
            boxShadow: '0 8px 32px rgba(31, 41, 55, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.5)'
          }}
        >
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '16px'
          }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{
                padding: '12px',
                borderRadius: '50%',
                background: ghostMode 
                  ? 'linear-gradient(135deg, #312e81 0%, #4338ca 100%)' 
                  : 'rgba(241, 245, 249, 0.6)',
                color: ghostMode ? 'white' : '#64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s'
              }}>
                {ghostMode ? <Ghost size={24} /> : <Eye size={24} />}
              </div>
              <div>
                <h2 style={{
                  fontWeight: '700',
                  color: '#1e3a8a',
                  fontSize: '18px',
                  marginBottom: '4px'
                }}>
                  Ghost Mode
                </h2>
                <p style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: ghostMode ? '#6366f1' : '#64748b'
                }}>
                  {ghostMode ? "Active (You are invisible)" : "Inactive (You are visible)"}
                </p>
              </div>
            </div>
            
            {/* Toggle Switch */}
            <div 
              onClick={!updating ? toggleGhostMode : undefined}
              style={{
                width: '56px',
                height: '32px',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                padding: '4px',
                cursor: updating ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s',
                background: ghostMode 
                  ? 'linear-gradient(135deg, #4338ca 0%, #6366f1 100%)' 
                  : 'rgba(203, 213, 225, 0.8)',
                boxShadow: ghostMode 
                  ? '0 4px 12px rgba(67, 56, 202, 0.3)' 
                  : 'inset 0 2px 4px rgba(0, 0, 0, 0.1)',
                opacity: updating ? 0.6 : 1
              }}
            >
              <div style={{
                width: '24px',
                height: '24px',
                background: 'white',
                borderRadius: '50%',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                transform: ghostMode ? 'translateX(24px)' : 'translateX(0)',
                transition: 'transform 0.3s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {updating ? (
                  <Loader2 size={12} style={{ color: '#6366f1', animation: 'spin 1s linear infinite' }} />
                ) : ghostMode ? (
                  <EyeOff size={12} style={{ color: '#6366f1' }} />
                ) : (
                  <Eye size={12} style={{ color: '#94a3b8' }} />
                )}
              </div>
            </div>
          </div>
          
          <p style={{
            fontSize: '13px',
            color: '#64748b',
            lineHeight: '1.6',
            paddingTop: '16px',
            borderTop: '1px solid rgba(226, 232, 240, 0.4)'
          }}>
            When Ghost Mode is on, your profile is <strong style={{ color: '#1e3a8a' }}>hidden</strong> from the Discovery Feed. 
            Existing connections can still see you and chat with you.
          </p>
        </motion.div>

        {/* Info Cards */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{
              display: 'flex',
              gap: '12px',
              padding: '16px',
              background: 'rgba(59, 130, 246, 0.05)',
              border: '1px solid rgba(59, 130, 246, 0.1)',
              borderRadius: '20px',
              backdropFilter: 'blur(10px)'
            }}
          >
            <Shield style={{ color: '#2563eb', flexShrink: 0 }} size={20} />
            <div>
              <h3 style={{
                fontSize: '14px',
                fontWeight: '700',
                color: '#1e40af',
                marginBottom: '4px'
              }}>
                Social Shield Active
              </h3>
              <p style={{
                fontSize: '12px',
                color: '#3b82f6',
                lineHeight: '1.5'
              }}>
                Your career and social details are always blurred for strangers, regardless of Ghost Mode.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{
              display: 'flex',
              gap: '12px',
              padding: '16px',
              background: 'rgba(99, 102, 241, 0.05)',
              border: '1px solid rgba(99, 102, 241, 0.1)',
              borderRadius: '20px',
              backdropFilter: 'blur(10px)'
            }}
          >
            <Lock style={{ color: '#6366f1', flexShrink: 0 }} size={20} />
            <div>
              <h3 style={{
                fontSize: '14px',
                fontWeight: '700',
                color: '#4338ca',
                marginBottom: '4px'
              }}>
                Private Signals Protected
              </h3>
              <p style={{
                fontSize: '12px',
                color: '#6366f1',
                lineHeight: '1.5'
              }}>
                Income, family details, and deep data are only visible after you connect with someone.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Status Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          style={{
            padding: '20px',
            background: ghostMode 
              ? 'linear-gradient(135deg, rgba(79, 70, 229, 0.1) 0%, rgba(99, 102, 241, 0.05) 100%)'
              : 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)',
            borderRadius: '20px',
            border: `1px solid ${ghostMode ? 'rgba(99, 102, 241, 0.2)' : 'rgba(16, 185, 129, 0.2)'}`,
            textAlign: 'center'
          }}
        >
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: ghostMode ? 'rgba(99, 102, 241, 0.1)' : 'rgba(16, 185, 129, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px'
          }}>
            {ghostMode ? (
              <EyeOff size={24} style={{ color: '#6366f1' }} />
            ) : (
              <Eye size={24} style={{ color: '#10b981' }} />
            )}
          </div>
          <p style={{
            fontSize: '14px',
            fontWeight: '700',
            color: ghostMode ? '#4338ca' : '#059669',
            marginBottom: '4px'
          }}>
            {ghostMode ? 'You are currently invisible' : 'You are discoverable'}
          </p>
          <p style={{
            fontSize: '12px',
            color: '#64748b'
          }}>
            {ghostMode 
              ? 'New people cannot find your profile in the feed'
              : 'Your profile appears in the discovery feed'
            }
          </p>
        </motion.div>
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}