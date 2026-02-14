'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, CheckCircle, Plus, Loader2, Image as ImageIcon, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'

export default function ManagePhotos() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [media, setMedia] = useState<any[]>([])
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/login')

      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(prof)

      const { data: posts } = await supabase.from('posts').select('*').eq('user_id', user.id).eq('type', 'photo').order('created_at', { ascending: false })
      setMedia(posts || [])
      setLoading(false)
    }
    fetchData()
  }, [router])

  const handleSetAvatar = async (url: string) => {
    if(!confirm("Set as profile photo?")) return;
    
    const { error } = await supabase
      .from('profiles')
      .update({ avatar_url: url })
      .eq('id', profile.id);
    
    if (!error) {
      setProfile((prev: any) => ({ ...prev, avatar_url: url }));
      alert('Profile photo updated!');
    }
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
            color: '#64748b',
            borderRadius: '50%',
            transition: 'background 0.2s',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(241, 245, 249, 0.8)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <ArrowLeft size={22} />
        </Link>
        <h1 style={{
          fontWeight: '700',
          color: '#1e3a8a',
          fontSize: '18px'
        }}>
          Manage Photos
        </h1>
      </div>

      <div style={{
        padding: '16px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px',
        maxWidth: '640px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 10
      }}>
        {/* Current Avatar Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            gridColumn: '1 / -1',
            background: 'rgba(255, 255, 255, 0.75)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            padding: '20px',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            boxShadow: '0 4px 16px rgba(31, 41, 55, 0.08)'
          }}
        >
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'rgba(226, 232, 240, 0.5)',
            overflow: 'hidden',
            position: 'relative',
            border: '4px solid white',
            boxShadow: '0 4px 12px rgba(31, 41, 55, 0.1)',
            flexShrink: 0
          }}>
            <img 
              src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.full_name}`} 
              alt="Profile"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          </div>
          <div>
            <p style={{
              fontWeight: '700',
              color: '#1e3a8a',
              fontSize: '18px',
              marginBottom: '4px'
            }}>
              Profile Photo
            </p>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: 'rgba(16, 185, 129, 0.1)',
              padding: '6px 12px',
              borderRadius: '8px',
              width: 'fit-content',
              marginTop: '8px'
            }}>
              <CheckCircle size={12} style={{ color: '#10b981' }} />
              <span style={{
                fontSize: '11px',
                fontWeight: '700',
                color: '#10b981'
              }}>
                Visible to all
              </span>
            </div>
          </div>
        </motion.div>

        {/* Post Grid */}
        {media.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            style={{
              position: 'relative',
              aspectRatio: '1',
              background: 'rgba(255, 255, 255, 0.75)',
              borderRadius: '20px',
              overflow: 'hidden',
              border: '1px solid rgba(255, 255, 255, 0.5)',
              boxShadow: '0 4px 12px rgba(31, 41, 55, 0.08)',
              cursor: 'pointer'
            }}
          >
            <img 
              src={item.media_url} 
              alt="Post"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.4)',
              backdropFilter: 'blur(4px)',
              opacity: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'opacity 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
            >
              <button
                onClick={() => handleSetAvatar(item.media_url)}
                style={{
                  fontSize: '11px',
                  background: 'white',
                  color: '#1e3a8a',
                  padding: '8px 16px',
                  borderRadius: '12px',
                  fontWeight: '700',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontFamily: 'inherit',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                Make Avatar
              </button>
            </div>
          </motion.div>
        ))}
        
        {/* Add New Placeholder */}
        <Link
          href="/"
          style={{
            aspectRatio: '1',
            borderRadius: '20px',
            border: '2px dashed rgba(148, 163, 184, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#94a3b8',
            transition: 'all 0.2s',
            cursor: 'pointer',
            textDecoration: 'none',
            background: 'rgba(241, 245, 249, 0.4)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(241, 245, 249, 0.6)';
            e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(241, 245, 249, 0.4)';
            e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.3)';
          }}
        >
          <Plus size={28} style={{ marginBottom: '8px' }} />
          <span style={{
            fontSize: '12px',
            fontWeight: '700',
            textAlign: 'center'
          }}>
            Post Photo
          </span>
        </Link>
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