'use client'
import { useRouter } from 'next/navigation'

export default function AccountNotFoundPage() {
  const router = useRouter()

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
          background: 'rgba(148, 163, 184, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
          fontSize: '28px',
        }}>
          🌙
        </div>

        <h1 style={{
          fontSize: '22px',
          fontWeight: '700',
          color: '#1e3a8a',
          marginBottom: '12px',
        }}>
          Account No Longer Exists
        </h1>

        <p style={{
          fontSize: '15px',
          color: '#475569',
          lineHeight: '1.6',
          marginBottom: '8px',
        }}>
          Your account has been permanently removed from Wyth.
        </p>

        <p style={{
          fontSize: '13px',
          color: '#94a3b8',
          lineHeight: '1.6',
          marginBottom: '32px',
        }}>
          The 30-day recovery window has passed. If you'd like to start fresh, you're welcome to create a new account.
        </p>

        <button
          onClick={() => router.push('/login')}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '12px',
            border: 'none',
            background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
            color: 'white',
            fontWeight: '600',
            fontSize: '15px',
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(79, 70, 229, 0.3)',
            fontFamily: 'inherit',
          }}
        >
          Create New Account
        </button>
      </div>
    </div>
  )
}