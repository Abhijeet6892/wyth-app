"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MessageCircle, User, Zap } from "lucide-react";
import { motion } from "framer-motion";

export default function BottomNav() {
  const pathname = usePathname();

  // Logic: Hide Nav on Login, Onboarding, and Splash
  const isHidden = pathname === "/login" || pathname.startsWith("/onboarding");

  if (isHidden) return null;

  const tabs = [
    { name: "Feed", href: "/", icon: Home },
    { name: "Chat", href: "/chat", icon: MessageCircle },
    { name: "Wallet", href: "/wallet", icon: Zap },
    { name: "Profile", href: "/profile", icon: User },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-6 pointer-events-none">
      <div className="bg-white/90 backdrop-blur-xl border border-white/40 shadow-[0_20px_40px_rgba(0,0,0,0.1)] rounded-full px-6 py-4 flex justify-between items-center pointer-events-auto">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href || (tab.href !== "/" && pathname.startsWith(tab.href));
          const Icon = tab.icon;

          return (
            <Link key={tab.name} href={tab.href} className="relative flex flex-col items-center group">
              {isActive && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute -top-10 w-1.5 h-1.5 bg-brand-gold rounded-full shadow-[0_0_10px_rgba(212,175,55,0.5)]"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}

              <div
                className={`transition-all duration-300 ${
                  isActive
                    ? "text-brand-blue scale-110"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}