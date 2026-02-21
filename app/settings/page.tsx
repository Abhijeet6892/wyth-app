'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, User, Heart, Camera, Eye, Zap, ShieldCheck, 
  LogOut, Trash2, ChevronRight, Briefcase, Home, Church
} from 'lucide-react'

export default function Settings() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) router.push('/login')
      setUser(user)
    }
    getUser()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const glassCardStyle: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.75)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.5)',
    borderRadius: '20px',
    boxShadow: '0 8px 32px rgba(31, 41, 55, 0.1)',
    padding: '16px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    marginBottom: '12px'
  }

  const SettingsItem = ({ 
    icon: Icon, 
    label, 
    value, 
    onClick, 
    href, 
    color = '#1e3a8a',
    bgColor = '#e0e7ff'
  }: any) => {
    const content = (
      <div 
        onClick={onClick}
        style={glassCardStyle}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)'
          e.currentTarget.style.boxShadow = '0 12px 40px rgba(31, 41, 55, 0.15)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = '0 8px 32px rgba(31, 41, 55, 0.1)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '12px',
              background: bgColor, display: 'flex',
              alignItems: 'center', justifyContent: 'center'
            }}>
              <Icon size={20} style={{ color }} />
            </div>
            <span style={{ fontSize: '15px', fontWeight: '600', color: '#1e3a8a' }}>
              {label}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {value && (
              <span style={{
                fontSize: '12px', fontWeight: '700', color: '#d4af37',
                background: 'rgba(212, 175, 55, 0.1)',
                padding: '4px 12px', borderRadius: '8px'
              }}>
                {value}
              </span>
            )}
            <ChevronRight size={18} style={{ color: '#94a3b8' }} />
          </div>
        </div>
      </div>
    )
    
    if (href) return <Link href={href} style={{ textDecoration: 'none' }}>{content}</Link>
    return content
  }

  const SectionLabel = ({ title }: { title: string }) => (
    <h3 style={{
      fontSize: '11px', fontWeight: '700', color: '#94a3b8',
      textTransform: 'uppercase', letterSpacing: '1px',
      marginBottom: '16px', paddingLeft: '4px'
    }}>
      {title}
    </h3>
  )

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 50%, #fef3c7 100%)',
      paddingBottom: '80px',
      position: 'relative'
    }}>

      {/* Background Orbs */}
      <div style={{ 
        position: 'fixed', top: '-10%', left: '-10%',
        width: '50%', height: '50%', 
        background: 'radial-gradient(circle, rgba(30, 58, 138, 0.15) 0%, transparent 70%)', 
        filter: 'blur(60px)', pointerEvents: 'none'
      }} />
      <div style={{ 
        position: 'fixed', bottom: '-10%', right: '-10%',
        width: '50%', height: '50%', 
        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.12) 0%, transparent 70%)', 
        filter: 'blur(60px)', pointerEvents: 'none'
      }} />

      {/* Header */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(16px)',
        padding: '16px 20px',
        position: 'sticky', top: 0, zIndex: 10,
        borderBottom: '1px solid rgba(226, 232, 240, 0.5)',
        display: 'flex', alignItems: 'center', gap: '12px'
      }}>
        <Link href="/" style={{
          padding: '8px', borderRadius: '12px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(248, 250, 252, 0.5)',
          border: '1px solid rgba(226, 232, 240, 0.5)',
          cursor: 'pointer', transition: 'all 0.2s', textDecoration: 'none'
        }}>
          <ArrowLeft size={20} style={{ color: '#64748b' }} />
        </Link>
        <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#1e3a8a', margin: 0 }}>
          Settings
        </h1>
      </div>

      {/* Content */}
      <div style={{ padding: '20px', maxWidth: '480px', margin: '0 auto' }}>

        {/* Profile Section */}
        <div style={{ marginBottom: '32px' }}>
          <SectionLabel title="Profile" />
          <SettingsItem icon={User} label="Personal Details" href="/settings/edit-profile?section=basic" color="#1e3a8a" bgColor="#e0e7ff" />
          <SettingsItem icon={Briefcase} label="Career & Income" href="/settings/edit-profile?section=career" color="#2563eb" bgColor="#dbeafe" />
          <SettingsItem icon={Camera} label="Manage Photos" href="/settings/edit-profile?section=photos" color="#3b82f6" bgColor="#eff6ff" />
          <SettingsItem icon={Home} label="Background & Family" href="/settings/edit-profile?section=background" color="#059669" bgColor="#ecfdf5" />
          <SettingsItem icon={Church} label="Cultural Background" href="/settings/edit-profile?section=culture" color="#7c3aed" bgColor="#f5f3ff" />
          <SettingsItem icon={Heart} label="Partner Preferences" href="/settings/edit-profile?section=preferences" color="#ec4899" bgColor="#fce7f3" />
        </div>

        {/* Privacy & Membership Section */}
        <div style={{ marginBottom: '32px' }}>
          <SectionLabel title="Privacy & Membership" />
          <SettingsItem icon={Eye} label="Visibility Controls" href="/settings/privacy" color="#64748b" bgColor="#f1f5f9" />
          <SettingsItem icon={Zap} label="My Wallet" href="/wallet" color="#f59e0b" bgColor="#fef3c7" />
          <SettingsItem icon={ShieldCheck} label="WYTH Gold" value="Upgrade" href="/upgrade" color="#d4af37" bgColor="#fef3c7" />
        </div>

        {/* Account Section */}
        <div>
          <SectionLabel title="Account" />
          <SettingsItem icon={LogOut} label="Log Out" onClick={handleLogout} color="#64748b" bgColor="#f1f5f9" />
          <SettingsItem icon={Trash2} label="Delete Account" href="/settings/delete-account" color="#dc2626" bgColor="#fee2e2" />
        </div>

      </div>
    </div>
  )
}