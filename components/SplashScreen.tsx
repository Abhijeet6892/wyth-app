'use client'
import { motion } from 'framer-motion'

export default function SplashScreen() {
  const letters = "WYTH".split("")

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-950 overflow-hidden"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      {/* Deep Gradient Background Layers */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#1e1b4b_0%,#020617_100%)]" />
      
      {/* Animated Glowing Orbs for "Vibe" */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
          x: [-20, 20, -20] 
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute w-[500px] h-[500px] bg-indigo-600/30 rounded-full blur-[120px]" 
      />

      <div className="relative z-10 flex flex-col items-center text-center px-8">
        {/* Glassmorphic Logo Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="mb-10 p-8 rounded-[2.5rem] bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl"
        >
          <div className="flex gap-2">
            {letters.map((char, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i, duration: 0.8 }}
                className="text-6xl sm:text-7xl font-serif font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-indigo-200"
              >
                {char}
              </motion.span>
            ))}
          </div>
        </motion.div>

        {/* High-Intent Subtext */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="space-y-3"
        >
          <p className="text-indigo-100/80 text-lg font-medium tracking-tight">Observe the vibe.</p>
          <p className="text-indigo-100/80 text-lg font-medium tracking-tight">Understand the person.</p>
          <p className="text-white text-xl font-bold tracking-tight shadow-indigo-500/50">Then Decide.</p>
        </motion.div>

        {/* Progress Line */}
        <motion.div
          className="h-[2px] bg-gradient-to-r from-transparent via-indigo-400 to-transparent mt-12"
          initial={{ width: 0 }}
          animate={{ width: '240px' }}
          transition={{ delay: 1.5, duration: 1.5 }}
        />
      </div>
    </motion.div>
  )
}