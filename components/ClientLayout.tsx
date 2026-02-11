'use client'
import { useState, useEffect } from "react"
import { AnimatePresence } from "framer-motion"
import SplashScreen from "@/components/SplashScreen"
import BottomNav from "@/components/BottomNav"

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    // Show splash for 2.8s to match the internal animations
    const timer = setTimeout(() => {
      setShowSplash(false)
    }, 2800)
    
    return () => clearTimeout(timer)
  }, [])

  return (
    <>
      {/* 1. App Content & Nav render immediately (preloading behind the splash) */}
      <main className="relative z-10">
        {children}
        <BottomNav />
      </main>

      {/* 2. Splash Overlay (z-index ensures it covers everything) */}
      <AnimatePresence>
        {showSplash && <SplashScreen key="splash" />}
      </AnimatePresence>
    </>
  )
}