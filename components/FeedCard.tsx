'use client'
import { useState } from 'react'
import Link from 'next/link'
import { 
  Heart, Lock, Zap, Award, CheckCircle2, Instagram, Linkedin, 
  MessageCircle, X, UserPlus, ShieldCheck, Users, MoreHorizontal 
} from 'lucide-react'

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
  
  const profile = post.profiles || { full_name: 'Unknown User' }
  const isCommitted = profile.relationship_status === 'paired'

  // URL-friendly username
  const profileLink = `/profile/${encodeURIComponent(profile.full_name)}`

  const handleReaction = (emoji: string) => {
    setReactionType(emoji === reactionType ? null : emoji)
    setShowReactionDock(false)
  }

  // Handle tap on "Unavailable" button
  const handleUnavailableClick = () => {
    alert(`${profile.full_name} is currently committed on WYTH and is not accepting connection requests.`)
  }

  return (
    <div className="bg-white border-b border-slate-100 sm:border sm:rounded-2xl sm:shadow-sm sm:mb-4 relative">
      
      {/* 1. HEADER */}
      <div className="p-3 flex justify-between items-center">
        <div className="flex gap-3 items-center">
          
          {/* AVATAR (Clean, No Fake Status) */}
          <Link href={profileLink} className="relative">
            <div className={`w-10 h-10 rounded-full p-[1.5px] ${profile.is_gold ? 'bg-gradient-to-tr from-amber-300 to-yellow-500' : 'bg-slate-100'}`}>
                <div className="w-full h-full rounded-full bg-white overflow-hidden">
                    <img 
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.full_name}`} 
                        alt="avatar" 
                        className="w-full h-full object-cover"
                    />
                </div>
            </div>
          </Link>
          
          <div className="leading-tight">
            <div className="flex items-center gap-1.5">
                <Link href={profileLink} className="font-bold text-slate-900 text-sm hover:underline decoration-slate-300 underline-offset-2">
                    {profile.full_name}
                </Link>
                
                {profile.is_gold && <Award size={12} className="text-amber-500 fill-amber-500" />}
                
                {/* REAL LOGIC: Only shows if DB says 'paired' */}
                {isCommitted && (
                    <span className="text-[9px] font-bold bg-slate-100 text-slate-500 border border-slate-200 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                        <Lock size={8} /> Taken
                    </span>
                )}
            </div>
            
            <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                {profile.brand_id && <span className="font-mono opacity-80">{profile.brand_id}</span>}
                {profile.city && <span>• {profile.city}</span>}
            </div>
          </div>
        </div>
        
        <button className="text-slate-300 hover:text-slate-600"><MoreHorizontal size={18}/></button>
      </div>

      {/* 2. CONTENT LAYER */}
      
      {/* Type: PHOTO */}
      {post.type === 'photo' && post.media_url && (
        <div className="w-full bg-slate-100 relative">
          <img src={post.media_url} className="w-full h-auto object-cover max-h-[500px]" alt="Post" />
          
          {/* Reaction Dock Overlay */}
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

      {/* Type: TEXT */}
      {post.type === 'text' && (
        <div className="px-4 py-6 bg-gradient-to-b from-white to-slate-50/30">
           <p className="text-slate-800 text-[15px] leading-relaxed font-normal whitespace-pre-wrap">
             {post.caption}
           </p>
           {showReactionDock && (
            <div className="flex justify-center mt-4">
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

      {/* Type: ACHIEVEMENT */}
      {post.type === 'achievement' && (
        <div className="px-4 pb-2 pt-1">
           <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex gap-3">
               <div className="bg-white p-2 rounded-full border border-slate-100 h-fit shadow-sm text-lg">🏆</div>
               <div>
                   <h4 className="font-bold text-slate-900 text-sm">{post.achievement_title}</h4>
                   <p className="text-xs text-slate-500 mt-0.5 leading-snug">{post.caption}</p>
               </div>
           </div>
        </div>
      )}

      {/* 3. SOCIAL SHIELD */}
      <div className="px-4 py-3">
        <div className="flex gap-2">
            {/* Career Pill */}
            <div onClick={isConnected ? undefined : onSocialUnlock} className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-lg border transition cursor-pointer active:scale-[0.98] ${isConnected ? 'bg-white border-slate-200' : 'bg-slate-50 border-dashed border-slate-200 hover:border-blue-200'}`}>
                <div className={`p-1 rounded-full ${isConnected ? 'bg-blue-50 text-blue-600' : 'bg-slate-200 text-slate-400'}`}>
                    <Linkedin size={12} />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Career</p>
                    {isConnected ? (
                        <p className="text-xs font-semibold text-slate-900 truncate">Product Designer</p>
                    ) : (
                        <p className="text-xs text-slate-400 truncate flex items-center gap-1">Top Tier Firm <Lock size={10}/></p>
                    )}
                </div>
            </div>

            {/* Vibe Pill */}
            <div onClick={isConnected ? undefined : onSocialUnlock} className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-lg border transition cursor-pointer active:scale-[0.98] ${isConnected ? 'bg-white border-slate-200' : 'bg-slate-50 border-dashed border-slate-200 hover:border-pink-200'}`}>
                <div className={`p-1 rounded-full ${isConnected ? 'bg-pink-50 text-pink-600' : 'bg-slate-200 text-slate-400'}`}>
                    <Instagram size={12} />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Vibe</p>
                    {isConnected ? (
                        <p className="text-xs font-semibold text-slate-900 truncate">Visible</p>
                    ) : (
                        <p className="text-xs text-slate-400 truncate flex items-center gap-1">Hidden <Lock size={10}/></p>
                    )}
                </div>
            </div>
        </div>
      </div>

      {/* 4. ACTIONS BAR */}
      <div className="px-4 pb-4 flex items-center gap-3">
         {/* Reaction */}
         <button onClick={() => setShowReactionDock(!showReactionDock)} className={`p-2 rounded-full transition active:scale-90 ${reactionType ? 'text-rose-500 bg-rose-50' : 'text-slate-400 hover:bg-slate-50'}`}>
            {reactionType ? <span className="text-lg">{reactionType}</span> : <Heart size={22} />}
         </button>
         
         {/* Comment */}
         <button onClick={onComment} className="p-2 rounded-full text-slate-400 hover:bg-slate-50 transition active:scale-90">
            <MessageCircle size={22} />
         </button>

         {/* Spacer */}
         <div className="flex-1"></div>

         {/* Main CTA */}
         {isConnected ? (
             <button onClick={() => onConnect('message')} className="bg-slate-100 text-slate-900 px-4 py-2 rounded-full font-bold text-sm hover:bg-slate-200 transition">Message</button>
         ) : isCommitted ? (
             // COMMITTED STATE: Cannot Connect (Now Interactive)
             <button 
                onClick={handleUnavailableClick}
                className="bg-slate-50 text-slate-400 px-4 py-2 rounded-full font-bold text-xs border border-slate-100 flex items-center gap-1 hover:bg-slate-100 transition"
             >
                <Lock size={12}/> Unavailable
             </button>
         ) : (
             <button onClick={() => onConnect('connect')} className="bg-slate-900 text-white px-5 py-2 rounded-full font-bold text-sm shadow-md hover:bg-slate-800 transition flex items-center gap-2 active:scale-95">
                Connect <Zap size={14} className="fill-yellow-400 text-yellow-400"/>
             </button>
         )}
      </div>
      
      {/* 5. CAPTION FOOTER (For Photos) */}
      {post.type === 'photo' && post.caption && (
        <div className="px-4 pb-4 -mt-2">
            <p className="text-sm text-slate-800"><span className="font-bold mr-2 text-slate-900">{profile.full_name}</span>{post.caption}</p>
        </div>
      )}

    </div>
  )
}