"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Lock,
  Zap,
  Award,
  Instagram,
  Linkedin,
  MessageCircle,
  X,
  MoreHorizontal,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";

// --- TYPES ---
interface Profile {
  id?: string;
  full_name: string;
  is_gold?: boolean;
  brand_id?: string;
  vouches_count?: number;
  city?: string;
  career_verified?: boolean;
  relationship_status?: "single" | "paired";
  job_title?: string;
  company?: string;
}

interface FeedPost {
  id: string;
  type: "photo" | "text" | "achievement";
  caption?: string;
  media_url?: string;
  achievement_title?: string;
  profiles?: Profile;
}

interface FeedCardProps {
  post: FeedPost;
  isConnected?: boolean;
  onConnect: (mode?: "connect" | "message") => void; // Accepts the mode argument
  onSocialUnlock: () => void; // Accepts the unlock trigger
  onComment: () => void; // Accepts the comment trigger
}

export default function FeedCard({
  post,
  isConnected = false,
  onConnect,
  onSocialUnlock,
  onComment,
}: FeedCardProps) {
  const [showReactionDock, setShowReactionDock] = useState(false);
  const [reactionType, setReactionType] = useState<string | null>(null);
  const [liked, setLiked] = useState(false);

  const profile = post.profiles || { full_name: "Unknown User" };
  const isCommitted = profile.relationship_status === "paired";

  // URL-friendly username
  const profileLink = `/profile/${encodeURIComponent(profile.full_name)}`;

  // The "Intentional" Reaction Set
  const reactions = [
    { emoji: "❤️", label: "Appreciate" },
    { emoji: "🧿", label: "Vibe" },
    { emoji: "🙌", label: "Respect" },
  ];

  const handleReaction = (emoji: string) => {
    setReactionType(emoji === reactionType ? null : emoji);
    setShowReactionDock(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-100 overflow-hidden mb-8 relative"
    >
      {/* 1. HEADER: Minimalist & Clean */}
      <div className="p-4 flex justify-between items-center bg-white/60 backdrop-blur-md sticky top-0 z-10">
        <div className="flex gap-3 items-center">
          {/* Avatar Ring */}
          <Link href={profileLink} className="relative group">
            <div
              className={`w-11 h-11 rounded-full p-[2px] transition-transform duration-300 group-hover:scale-105 ${
                profile.is_gold
                  ? "bg-gradient-to-tr from-amber-200 to-yellow-500"
                  : "bg-slate-100"
              }`}
            >
              <div className="w-full h-full rounded-full bg-white overflow-hidden border-2 border-white">
                <img
                  src={
                    profile.brand_id
                      ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.brand_id}`
                      : `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.full_name}`
                  }
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </Link>

          <div className="leading-tight">
            <div className="flex items-center gap-1.5">
              <Link
                href={profileLink}
                className="font-bold text-slate-900 text-[15px] hover:text-brand-blue transition-colors"
              >
                {profile.full_name}
              </Link>
              {profile.is_gold && (
                <Award size={14} className="text-amber-500 fill-amber-500" />
              )}
              {profile.career_verified && !profile.is_gold && (
                <CheckCircle2 size={14} className="text-brand-blue" />
              )}

              {isCommitted && (
                <span className="text-[9px] font-bold bg-slate-100 text-slate-400 border border-slate-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Lock size={8} /> Taken
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wide mt-0.5">
              {profile.city || "Observing"}
            </p>
          </div>
        </div>
        <button className="p-2 text-slate-300 hover:text-slate-600 transition-colors active:scale-95">
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* 2. CONTENT LAYER */}
      <div className="relative group">
        {/* PHOTO POST */}
        {post.type === "photo" && post.media_url && (
          <div className="w-full bg-slate-50 relative aspect-[4/5] overflow-hidden">
            <img
              src={post.media_url}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
              alt="Post"
            />
          </div>
        )}

        {/* TEXT POST */}
        {post.type === "text" && (
          <div className="px-8 py-16 bg-gradient-to-br from-brand-bg to-white flex items-center justify-center min-h-[320px] border-y border-slate-50 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-32 h-32 bg-blue-100 rounded-full blur-[80px] opacity-20 -translate-x-1/2 -translate-y-1/2"></div>
            <p className="text-slate-800 text-xl font-display text-center leading-relaxed italic relative z-10 max-w-xs">
              &ldquo;{post.caption}&rdquo;
            </p>
          </div>
        )}

        {/* ACHIEVEMENT POST */}
        {post.type === "achievement" && (
          <div className="px-5 py-8 bg-indigo-50/20 border-y border-slate-50">
            <div className="bg-white rounded-2xl p-6 border border-indigo-100 shadow-sm flex flex-col items-center text-center">
              <div className="bg-indigo-50 w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-4 shadow-inner">
                🏆
              </div>
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-2">
                Career Update
              </span>
              <h4 className="font-bold text-slate-900 text-lg mb-2">
                {post.achievement_title}
              </h4>
              <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
                {post.caption}
              </p>
            </div>
          </div>
        )}

        {/* 3. REACTION DOCK */}
        <AnimatePresence>
          {showReactionDock && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-xl rounded-full px-6 py-3 shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-white/50 flex items-center gap-6 z-20"
            >
              {reactions.map((r) => (
                <button
                  key={r.emoji}
                  onClick={() => handleReaction(r.emoji)}
                  className="flex flex-col items-center gap-1 group transition-transform active:scale-90"
                >
                  <span className="text-2xl group-hover:-translate-y-1 transition-transform duration-300">
                    {r.emoji}
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 absolute -bottom-4 transition-opacity whitespace-nowrap">
                    {r.label}
                  </span>
                </button>
              ))}
              <div className="w-px h-8 bg-slate-200 mx-1"></div>
              <button
                onClick={() => setShowReactionDock(false)}
                className="text-slate-300 hover:text-slate-500 transition-colors"
              >
                <X size={20} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 4. SOCIAL SHIELD PILLS */}
      <div className="px-5 pt-5 pb-2 flex gap-3">
        {/* Career Pill */}
        <div
          onClick={isConnected ? undefined : onSocialUnlock}
          className={`flex-1 group cursor-pointer flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all duration-300 ${
            isConnected
              ? "bg-indigo-50/40 border-indigo-100"
              : "bg-slate-50 border-slate-100 hover:bg-white hover:border-slate-200 hover:shadow-sm"
          }`}
        >
          <div className="flex items-center gap-2">
            <div
              className={`p-1.5 rounded-full ${
                isConnected
                  ? "bg-indigo-100 text-indigo-600"
                  : "bg-slate-200 text-slate-400"
              }`}
            >
              <Linkedin size={12} />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                Career
              </span>
              {isConnected ? (
                <span className="text-[11px] font-bold text-slate-900 leading-none">
                  {profile.job_title || "Verified"}
                </span>
              ) : (
                <span className="text-[11px] font-medium text-slate-500 leading-none">
                  Top Tier Firm
                </span>
              )}
            </div>
          </div>
          {!isConnected && (
            <Lock
              size={12}
              className="text-slate-300 group-hover:text-amber-500 transition-colors"
            />
          )}
        </div>

        {/* Vibe Pill */}
        <div
          onClick={isConnected ? undefined : onSocialUnlock}
          className={`flex-1 group cursor-pointer flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all duration-300 ${
            isConnected
              ? "bg-pink-50/40 border-pink-100"
              : "bg-slate-50 border-slate-100 hover:bg-white hover:border-slate-200 hover:shadow-sm"
          }`}
        >
          <div className="flex items-center gap-2">
            <div
              className={`p-1.5 rounded-full ${
                isConnected
                  ? "bg-pink-100 text-pink-600"
                  : "bg-slate-200 text-slate-400"
              }`}
            >
              <Instagram size={12} />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                Vibe
              </span>
              {isConnected ? (
                <span className="text-[11px] font-bold text-slate-900 leading-none">
                  Unlocked
                </span>
              ) : (
                <span className="text-[11px] font-medium text-slate-500 leading-none">
                  Hidden
                </span>
              )}
            </div>
          </div>
          {!isConnected && (
            <Lock
              size={12}
              className="text-slate-300 group-hover:text-amber-500 transition-colors"
            />
          )}
        </div>
      </div>

      {/* 5. ACTIONS BAR */}
      <div className="px-5 pb-6 pt-2 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowReactionDock(!showReactionDock)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full transition-all duration-300 active:scale-95 border ${
              reactionType
                ? "bg-rose-50 border-rose-100 text-rose-600 shadow-sm"
                : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
            }`}
          >
            {reactionType ? (
              <span className="text-lg animate-in zoom-in spin-in-12 duration-300">
                {reactionType}
              </span>
            ) : (
              <Heart size={18} />
            )}
            {!reactionType && (
              <span className="text-xs font-bold uppercase tracking-wide">
                React
              </span>
            )}
          </button>

          <button
            onClick={onComment}
            className="p-2.5 rounded-full border border-transparent text-slate-400 hover:bg-slate-50 hover:text-slate-600 hover:border-slate-200 transition-all active:scale-95"
          >
            <MessageCircle size={20} />
          </button>
        </div>

        {/* CTA Logic */}
        {isConnected ? (
          <button
            onClick={() => onConnect("message")}
            className="px-6 py-2.5 bg-slate-100 text-slate-900 rounded-full font-bold text-sm hover:bg-slate-200 transition-all active:scale-95"
          >
            Message
          </button>
        ) : isCommitted ? (
          <button
            onClick={() => alert(`${profile.full_name} is currently committed.`)}
            className="px-5 py-2.5 bg-slate-50 text-slate-400 rounded-full font-bold text-xs border border-slate-100 flex items-center gap-2 cursor-not-allowed"
          >
            <Lock size={12} /> Unavailable
          </button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onConnect("connect")}
            className="px-8 py-3 bg-brand-blue text-white rounded-full font-bold text-sm shadow-xl shadow-blue-200 flex items-center gap-2"
          >
            Connect{" "}
            <Zap size={14} className="fill-brand-gold text-brand-gold" />
          </motion.button>
        )}
      </div>

      {/* 6. CAPTION FOOTER */}
      {post.type === "photo" && post.caption && (
        <div className="px-6 pb-6 pt-0">
          <p className="text-sm text-slate-600 leading-relaxed">
            <span className="font-bold text-slate-900 mr-2">
              {profile.full_name}
            </span>
            {post.caption}
          </p>
        </div>
      )}
    </motion.div>
  );
}