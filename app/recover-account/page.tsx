'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { restoreAccount } from '@/app/actions/deleteAccount'
import { Loader2 } from 'lucide-react'

export default function RecoverAccountPage() {
  const [loading, setLoading] = useState(false)
  const [declining, setDeclining] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleRestore = async () => {
    setLoading(true)
    try {
      await restoreAccount()
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  const handleDecline = async () => {
    setDeclining(true)
    // Waive grace period — mark as permanently deleted
    router.push('/account-not-found')
  }

  return (
    <div style={{
      minHeight: '100dvh',
      width: '100%',
      background: 'linear-gradient(135deg, #E0E7FF 0%, #DBEAFE 25%, #FFFFFF 50%, #E0F2FE 75%, #DBEAFE 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        background: 'rgba(255, 255, 255, 0.75)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.5)',
        borderRadius: '24px',
        padding: '40px',
        boxShadow: '0 8px 32px rgba(31, 41, 55, 0.1)',
        textAlign: 'center',
      }}>
        {/* Icon */}
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'rgba(99, 102, 241, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
          fontSize: '28px',
        }}>
          👋
        </div>

        <h1 style={{
          fontSize: '22px',
          fontWeight: '700',
          color: '#1e3a8a',
          marginBottom: '12px',
        }}>
          Welcome Back
        </h1>

        <p style={{
          fontSize: '15px',
          color: '#475569',
          lineHeight: '1.6',
          marginBottom: '8px',
        }}>
          Your account was scheduled for deletion. Would you like to restore everything?
        </p>

        <p style={{
          fontSize: '13px',
          color: '#94a3b8',
          lineHeight: '1.6',
          marginBottom: '32px',
        }}>
          Your profile, posts, and connections are still intact and can be fully restored.
        </p>

        {error && (
          <div style={{
            padding: '12px',
            borderRadius: '8px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            marginBottom: '16px',
          }}>
            <p style={{ color: '#dc2626', fontSize: '13px', margin: 0, fontWeight: '500' }}>
              {error}
            </p>
          </div>
        )}

        {/* Restore button */}
        <button
          onClick={handleRestore}
          disabled={loading || declining}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '12px',
            border: 'none',
            background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
            color: 'white',
            fontWeight: '600',
            fontSize: '15px',
            cursor: loading || declining ? 'not-allowed' : 'pointer',
            marginBottom: '12px',
            boxShadow: '0 4px 16px rgba(79, 70, 229, 0.3)',
            fontFamily: 'inherit',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            opacity: loading || declining ? 0.7 : 1,
          }}
        >
          {loading
            ? <><Loader2 className="animate-spin" style={{ width: '18px', height: '18px' }} /> Restoring...</>
            : 'Restore My Account'
          }
        </button>

        {/* Decline button */}
        <button
          onClick={handleDecline}
          disabled={loading || declining}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '12px',
            border: '1.5px solid rgba(99, 102, 241, 0.2)',
            background: 'transparent',
            color: '#94a3b8',
            fontWeight: '500',
            fontSize: '14px',
            cursor: loading || declining ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit',
            opacity: loading || declining ? 0.5 : 1,
          }}
        >
          {declining ? 'Processing...' : 'Continue with deletion'}
        </button>
      </div>
    </div>
  )
}