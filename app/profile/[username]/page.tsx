'use client'

import { useEffect, useState, use } from 'react'
import { supabase } from '@/utils/supabase/client'
import FeedCard from '@/components/FeedCard'
import { SlotPaywall, GoldUpsell } from '@/components/InteractionModals'
import { 
  ArrowLeft, 
  Zap, 
  Hash, 
  ShieldCheck, 
  Lock, 
  MapPin, 
  Briefcase, 
  Award, 
  CheckCircle2,
  Heart,
  Loader2,
  Home,
  Church,
  Languages,
  Utensils,
  Wine,
  Cigarette
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

export default function PublicProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params)
  const router = useRouter()
  
  const [profile, setProfile] = useState<any>(null)
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isConnected, setIsConnected] = useState(false)

  // Vouch eligibility — Task 5.5
  const [vouchEligible, setVouchEligible] = useState(false)
  const [vouchTooltip, setVouchTooltip] = useState('')
  const [showVouchTooltip, setShowVouchTooltip] = useState(false)
  const [vouchingLoading, setVouchingLoading] = useState(false)
  
  // Modals state
  const [showPaywall, setShowPaywall] = useState(false)
  const [showGoldUpsell, setShowGoldUpsell] = useState(false)
  const [paywallMode, setPaywallMode] = useState<'connect' | 'comment'>('connect')

  useEffect(() => {
    const fetchProfile = async () => {
      const name = decodeURIComponent(username)
      
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUser(user)

      // Check vouch eligibility for current user — Task 5.5
      if (user) {
        const { data: myProfile } = await supabase
          .from('profiles')
          .select('account_created_at')
          .eq('id', user.id)
          .single()

        const { count: vouchesGiven } = await supabase
          .from('vouches')
          .select('*', { count: 'exact', head: true })
          .eq('voucher_id', user.id)
          .eq('vouch_invalidated', false)
          .eq('is_deleted', false)

        const accountAgeInDays = myProfile?.account_created_at
          ? Math.floor((Date.now() - new Date(myProfile.account_created_at).getTime()) / (1000 * 60 * 60 * 24))
          : 0

          if (accountAgeInDays < 90) {
            setVouchEligible(false)
            const daysLeft = 90 - accountAgeInDays
            setVouchTooltip(`You can vouch after ${daysLeft} more day${daysLeft === 1 ? '' : 's'} on Wyth`)
          } else if ((vouchesGiven ?? 0) >= 10) {
            setVouchEligible(false)
            setVouchTooltip('You have reached the maximum of 10 vouches')
          } else {
            // Check mutual chat — 3+ messages each direction
            const { count: sentCount } = await supabase
              .from('messages')
              .select('*', { count: 'exact', head: true })
              .eq('sender_id', user.id)
              .eq('receiver_id', profile?.id)
          
            const { count: receivedCount } = await supabase
              .from('messages')
              .select('*', { count: 'exact', head: true })
              .eq('sender_id', profile?.id)
              .eq('receiver_id', user.id)
          
            if ((sentCount ?? 0) < 3 || (receivedCount ?? 0) < 3) {
              setVouchEligible(false)
              setVouchTooltip('Exchange at least 3 messages each way before vouching')
            } else {
              setVouchEligible(true)
              setVouchTooltip('')
            }
          }
      }

      let query = supabase.from('profiles').select('*')
      
      if (name.startsWith('WYTH')) {
         const { data: byID } = await supabase.from('profiles').select('*').eq('brand_id', name).maybeSingle()
         if (byID) {
             setProfileData(byID, user)
             return
         }
      }

      const { data: byName } = await query.ilike('full_name', `%${name}%`).limit(1).maybeSingle()
      
      if (byName) {
          setProfileData(byName, user)
      } else {
          setLoading(false)
      }
    }

    const setProfileData = async (userData: any, user: any) => {
        setProfile(userData)
        
        if (user) {
            const { data: connection } = await supabase
                .from('connections')
                .select('*')
                .or(`and(requester_id.eq.${user.id},receiver_id.eq.${userData.id}),and(requester_id.eq.${userData.id},receiver_id.eq.${user.id})`)
                .eq('status', 'accepted')
                .maybeSingle()
            
            if (connection || user.id === userData.id) setIsConnected(true)
        }

        const { data: postData } = await supabase
          .from('posts')
          .select('*, profiles(*)')
          .eq('user_id', userData.id)
          .order('created_at', { ascending: false }) 
        
        setPosts(postData || [])
        setLoading(false)
    }

    if (username) fetchProfile()
  }, [username])

  const handleConnect = () => {
      if (!currentUser) return router.push('/login')
      setPaywallMode('connect')
      setShowPaywall(true)
  }

  // Task 5.5 — eligibility gate before calling RPC
  const handleVouch = async () => {
      if (!currentUser) return router.push('/login')
      if (!vouchEligible) {
        setShowVouchTooltip(true)
        setTimeout(() => setShowVouchTooltip(false), 3000)
        return
      }
      setVouchingLoading(true)
      const { data, error } = await supabase.rpc('vouch_for_user', { target_id: profile.id })
      if (data === 'success_vouched') {
          alert(`You verified ${profile.full_name}!`)
          setProfile((prev: any) => ({ ...prev, vouches_count: (prev.vouches_count || 0) + 1 }))
      } else {
          alert("Unable to vouch. You may have already vouched.")
      }
      setVouchingLoading(false)
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
        <Loader2 size={32} className="animate-spin" style={{ color: '#1e3a8a' }} />
      </div>
    );
  }
  
  if (!profile && !loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        background: 'linear-gradient(135deg, #E0E7FF 0%, #DBEAFE 25%, #FFFFFF 50%, #E0F2FE 75%, #DBEAFE 100%)'
      }}>
        <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1e3a8a', marginBottom: '12px' }}>
          User not found
        </h2>
        <Link href="/" style={{
          padding: '12px 24px',
          background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
          color: 'white', borderRadius: '16px', fontWeight: '700',
          fontSize: '14px', textDecoration: 'none',
          boxShadow: '0 4px 12px rgba(30, 58, 138, 0.3)'
        }}>
          Go Home
        </Link>
      </div>
    );
  }

  const signals = profile.profile_signals || {}
  const lifestyle = profile.lifestyle || {}
  const isOwnProfile = currentUser?.id === profile.id

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #E0E7FF 0%, #DBEAFE 25%, #FFFFFF 50%, #E0F2FE 75%, #DBEAFE 100%)',
      display: 'flex',
      justifyContent: 'center',
      position: 'relative'
    }}>
      {/* Background Orbs */}
      <div style={{ 
        position: 'fixed', top: '-10%', left: '-10%', width: '50%', height: '50%', 
        background: 'radial-gradient(circle, rgba(30, 58, 138, 0.15) 0%, transparent 70%)', 
        filter: 'blur(60px)', pointerEvents: 'none', zIndex: 1
      }} />
      <div style={{ 
        position: 'fixed', bottom: '-10%', right: '-10%', width: '50%', height: '50%', 
        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.12) 0%, transparent 70%)', 
        filter: 'blur(60px)', pointerEvents: 'none', zIndex: 1
      }} />

      <div style={{
        width: '100%', maxWidth: '448px',
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(20px)', minHeight: '100vh',
        boxShadow: '0 0 60px rgba(31, 41, 55, 0.08)', position: 'relative',
        paddingBottom: isConnected || isOwnProfile ? '100px' : '140px',
        zIndex: 10
      }}>
        
        {/* Header */}
        <div style={{
          position: 'sticky', top: 0,
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px)', zIndex: 30,
          padding: '12px 16px', display: 'flex',
          alignItems: 'center', justifyContent: 'space-between',
          borderBottom: '1px solid rgba(226, 232, 240, 0.6)'
        }}>
          <Link href="/" style={{
            padding: '8px', marginLeft: '-8px', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.2s', textDecoration: 'none'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(241, 245, 249, 0.8)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <ArrowLeft size={20} style={{ color: '#64748b' }} />
          </Link>
          <span style={{ fontWeight: '700', color: '#1e3a8a', fontSize: '16px' }}>
            {profile.full_name}
          </span>
          <div style={{ width: '32px' }}></div>
        </div>

        <div style={{ padding: '16px' }}>

          {/* Zero-vouch notification — Task 5.4 — only on own profile */}
          {isOwnProfile && (profile.vouches_count === 0) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: 'rgba(99, 102, 241, 0.06)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                borderRadius: '16px', padding: '14px 16px',
                marginBottom: '20px', display: 'flex',
                alignItems: 'flex-start', gap: '12px'
              }}
            >
              <ShieldCheck size={18} style={{ color: '#6366f1', flexShrink: 0, marginTop: '2px' }} />
              <p style={{ fontSize: '13px', color: '#4f46e5', lineHeight: '1.6', margin: 0 }}>
                Your profile endorsements have changed. Consider inviting someone who knows you to vouch for you.
              </p>
            </motion.div>
          )}

          {/* Hero Image */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              width: '100%', aspectRatio: '1',
              background: 'rgba(241, 245, 249, 0.8)',
              borderRadius: '24px', overflow: 'hidden',
              marginBottom: '24px', position: 'relative',
              boxShadow: '0 8px 32px rgba(31, 41, 55, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.5)'
            }}
          >
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.full_name}`} alt={profile.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            )}
            
            <div style={{
              position: 'absolute', bottom: '16px', left: '16px',
              background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)',
              padding: '8px 16px', borderRadius: '16px', fontSize: '12px',
              fontWeight: '700', color: '#1e3a8a',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.5)',
              display: 'flex', alignItems: 'center', gap: '6px'
            }}>
              <Heart size={12} style={{ fill: '#1e3a8a' }} />
              {profile.intent === 'ready_marriage' ? 'Ready for Marriage' : profile.intent === 'dating_marriage' ? 'Dating for Marriage' : 'Exploring'}
            </div>
          </motion.div>

          {/* Name & ID */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <h1 style={{
              fontSize: '32px', fontWeight: '700', color: '#1e3a8a',
              marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px'
            }}>
              {profile.full_name}
              {profile.is_gold ? (
                <Award size={20} style={{ color: '#f59e0b', fill: '#f59e0b' }} />
              ) : (
                <CheckCircle2 size={20} style={{ color: '#2563eb', fill: 'rgba(37, 99, 235, 0.1)' }} />
              )}
            </h1>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
              {profile.brand_id && (
                <p style={{
                  fontSize: '11px', color: '#94a3b8', fontFamily: 'monospace',
                  display: 'flex', alignItems: 'center', gap: '4px',
                  background: 'rgba(241, 245, 249, 0.6)', padding: '4px 12px',
                  borderRadius: '8px', border: '1px solid rgba(226, 232, 240, 0.5)'
                }}>
                  <Hash size={12} /> {profile.brand_id}
                </p>
              )}
              {/* Task 5.3 — count reads from DB on load, always reflects current state */}
              <div style={{
                fontSize: '11px', background: 'rgba(99, 102, 241, 0.1)',
                color: '#4f46e5', fontWeight: '700', padding: '6px 12px',
                borderRadius: '8px', display: 'flex', alignItems: 'center',
                gap: '4px', border: '1px solid rgba(99, 102, 241, 0.1)'
              }}>
                <ShieldCheck size={12} /> {profile.vouches_count || 0} Vouches
              </div>
            </div>

            <p style={{
              color: '#64748b', marginBottom: '24px',
              display: 'flex', alignItems: 'center', gap: '6px',
              fontSize: '14px', fontWeight: '500'
            }}>
              <MapPin size={16} style={{ color: '#f59e0b' }} /> 
              {profile.city_display || profile.city}
              {profile.gender && <span style={{ marginLeft: '4px' }}>• {profile.gender}</span>}
            </p>
          </motion.div>

          {/* BIO */}
          {profile.bio && (
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              style={{
                marginBottom: '32px', padding: '20px',
                background: 'rgba(241, 245, 249, 0.6)', borderRadius: '20px',
                border: '1px solid rgba(226, 232, 240, 0.6)', fontStyle: 'italic',
                color: '#475569', fontSize: '15px', lineHeight: '1.6',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)'
              }}
            >
              "{profile.bio}"
            </motion.div>
          )}

          {/* LIFESTYLE CHIPS */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '32px' }}
          >
            {lifestyle.diet && (
              <span style={{
                padding: '10px 16px', background: 'rgba(16, 185, 129, 0.05)',
                border: '1px solid rgba(16, 185, 129, 0.1)', borderRadius: '16px',
                fontSize: '13px', fontWeight: '600', color: '#059669',
                display: 'flex', alignItems: 'center', gap: '6px'
              }}>
                <Utensils size={12} /> {lifestyle.diet}
              </span>
            )}
            {lifestyle.drink && (
              <span style={{
                padding: '10px 16px', background: 'rgba(139, 92, 246, 0.05)',
                border: '1px solid rgba(139, 92, 246, 0.1)', borderRadius: '16px',
                fontSize: '13px', fontWeight: '600', color: '#7c3aed',
                display: 'flex', alignItems: 'center', gap: '6px'
              }}>
                <Wine size={12} /> {lifestyle.drink} Drinker
              </span>
            )}
            {lifestyle.smoke && (
              <span style={{
                padding: '10px 16px', background: 'rgba(239, 68, 68, 0.05)',
                border: '1px solid rgba(239, 68, 68, 0.1)', borderRadius: '16px',
                fontSize: '13px', fontWeight: '600', color: '#dc2626',
                display: 'flex', alignItems: 'center', gap: '6px'
              }}>
                <Cigarette size={12} /> {lifestyle.smoke} Smoker
              </span>
            )}
          </motion.div>

          <div style={{ height: '1px', background: 'rgba(226, 232, 240, 0.6)', marginBottom: '32px' }} />

          {/* DEEP DATA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            style={{ marginBottom: '32px' }}
          >
            <h3 style={{
              fontWeight: '700', fontSize: '18px', marginBottom: '16px',
              display: 'flex', alignItems: 'center', gap: '8px', color: '#1e3a8a'
            }}>
              Private Preferences
              {!isConnected && <Lock size={16} style={{ color: '#f59e0b' }} />}
            </h3>
            
            {isConnected ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ padding: '16px', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '16px', border: '1px solid rgba(59, 130, 246, 0.1)' }}>
                  <p style={{ fontSize: '10px', color: '#2563eb', textTransform: 'uppercase', fontWeight: '700', marginBottom: '4px', letterSpacing: '0.5px' }}>Income Range</p>
                  <p style={{ fontWeight: '700', color: '#1e3a8a', fontSize: '14px' }}>₹{signals.incomeSignal?.min || '?'}-{signals.incomeSignal?.max || '?'}L</p>
                </div>
                <div style={{ padding: '16px', background: 'rgba(168, 85, 247, 0.05)', borderRadius: '16px', border: '1px solid rgba(168, 85, 247, 0.1)' }}>
                  <p style={{ fontSize: '10px', color: '#9333ea', textTransform: 'uppercase', fontWeight: '700', marginBottom: '4px', letterSpacing: '0.5px' }}>Family</p>
                  <p style={{ fontWeight: '700', color: '#1e3a8a', fontSize: '14px' }}>{signals.familyTypeSignal || 'Not specified'}</p>
                </div>
                <div style={{ padding: '16px', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '16px', border: '1px solid rgba(16, 185, 129, 0.1)', gridColumn: '1 / -1' }}>
                  <p style={{ fontSize: '10px', color: '#059669', textTransform: 'uppercase', fontWeight: '700', marginBottom: '4px', letterSpacing: '0.5px' }}>Culture</p>
                  <p style={{ fontWeight: '700', color: '#1e3a8a', fontSize: '14px' }}>{signals.religionSignal || 'Not specified'}</p>
                </div>
              </div>
            ) : (
              <div
                onClick={handleConnect}
                style={{
                  position: 'relative', overflow: 'hidden', borderRadius: '20px',
                  border: '1px solid rgba(245, 158, 11, 0.2)',
                  background: 'rgba(254, 243, 199, 0.3)', padding: '24px',
                  textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(254, 243, 199, 0.5)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(254, 243, 199, 0.3)'}
              >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: 0.6 }}>
                  <div style={{ height: '16px', background: '#cbd5e1', borderRadius: '8px', width: '50%' }}></div>
                  <div style={{ height: '16px', background: '#cbd5e1', borderRadius: '8px', width: '75%' }}></div>
                </div>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(2px)' }}>
                  <div style={{ background: 'white', padding: '12px', borderRadius: '50%', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', marginBottom: '8px', transition: 'transform 0.2s' }}>
                    <Lock size={20} style={{ color: '#f59e0b' }} />
                  </div>
                  <p style={{ fontSize: '12px', fontWeight: '700', color: '#92400e' }}>Connect to unlock Deep Data</p>
                </div>
              </div>
            )}
          </motion.div>

          <div style={{ height: '1px', background: 'rgba(226, 232, 240, 0.6)', marginBottom: '32px' }} />
          
          <h3 style={{ fontWeight: '700', fontSize: '18px', marginBottom: '16px', color: '#1e3a8a' }}>
            Activity
          </h3>
          
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
            {posts.map(post => (
              <FeedCard 
                key={post.id} post={post}
                isConnected={isConnected}
                onConnect={handleConnect}
                onSocialUnlock={() => setShowGoldUpsell(true)}
                onComment={() => setShowPaywall(true)}
              />
            ))}
            {posts.length === 0 && (
              <p style={{ color: '#94a3b8', textAlign: 'center', padding: '32px 16px', fontSize: '14px' }}>
                No public activity yet.
              </p>
            )}
          </motion.div>
        </div>

        {/* Sticky Action Bar */}
        {!isConnected && !isOwnProfile && (
          <div style={{
            position: 'fixed', bottom: '24px', left: '50%',
            transform: 'translateX(-50%)', width: '100%',
            maxWidth: '416px', padding: '0 16px', zIndex: 50
          }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.5)',
              boxShadow: '0 8px 32px rgba(31, 41, 55, 0.15)',
              borderRadius: '20px', padding: '12px', display: 'flex', gap: '12px'
            }}>

              {/* Vouch button — Task 5.5 — disabled state + tooltip */}
              <div style={{ flex: 1, position: 'relative' }}>
                <button
                  onClick={handleVouch}
                  disabled={vouchingLoading}
                  style={{
                    width: '100%',
                    background: vouchEligible ? 'rgba(99, 102, 241, 0.1)' : 'rgba(148, 163, 184, 0.1)',
                    border: vouchEligible ? '1px solid rgba(99, 102, 241, 0.2)' : '1px solid rgba(148, 163, 184, 0.2)',
                    color: vouchEligible ? '#4f46e5' : '#94a3b8',
                    padding: '14px', borderRadius: '16px', fontWeight: '700', fontSize: '14px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    cursor: vouchEligible ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s', fontFamily: 'inherit'
                  }}
                  onMouseEnter={(e) => {
                    if (!vouchEligible) setShowVouchTooltip(true)
                    else {
                      e.currentTarget.style.background = 'rgba(99, 102, 241, 0.15)'
                      e.currentTarget.style.transform = 'scale(0.98)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    setShowVouchTooltip(false)
                    if (vouchEligible) {
                      e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)'
                      e.currentTarget.style.transform = 'scale(1)'
                    }
                  }}
                >
                  {vouchingLoading
                    ? <Loader2 size={16} className="animate-spin" />
                    : <><ShieldCheck size={18} /> Vouch</>
                  }
                </button>

                {/* Tooltip */}
                {showVouchTooltip && !vouchEligible && vouchTooltip && (
                  <div style={{
                    position: 'absolute', bottom: '110%', left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'rgba(15, 23, 42, 0.9)',
                    backdropFilter: 'blur(8px)',
                    color: 'white', fontSize: '12px', fontWeight: '500',
                    padding: '8px 12px', borderRadius: '10px',
                    whiteSpace: 'nowrap', zIndex: 60,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                    pointerEvents: 'none'
                  }}>
                    {vouchTooltip}
                    {/* Tooltip arrow */}
                    <div style={{
                      position: 'absolute', top: '100%', left: '50%',
                      transform: 'translateX(-50%)', width: 0, height: 0,
                      borderLeft: '6px solid transparent',
                      borderRight: '6px solid transparent',
                      borderTop: '6px solid rgba(15, 23, 42, 0.9)'
                    }} />
                  </div>
                )}
              </div>

              <button
                onClick={handleConnect}
                style={{
                  flex: 2,
                  background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
                  border: 'none', color: 'white', padding: '14px',
                  borderRadius: '16px', fontWeight: '700', fontSize: '14px',
                  boxShadow: '0 4px 16px rgba(30, 58, 138, 0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: '8px', cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'inherit'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)'
                  e.currentTarget.style.transform = 'scale(0.98)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)'
                  e.currentTarget.style.transform = 'scale(1)'
                }}
              >
                Connect <Zap size={16} style={{ color: '#fbbf24', fill: '#fbbf24' }} />
              </button>
            </div>
          </div>
        )}

        <SlotPaywall isOpen={showPaywall} mode={paywallMode} onClose={() => setShowPaywall(false)} />
        <GoldUpsell isOpen={showGoldUpsell} onClose={() => setShowGoldUpsell(false)} />
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  )
}