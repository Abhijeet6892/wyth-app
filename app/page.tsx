'use client'
import React, { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Zap, UserCircle, MessageCircle, Send, Heart, 
  Lock, Award, CheckCircle2, Instagram, Linkedin, 
  X, UserPlus, ShieldCheck, Loader2, Bell 
} from 'lucide-react'

// --- INTERNAL COMPONENTS ---

const FeedCard = ({ post, isConnected = false, onConnect, onSocialUnlock, onComment }: any) => {
  const [showReactionDock, setShowReactionDock] = useState(false)
  const [reactionType, setReactionType] = useState<string | null>(null)
  
  const profile = post.profiles || { full_name: 'Unknown User' }

  const handleReaction = (emoji: string) => {
    setReactionType(emoji === reactionType ? null : emoji)
    setShowReactionDock(false)
  }

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden mb-6 relative">
      <div className="p-4 flex justify-between items-start">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
            <img 
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.full_name}`} 
              alt="avatar" 
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              {profile.full_name}
              {profile.is_gold ? (
                 <Award size={16} className="text-amber-500 fill-amber-500" />
              ) : profile.career_verified ? (
                 <CheckCircle2 size={16} className="text-blue-500 fill-blue-50" />
              ) : (
                 <CheckCircle2 size={16} className="text-slate-300" />
              )}
            </h3>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
                {profile.brand_id && (
                    <span className="font-mono text-[10px] bg-slate-50 px-1.5 py-0.5 rounded text-slate-500 border border-slate-200">
                        {profile.brand_id}
                    </span>
                )}
                <span className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                    <ShieldCheck size={10} /> {profile.vouches_count || 0}
                </span>
            </div>
          </div>
        </div>
        {profile.is_gold && (
           <span className="bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-100">GOLD</span>
        )}
      </div>

      {post.type === 'photo' && post.media_url && (
        <div className="aspect-[4/5] bg-slate-100 relative">
          <img src={post.media_url} className="w-full h-full object-cover" alt="post"/>
          {showReactionDock && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur rounded-full px-4 py-2 shadow-xl border border-slate-100 flex items-center gap-4 z-10 animate-in slide-in-from-bottom-2">
                <button onClick={() => handleReaction('❤️')} className="text-2xl hover:scale-125 transition">❤️</button>
                <button onClick={() => handleReaction('🧿')} className="text-2xl hover:scale-125 transition">🧿</button>
                <button onClick={() => handleReaction('🙌')} className="text-2xl hover:scale-125 transition">🙌</button>
                <button onClick={() => setShowReactionDock(false)} className="text-slate-400"><X size={18} /></button>
            </div>
          )}
        </div>
      )}

      {post.type === 'text' && (
        <div className="px-6 py-10 bg-slate-50 border-y border-slate-100 relative">
          <p className="text-slate-800 text-lg font-serif font-medium text-center italic leading-relaxed">
            &ldquo;{post.caption}&rdquo;
          </p>
          {showReactionDock && (
            <div className="bg-white rounded-full px-4 py-2 mt-6 shadow-sm border border-slate-200 flex items-center gap-4 justify-center w-fit mx-auto animate-in fade-in">
                <button onClick={() => handleReaction('❤️')} className="text-2xl">❤️</button>
                <button onClick={() => handleReaction('🧿')} className="text-2xl">🧿</button>
                <button onClick={() => handleReaction('🙌')} className="text-2xl">🙌</button>
                <button onClick={() => setShowReactionDock(false)} className="text-slate-400"><X size={18} /></button>
            </div>
          )}
        </div>
      )}

      {post.type === 'achievement' && (
        <div className="px-4 pb-2">
           <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-100 relative overflow-hidden">
               <div className="absolute top-0 right-0 bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-1 rounded-bl-lg">CAREER UPDATE</div>
               <div className="flex items-start gap-3 mb-1 mt-1">
                   <div className="bg-white p-2.5 rounded-full border border-blue-100 shadow-sm text-xl">🏆</div>
                   <div>
                       <h4 className="font-bold text-slate-900 leading-tight text-lg">{post.achievement_title}</h4>
                       <p className="text-xs text-slate-500 mt-1">Just now</p>
                   </div>
               </div>
               <p className="text-sm text-slate-700 leading-relaxed">
                   {post.caption}
               </p>
           </div>
        </div>
      )}

      <div className="px-4 mt-3 mb-3 grid grid-cols-2 gap-2">
            <div onClick={onSocialUnlock} className="bg-blue-50/50 rounded-xl p-3 border border-blue-100 flex flex-col justify-center relative cursor-pointer hover:bg-blue-100/50 transition">
                <div className="flex items-center gap-1.5 mb-1"><Linkedin size={14} className="text-blue-700"/><span className="text-[10px] font-bold text-slate-500 uppercase">Career</span></div>
                <div className="absolute top-2 right-2 text-amber-400"><Lock size={12}/></div>
            </div>
            <div onClick={onSocialUnlock} className="bg-pink-50/30 rounded-xl p-2 border border-pink-100 relative cursor-pointer hover:bg-pink-50/50 transition">
                 <div className="flex items-center gap-1.5 mb-1.5 px-1"><Instagram size={14} className="text-pink-600"/><span className="text-[10px] font-bold text-slate-500 uppercase">Vibe</span></div>
                 <div className="grid grid-cols-3 gap-1 h-8 overflow-hidden rounded-lg relative w-full"><div className="absolute inset-0 bg-black/10 flex items-center justify-center"><Lock size={12} className="text-white drop-shadow-md"/></div></div>
            </div>
      </div>

      <div className="px-4 pb-4 flex items-center gap-2">
         <button onClick={() => setShowReactionDock(!showReactionDock)} className={`flex-1 border rounded-xl py-2.5 font-bold text-sm transition flex items-center justify-center gap-2 active:scale-95 ${reactionType ? 'border-rose-200 bg-rose-50 text-rose-600' : 'border-slate-200 text-slate-600'}`}>
           {reactionType ? <span className="text-lg">{reactionType}</span> : <><Heart size={18}/> React</>}
         </button>
         <button className="flex-1 border border-slate-200 text-slate-600 rounded-xl py-2.5 font-bold text-sm transition flex justify-center items-center gap-2 active:scale-95"><UserPlus size={18}/> Follow</button>
         {isConnected ? 
             <button onClick={onConnect} className="flex-[1.5] bg-blue-600 text-white rounded-xl py-2.5 font-bold text-sm shadow-lg hover:bg-blue-700 transition flex items-center justify-center gap-1.5 active:scale-95">
                <MessageCircle size={16}/> Message
             </button> :
             <button onClick={onConnect} className="flex-[1.5] bg-slate-900 text-white rounded-xl py-2.5 font-bold text-sm shadow-lg hover:bg-slate-800 transition flex items-center justify-center gap-1.5 active:scale-95">
                Connect <Zap size={14} className="fill-yellow-400 text-yellow-400"/>
             </button>
         }
      </div>
    </div>
  )
}

const SlotPaywall = ({ isOpen, mode, onClose, onAction }: any) => {
    if (!isOpen) return null
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X size={20}/></button>
                <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-900">
                        {mode === 'connect' ? <Zap size={32} className="fill-slate-900"/> : <MessageCircle size={32} className="fill-slate-900"/>}
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">
                        {mode === 'connect' ? 'Connect for 29 Coins' : '9 Coins per Comment'}
                    </h3>
                    <p className="text-slate-500 text-sm mt-2 mb-6">
                        {mode === 'connect' ? 'This unlocks a high-intent slot and a private chat window.' : 'Priority comments help you stand out and keep the community high-quality.'}
                    </p>
                    <button onClick={onAction} className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl shadow-xl active:scale-95 transition">
                        Confirm & Deduct
                    </button>
                    <button onClick={onClose} className="mt-4 text-slate-400 text-sm font-medium hover:text-slate-600">Not now</button>
                </div>
            </div>
        </div>
    )
}

const GoldUpsell = ({ isOpen, onClose }: any) => {
    if (!isOpen) return null
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-slate-900 text-white rounded-3xl p-8 w-full max-w-sm shadow-2xl border border-amber-500/30">
                <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mb-6 text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                        <Award size={48} />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Upgrade to Gold</h3>
                    <p className="text-slate-400 text-sm mb-8 leading-relaxed px-2">
                        Unlock LinkedIn/Instagram verification shields and get 3 free comments every single day.
                    </p>
                    <button className="w-full bg-gradient-to-r from-amber-400 to-amber-600 text-slate-900 font-bold py-4 rounded-2xl shadow-xl active:scale-95 transition">
                        ₹499 / Month
                    </button>
                    <button onClick={onClose} className="mt-4 text-slate-500 text-sm font-medium hover:text-slate-400">Keep browsing</button>
                </div>
            </div>
        </div>
    )
}

// --- MAIN APP COMPONENT ---

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

        // Fetch profile
        const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, slots_limit, slots_used')
            .eq('id', currentUser.id)
            .maybeSingle()

        if (!profile || !profile.full_name) {
            router.replace('/onboarding')
            return
        }

        setUser(currentUser)
        setSlotsLeft((profile.slots_limit || 3) - (profile.slots_used || 0))

        // Fetch Connections
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
      {/* APP HEADER */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex justify-between items-center">
        <h1 className="text-xl font-serif font-bold text-slate-900 tracking-tight">WYTH</h1>
        <div className="flex items-center gap-3">
            {/* SLOT INDICATOR */}
            {user && (
                <div className="bg-rose-50 text-rose-600 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 border border-rose-100">
                    <Zap size={12} className="fill-rose-600" /> {slotsLeft} Left
                </div>
            )}
            {/* NOTIFICATION BELL */}
            <Link href="/notifications" className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-200 transition cursor-pointer">
                <Bell size={20} />
            </Link>
            {/* CHAT ICON */}
            <Link href="/chat" className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-200 transition cursor-pointer">
                <MessageCircle size={20} />
            </Link>
            {/* PROFILE ICON */}
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