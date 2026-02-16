'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, User, Heart, Camera, Eye, Zap, ShieldCheck, 
  LogOut, Trash2, ChevronRight, AlertTriangle, X 
} from 'lucide-react'

export default function Settings() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)

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

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      alert('Please type DELETE to confirm')
      return
    }

    setDeleting(true)
    
    try {
      // Get current session
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        throw new Error('No active session')
      }

      console.log('Calling delete account Edge Function...')

      // Call the deployed Edge Function
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/delete-account`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      const result = await response.json()
      console.log('Delete account response:', result)

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete account')
      }

      console.log('Account deleted successfully via Edge Function')

      // Sign out (user is already deleted from auth)
      await supabase.auth.signOut()
      
      alert('Account deleted successfully. We\'re sorry to see you go.')
      router.push('/login')
      
    } catch (error: any) {
      console.error('Delete account error:', error)
      alert(`Error: ${error.message || 'Failed to delete account. Please try again or contact support.'}`)
    } finally {
      setDeleting(false)
    }
  }

  // Glassmorphism styles matching your app
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
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: bgColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Icon size={20} style={{ color }} />
            </div>
            <span style={{ 
              fontSize: '15px', 
              fontWeight: '600', 
              color: '#1e3a8a' 
            }}>
              {label}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {value && (
              <span style={{
                fontSize: '12px',
                fontWeight: '700',
                color: '#d4af37',
                background: 'rgba(212, 175, 55, 0.1)',
                padding: '4px 12px',
                borderRadius: '8px'
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

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 50%, #fef3c7 100%)',
      paddingBottom: '80px',
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
        pointerEvents: 'none'
      }} />
      <div style={{ 
        position: 'fixed', 
        bottom: '-10%', 
        right: '-10%', 
        width: '50%', 
        height: '50%', 
        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.12) 0%, transparent 70%)', 
        filter: 'blur(60px)', 
        pointerEvents: 'none'
      }} />

      {/* Header */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(16px)',
        padding: '16px 20px',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        borderBottom: '1px solid rgba(226, 232, 240, 0.5)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <Link 
          href="/" 
          style={{
            padding: '8px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(248, 250, 252, 0.5)',
            border: '1px solid rgba(226, 232, 240, 0.5)',
            cursor: 'pointer',
            transition: 'all 0.2s',
            textDecoration: 'none'
          }}
        >
          <ArrowLeft size={20} style={{ color: '#64748b' }} />
        </Link>
        <h1 style={{ 
          fontSize: '20px', 
          fontWeight: '700', 
          color: '#1e3a8a',
          margin: 0 
        }}>
          Settings
        </h1>
      </div>

      {/* Content */}
      <div style={{ 
        padding: '20px',
        maxWidth: '480px',
        margin: '0 auto'
      }}>
        {/* Profile Section */}
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{
            fontSize: '11px',
            fontWeight: '700',
            color: '#94a3b8',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: '16px',
            paddingLeft: '4px'
          }}>
            Profile
          </h3>
          <SettingsItem 
            icon={User} 
            label="Personal Details" 
            href="/settings/edit-profile"
            color="#1e3a8a"
            bgColor="#e0e7ff"
          />
          <SettingsItem 
            icon={Camera} 
            label="Manage Photos" 
            href="/settings/photos"
            color="#2563eb"
            bgColor="#dbeafe"
          />
          <SettingsItem 
            icon={Heart} 
            label="Partner Preferences" 
            href="/settings/edit-profile"
            color="#ec4899"
            bgColor="#fce7f3"
          />
        </div>

        {/* Privacy & Membership Section */}
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{
            fontSize: '11px',
            fontWeight: '700',
            color: '#94a3b8',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: '16px',
            paddingLeft: '4px'
          }}>
            Privacy & Membership
          </h3>
          <SettingsItem 
            icon={Eye} 
            label="Visibility Controls" 
            href="/settings/privacy"
            color="#64748b"
            bgColor="#f1f5f9"
          />
          <SettingsItem 
            icon={Zap} 
            label="My Wallet" 
            href="/wallet"
            color="#f59e0b"
            bgColor="#fef3c7"
          />
          <SettingsItem 
            icon={ShieldCheck} 
            label="WYTH Gold" 
            value="Upgrade"
            href="/upgrade"
            color="#d4af37"
            bgColor="#fef3c7"
          />
        </div>

        {/* Account Section */}
        <div>
          <h3 style={{
            fontSize: '11px',
            fontWeight: '700',
            color: '#94a3b8',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: '16px',
            paddingLeft: '4px'
          }}>
            Account
          </h3>
          <SettingsItem 
            icon={LogOut} 
            label="Log Out" 
            onClick={handleLogout}
            color="#64748b"
            bgColor="#f1f5f9"
          />
          <SettingsItem 
            icon={Trash2} 
            label="Delete Account" 
            onClick={() => setShowDeleteModal(true)}
            color="#dc2626"
            bgColor="#fee2e2"
          />
        </div>
      </div>

      {/* Delete Account Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !deleting && setShowDeleteModal(false)}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(4px)',
                zIndex: 50,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px'
              }}
            >
              {/* Modal */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '24px',
                  padding: '32px',
                  maxWidth: '400px',
                  width: '100%',
                  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                  border: '1px solid rgba(255, 255, 255, 0.5)',
                  position: 'relative'
                }}
              >
                {/* Close button */}
                {!deleting && (
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    style={{
                      position: 'absolute',
                      top: '16px',
                      right: '16px',
                      background: 'rgba(248, 250, 252, 0.5)',
                      border: '1px solid rgba(226, 232, 240, 0.5)',
                      borderRadius: '12px',
                      padding: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <X size={18} style={{ color: '#64748b' }} />
                  </button>
                )}

                {/* Warning Icon */}
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: '#fee2e2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px'
                }}>
                  <AlertTriangle size={32} style={{ color: '#dc2626' }} />
                </div>

                {/* Title */}
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#1e3a8a',
                  textAlign: 'center',
                  marginBottom: '12px'
                }}>
                  Delete Account?
                </h2>

                {/* Description */}
                <p style={{
                  fontSize: '15px',
                  color: '#64748b',
                  textAlign: 'center',
                  lineHeight: '1.6',
                  marginBottom: '24px'
                }}>
                  This action cannot be undone. All your data, photos, connections, and messages will be permanently deleted.
                </p>

                {/* Warning Box */}
                <div style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: '16px',
                  padding: '16px',
                  marginBottom: '24px'
                }}>
                  <p style={{
                    fontSize: '13px',
                    color: '#991b1b',
                    lineHeight: '1.5',
                    margin: 0
                  }}>
                    <strong>You will lose:</strong><br />
                    • All profile data and photos<br />
                    • All connections and conversations<br />
                    • Vouches and reputation<br />
                    • Premium subscription (no refund)
                  </p>
                </div>

                {/* Confirmation Input */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#64748b',
                    display: 'block',
                    marginBottom: '8px'
                  }}>
                    Type <strong style={{ color: '#dc2626' }}>DELETE</strong> to confirm:
                  </label>
                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    disabled={deleting}
                    placeholder="DELETE"
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      borderRadius: '12px',
                      border: '1.5px solid rgba(226, 232, 240, 0.5)',
                      background: 'rgba(248, 250, 252, 0.8)',
                      fontSize: '15px',
                      color: '#1e3a8a',
                      outline: 'none',
                      fontFamily: 'inherit',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(220, 38, 38, 0.5)'
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(220, 38, 38, 0.1)'
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(226, 232, 240, 0.5)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  />
                </div>

                {/* Action Buttons */}
                <div style={{ 
                  display: 'flex', 
                  gap: '12px' 
                }}>
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    disabled={deleting}
                    style={{
                      flex: 1,
                      padding: '14px',
                      borderRadius: '12px',
                      border: '1.5px solid rgba(226, 232, 240, 0.5)',
                      background: 'white',
                      color: '#64748b',
                      fontSize: '15px',
                      fontWeight: '600',
                      cursor: deleting ? 'not-allowed' : 'pointer',
                      opacity: deleting ? 0.5 : 1,
                      fontFamily: 'inherit'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleting || deleteConfirmText !== 'DELETE'}
                    style={{
                      flex: 1,
                      padding: '14px',
                      borderRadius: '12px',
                      border: 'none',
                      background: deleteConfirmText === 'DELETE' && !deleting
                        ? 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)'
                        : '#e5e7eb',
                      color: deleteConfirmText === 'DELETE' && !deleting ? 'white' : '#9ca3af',
                      fontSize: '15px',
                      fontWeight: '600',
                      cursor: (deleting || deleteConfirmText !== 'DELETE') ? 'not-allowed' : 'pointer',
                      fontFamily: 'inherit',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    {deleting ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          style={{
                            width: '16px',
                            height: '16px',
                            border: '2px solid rgba(255, 255, 255, 0.3)',
                            borderTopColor: 'white',
                            borderRadius: '50%'
                          }}
                        />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 size={18} />
                        Delete Forever
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}