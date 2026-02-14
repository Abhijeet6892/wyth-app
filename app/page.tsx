"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Zap, Loader2, Send, Camera, X } from "lucide-react";
import FeedCard from "@/components/FeedCard";
import { SlotPaywall, GoldUpsell } from "@/components/InteractionModals";

interface FeedPost {
  id: string;
  type: "photo" | "text" | "achievement";
  caption?: string;
  media_url?: string;
  achievement_title?: string;
  profiles: {
    id: string;
    full_name: string;
    avatar_url?: string;         // ✅ ADD THIS LINE
    brand_id: string;
    intent: string;
    is_gold?: boolean;
    city?: string;
    career_verified?: boolean;
    relationship_status?: "single" | "paired";
    job_title?: string;
    company?: string;
    vouches_count?: number;
  };
}

export default function Home() {
  const router = useRouter();

  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [connectedUserIds, setConnectedUserIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [slotsLeft, setSlotsLeft] = useState<number>(0);

  const [newPostContent, setNewPostContent] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  // Photo upload state
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const [showPaywall, setShowPaywall] = useState(false);
  const [paywallMode, setPaywallMode] = useState<"connect" | "comment">("connect");
  const [showGoldUpsell, setShowGoldUpsell] = useState(false);
  const [targetUserId, setTargetUserId] = useState<string | null>(null);

  // ------------------ FETCH FEED (RPC - DO NOT CHANGE) ------------------

  const fetchFeed = async () => {
    const { data, error } = await supabase.rpc("get_feed");

    if (!error && data) {
      const transformed: FeedPost[] = (data as any[]).map((row) => ({
        id: row.id,
        type: row.type,
        caption: row.caption,
        media_url: row.media_url,
        achievement_title: row.achievement_title || undefined,
        profiles: {
          id: row.user_id,
          full_name: row.full_name,
          avatar_url: row.avatar_url,        // ✅ ADD THIS LINE
          brand_id: row.brand_id,
          intent: row.intent,
          is_gold: row.is_gold,
          city: row.city_display,
          career_verified: row.career_verified,
          relationship_status: row.relationship_status,
          job_title: row.job_title,
          company: row.company,
          vouches_count: row.vouches_count,
        },
      }));

      setPosts(transformed);
    }

    setLoading(false);
  };

  // ------------------ INIT (DO NOT CHANGE LOGIC) ------------------

  useEffect(() => {
    const init = async () => {
      const { data: authData } = await supabase.auth.getUser();
      const currentUser = authData?.user;

      if (!currentUser) {
        router.replace("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("active_slots, max_slots")
        .eq("id", currentUser.id)
        .single();

      if (!profile) {
        router.replace("/onboarding");
        return;
      }

      setUser(currentUser);
      setSlotsLeft((profile.max_slots || 3) - (profile.active_slots || 0));

      const { data: connections } = await supabase
        .from("connections")
        .select("receiver_id")
        .eq("requester_id", currentUser.id)
        .eq("status", "accepted");

      if (connections) {
        setConnectedUserIds(new Set(connections.map((c: any) => c.receiver_id)));
      }

      await fetchFeed();
    };

    init();
  }, [router]);

  // ------------------ PHOTO SELECT HANDLER ------------------

  const handlePhotoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Image must be less than 10MB');
      return;
    }

    // Set file and create preview
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // ------------------ CREATE POST WITH PHOTO UPLOAD ------------------

  const handleCreatePost = async () => {
    if ((!newPostContent.trim() && !photoFile) || !user) return;

    setIsPosting(true);
    let mediaUrl: string | null = null;

    try {
      // 1. Upload photo if exists
      if (photoFile) {
        setUploading(true);
        
        const fileExt = photoFile.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const filePath = `posts/${fileName}`;

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('posts')
          .upload(filePath, photoFile, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          alert('Failed to upload photo. Please try again.');
          setUploading(false);
          setIsPosting(false);
          return;
        }

        // Get public URL
        const { data } = supabase.storage
          .from('posts')
          .getPublicUrl(filePath);

        mediaUrl = data.publicUrl;
        setUploading(false);
      }

      // 2. Create post in database
      const postType = photoFile ? 'photo' : 'text';
      
      const { error } = await supabase.from("posts").insert({
        user_id: user.id,
        type: postType,
        caption: newPostContent.trim() || null,
        media_url: mediaUrl,
        privacy_level: "public",
      });

      if (!error) {
        // Reset form
        setNewPostContent("");
        setPhotoFile(null);
        setPhotoPreview(null);
        
        // Refresh feed
        await fetchFeed();
      } else {
        alert('Failed to create post: ' + error.message);
      }
    } catch (error) {
      console.error('Post creation error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setIsPosting(false);
      setUploading(false);
    }
  };

  // ------------------ CONNECT (RPC - DO NOT CHANGE) ------------------

  const handleConnect = async () => {
    if (!targetUserId) return;

    // Check slots before attempting
    if (slotsLeft <= 0) {
      setShowPaywall(true);
      setPaywallMode("connect");
      return;
    }

    setLoading(true);

    const { error } = await supabase.rpc("send_connection_request", {
      receiver_uuid: targetUserId,
    });

    if (!error) {
      // Optimistic update
      setSlotsLeft(prev => Math.max(0, prev - 1));
      
      setShowPaywall(false);
      
      // Refresh feed
      await fetchFeed();
      
      // Refresh actual slot count
      const { data: profile } = await supabase
        .from("profiles")
        .select("active_slots, max_slots")
        .eq("id", user!.id)
        .single();
      
      if (profile) {
        setSlotsLeft((profile.max_slots || 3) - (profile.active_slots || 0));
      }
    } else {
      alert(error.message || "Failed to send request");
    }

    setLoading(false);
  };

  // ------------------ HANDLE COMMENT ------------------

  const handleComment = async (postId: string, content: string) => {
    if (!content.trim()) {
      alert("Please enter a comment");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.rpc("post_priority_comment", {
      p_post_id: postId,
      p_content: content.trim()
    });

    if (data?.success) {
      alert(`Note sent! 💬\n\nCoins spent: ${data.coins_spent}\nBalance: ${data.remaining_balance}`);
      setShowPaywall(false);
    } else {
      const errorMsg = data?.error || error?.message || "Failed to send note";
      alert(`Error: ${errorMsg}`);
    }

    setLoading(false);
  };

  // ------------------ LOADING STATE ------------------

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #E0E7FF 0%, #DBEAFE 25%, #FFFFFF 50%, #E0F2FE 75%, #DBEAFE 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Loader2 size={40} style={{ color: '#1E3A8A', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  // ------------------ UI (REFINED GLASSMORPHISM) ------------------

  return (
    <main style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #E0E7FF 0%, #DBEAFE 25%, #FFFFFF 50%, #E0F2FE 75%, #DBEAFE 100%)',
      paddingBottom: '96px',
      position: 'relative'
    }}>
      
      {/* Background Orbs */}
      <div style={{ 
        position: 'fixed', 
        top: '-10%', 
        left: '-10%', 
        width: '50%', 
        height: '50%', 
        background: 'radial-gradient(circle, rgba(30, 58, 138, 0.15) 0%, transparent 70%)', 
        filter: 'blur(60px)', 
        pointerEvents: 'none',
        zIndex: 1
      }} />
      <div style={{ 
        position: 'fixed', 
        bottom: '-10%', 
        right: '-10%', 
        width: '50%', 
        height: '50%', 
        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.12) 0%, transparent 70%)', 
        filter: 'blur(60px)', 
        pointerEvents: 'none',
        zIndex: 1
      }} />

      {/* GLASSMORPHISM HEADER */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        background: 'rgba(255, 255, 255, 0.75)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.5)',
        boxShadow: '0 4px 16px rgba(31, 41, 55, 0.08)',
        padding: '16px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        {/* WYTH Logo SVG */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 340 100" width="80" height="auto">
            <g>
              <path fill="#1E3A8A" d="M10,30 Q10,28 12,28 L22,28 Q24,28 24.5,30 L34,68 L43.5,30 Q44,28 46,28 L54,28 Q56,28 56.5,30 L66,68 L75.5,30 Q76,28 78,28 L88,28 Q90,28 90,30 L80,78 Q79,82 75,82 L65,82 Q61,82 60,78 L50,42 L40,78 Q39,82 35,82 L25,82 Q21,82 20,78 Z" />
              <path fill="#1E3A8A" d="M105,30 Q105,28 107,28 L118,28 Q120,28 121,30 L134,55 L149,30 Q150,28 152,28 L166,28 Q168,28 168,30 L148,62 L148,78 Q148,82 144,82 L132,82 Q128,82 128,78 L128,62 Z" />
              <path fill="#1E3A8A" d="M163,28 L210,28 Q212,28 212,30 L212,40 Q212,42 210,42 L196,42 L196,78 Q196,82 192,82 L180,82 Q176,82 176,78 L176,42 L163,42 Q161,42 161,40 L161,30 Q161,28 163,28 Z" />
              <path fill="#1E3A8A" d="M225,30 Q225,28 227,28 L239,28 Q241,28 241,30 L241,48 L274,48 L274,30 Q274,28 276,28 L288,28 Q290,28 290,30 L290,78 Q290,82 286,82 L274,82 Q270,82 270,78 L270,60 L241,60 L241,78 Q241,82 237,82 L225,82 Q221,82 221,78 Z" />
            </g>
          </svg>
        </div>

        {/* Premium Slot Badge - CLICKABLE */}
        <div 
          onClick={() => router.push('/wallet')}
          style={{
            background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%)',
            color: '#1E3A8A',
            padding: '8px 16px',
            borderRadius: '12px',
            fontSize: '13px',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            border: '1px solid rgba(30, 58, 138, 0.2)',
            boxShadow: '0 2px 8px rgba(30, 58, 138, 0.1)',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(30, 58, 138, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(30, 58, 138, 0.1)';
          }}
        >
          <Zap size={14} style={{ color: '#1E3A8A' }} /> 
          {slotsLeft} {slotsLeft === 1 ? 'Slot' : 'Slots'}
        </div>
      </header>

      <div style={{
        maxWidth: '640px',
        margin: '0 auto',
        paddingTop: '24px',
        paddingLeft: '16px',
        paddingRight: '16px',
        position: 'relative',
        zIndex: 10
      }}>
        
        {/* CREATE POST - LINKEDIN STYLE WITH PHOTO UPLOAD */}
        {user && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.75)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.5)',
            borderRadius: '24px',
            padding: '24px',
            boxShadow: '0 8px 32px rgba(31, 41, 55, 0.1)',
            marginBottom: '24px'
          }}>
            
            {/* Header with Avatar */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: '#f1f5f9',
                overflow: 'hidden',
                flexShrink: 0
              }}>
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`}
                  alt="You"
                  style={{ width: '100%', height: '100%' }}
                />
              </div>

              <textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="Share an update, thought, or milestone..."
                style={{
                  flex: 1,
                  background: 'rgba(248, 250, 252, 0.8)',
                  border: '1.5px solid rgba(226, 232, 240, 0.5)',
                  borderRadius: '16px',
                  padding: '14px 16px',
                  fontSize: '15px',
                  color: '#1e3a8a',
                  outline: 'none',
                  resize: 'none',
                  minHeight: '60px',
                  fontFamily: 'inherit',
                  lineHeight: '1.5',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.background = 'white';
                  e.currentTarget.style.borderColor = 'rgba(30, 58, 138, 0.3)';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(30, 58, 138, 0.1)';
                  e.currentTarget.style.minHeight = '100px';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.background = 'rgba(248, 250, 252, 0.8)';
                  e.currentTarget.style.borderColor = 'rgba(226, 232, 240, 0.5)';
                  e.currentTarget.style.boxShadow = 'none';
                  if (!newPostContent) {
                    e.currentTarget.style.minHeight = '60px';
                  }
                }}
              />
            </div>

            {/* Photo Preview */}
            {photoPreview && (
              <div style={{
                position: 'relative',
                marginBottom: '16px',
                borderRadius: '16px',
                overflow: 'hidden',
                border: '1px solid #e2e8f0'
              }}>
                <img
                  src={photoPreview}
                  alt="Preview"
                  style={{
                    width: '100%',
                    maxHeight: '400px',
                    objectFit: 'cover'
                  }}
                />
                <button
                  onClick={() => {
                    setPhotoPreview(null);
                    setPhotoFile(null);
                  }}
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'rgba(0, 0, 0, 0.6)',
                    backdropFilter: 'blur(10px)',
                    border: 'none',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0, 0, 0, 0.8)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0, 0, 0, 0.6)'}
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Action Bar */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: '16px',
              borderTop: '1px solid rgba(226, 232, 240, 0.5)'
            }}>
              
              {/* Left: Media Buttons */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <label style={{
                  padding: '10px 16px',
                  background: photoPreview ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  color: photoPreview ? '#2563eb' : '#64748b',
                  fontSize: '13px',
                  fontWeight: '600',
                  border: photoPreview ? '1px solid rgba(59, 130, 246, 0.2)' : '1px solid transparent'
                }}
                onMouseEnter={(e) => {
                  if (!photoPreview) {
                    e.currentTarget.style.background = 'rgba(248, 250, 252, 0.8)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!photoPreview) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
                >
                  <Camera size={18} />
                  Photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoSelect}
                    style={{ display: 'none' }}
                    disabled={isPosting}
                  />
                </label>
              </div>

              {/* Right: Post Button */}
              <button
                onClick={handleCreatePost}
                disabled={(!newPostContent.trim() && !photoFile) || isPosting}
                style={{
                  background: (!newPostContent.trim() && !photoFile) || isPosting
                    ? 'rgba(30, 58, 138, 0.3)' 
                    : 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
                  color: 'white',
                  padding: '12px 28px',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  border: 'none',
                  cursor: (!newPostContent.trim() && !photoFile) || isPosting ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: (!newPostContent.trim() && !photoFile) || isPosting
                    ? 'none' 
                    : '0 4px 12px rgba(30, 58, 138, 0.3)',
                  fontFamily: 'inherit'
                }}
                onMouseEnter={(e) => {
                  if ((newPostContent.trim() || photoFile) && !isPosting) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(30, 58, 138, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  if ((newPostContent.trim() || photoFile) && !isPosting) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(30, 58, 138, 0.3)';
                  }
                }}
              >
                {isPosting ? (
                  <>
                    <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                    {uploading ? 'Uploading...' : 'Posting...'}
                  </>
                ) : (
                  <>
                    Post
                    <Send size={14} />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* FEED */}
        {posts.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {posts.map((post) => (
              <FeedCard
                key={post.id}
                post={post}
                isConnected={connectedUserIds.has(post.profiles.id)}
                onConnect={(mode) => {
                  if (mode === "message") {
                    router.push(`/chat?open=${post.profiles.id}`);
                    return;
                  }
                  setTargetUserId(post.profiles.id);
                  
                  // Check slots immediately
                  if (slotsLeft <= 0) {
                    setShowPaywall(true);
                    setPaywallMode("connect");
                  } else {
                    handleConnect();
                  }
                }}
                onSocialUnlock={() => setShowGoldUpsell(true)}
                onComment={async () => {
                  const content = prompt("Write a private note (199 coins):");
                  if (content) {
                    await handleComment(post.id, content);
                  }
                }}
              />
            ))}
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '80px 20px',
            color: '#94a3b8',
            fontSize: '15px'
          }}>
            No activity yet.
          </div>
        )}
      </div>

      {/* MODALS */}
      <SlotPaywall
        isOpen={showPaywall}
        mode={paywallMode}
        onClose={() => setShowPaywall(false)}
        onAction={handleConnect}
      />

      <GoldUpsell
        isOpen={showGoldUpsell}
        onClose={() => setShowGoldUpsell(false)}
      />

      {/* Spin animation */}
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </main>
  );
}