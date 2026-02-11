'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabase/client'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, UserPlus, ShieldCheck, MessageCircle, 
  CreditCard, Bell, ChevronRight, Sparkles 
} from 'lucide-react'

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchNotifications = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('notifications')
        .select(`
            *,
            profiles:actor_id (full_name, avatar_url, is_gold)
        `)
        .eq('receiver_id', user.id)
        .order('created_at', { ascending: false })

      setNotifications(data || [])
      setLoading(false)
      
      // Mark read on load
      if (data && data.length > 0) {
          await supabase.from('notifications').update({ is_read: true }).eq('receiver_id', user.id)
      }
    }
    
    fetchNotifications()
  }, [])

  // Helper for "Vibe" Icons
  const getIcon = (type: string) => {
      switch(type) {
          case 'connection_request': return <UserPlus size={18} className="text-blue-600" />
          case 'vouch': return <ShieldCheck size={18} className="text-indigo-600" />
          case 'secure_card': return <CreditCard size={18} className="text-amber-600" />
          case 'comment': return <MessageCircle size={18} className="text-pink-600" />
          default: return <Bell size={18} className="text-slate-400" />
      }
  }

  // Helper for Background Colors
  const getBgColor = (type: string) => {
      switch(type) {
          case 'connection_request': return 'bg-blue-50 border-blue-100'
          case 'vouch': return 'bg-indigo-50 border-indigo-100'
          case 'secure_card': return 'bg-amber-50 border-amber-100'
          case 'comment': return 'bg-pink-50 border-pink-100'
          default: return 'bg-slate-50 border-slate-100'
      }
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md px-4 py-4 sticky top-0 z-10 border-b border-slate-100 flex items-center gap-3 shadow-sm">
        <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-600 transition">
            <ArrowLeft size={20} />
        </Link>
        <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            Notifications <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></div>
        </h1>
      </div>

      <div className="p-4 space-y-3 max-w-md mx-auto">
        {loading ? (
             <div className="flex flex-col items-center justify-center py-20 space-y-4">
                 <Sparkles className="animate-spin text-slate-300" size={24}/>
                 <p className="text-xs text-slate-400 uppercase tracking-widest">Checking Vibe...</p>
             </div>
        ) : notifications.length === 0 ? (
             <div className="flex flex-col items-center py-20 text-slate-400">
                 <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <Bell size={24} className="text-slate-300" />
                 </div>
                 <p className="text-sm font-medium">All caught up.</p>
             </div>
        ) : (
            <AnimatePresence>
            {notifications.map((n, i) => (
                <motion.div 
                    key={n.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`relative overflow-hidden rounded-2xl border p-4 flex items-start gap-4 transition-all active:scale-[0.98] ${n.is_read ? 'bg-white border-slate-100' : 'bg-white border-indigo-100 shadow-[0_4px_20px_rgba(99,102,241,0.08)]'}`}
                >
                    {!n.is_read && (
                        <div className="absolute top-4 right-4 w-2 h-2 bg-indigo-500 rounded-full"></div>
                    )}

                    {/* Icon Box */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${getBgColor(n.type)}`}>
                        {getIcon(n.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-bold text-slate-900 text-sm truncate">{n.profiles?.full_name || 'Someone'}</span>
                            {n.profiles?.is_gold && <span className="w-1.5 h-1.5 bg-amber-400 rounded-full"></span>}
                        </div>
                        <p className="text-sm text-slate-600 leading-snug mb-2">
                            {n.content}
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium">
                            {new Date(n.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>

                    {/* Avatar Preview (if available) */}
                    <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden border border-slate-100 shrink-0">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${n.profiles?.full_name}`} className="w-full h-full object-cover" />
                    </div>
                </motion.div>
            ))}
            </AnimatePresence>
        )}
      </div>
    </div>
  )
}