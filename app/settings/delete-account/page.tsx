'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { deleteAccount } from '@/app/actions/deleteAccount'
import { supabase } from '@/utils/supabase/client'
import { Loader2 } from 'lucide-react'

const REASONS = [
  'I found my person 🎉',
  'I need time for myself',
  'I wasn\'t ready for this yet',
  'The right person wasn\'t here',
  'I have privacy concerns',
  'Prefer not to say',
]

export default function DeleteAccountPage() {
  const [step, setStep] = useState<'warning' | 'connections' | 'reason' | 'confirm'>('warning')
  const [selectedReason, setSelectedReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [connectionCount, setConnectionCount] = useState<number>(0)
  const [countLoading, setCountLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchConnectionCount = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { count } = await supabase
        .from('connections')
        .select('*', { count: 'exact', head: true })
        .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .in('status', ['pending', 'active'])
        .eq('is_deleted', false)

      setConnectionCount(count ?? 0)
      setCountLoading(false)
    }
    fetchConnectionCount()
  }, [])

  const handleDelete = async () => {
    setLoading(true)
    setError('')
    try {
      await deleteAccount(selectedReason || undefined)
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  const cardStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: '420px',
    background: 'rgba(255, 255, 255, 0.75)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.5)',
    borderRadius: '24px',
    padding: '40px',
    boxShadow: '0 8px 32px rgba(31, 41, 55, 0.1)',
  }

  const primaryRedBtn: React.CSSProperties = {
    width: '100%',
    padding: '14px',
    borderRadius: '12px',
    border: 'none',
    background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
    color: 'white',
    fontWeight: '600',
    fontSize: '15px',
    cursor: 'pointer',
    marginBottom: '12px',
    boxShadow: '0 4px 16px rgba(220, 38, 38, 0.25)',
    fontFamily: 'inherit',
  }

  const ghostBtn: React.CSSProperties = {
    width: '100%',
    padding: '14px',
    borderRadius: '12px',
    border: '1.5px solid rgba(99, 102, 241, 0.2)',
    background: 'transparent',
    color: '#6366f1',
    fontWeight: '500',
    fontSize: '14px',
    cursor: 'pointer',
    fontFamily: 'inherit',
  }

  const iconBox = (emoji: string, bg: string) => (
    <div style={{
      width: '64px', height: '64px', borderRadius: '50%',
      background: bg, display: 'flex', alignItems: 'center',
      justifyContent: 'center', margin: '0 auto 24px', fontSize: '28px',
    }}>
      {emoji}
    </div>
  )

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

      {/* Step indicator */}
      <div style={{
        display: 'flex', gap: '8px', marginBottom: '24px',
      }}>
        {['warning', 'connections', 'reason', 'confirm'].map((s, i) => (
          <div key={s} style={{
            width: '8px', height: '8px', borderRadius: '50%',
            background: step === s ? '#4f46e5' : 'rgba(99,102,241,0.25)',
            transition: 'all 0.2s ease',
          }} />
        ))}
      </div>

      <div style={cardStyle}>

        {/* STEP 1 — WARNING */}
        {step === 'warning' && (
          <>
            {iconBox('⚠️', 'rgba(239, 68, 68, 0.1)')}
            <h1 style={{
              fontSize: '22px', fontWeight: '700', color: '#1e3a8a',
              marginBottom: '16px', textAlign: 'center',
            }}>
              Delete Your Account
            </h1>
            <div style={{
              background: 'rgba(239, 68, 68, 0.06)',
              border: '1px solid rgba(239, 68, 68, 0.15)',
              borderRadius: '12px', padding: '16px', marginBottom: '24px',
            }}>
              <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.7', margin: 0 }}>
                Deleting your account will remove your <strong>profile, posts, and connections</strong> from Wyth.
                <br /><br />
                You have <strong>30 days</strong> to change your mind by logging back in. After that, this cannot be undone.
              </p>
            </div>
            <button onClick={() => setStep('connections')} style={primaryRedBtn}>
              I understand, continue
            </button>
            <button onClick={() => router.back()} style={ghostBtn}>
              Go Back
            </button>
          </>
        )}

        {/* STEP 2 — PENDING CONNECTIONS NOTICE */}
        {step === 'connections' && (
          <>
            {iconBox('🤝', 'rgba(99, 102, 241, 0.1)')}
            <h1 style={{
              fontSize: '20px', fontWeight: '700', color: '#1e3a8a',
              marginBottom: '12px', textAlign: 'center',
            }}>
              You have people waiting
            </h1>

            {countLoading ? (
              <div style={{ textAlign: 'center', padding: '16px' }}>
                <Loader2 className="animate-spin" style={{ color: '#6366f1', width: '24px', height: '24px', margin: '0 auto' }} />
              </div>
            ) : (
              <div style={{
                background: 'rgba(99, 102, 241, 0.06)',
                border: '1px solid rgba(99, 102, 241, 0.15)',
                borderRadius: '12px', padding: '16px', marginBottom: '16px',
                textAlign: 'center',
              }}>
                {connectionCount > 0 ? (
                  <>
                    <p style={{ fontSize: '32px', fontWeight: '700', color: '#4f46e5', margin: '0 0 8px' }}>
                      {connectionCount}
                    </p>
                    <p style={{ fontSize: '14px', color: '#475569', margin: 0, lineHeight: '1.6' }}>
                      {connectionCount === 1
                        ? 'person is currently connected with you.'
                        : 'people are currently connected with you.'}
                      <br />
                      <strong>They will lose their slot</strong> and receive no explanation when you leave.
                    </p>
                  </>
                ) : (
                  <p style={{ fontSize: '14px', color: '#475569', margin: 0, lineHeight: '1.6' }}>
                    You have no active or pending connections right now.
                  </p>
                )}
              </div>
            )}

            {connectionCount > 0 && (
              <p style={{
                fontSize: '13px', color: '#94a3b8', lineHeight: '1.6',
                marginBottom: '20px', textAlign: 'center',
              }}>
                Consider giving them closure before you go. A kind goodbye goes a long way.
              </p>
            )}

            <button onClick={() => setStep('reason')} style={primaryRedBtn}>
              {connectionCount > 0 ? 'Continue anyway' : 'Continue'}
            </button>
            <button onClick={() => router.push('/chat')} style={{
              ...ghostBtn,
              marginBottom: '12px',
              display: connectionCount > 0 ? 'block' : 'none',
            }}>
              Say goodbye first
            </button>
            <button onClick={() => setStep('warning')} style={ghostBtn}>
              Back
            </button>
          </>
        )}

        {/* STEP 3 — REASON */}
        {step === 'reason' && (
          <>
            <h1 style={{
              fontSize: '20px', fontWeight: '700', color: '#1e3a8a',
              marginBottom: '8px', textAlign: 'center',
            }}>
              Why are you leaving?
            </h1>
            <p style={{
              fontSize: '13px', color: '#94a3b8', textAlign: 'center',
              marginBottom: '24px', lineHeight: '1.5',
            }}>
              Optional. Only visible to Wyth. Helps us build better.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
              {REASONS.map(reason => (
                <button
                  key={reason}
                  onClick={() => setSelectedReason(reason === selectedReason ? '' : reason)}
                  style={{
                    width: '100%', padding: '14px 16px',
                    borderRadius: '12px', textAlign: 'left',
                    border: selectedReason === reason
                      ? '1.5px solid #6366f1'
                      : '1.5px solid rgba(99, 102, 241, 0.2)',
                    background: selectedReason === reason
                      ? 'rgba(99, 102, 241, 0.08)'
                      : 'rgba(255, 255, 255, 0.6)',
                    color: selectedReason === reason ? '#4f46e5' : '#475569',
                    fontWeight: selectedReason === reason ? '600' : '400',
                    fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {reason}
                </button>
              ))}
            </div>
            <button onClick={() => setStep('confirm')} style={primaryRedBtn}>
              Continue
            </button>
            <button onClick={() => setStep('connections')} style={ghostBtn}>
              Back
            </button>
          </>
        )}

        {/* STEP 4 — FINAL CONFIRM */}
        {step === 'confirm' && (
          <>
            {iconBox('🗑️', 'rgba(239, 68, 68, 0.1)')}
            <h1 style={{
              fontSize: '20px', fontWeight: '700', color: '#1e3a8a',
              marginBottom: '12px', textAlign: 'center',
            }}>
              Last chance
            </h1>
            <p style={{
              fontSize: '14px', color: '#475569', lineHeight: '1.7',
              marginBottom: '8px', textAlign: 'center',
            }}>
              Your account will be scheduled for deletion.
            </p>
            <p style={{
              fontSize: '13px', color: '#94a3b8', lineHeight: '1.6',
              marginBottom: '28px', textAlign: 'center',
            }}>
              Log back in within <strong>30 days</strong> if you change your mind.
            </p>

            {error && (
              <div style={{
                padding: '12px', borderRadius: '8px',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                marginBottom: '16px',
              }}>
                <p style={{ color: '#dc2626', fontSize: '13px', margin: 0, fontWeight: '500' }}>
                  {error}
                </p>
              </div>
            )}

            <button
              onClick={handleDelete}
              disabled={loading}
              style={{
                ...primaryRedBtn,
                background: loading ? '#9ca3af' : 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
                boxShadow: loading ? 'none' : '0 4px 16px rgba(220, 38, 38, 0.25)',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: '8px',
              }}
            >
              {loading
                ? <><Loader2 className="animate-spin" style={{ width: '18px', height: '18px' }} /> Deleting...</>
                : 'Yes, Delete My Account'
              }
            </button>
            <button
              onClick={() => setStep('reason')}
              disabled={loading}
              style={{ ...ghostBtn, opacity: loading ? 0.5 : 1 }}
            >
              Back
            </button>
          </>
        )}

      </div>
    </div>
  )
}