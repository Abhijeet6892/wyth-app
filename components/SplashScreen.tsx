'use client'
import { motion } from 'framer-motion'
import { useEffect } from 'react'

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  // Auto-hide after 2.5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete()
    }, 2500)
    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <motion.div 
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-indigo-950 text-white overflow-hidden"
      exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
    >
        {/* Subtle Background Pulse */}
        <motion.div 
            className="absolute w-[500px] h-[500px] bg-indigo-500 rounded-full blur-[120px] opacity-20"
            animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
            transition={{ duration: 3, repeat: Infinity }}
        />

        {/* Logo Text Animation */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative z-10 flex flex-col items-center"
        >
            <h1 className="text-6xl font-serif font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-slate-200">
                WYTH
            </h1>
            
            {/* The "Pulse" Line */}
            <motion.div 
                className="h-px bg-gradient-to-r from-transparent via-indigo-400 to-transparent w-0 mt-4"
                animate={{ width: "120%" }}
                transition={{ delay: 0.5, duration: 1.2, ease: "easeInOut" }}
            />
        </motion.div>

        {/* Tagline Fade In */}
        <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="mt-6 text-sm font-medium text-indigo-200 tracking-widest uppercase"
        >
            Follow for Vibe. Connect for Life.
        </motion.p>

    </motion.div>
  )
}