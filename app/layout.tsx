'use client'
import './globals.css'
import { useEffect, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import SplashScreen from '@/components/SplashScreen'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    // Show splash for 2.8s, then fade into the app
    const timer = setTimeout(() => {
      setShowSplash(false)
    }, 2800) 
    
    return () => clearTimeout(timer)
  }, [])

  return (
    <html lang="en">
      <body className="bg-white antialiased">
        {/* APP CONTENT RENDERS IMMEDIATELY UNDERNEATH */}
        {children}

        {/* SPLASH OVERLAY SITS ON TOP */}
        <AnimatePresence>
          {showSplash && <SplashScreen />}
        </AnimatePresence>
      </body>
    </html>
  )
}