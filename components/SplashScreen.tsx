'use client'
import { motion } from 'framer-motion'

export default function SplashScreen() {
  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 overflow-hidden"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      {/* Dynamic Background Glow */}
      <motion.div
        className="absolute w-[600px] h-[600px] bg-indigo-500 rounded-full blur-[150px] opacity-20"
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      <div className="relative z-10 flex flex-col items-center text-center px-6">
        {/* SCALABLE SVG LOGO */}
        <motion.svg
          viewBox="0 0 220 80"
          className="w-40 sm:w-52 md:w-60"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="middle"
            fill="url(#grad)"
            fontSize="48"
            fontFamily="Inter, sans-serif"
            letterSpacing="8"
            className="font-bold"
          >
            WYTH
          </text>
          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#3B82F6" />
            </linearGradient>
          </defs>
        </motion.svg>

        {/* Animated Accent Line */}
        <motion.div
          className="h-px bg-gradient-to-r from-transparent via-indigo-400 to-transparent mt-5"
          initial={{ width: 0 }}
          animate={{ width: '140px' }}
          transition={{ delay: 0.6, duration: 1 }}
        />

        {/* Tagline */}
        <motion.p
          className="mt-6 text-xs sm:text-sm text-indigo-200 tracking-widest uppercase font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 1 }}
        >
          Follow for Vibe. Connect for Life.
        </motion.p>
      </div>
    </motion.div>
  )
}