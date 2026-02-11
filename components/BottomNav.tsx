'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, MessageCircle, User, Zap } from 'lucide-react'
import { motion } from 'framer-motion'

export default function BottomNav() {
  const pathname = usePathname()

  // Logic: Hide Nav on Login, Onboarding, and Splash
  // We strictly show it only when the user is "inside" the app
  const isHidden = pathname === '/login' || pathname.startsWith('/onboarding')
  
  if (isHidden) return null

  const tabs = [
    { name: 'Feed', href: '/', icon: Home },
    { name: 'Chat', href: '/chat', icon: MessageCircle },
    { name: 'Wallet', href: '/wallet', icon: Zap },
    { name: 'Profile', href: '/profile', icon: User },
  ]

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-sm px-6">
      <div className="bg-white/80 backdrop-blur-xl border border-white/50 shadow-2xl rounded-full px-6 py-4 flex justify-between items-center relative">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href
          const Icon = tab.icon
          
          return (
            <Link key={tab.name} href={tab.href} className="relative flex flex-col items-center">
              {isActive && (
                <motion.div 
                  layoutId="nav-pill"
                  className="absolute -top-10 w-1 h-1 bg-indigo-500 rounded-full"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              
              <div className={`transition-all duration-300 ${isActive ? 'text-indigo-900 scale-110' : 'text-slate-400 hover:text-slate-600'}`}>
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}