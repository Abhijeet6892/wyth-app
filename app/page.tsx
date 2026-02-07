'use client'
import React, { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Zap, UserCircle, MessageCircle, Send, Heart, 
  Lock, Award, CheckCircle2, Instagram, Linkedin, 
  X, UserPlus, ShieldCheck, Loader2 
} from 'lucide-react'
import FeedCard from '@/components/FeedCard'
import { SlotPaywall, GoldUpsell } from '@/components/InteractionModals'

export default function Home() {
  const router = useRouter()
  const [posts, setPosts] = useState<any[]>([])
  const [connectedUserIds, setConnectedUserIds] = useState<Set<string>>(new Set()) 
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [slotsLeft, setSlotsLeft] = useState<number>(0)
  
  const [newPostContent, setNewPostContent] = useState('')
  const [isPosting, setIsPosting] = useState(false)
  
  const [showPaywall, setShowPaywall] = useState(false)
  const [paywallMode, setPaywallMode] = useState<'connect' | 'comment'>('connect')
  const [showGoldUpsell, setShowGoldUpsell] = useState(false)
  const [targetUserId, setTargetUserId] = useState<string | null>(null)

  useEffect(() => {
    const initData = async () => {
        const { data: authData } = await supabase.auth.getUser()
        const currentUser = authData?.user
        
        // --- 1. LOGIN GUARD (The Fix) ---
        // If no user, kick them to login screen immediately.
        if (!currentUser) {
            router.replace('/login')
            return
        }

        // --- 2. PROFILE GUARD ---
        const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, slots_limit, slots_used, city, intent')
            .eq('id', currentUser.id)
            .maybeSingle()

        if (!profile || !profile.full_name) {
            router.replace('/onboarding')
            return
        }

        setUser(currentUser)
        setSlotsLeft((profile.slots_limit || 3) - (profile.slots_used || 0))

        const { data: connections } = await supabase
            .from('connections')
            .select('receiver_id')
            .eq('requester_id', currentUser.id)
            .eq('status', 'accepted')
        
        if (connections) {
            setConnectedUserIds(new Set(connections.map((c: any) => c.receiver_id)))
        }

        await fetchFeed(profile)
    }

    initData()
  }, [router])

  // ... (Rest of the file remains exactly the same: fetchFeed, handlers, UI)
  // To ensure the file is complete, I'm including the rest of the logic below 
  // so you can copy-paste the whole file safely.

  const fetchFeed = async (userProfile?: any) => {
      const { data: postsData } = await supabase
        .from('posts')
        .select(`*, profiles (id, full_name, city, intent, is_gold, career_verified, vibe_verified, brand_id, vouches_count)`)
        .order('created_at', { ascending: false })
        .limit(50) 
      
      if (postsData) {
          if (userProfile) {
              const sorted = postsData.sort((a, b) => {
                  let scoreA = 0; let scoreB = 0;
                  if (a.profiles.city === userProfile.city) scoreA += 10;
                  if (b.profiles.city === userProfile.city) scoreB += 10;
                  if (a.profiles.intent === userProfile.intent) scoreA += 5;
                  if (b.profiles.intent === userProfile.intent) scoreB += 5;
                  if (a.profiles.is_gold) scoreA += 2;
                  if (b.profiles.is_gold) scoreB += 2;
                  return scoreB - scoreA;
              })
              setPosts(sorted)
          } else {
              setPosts(postsData)
          }
      }
      setLoading(false)
  }

  const handleCreatePost = async () => {
      if (!newPostContent.trim() || !user) return
      setIsPosting(true)
      const { error } = await supabase.from('posts').insert({
          user_id: user.id,
          type: 'text',
          caption: newPostContent
      })
      if (!error) {
          setNewPostContent('')
          const { data: profile } = await supabase.from('profiles').select('city, intent').eq('id', user.id).single()
          fetchFeed(profile)
      }
      setIsPosting(false)
  }

  const handleMainAction = (postUserId: string) => {
      if (connectedUserIds.has(postUserId)) {
          router.push(`/chat?open=${postUserId}`)
          return
      }
      setTargetUserId(postUserId)
      setPaywallMode('connect')
      setShowPaywall(true)
  }

  const handlePaywallAction = async () => {
    if (!user) return router.push('/login')

    if (paywallMode === 'comment') {
       const { data } = await supabase.rpc('spend_for_comment')
       if (data === 'success_paid' || data === 'success_free_allowance') {
           alert('Comment access unlocked!')
           setShowPaywall(false)
       } else {
           alert('Insufficient coins! Visit your Wallet.')
       }
    } else {
       if (!targetUserId) return
       const { data } = await supabase.rpc('request_connection', { target_user_id: targetUserId })
       if (data === 'success_connected' || data === 'error_already_connected') {
           router.push(`/chat?open=${targetUserId}`)
       } else {
           alert('Insufficient coins! Visit your Wallet.')
       }
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Zap size={40} className="text-slate-200 animate-pulse" />
    </div>
  )

  return (
    <main className="min-h-screen bg-slate-50 pb-20">
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex justify-between items-center">
        <h1 className="text-xl font-serif font-bold text-slate-900 tracking-tight">WYTH</h1>
        <div className="flex items-center gap-3">
            {user && (
                <div className="bg-rose-50 text-rose-600 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 border border-rose-100">
                    <Zap size={12} className="fill-rose-600" /> {slotsLeft} Left
                </div>
            )}
            <Link href="/chat" className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-200 transition cursor-pointer">
                <MessageCircle size={20} />
            </Link>
            <Link href={user ? "/settings" : "/login"} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-200 transition cursor-pointer">
                <UserCircle size={20} />
            </Link>
        </div>
      </header>

      <div className="max-w-md mx-auto pt-4 px-3">
        {user && (
            <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 mb-6">
                <textarea 
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    placeholder="What's your vibe today?" 
                    className="w-full bg-slate-50 rounded-2xl p-3 text-sm focus:outline-none h-20 resize-none mb-3 border-none ring-0"
                />
                <div className="flex justify-end">
                    <button 
                        onClick={handleCreatePost}
                        disabled={!newPostContent.trim() || isPosting}
                        className="bg-slate-900 text-white px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-slate-800 disabled:opacity-50 transition active:scale-95"
                    >
                        {isPosting ? <Loader2 size={16} className="animate-spin" /> : <>Post <Send size={14} /></>}
                    </button>
                </div>
            </div>
        )}

        {posts.length > 0 ? (
            posts.map(post => (
                <FeedCard 
                    key={post.id} 
                    post={post} 
                    isConnected={connectedUserIds.has(post.profiles?.id)} 
                    onConnect={() => handleMainAction(post.profiles?.id)} 
                    onSocialUnlock={() => setShowGoldUpsell(true)}
                    onComment={() => { setPaywallMode('comment'); setShowPaywall(true); }}
                />
            ))
        ) : (
            <div className="text-center py-20 text-slate-400">No posts yet. Start the vibe!</div>
        )}
      </div>

      <SlotPaywall isOpen={showPaywall} mode={paywallMode} onClose={() => setShowPaywall(false)} onAction={handlePaywallAction} />
      <GoldUpsell isOpen={showGoldUpsell} onClose={() => setShowGoldUpsell(false)} />
    </main>
  )
}
