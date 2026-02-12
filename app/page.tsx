"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Zap, Loader2, Send } from "lucide-react";

// --- IMPORTS ---
// 1. The Premium Feed Card you created
import FeedCard from "@/components/FeedCard"; 
// 2. The Modals you already have
import { SlotPaywall, GoldUpsell } from "@/components/InteractionModals"; 

// --- TYPES ---
// Defined here to match Supabase response structure
interface Profile {
  id: string;
  full_name: string;
  city: string;
  intent: string;
  is_gold: boolean;
  career_verified: boolean;
  brand_id?: string;
  vouches_count: number;
  slots_limit: number;
  slots_used: number;
  relationship_status?: 'single' | 'paired';
}

interface Post {
  id: string;
  type: "text" | "photo" | "achievement";
  caption?: string;
  media_url?: string;
  achievement_title?: string;
  created_at: string;
  profiles: Profile; // Joined data from Supabase
}

export default function Home() {
  const router = useRouter();

  // --- STATE ---
  const [posts, setPosts] = useState<Post[]>([]);
  const [connectedUserIds, setConnectedUserIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [slotsLeft, setSlotsLeft] = useState<number>(0);

  // Post Creation State
  const [newPostContent, setNewPostContent] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  // Modal State
  const [showPaywall, setShowPaywall] = useState(false);
  // 'message_limit' is optional in your modal, but we include it for type safety
  const [paywallMode, setPaywallMode] = useState<"connect" | "comment" | "message_limit">("connect");
  const [showGoldUpsell, setShowGoldUpsell] = useState(false);
  const [targetUserId, setTargetUserId] = useState<string | null>(null);

  // --- 1. FETCH & SORT ENGINE ---
  const fetchFeed = async (userProfile?: Profile) => {
    // Fetch posts with EXTENDED profile data
    const { data: postsData } = await supabase
      .from("posts")
      .select(`
        *, 
        profiles (
          id, full_name, city, intent, is_gold, 
          career_verified, brand_id, vouches_count, relationship_status
        )
      `)
      .order("created_at", { ascending: false })
      .limit(50);

    if (postsData) {
      if (userProfile) {
        // Smart Sort Algorithm
        // We force cast to any[] first because Supabase types can be tricky with joins
        const sorted = (postsData as any[]).sort((a, b) => {
          let scoreA = 0;
          let scoreB = 0;

          // Rule A: Geography Match (+10)
          if (a.profiles.city?.toLowerCase() === userProfile.city?.toLowerCase()) scoreA += 10;
          if (b.profiles.city?.toLowerCase() === userProfile.city?.toLowerCase()) scoreB += 10;

          // Rule B: Intent Match (+5)
          if (a.profiles.intent === userProfile.intent) scoreA += 5;
          if (b.profiles.intent === userProfile.intent) scoreB += 5;

          // Rule C: Gold Boost (+2)
          if (a.profiles.is_gold) scoreA += 2;
          if (b.profiles.is_gold) scoreB += 2;

          return scoreB - scoreA;
        });
        setPosts(sorted);
      } else {
        setPosts(postsData as any[]);
      }
    }
    setLoading(false);
  };

  // --- 2. INITIALIZATION ---
  useEffect(() => {
    const initData = async () => {
      const { data: authData } = await supabase.auth.getUser();
      const currentUser = authData?.user;

      if (!currentUser) {
        router.replace("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", currentUser.id)
        .maybeSingle();

      if (!profile || !profile.full_name) {
        router.replace("/onboarding");
        return;
      }

      setUser(currentUser);
      setSlotsLeft((profile.slots_limit || 3) - (profile.slots_used || 0));

      // Get Connections
      const { data: connections } = await supabase
        .from("connections")
        .select("receiver_id")
        .eq("requester_id", currentUser.id)
        .eq("status", "accepted");

      if (connections) {
        setConnectedUserIds(new Set(connections.map((c: any) => c.receiver_id)));
      }

      // Cast profile to match the Interface
      await fetchFeed(profile as Profile);
    };

    initData();
  }, []);

  // --- 3. HANDLERS ---
  const handleCreatePost = async () => {
    if (!newPostContent.trim() || !user) return;
    setIsPosting(true);
    const { error } = await supabase.from("posts").insert({
      user_id: user.id,
      type: "text",
      caption: newPostContent,
    });

    if (!error) {
      setNewPostContent("");
      // Refresh feed
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      fetchFeed(profile);
    } else {
      alert("Failed to post.");
    }
    setIsPosting(false);
  };

  // Logic to determine if we show Paywall or go to Chat
  const handleMainAction = (postUserId: string, mode: "connect" | "message" = "connect") => {
    // If already connected or just clicking 'message', go to chat
    if (mode === "message" || connectedUserIds.has(postUserId)) {
      router.push(`/chat?open=${postUserId}`);
      return;
    }
    // Otherwise, it's a new connection request -> Paywall
    setTargetUserId(postUserId);
    setPaywallMode("connect");
    setShowPaywall(true);
  };

  const handlePaywallAction = async () => {
    if (!user) return router.push("/login");

    if (paywallMode === "comment") {
      // Logic for paying for comment
      // const { error } = await supabase.rpc('spend_coins', { amount: 9 });
      alert("9 Coins spent! Comment unlocked (Simulated)");
      setShowPaywall(false);
    } else {
        // Logic for connecting
        if (!targetUserId) return;
        
        // Call RPC
        const { data, error } = await supabase.rpc('request_connection', { target_user_id: targetUserId });
        
        if (!error) {
            alert("Connection Request Sent!");
            setShowPaywall(false);
            // Optimistically update UI could happen here
        } else {
            // Handle specific errors from your RPC
            alert("Failed: " + (error.message || "Insufficient Slots"));
        }
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <Loader2 size={40} className="text-brand-blue animate-spin" />
      </div>
    );

  return (
    <main className="min-h-screen bg-brand-bg pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 px-5 py-3 flex justify-between items-center">
        <h1 className="text-xl font-display font-bold text-brand-blue tracking-tight">WYTH</h1>
        <div className="flex items-center gap-3">
          {user && (
            <div className="bg-rose-50 text-rose-600 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 border border-rose-100 shadow-sm">
              <Zap size={12} className="fill-rose-600" /> {slotsLeft} Slots
            </div>
          )}
        </div>
      </header>

      <div className="max-w-md mx-auto pt-6 px-4">
        {/* Create Post Input */}
        {user && (
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 mb-8">
            <textarea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder="Share your vibe..."
              className="w-full bg-slate-50 rounded-2xl p-3 text-sm focus:outline-none h-20 resize-none mb-3 border-none ring-0 placeholder:text-slate-400"
            />
            <div className="flex justify-end">
              <button
                onClick={handleCreatePost}
                disabled={!newPostContent.trim() || isPosting}
                className="bg-brand-blue text-white px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-blue-900 disabled:opacity-50 transition active:scale-95 shadow-md shadow-blue-900/10"
              >
                {isPosting ? <Loader2 size={16} className="animate-spin" /> : <>Post <Send size={14} /></>}
              </button>
            </div>
          </div>
        )}

        {/* The Feed */}
        {posts.length > 0 ? (
          posts.map((post) => (
            <FeedCard
              key={post.id}
              post={post} // Pass the full post object
              isConnected={connectedUserIds.has(post.profiles?.id)}
              // Trigger main action for this profile on connect
              onConnect={() => handleMainAction(post.profiles?.id)}
              onSocialUnlock={() => setShowGoldUpsell(true)}
              onComment={() => {
                setPaywallMode("comment");
                setShowPaywall(true);
              }}
            />
          ))
        ) : (
          <div className="text-center py-20 text-slate-400 flex flex-col items-center">
             <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Zap size={24} className="text-slate-300"/>
             </div>
             <p>No activity in your area yet.</p>
          </div>
        )}
      </div>

      {/* Modals */}
      <SlotPaywall
        isOpen={showPaywall}
        mode={paywallMode}
        onClose={() => setShowPaywall(false)}
        onAction={handlePaywallAction}
      />
      <GoldUpsell isOpen={showGoldUpsell} onClose={() => setShowGoldUpsell(false)} />
    </main>
  );
}