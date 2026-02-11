'use client'
import { motion } from 'framer-motion'

export default function SplashScreen() {
  return (
    <motion.div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at center, #1e1b4b 0%, #020617 100%)',
        color: 'white',
        textAlign: 'center'
      }}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div style={{ position: 'relative', zIndex: 10, padding: '0 20px' }}>
        {/* Logo */}
        <h1 className="text-6xl font-serif font-bold text-white mb-8 tracking-tighter" style={{ fontSize: '4rem', fontWeight: 'bold', marginBottom: '2rem' }}>
          WYTH
        </h1>
        
        {/* Vibe Text */}
        <div className="space-y-4" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
          <p style={{ color: '#a5b4fc', fontSize: '1.125rem', margin: 0 }}>Observe the vibe.</p>
          <p style={{ color: '#a5b4fc', fontSize: '1.125rem', margin: 0 }}>Understand the person.</p>
          <p style={{ color: 'white', fontSize: '1.25rem', fontWeight: 'bold', borderBottom: '2px solid #6366f1', paddingBottom: '4px', display: 'inline-block', margin: '10px 0 0 0' }}>
            Then Decide.
          </p>
        </div>
      </div>
    </motion.div>
  )
}