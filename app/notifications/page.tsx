'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabase/client'
import Link from 'next/link'
import { ArrowLeft, UserPlus, ShieldCheck, MessageCircle, CreditCard, Bell } from 'lucide-react'

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
            profiles:actor_id (full_name, avatar_url)
        `)
        .eq('receiver_id', user.id)
        .order('created_at', { ascending: false })

      setNotifications(data || [])
      setLoading(false)
      
      // Optional: Mark all as read immediately
      if (data && data.length > 0) {
          await supabase.from('notifications').update({ is_read: true }).eq('receiver_id', user.id)
      }
    }
    
    fetchNotifications()
  }, [])

  // Icon Helper
  const getIcon = (type: string) => {
      switch(type) {
          case 'connection_request': return <UserPlus size={16} className="text-blue-500" />
          case 'vouch': return <ShieldCheck size={16} className="text-green-600" />
          case 'secure_card': return <CreditCard size={16} className="text-amber-500" />
          default: return <MessageCircle size={16} className="text-slate-400" />
      }
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 max-w-md mx-auto">
      {/* Header */}
      <div className="bg-white px-4 py-4 sticky top-0 z-10 border-b border-slate-100 flex items-center gap-3">
        <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-slate-50 text-slate-600">
            <ArrowLeft size={20} />
        </Link>
        <h1 className="text-lg font-bold text-slate-900">Notifications</h1>
      </div>

      <div className="p-4 space-y-3">
        {loading ? (
             <div className="text-center py-10 text-slate-400">Loading updates...</div>
        ) : notifications.length === 0 ? (
             <div className="flex flex-col items-center py-12 text-slate-400">
                 <Bell size={48} className="mb-4 text-slate-200" />
                 <p>No new notifications.</p>
             </div>
        ) : (
            notifications.map(n => (
                <div key={n.id} className={`flex items-start gap-4 p-4 rounded-2xl border ${n.is_read ? 'bg-white border-slate-100' : 'bg-blue-50/50 border-blue-100'}`}>
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden shrink-0">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${n.profiles?.full_name}`} alt="avatar" />
                    </div>
                    
                    <div className="flex-1">
                        <p className="text-sm text-slate-900 leading-snug">
                            <span className="font-bold">{n.profiles?.full_name}</span> {n.content}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                            {new Date(n.created_at).toLocaleDateString()}
                        </p>
                    </div>

                    <div className="p-2 bg-slate-50 rounded-full border border-slate-100">
                        {getIcon(n.type)}
                    </div>
                </div>
            ))
        )}
      </div>
    </div>
  )
}