"use client";

import { useRouter } from 'next/navigation';
import VerificationBadge from './VerificationBadge';
import SocialVerificationBadges from './SocialVerificationBadges';
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
  subscription_tier?: 'free' | 'gold' | 'premium';
  linkedin_verified?: boolean;
  instagram_verified?: boolean;
  id?: string;
  full_name: string;
  avatar_url?: string;      // ✅ ADDED - Real photo support
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
  isOwnPost?: boolean;  // ADD THIS
  onConnect: (mode?: "connect" | "message") => void;
  onSocialUnlock: () => void;
  onComment: () => void;
}

export default function FeedCard({
  post,
  isConnected = false,
  isOwnPost = false,
  onConnect,
  onSocialUnlock,
  onComment,
}: FeedCardProps) {
  const router = useRouter();
  const [showReactionDock, setShowReactionDock] = useState(false);
  const [reactionType, setReactionType] = useState<string | null>(null);
  const profile = post.profiles || { full_name: "Unknown User" };
  const isCommitted = profile.relationship_status === "paired";

  // URL-friendly username
  const profileLink = `/profile/${encodeURIComponent(profile.full_name)}`;

  // ✅ AVATAR LOGIC - Use real photo if exists, fallback to DiceBear
  const avatarSrc = profile.avatar_url 
    || (profile.brand_id 
      ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.brand_id}`
      : `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.full_name}`);

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
      style={{
        background: 'rgba(255, 255, 255, 0.75)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.5)',
        borderRadius: '24px',
        boxShadow: '0 8px 32px rgba(31, 41, 55, 0.1)',
        overflow: 'hidden',
        marginBottom: '20px',
        position: 'relative'
      }}
    >
      {/* 1. HEADER: Minimalist & Clean */}
      <div style={{
        padding: '16px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(255, 255, 255, 0.6)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(226, 232, 240, 0.3)'
      }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {/* Avatar Ring - NOW USES REAL PHOTOS! */}
          <Link href={profileLink}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              padding: '2px',
              background: profile.is_gold
                ? 'linear-gradient(135deg, #fde68a 0%, #fbbf24 100%)'
                : '#f1f5f9',
              cursor: 'pointer',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <div style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                overflow: 'hidden',
                background: 'white',
                border: '2px solid white'
              }}>
                <img
                  src={avatarSrc}
                  alt={profile.full_name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            </div>
          </Link>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Link
                  href={profileLink}
                  style={{
                    fontWeight: '700',
                    color: '#1e3a8a',
                    fontSize: '15px',
                    textDecoration: 'none',
                    transition: 'color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#2563eb'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#1e3a8a'}
                >
                  {profile.full_name}
                </Link>
                <VerificationBadge tier={profile.subscription_tier || 'free'} size={16} />
                <SocialVerificationBadges
                  instagramVerified={profile.instagram_verified}
                  linkedinVerified={profile.linkedin_verified}
                  size={14}
                />
              </div>
              {isCommitted && (
                <span style={{
                  fontSize: '9px',
                  fontWeight: '700',
                  background: '#f1f5f9',
                  color: '#94a3b8',
                  border: '1px solid #e2e8f0',
                  padding: '2px 6px',
                  borderRadius: '6px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px'
                }}>
                  <Lock size={8} /> Taken
                </span>
              )}
            </div>
            <p style={{
              fontSize: '12px',
              color: '#94a3b8',
              fontWeight: '500'
            }}>
              {profile.job_title && profile.company 
                ? `${profile.job_title} at ${profile.company}` 
                : profile.city || "Observing"}
            </p>
          </div>
        </div>
        <button style={{
          padding: '8px',
          color: '#cbd5e1',
          background: 'transparent',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(226, 232, 240, 0.5)';
          e.currentTarget.style.color = '#64748b';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = '#cbd5e1';
        }}
        >
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* 2. CONTENT LAYER - LINKEDIN STYLE */}
      <div style={{ position: 'relative' }}>
        
        {/* TEXT POST - LinkedIn Style (Professional) */}
        {post.type === "text" && (
          <div style={{
            padding: '20px 24px',
            background: 'white'
          }}>
            <p style={{
              fontSize: '15px',
              lineHeight: '1.6',
              color: '#1e293b',
              fontWeight: '400',
              margin: 0,
              whiteSpace: 'pre-wrap'
            }}>
              {post.caption}
            </p>
          </div>
        )}

        {/* PHOTO POST */}
        {post.type === "photo" && post.media_url && (
          <div style={{
            width: '100%',
            background: '#f8fafc',
            position: 'relative',
            aspectRatio: '4/5',
            overflow: 'hidden'
          }}>
            <img
              src={post.media_url}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transition: 'transform 0.7s'
              }}
              alt="Post"
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            />
          </div>
        )}

        {/* ACHIEVEMENT POST */}
        {post.type === "achievement" && (
          <div style={{
            padding: '20px',
            background: 'rgba(238, 242, 255, 0.3)'
          }}>
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid rgba(99, 102, 241, 0.2)',
              boxShadow: '0 2px 8px rgba(99, 102, 241, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center'
            }}>
              <div style={{
                background: 'rgba(99, 102, 241, 0.1)',
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
                marginBottom: '16px',
                boxShadow: 'inset 0 2px 4px rgba(99, 102, 241, 0.1)'
              }}>
                🏆
              </div>
              <span style={{
                fontSize: '10px',
                fontWeight: '700',
                color: '#6366f1',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: '8px'
              }}>
                Career Update
              </span>
              <h4 style={{
                fontWeight: '700',
                color: '#1e3a8a',
                fontSize: '18px',
                marginBottom: '8px',
                margin: '0 0 8px 0'
              }}>
                {post.achievement_title}
              </h4>
              <p style={{
                fontSize: '14px',
                color: '#64748b',
                lineHeight: '1.5',
                maxWidth: '320px',
                margin: 0
              }}>
                {post.caption}
              </p>
            </div>
          </div>
        )}

        {/* REACTION DOCK */}
        <AnimatePresence>
          {showReactionDock && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              style={{
                position: 'absolute',
                bottom: '24px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                borderRadius: '50px',
                padding: '12px 24px',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.5)',
                display: 'flex',
                alignItems: 'center',
                gap: '24px',
                zIndex: 20
              }}
            >
              {reactions.map((r) => (
                <button
                  key={r.emoji}
                  onClick={() => handleReaction(r.emoji)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    const emoji = e.currentTarget.querySelector('span');
                    if (emoji) (emoji as HTMLElement).style.transform = 'translateY(-4px)';
                  }}
                  onMouseLeave={(e) => {
                    const emoji = e.currentTarget.querySelector('span');
                    if (emoji) (emoji as HTMLElement).style.transform = 'translateY(0)';
                  }}
                >
                  <span style={{
                    fontSize: '28px',
                    transition: 'transform 0.3s'
                  }}>
                    {r.emoji}
                  </span>
                  <span style={{
                    fontSize: '9px',
                    fontWeight: '700',
                    color: '#94a3b8',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    whiteSpace: 'nowrap'
                  }}>
                    {r.label}
                  </span>
                </button>
              ))}
              <div style={{
                width: '1px',
                height: '32px',
                background: '#e2e8f0',
                margin: '0 4px'
              }} />
              <button
                onClick={() => setShowReactionDock(false)}
                style={{
                  color: '#cbd5e1',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'color 0.2s',
                  display: 'flex',
                  padding: '4px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#64748b'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#cbd5e1'}
              >
                <X size={20} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 3. PHOTO CAPTION (if photo post has caption) */}
      {post.type === "photo" && post.caption && (
        <div style={{
          padding: '16px 24px 0',
          background: 'white'
        }}>
          <p style={{
            fontSize: '14px',
            color: '#475569',
            lineHeight: '1.5',
            margin: 0
          }}>
            <span style={{
              fontWeight: '700',
              color: '#1e3a8a',
              marginRight: '8px'
            }}>
              {profile.full_name}
            </span>
            {post.caption}
          </p>
        </div>
      )}

      {/* 4. SOCIAL SHIELD PILLS */}
      <div style={{
        padding: '16px 20px 12px',
        display: 'flex',
        gap: '12px'
      }}>
        {/* Career Pill */}
        <div
          onClick={isConnected ? undefined : onSocialUnlock}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 12px',
            borderRadius: '12px',
            border: `1px solid ${isConnected ? 'rgba(99, 102, 241, 0.2)' : '#e2e8f0'}`,
            background: isConnected ? 'rgba(99, 102, 241, 0.05)' : '#f8fafc',
            cursor: isConnected ? 'default' : 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            if (!isConnected) {
              e.currentTarget.style.background = 'white';
              e.currentTarget.style.borderColor = '#cbd5e1';
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.05)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isConnected) {
              e.currentTarget.style.background = '#f8fafc';
              e.currentTarget.style.borderColor = '#e2e8f0';
              e.currentTarget.style.boxShadow = 'none';
            }
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              padding: '6px',
              borderRadius: '50%',
              background: isConnected ? 'rgba(99, 102, 241, 0.15)' : '#e2e8f0',
              color: isConnected ? '#6366f1' : '#94a3b8',
              display: 'flex'
            }}>
              <Linkedin size={12} />
            </div>
            <div>
              <span style={{
                fontSize: '9px',
                fontWeight: '700',
                color: '#94a3b8',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                display: 'block',
                marginBottom: '2px'
              }}>
                Career
              </span>
              <span style={{
                fontSize: '11px',
                fontWeight: isConnected ? '700' : '500',
                color: isConnected ? '#1e3a8a' : '#64748b',
                display: 'block'
              }}>
                {isConnected ? (profile.job_title || "Verified") : "Top Tier Firm"}
              </span>
            </div>
          </div>
          {!isConnected && (
            <Lock size={12} style={{ color: '#cbd5e1' }} />
          )}
        </div>

        {/* Vibe Pill */}
        <div
          onClick={isConnected ? undefined : onSocialUnlock}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 12px',
            borderRadius: '12px',
            border: `1px solid ${isConnected ? 'rgba(236, 72, 153, 0.2)' : '#e2e8f0'}`,
            background: isConnected ? 'rgba(236, 72, 153, 0.05)' : '#f8fafc',
            cursor: isConnected ? 'default' : 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            if (!isConnected) {
              e.currentTarget.style.background = 'white';
              e.currentTarget.style.borderColor = '#cbd5e1';
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.05)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isConnected) {
              e.currentTarget.style.background = '#f8fafc';
              e.currentTarget.style.borderColor = '#e2e8f0';
              e.currentTarget.style.boxShadow = 'none';
            }
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              padding: '6px',
              borderRadius: '50%',
              background: isConnected ? 'rgba(236, 72, 153, 0.15)' : '#e2e8f0',
              color: isConnected ? '#ec4899' : '#94a3b8',
              display: 'flex'
            }}>
              <Instagram size={12} />
            </div>
            <div>
              <span style={{
                fontSize: '9px',
                fontWeight: '700',
                color: '#94a3b8',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                display: 'block',
                marginBottom: '2px'
              }}>
                Vibe
              </span>
              <span style={{
                fontSize: '11px',
                fontWeight: isConnected ? '700' : '500',
                color: isConnected ? '#1e3a8a' : '#64748b',
                display: 'block'
              }}>
                {isConnected ? "Unlocked" : "Hidden"}
              </span>
            </div>
          </div>
          {!isConnected && (
            <Lock size={12} style={{ color: '#cbd5e1' }} />
          )}
        </div>
      </div>

      {/* 5. ACTIONS BAR */}
      <div style={{
        padding: '12px 20px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setShowReactionDock(!showReactionDock)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              borderRadius: '50px',
              transition: 'all 0.3s',
              border: reactionType ? '1px solid rgba(244, 63, 94, 0.2)' : '1px solid #e2e8f0',
              background: reactionType ? 'rgba(244, 63, 94, 0.05)' : 'white',
              color: reactionType ? '#f43f5e' : '#64748b',
              cursor: 'pointer',
              fontFamily: 'inherit'
            }}
            onMouseEnter={(e) => {
              if (!reactionType) {
                e.currentTarget.style.borderColor = '#cbd5e1';
              }
            }}
            onMouseLeave={(e) => {
              if (!reactionType) {
                e.currentTarget.style.borderColor = '#e2e8f0';
              }
            }}
          >
            {reactionType ? (
              <span style={{ fontSize: '18px' }}>{reactionType}</span>
            ) : (
              <Heart size={18} />
            )}
            {!reactionType && (
              <span style={{
                fontSize: '12px',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                React
              </span>
            )}
          </button>

          <button
            onClick={onComment}
            style={{
              padding: '10px',
              borderRadius: '50%',
              border: '1px solid transparent',
              color: '#94a3b8',
              background: 'transparent',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f8fafc';
              e.currentTarget.style.color = '#64748b';
              e.currentTarget.style.borderColor = '#e2e8f0';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = '#94a3b8';
              e.currentTarget.style.borderColor = 'transparent';
            }}
          >
            <MessageCircle size={20} />
          </button>
        </div>

{/* CTA Logic */}
{isOwnPost ? (
          <button
            onClick={() => router.push('/profile')}
            style={{
              padding: '10px 24px',
              background: '#f1f5f9',
              color: '#1e3a8a',
              borderRadius: '50px',
              fontWeight: '700',
              fontSize: '14px',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontFamily: 'inherit'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#e2e8f0'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#f1f5f9'}
          >
            View Profile
          </button>
        ) : isConnected ? (
          <button
            onClick={() => onConnect("message")}
            style={{
              padding: '10px 24px',
              background: '#f1f5f9',
              color: '#1e3a8a',
              borderRadius: '50px',
              fontWeight: '700',
              fontSize: '14px',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontFamily: 'inherit'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#e2e8f0'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#f1f5f9'}
          >
            Message
          </button>
        ) : isCommitted ? (
          <button
            onClick={() => alert(`${profile.full_name} is currently committed.`)}
            style={{
              padding: '10px 20px',
              background: '#f8fafc',
              color: '#94a3b8',
              borderRadius: '50px',
              fontWeight: '700',
              fontSize: '12px',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'not-allowed',
              fontFamily: 'inherit'
            }}
          >
            <Lock size={12} /> Unavailable
          </button>
        ) : (
          <button
            onClick={() => onConnect("connect")}
            style={{
              padding: '12px 32px',
              background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
              color: 'white',
              borderRadius: '50px',
              fontWeight: '700',
              fontSize: '14px',
              boxShadow: '0 8px 24px rgba(30, 58, 138, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontFamily: 'inherit'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 10px 28px rgba(30, 58, 138, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(30, 58, 138, 0.3)';
            }}
          >
            Connect{" "}
            <Zap size={14} style={{ fill: '#D4AF37', color: '#D4AF37' }} />
          </button>
        )}
      </div>
    </motion.div>
  );
}