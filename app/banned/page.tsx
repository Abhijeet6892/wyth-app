'use client'
import { useRouter } from 'next/navigation'

export default function BannedPage() {
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
          background: 'rgba(239, 68, 68, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
          fontSize: '28px',
        }}>
          🚫
        </div>

        <h1 style={{
          fontSize: '22px',
          fontWeight: '700',
          color: '#1e3a8a',
          marginBottom: '12px',
        }}>
          Account Removed
        </h1>

        <p style={{
          fontSize: '15px',
          color: '#475569',
          lineHeight: '1.6',
          marginBottom: '8px',
        }}>
          Your account has been removed from Wyth for violating our community guidelines.
        </p>

        <p style={{
          fontSize: '14px',
          color: '#94a3b8',
          lineHeight: '1.6',
          marginBottom: '32px',
        }}>
          This decision cannot be reversed. If you believe this was a mistake, please contact our support team.
        </p>

        <button
          onClick={() => window.location.href = 'mailto:support@wyth.app'}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '12px',
            border: '1.5px solid rgba(99, 102, 241, 0.3)',
            background: 'transparent',
            color: '#4f46e5',
            fontWeight: '600',
            fontSize: '15px',
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          Contact Support
        </button>
      </div>
    </div>
  )
}