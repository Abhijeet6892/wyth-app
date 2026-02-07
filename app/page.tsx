'use client'
import React, { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Zap, UserCircle, MessageCircle, Send, Loader2 
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
        // Fetch session
        const { data: authData } = await supabase.auth.getUser()
        const currentUser = authData?.user
        
        if (!currentUser) {
            setUser(null)
            await fetchFeed()
            return
        }

        // Fetch profile data for the guard and the slot counter
        const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, slots_limit, slots_used')
            .eq('id', currentUser.id)
            .maybeSingle()

        // Guard: If logged in but no profile data, send to onboarding
        if (!profile || !profile.full_name) {
            router.replace('/onboarding')
            return
        }

        setUser(currentUser)
        // Calculate remaining slots
        setSlotsLeft((profile.slots_limit || 3) - (profile.slots_used || 0))

        // Fetch My Connections to determine UI states (Message vs Connect)
        const { data: connections } = await supabase
            .from('connections')
            .select('receiver_id')
            .eq('requester_id', currentUser.id)
            .eq('status', 'accepted')
        
        if (connections) {
            setConnectedUserIds(new Set(connections.map((c: any) => c.receiver_id)))
        }

        await fetchFeed()
    }

    initData()
  }, [])

  const fetchFeed = async () => {
      const { data: postsData } = await supabase
        .from('posts')
        .select(`*, profiles (id, full_name, is_gold, career_verified, vibe_verified, brand_id, vouches_count)`)
        .order('created_at', { ascending: false }) 
      
      if (postsData) setPosts(postsData)
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
          fetchFeed()
      }
      setIsPosting(false)
  }

  const handleMainAction = (postUserId: string) => {
      // If already connected, open chat
      if (connectedUserIds.has(postUserId)) {
          router.push(`/chat?open=${postUserId}`)
          return
      }
      // Otherwise, trigger connection paywall
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
           // Successfully connected, navigate to chat
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
      {/* APP HEADER */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex justify-between items-center">
        <h1 className="text-xl font-serif font-bold text-slate-900 tracking-tight">WYTH</h1>
        <div className="flex items-center gap-3">
            {/* RESTORED SLOTS INDICATOR */}
            {user && (
                <div className="bg-rose-50 text-rose-600 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 border border-rose-100">
                    <Zap size={12} className="fill-rose-600" /> {slotsLeft} Left
                </div>
            )}
            
            {/* NAVIGATION LINKS */}
            <Link href="/chat" className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-200 transition cursor-pointer">
                <MessageCircle size={20} />
            </Link>
            <Link href={user ? "/settings" : "/login"} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-200 transition cursor-pointer">
                <UserCircle size={20} />
            </Link>
        </div>
      </header>

      <div className="max-w-md mx-auto pt-4 px-3">
        {/* CREATE POST WIDGET */}
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

        {/* POST FEED */}
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

      {/* OVERLAY MODALS */}
      <SlotPaywall 
        isOpen={showPaywall} 
        mode={paywallMode} 
        onClose={() => setShowPaywall(false)} 
        onAction={handlePaywallAction} 
      />
      <GoldUpsell 
        isOpen={showGoldUpsell} 
        onClose={() => setShowGoldUpsell(false)} 
      />
    </main>
  )
}