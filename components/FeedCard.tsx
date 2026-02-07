'use client'
import { useState } from 'react'
import { Heart, Lock, Zap, Award, CheckCircle2, Instagram, Linkedin, MessageCircle, X, UserPlus, ShieldCheck } from 'lucide-react'

interface PostProps {
  post: any
  isConnected?: boolean
  onConnect: () => void
  onSocialUnlock: () => void
  onComment: () => void
}

export default function FeedCard({ post, isConnected = false, onConnect, onSocialUnlock, onComment }: PostProps) {
  const [showReactionDock, setShowReactionDock] = useState(false)
  const [reactionType, setReactionType] = useState<string | null>(null)
  const [isFollowing, setIsFollowing] = useState(false)
  
  const profile = post.profiles

  const handleReaction = (emoji: string) => {
    setReactionType(emoji === reactionType ? null : emoji)
    setShowReactionDock(false)
  }

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden mb-6 relative">
      
      {/* 1. HEADER */}
      <div className="p-4 flex justify-between items-start">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
            <img 
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.full_name}`} 
              alt="avatar" 
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              {profile?.full_name}
              {/* TICK LOGIC */}
              {profile?.is_gold ? (
                 <Award size={16} className="text-amber-500 fill-amber-500" />
              ) : profile?.career_verified ? (
                 <CheckCircle2 size={16} className="text-blue-500 fill-blue-50" />
              ) : (
                 <CheckCircle2 size={16} className="text-slate-300" />
              )}
            </h3>
            
            {/* META ROW: Brand ID + Vouch Score + Location */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
                {profile?.brand_id && (
                    <span className="font-mono text-[10px] bg-slate-50 px-1.5 py-0.5 rounded text-slate-500 border border-slate-200">
                        {profile.brand_id}
                    </span>
                )}
                
                {/* VOUCH SCORE (New) */}
                <span className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                    <ShieldCheck size={10} /> {profile?.vouches_count || 0}
                </span>

                <span className="text-[10px]">Mumbai • 29</span>
            </div>
          </div>
        </div>
        
        {profile?.is_gold && (
           <span className="bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-100">GOLD</span>
        )}
      </div>

      {/* 2. CONTENT */}
      {post.type === 'photo' && post.media_url && (
        <div className="aspect-[4/5] bg-slate-100 relative">
          <img src={post.media_url} className="w-full h-full object-cover" alt="Post" />
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
        <div className="px-6 py-10 bg-slate-50 border-y border-slate-100">
           <p className="text-slate-800 text-[18px] font-serif font-medium leading-relaxed whitespace-pre-wrap text-center italic">
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
               <h4 className="font-bold text-slate-900 text-lg mt-2">🏆 {post.achievement_title}</h4>
           </div>
        </div>
      )}

      {/* 3. SOCIAL SHIELD (Always Visible now, handles unverified state inside) */}
      <div className="px-4 mt-3 mb-3 grid grid-cols-2 gap-2">
            {/* CAREER BLOCK */}
            <div onClick={onSocialUnlock} className="bg-blue-50/50 rounded-xl p-3 border border-blue-100 flex flex-col justify-center relative cursor-pointer hover:bg-blue-100/50 transition active:scale-95 min-h-[70px]">
                <div className="flex items-center gap-1.5 mb-1"><Linkedin size={14} className="text-blue-700" /><span className="text-[10px] font-bold text-slate-500 uppercase">Career</span></div>
                
                {profile?.career_verified ? (
                    <>
                        <p className="text-[11px] text-slate-700 leading-tight block">Role at <span className="font-bold">Top Tier Firm...</span></p>
                        <div className="absolute top-2 right-2 text-amber-400"><Lock size={12} /></div>
                    </>
                ) : (
                    <p className="text-[10px] text-slate-400 italic">Not Verified</p>
                )}
            </div>

            {/* VIBE BLOCK */}
            <div onClick={onSocialUnlock} className="bg-pink-50/30 rounded-xl p-2 border border-pink-100 relative cursor-pointer hover:bg-pink-50/50 transition active:scale-95 min-h-[70px] flex flex-col justify-center">
                 <div className="flex items-center gap-1.5 mb-1.5 px-1"><Instagram size={14} className="text-pink-600" /><span className="text-[10px] font-bold text-slate-500 uppercase">Vibe</span></div>
                 
                 {profile?.vibe_verified ? (
                   <div className="grid grid-cols-3 gap-1 h-8 overflow-hidden rounded-lg relative w-full">
                      <div className="bg-slate-300 w-full h-full blur-[2px]"></div>
                      <div className="bg-slate-400 w-full h-full blur-[2px]"></div>
                      <div className="bg-slate-300 w-full h-full blur-[2px]"></div>
                      <div className="absolute inset-0 bg-black/10 flex items-center justify-center"><Lock size={12} className="text-white drop-shadow-md" /></div>
                   </div>
                ) : (
                    <p className="text-[10px] text-slate-400 italic px-1">Not Connected</p>
                )}
            </div>
      </div>

      {/* 4. ACTIONS */}
      <div className="px-4 pb-4 flex items-center gap-2">
         <button onClick={() => setShowReactionDock(!showReactionDock)} className={`flex-1 border rounded-xl py-2.5 font-bold text-sm transition flex items-center justify-center gap-2 active:scale-95 ${reactionType ? 'border-rose-200 bg-rose-50 text-rose-600' : 'border-slate-200 text-slate-600'}`}>
           {reactionType ? <span className="text-lg">{reactionType}</span> : <><Heart size={18} /> React</>}
         </button>
         
         <button onClick={() => setIsFollowing(!isFollowing)} className={`flex-1 border rounded-xl py-2.5 font-bold text-sm transition active:scale-95 flex items-center justify-center gap-2 ${isFollowing ? 'bg-slate-100 text-slate-800' : 'border-slate-200 text-slate-600'}`}>
           {isFollowing ? <><CheckCircle2 size={16}/> Following</> : <><UserPlus size={18}/> Follow</>}
         </button>
         
         {isConnected ? (
             <button onClick={onConnect} className="flex-[1.5] bg-blue-600 text-white rounded-xl py-2.5 font-bold text-sm shadow-lg hover:bg-blue-700 transition flex items-center justify-center gap-1.5 active:scale-95">
                <MessageCircle size={16} /> Message
             </button>
         ) : (
             <button onClick={onConnect} className="flex-[1.5] bg-slate-900 text-white rounded-xl py-2.5 font-bold text-sm shadow-lg hover:bg-slate-800 transition flex items-center justify-center gap-1.5 active:scale-95">
                Connect <Zap size={14} className="fill-yellow-400 text-yellow-400" />
             </button>
         )}
      </div>

      {/* 5. FOOTER */}
      <div className="px-4 pb-5 pt-0">
        {post.type !== 'text' && post.caption && <p className="text-sm text-slate-700 mb-3"><span className="font-bold mr-2">{profile?.full_name}</span>{post.caption}</p>}
        
        <div onClick={onComment} className="flex items-center gap-3 bg-slate-50 rounded-full px-4 py-2.5 border border-slate-100 cursor-pointer hover:bg-slate-100 transition group">
            <div className="w-6 h-6 rounded-full bg-slate-200 overflow-hidden"><img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=User`} alt="me" /></div>
            <div className="flex-1 text-xs text-slate-400 font-medium">Add a comment...</div>
            <Lock size={12} className="text-slate-400 group-hover:text-rose-500 transition" />
        </div>
      </div>

    </div>
  )
}