'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabase/client'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, UserPlus, ShieldCheck, MessageCircle, 
  CreditCard, Bell, Sparkles, Loader2
} from 'lucide-react'

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchNotifications = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('notifications')
        .select(`
            *,
            profiles:actor_id (full_name, avatar_url, is_gold)
        `)
        .eq('receiver_id', user.id)
        .order('created_at', { ascending: false })

      setNotifications(data || [])
      setLoading(false)
      
      // Mark read on load
      if (data && data.length > 0) {
          await supabase.from('notifications').update({ is_read: true }).eq('receiver_id', user.id)
      }
    }
    
    fetchNotifications()
  }, [])

  // Helper for "Vibe" Icons
  const getIcon = (type: string) => {
      switch(type) {
          case 'connection_request': return <UserPlus size={18} style={{ color: '#2563eb' }} />
          case 'vouch': return <ShieldCheck size={18} style={{ color: '#6366f1' }} />
          case 'secure_card': return <CreditCard size={18} style={{ color: '#f59e0b' }} />
          case 'comment': return <MessageCircle size={18} style={{ color: '#ec4899' }} />
          default: return <Bell size={18} style={{ color: '#94a3b8' }} />
      }
  }

  // Helper for Background Colors
  const getBgColor = (type: string) => {
      switch(type) {
          case 'connection_request': return { bg: 'rgba(37, 99, 235, 0.05)', border: 'rgba(37, 99, 235, 0.1)' }
          case 'vouch': return { bg: 'rgba(99, 102, 241, 0.05)', border: 'rgba(99, 102, 241, 0.1)' }
          case 'secure_card': return { bg: 'rgba(245, 158, 11, 0.05)', border: 'rgba(245, 158, 11, 0.1)' }
          case 'comment': return { bg: 'rgba(236, 72, 153, 0.05)', border: 'rgba(236, 72, 153, 0.1)' }
          default: return { bg: 'rgba(241, 245, 249, 0.6)', border: 'rgba(226, 232, 240, 0.6)' }
      }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #E0E7FF 0%, #DBEAFE 25%, #FFFFFF 50%, #E0F2FE 75%, #DBEAFE 100%)',
      paddingBottom: '120px',
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
        padding: '16px 16px',
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
          href="/"
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
          color: '#1e3a8a',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          Notifications
          {notifications.some(n => !n.is_read) && (
            <div style={{
              width: '8px',
              height: '8px',
              background: '#ef4444',
              borderRadius: '50%',
              boxShadow: '0 0 8px rgba(239, 68, 68, 0.5)',
              animation: 'pulse 2s ease-in-out infinite'
            }} />
          )}
        </h1>
      </div>

      <div style={{
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        maxWidth: '640px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 10
      }}>
        {loading ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            paddingTop: '80px',
            paddingBottom: '80px',
            gap: '16px'
          }}>
            <Loader2 size={32} style={{ color: '#94a3b8', animation: 'spin 1s linear infinite' }} />
            <p style={{
              fontSize: '12px',
              color: '#94a3b8',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              fontWeight: '600'
            }}>
              Loading notifications...
            </p>
          </div>
        ) : notifications.length === 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            paddingTop: '80px',
            paddingBottom: '80px',
            color: '#94a3b8'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              background: 'rgba(241, 245, 249, 0.6)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
              border: '1px solid rgba(226, 232, 240, 0.6)'
            }}>
              <Bell size={28} style={{ color: '#cbd5e1' }} />
            </div>
            <p style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#64748b'
            }}>
              All caught up!
            </p>
            <p style={{
              fontSize: '12px',
              color: '#94a3b8',
              marginTop: '4px'
            }}>
              No new notifications
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {notifications.map((n, i) => {
              const colors = getBgColor(n.type);
              return (
                <motion.div 
                  key={n.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  style={{
                    position: 'relative',
                    overflow: 'hidden',
                    borderRadius: '20px',
                    border: n.is_read 
                      ? '1px solid rgba(226, 232, 240, 0.6)' 
                      : `1px solid ${colors.border}`,
                    padding: '16px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '16px',
                    transition: 'all 0.2s',
                    background: n.is_read 
                      ? 'rgba(255, 255, 255, 0.75)' 
                      : 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(20px)',
                    boxShadow: n.is_read 
                      ? '0 2px 8px rgba(0, 0, 0, 0.02)' 
                      : '0 4px 20px rgba(99, 102, 241, 0.08)',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 24px rgba(31, 41, 55, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = n.is_read 
                      ? '0 2px 8px rgba(0, 0, 0, 0.02)' 
                      : '0 4px 20px rgba(99, 102, 241, 0.08)';
                  }}
                >
                  {!n.is_read && (
                    <div style={{
                      position: 'absolute',
                      top: '16px',
                      right: '16px',
                      width: '8px',
                      height: '8px',
                      background: '#6366f1',
                      borderRadius: '50%',
                      boxShadow: '0 0 8px rgba(99, 102, 241, 0.5)'
                    }} />
                  )}

                  {/* Icon Box */}
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    border: `1px solid ${colors.border}`,
                    background: colors.bg
                  }}>
                    {getIcon(n.type)}
                  </div>
                  
                  <div style={{
                    flex: 1,
                    minWidth: 0
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '4px'
                    }}>
                      <span style={{
                        fontWeight: '700',
                        color: '#1e3a8a',
                        fontSize: '14px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {n.profiles?.full_name || 'Someone'}
                      </span>
                      {n.profiles?.is_gold && (
                        <span style={{
                          width: '6px',
                          height: '6px',
                          background: '#f59e0b',
                          borderRadius: '50%',
                          flexShrink: 0
                        }} />
                      )}
                    </div>
                    <p style={{
                      fontSize: '14px',
                      color: '#475569',
                      lineHeight: '1.5',
                      marginBottom: '8px'
                    }}>
                      {n.content}
                    </p>
                    <p style={{
                      fontSize: '11px',
                      color: '#94a3b8',
                      fontWeight: '500'
                    }}>
                      {new Date(n.created_at).toLocaleDateString(undefined, { 
                        month: 'short', 
                        day: 'numeric', 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>

                  {/* Avatar Preview */}
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'rgba(226, 232, 240, 0.5)',
                    overflow: 'hidden',
                    border: '2px solid white',
                    flexShrink: 0,
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                  }}>
                    <img 
                      src={n.profiles?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${n.profiles?.full_name}`} 
                      alt={n.profiles?.full_name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}