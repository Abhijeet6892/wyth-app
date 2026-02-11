'use client'
import { useState } from "react"
import { AnimatePresence } from "framer-motion"
import SplashScreen from "@/components/SplashScreen"
import BottomNav from "@/components/BottomNav"

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [showSplash, setShowSplash] = useState(true)

  return (
    <>
      <AnimatePresence mode="wait">
        {showSplash ? (
          <SplashScreen key="splash" onComplete={() => setShowSplash(false)} />
        ) : (
          <>
            {children}
            <BottomNav />
          </>
        )}
      </AnimatePresence>
    </>
  )
}