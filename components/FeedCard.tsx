'use client'
import { useState } from 'react'
import { Heart, Lock, Zap, Award, CheckCircle2, Instagram, Linkedin, MessageCircle, X, UserPlus, ShieldCheck, Users } from 'lucide-react'

// --- TYPES ---
interface Profile {
  id?: string
  full_name: string
  is_gold?: boolean
  brand_id?: string
  vouches_count?: number
  city?: string
  career_verified?: boolean
  relationship_status?: 'single' | 'paired'
}

interface FeedPost {
  id: number
  type: 'photo' | 'text' | 'achievement'
  caption?: string
  media_url?: string
  achievement_title?: string
  profiles?: Profile
}

interface PostProps {
  post: FeedPost
  isConnected?: boolean
  onConnect: (mode?: 'connect' | 'message') => void
  onSocialUnlock: () => void
  onComment: () => void
}

export default function FeedCard({ post, isConnected = false, onConnect, onSocialUnlock, onComment }: PostProps) {
  const [showReactionDock, setShowReactionDock] = useState(false)
  const [reactionType, setReactionType] = useState<string | null>(null)
  const [isFollowing, setIsFollowing] = useState(false)
  
  // Safe Fallback
  const profile = post.profiles || { full_name: 'Unknown User' }
  const isCommitted = profile.relationship_status === 'paired'

  const handleReaction = (emoji: string) => {
    setReactionType(emoji === reactionType ? null : emoji)
    setShowReactionDock(false)
  }

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden mb-6 relative">
      
      {/* HEADER */}
      <div className="p-4 flex justify-between items-start">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden border border-slate-200 shrink-0">
            <img 
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.full_name}`} 
                alt="avatar" 
                className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  {profile.full_name}
                  {profile.is_gold ? <Award size={14} className="text-amber-500 fill-amber-500" /> : <CheckCircle2 size={14} className="text-slate-300" />}
                </h3>
                {/* COMMITTED BADGE */}
                {isCommitted && (
                    <span className="text-[9px] font-bold bg-slate-100 text-slate-500 border border-slate-200 px-1.5 py-0.5 rounded flex items-center gap-1">
                        <Users size={10} /> Committed
                    </span>
                )}
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
                {profile.brand_id && <span className="font-mono text-[10px] bg-slate-50 px-1.5 py-0.5 rounded text-slate-500 border border-slate-200">{profile.brand_id}</span>}
                <span className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100"><ShieldCheck size={10} /> {profile.vouches_count || 0}</span>
                {profile.city && <span className="text-[10px] text-slate-400">• {profile.city}</span>}
            </div>
          </div>
        </div>
        {profile.is_gold && <span className="bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-100">GOLD</span>}
      </div>

      {/* CONTENT: PHOTO */}
      {post.type === 'photo' && post.media_url && (
        <div className="aspect-[4/5] bg-slate-100 relative">
          <img src={post.media_url} className="w-full h-full object-cover" alt="Post" />
          {showReactionDock && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur rounded-full px-4 py-2 shadow-xl border border-slate-100 flex items-center gap-4 z-10 animate-in slide-in-from-bottom-2">
                <button onClick={() => handleReaction('❤️')} className="text-2xl hover:scale-125 transition">❤️</button>
                <button onClick={() => handleReaction('🧿')} className="text-2xl hover:scale-125 transition">🧿</button>
                <button onClick={() => handleReaction('🙌')} className="text-2xl hover:scale-125 transition">🙌</button>
                <button onClick={() => setShowReactionDock(false)} className="text-slate-400"><X size={16} /></button>
            </div>
          )}
        </div>
      )}

      {/* CONTENT: TEXT */}
      {post.type === 'text' && (
        <div className="px-6 py-8 bg-gradient-to-b from-white to-slate-50/50">
           <p className="text-slate-800 text-lg font-serif font-medium leading-relaxed whitespace-pre-wrap text-center">
             &ldquo;{post.caption}&rdquo;
           </p>
           {showReactionDock && (
            <div className="flex justify-center mt-6">
                <div className="bg-white rounded-full px-4 py-2 shadow-lg border border-slate-100 flex items-center gap-4 animate-in fade-in zoom-in-95">
                    <button onClick={() => handleReaction('❤️')} className="text-2xl hover:scale-110 transition">❤️</button>
                    <button onClick={() => handleReaction('🧿')} className="text-2xl hover:scale-110 transition">🧿</button>
                    <button onClick={() => handleReaction('🙌')} className="text-2xl hover:scale-110 transition">🙌</button>
                    <button onClick={() => setShowReactionDock(false)} className="text-slate-400 pl-2 border-l border-slate-200"><X size={16} /></button>
                </div>
            </div>
           )}
        </div>
      )}

      {/* CONTENT: ACHIEVEMENT */}
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
               <p className="text-sm text-slate-700 leading-relaxed">{post.caption}</p>
           </div>
        </div>
      )}

      {/* SOCIAL SHIELD (PRIVACY FIX APPLIED) */}
      <div className="px-4 mt-3 mb-3 grid grid-cols-2 gap-2">
            <div onClick={isConnected ? undefined : onSocialUnlock} className={`rounded-xl p-2.5 border flex flex-col justify-center relative transition active:scale-95 ${isConnected ? 'bg-blue-50 border-blue-100' : 'bg-slate-50 border-slate-100 cursor-pointer hover:border-blue-200'}`}>
                <div className="flex items-center gap-1.5 mb-1"><Linkedin size={12} className="text-blue-700"/><span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Career</span></div>
                {isConnected ? (
                  <p className="text-[11px] text-slate-900 leading-tight block font-medium">
                    Product Designer at <span className="font-bold">Top Tier Tech Firm</span>
                  </p>
                ) : (
                  <>
                    <p className="text-[11px] text-slate-400 leading-tight block blur-[2px]">Role at Top Firm</p>
                    <div className="absolute inset-0 flex items-center justify-center"><Lock size={12} className="text-slate-400"/></div>
                  </>
                )}
            </div>
            
            <div onClick={isConnected ? undefined : onSocialUnlock} className={`rounded-xl p-2.5 border flex flex-col justify-center relative transition active:scale-95 ${isConnected ? 'bg-pink-50 border-pink-100' : 'bg-slate-50 border-slate-100 cursor-pointer hover:border-pink-200'}`}>
                 <div className="flex items-center gap-1.5 mb-1"><Instagram size={12} className="text-pink-600"/><span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Vibe</span></div>
                 {isConnected ? (
                    <div className="grid grid-cols-3 gap-1 h-6 overflow-hidden rounded relative w-full opacity-80"><div className="bg-slate-400 w-full h-full"></div><div className="bg-slate-500 w-full h-full"></div><div className="bg-slate-400 w-full h-full"></div></div>
                 ) : (
                    <div className="grid grid-cols-3 gap-1 h-6 overflow-hidden rounded relative w-full opacity-50"><div className="bg-slate-300 w-full h-full blur-[2px]"></div><div className="bg-slate-300 w-full h-full blur-[2px]"></div><div className="bg-slate-300 w-full h-full blur-[2px]"></div><div className="absolute inset-0 flex items-center justify-center"><Lock size={12} className="text-slate-400"/></div></div>
                 )}
            </div>
      </div>

      {/* ACTIONS */}
      <div className="px-4 pb-4 flex items-center gap-2">
         {/* Reaction Button */}
         <button onClick={() => setShowReactionDock(!showReactionDock)} className={`flex-1 border rounded-xl py-2.5 font-bold text-sm flex justify-center gap-2 transition active:scale-95 ${reactionType ? 'bg-rose-50 text-rose-600 border-rose-100' : 'border-slate-100 text-slate-600 hover:bg-slate-50'}`}>{reactionType ? reactionType : <><Heart size={16} /> React</>}</button>
         
         {/* Follow Button */}
         <button onClick={() => setIsFollowing(!isFollowing)} className={`flex-1 border rounded-xl py-2.5 font-bold text-sm flex justify-center gap-2 transition active:scale-95 ${isFollowing ? 'bg-slate-900 text-white border-slate-900' : 'border-slate-100 text-slate-600 hover:bg-slate-50'}`}>{isFollowing ? <CheckCircle2 size={16}/> : <UserPlus size={16}/>} {isFollowing ? 'Following' : 'Follow'}</button>
         
         {/* Connect / Message / Unavailable */}
         {isConnected ? (
             <button onClick={() => onConnect('message')} className="flex-[1.5] bg-blue-600 text-white rounded-xl py-2.5 font-bold text-sm shadow-md hover:bg-blue-700 transition flex justify-center gap-1.5 active:scale-95"><MessageCircle size={16}/> Message</button>
         ) : isCommitted ? (
             // COMMITTED STATE: Cannot Connect
             <button disabled className="flex-[1.5] bg-slate-100 text-slate-400 rounded-xl py-2.5 font-bold text-[11px] border border-slate-200 flex justify-center gap-1.5 cursor-not-allowed">
                <Lock size={14}/> Unavailable
             </button>
         ) : (
             // SINGLE STATE: Can Connect
             <button onClick={() => onConnect('connect')} className="flex-[1.5] bg-slate-900 text-white rounded-xl py-2.5 font-bold text-sm shadow-md hover:bg-slate-800 transition flex justify-center gap-1.5 active:scale-95">Connect <Zap size={14} className="fill-yellow-400 text-yellow-400"/></button>
         )}
      </div>
      
      {/* FOOTER COMMENT */}
      <div className="px-4 pb-5 pt-0">
        {post.type !== 'text' && post.caption && <p className="text-sm text-slate-700 mb-3 leading-relaxed"><span className="font-bold mr-2 text-slate-900">{profile?.full_name}</span>{post.caption}</p>}
        <div onClick={onComment} className="flex items-center gap-3 bg-slate-50 rounded-full px-4 py-2.5 border border-slate-100 cursor-pointer hover:bg-white transition group">
            <div className="w-6 h-6 rounded-full bg-slate-200 overflow-hidden"><img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=User`} alt="me" /></div>
            <div className="flex-1 text-xs text-slate-400 font-medium group-hover:text-slate-500">Add a comment...</div>
            <Lock size={12} className="text-slate-300 group-hover:text-rose-500 transition" />
        </div>
      </div>
    </div>
  )
}