'use client'
import { motion } from 'framer-motion'

export default function SplashScreen() {
  const letters = "WYTH".split("")

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white overflow-hidden"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      {/* Soft Background Bloom */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg aspect-square bg-indigo-50/50 rounded-full blur-[120px]" />

      <div className="relative z-10 flex flex-col items-center text-center px-8">
        {/* Staggered Letter Reveal */}
        <div className="flex gap-1 mb-8">
          {letters.map((char, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i, duration: 0.8, ease: "easeOut" }}
              className="text-6xl sm:text-7xl font-serif font-bold tracking-tighter text-slate-900"
            >
              {char}
            </motion.span>
          ))}
        </div>

        {/* Minimal Subtext (ChatGPT Reference Style) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 1 }}
          className="space-y-2"
        >
          <p className="text-slate-500 font-medium tracking-wide">Observe the vibe.</p>
          <p className="text-slate-500 font-medium tracking-wide">Understand the person.</p>
          <p className="text-slate-900 font-bold tracking-tight">Then Decide.</p>
        </motion.div>

        {/* Animated Accent Line */}
        <motion.div
          className="h-px bg-slate-200 mt-12"
          initial={{ width: 0 }}
          animate={{ width: '60px' }}
          transition={{ delay: 1.2, duration: 1 }}
        />

        <motion.p
          className="mt-8 text-[10px] text-slate-400 tracking-[0.4em] uppercase font-bold"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 1 }}
        >
          Connect for Life.
        </motion.p>
      </div>
    </motion.div>
  )
}