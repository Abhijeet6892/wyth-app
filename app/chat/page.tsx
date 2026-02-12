"use client";

import { useEffect, useState, Suspense } from "react";
import { supabase } from "@/utils/supabase/client";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Send,
  MoreVertical,
  Phone,
  ShieldAlert,
  Contact,
  Ban,
  User,
  Lock,
  Loader2,
  UserMinus,
  Sparkles,
  X,
  CheckCircle2,
  MessageCircle,
} from "lucide-react";
// Ensure this path matches your file structure
import { generateChatHelp, type ChatIntent, type ChatTone } from "../actions/generateChatHelp";

function ChatContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const autoOpenId = searchParams.get("open");

  // --- STATE ---
  const [connections, setConnections] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [user, setUser] = useState<any>(null);
  const [userIsGold, setUserIsGold] = useState(false);

  // UI States
  const [showContactModal, setShowContactModal] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [sendingCard, setSendingCard] = useState(false);
  const [loading, setLoading] = useState(true);

  // AI States
  const [showAiMenu, setShowAiMenu] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiTone, setAiTone] = useState<ChatTone>("Chill");

  // --- 1. LOAD DATA ---
  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        // Check Gold Status
        const { data: profile } = await supabase
          .from("profiles")
          .select("is_gold")
          .eq("id", user.id)
          .single();
        setUserIsGold(profile?.is_gold || false);

        // Fetch Connections
        const { data } = await supabase
          .from("connections")
          .select(`*, profiles:receiver_id (id, full_name, is_gold, profile_signals, city, intent)`)
          .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`)
          .eq("status", "accepted"); // Only show accepted connections

        setConnections(data || []);
      }
      setLoading(false);
    };
    loadData();
  }, []);

  // --- 1.5 AUTO-OPEN ---
  useEffect(() => {
    if (autoOpenId && connections.length > 0 && !activeChat) {
      const targetChat = connections.find((c) => c.profiles.id === autoOpenId);
      if (targetChat) setActiveChat(targetChat);
    }
  }, [connections, autoOpenId, activeChat]);

  // --- 2. LOAD MESSAGES & SUBSCRIBE ---
  useEffect(() => {
    if (!activeChat || !user) return;

    const fetchMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .or(`sender_id.eq.${activeChat.profiles.id},receiver_id.eq.${activeChat.profiles.id}`)
        .order("created_at", { ascending: true });

      setMessages(data || []);
    };
    fetchMessages();

    // Realtime Subscription
    const channel = supabase
      .channel("chat")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          // Only add if it belongs to this chat
          if (
            payload.new.sender_id === activeChat.profiles.id ||
            payload.new.receiver_id === activeChat.profiles.id
          ) {
            setMessages((prev) => [...prev, payload.new]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeChat, user]);

  // --- SAFETY LOGIC ---
  const myMessageCount = messages.filter((m) => m.sender_id === user?.id).length;
  const hasSharedContact = messages.some(
    (m) => m.sender_id === user?.id && m.content === "Verified Contact Card 📇"
  );
  // Rule: Gold users bypass limits. Free users capped at 10 unless they share contact.
  const isLimitReached = !userIsGold && !hasSharedContact && myMessageCount >= 10;

  // --- AI LOGIC ---
  const handleAiAssist = async (intent: ChatIntent) => {
    if (!activeChat) return;
    setAiLoading(true);

    const lastMsg = messages.length > 0 ? messages[messages.length - 1].content : "";
    const context = `${activeChat.profiles.city || ""} • ${activeChat.profiles.intent || ""}`;

    try {
      const suggestion = await generateChatHelp(
        intent,
        activeChat.profiles.full_name,
        context,
        lastMsg,
        aiTone
      );
      setNewMessage(suggestion);
      setShowAiMenu(false);
    } catch (e) {
      alert("AI Assistant is taking a break. Try typing manually.");
    } finally {
      setAiLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || !activeChat) return;

    if (isLimitReached) {
      setShowLimitModal(true);
      return;
    }

    // Safety Regex: Detect phone numbers
    const phoneRegex = /\b[\d\s-]{10,}\b/;
    if (phoneRegex.test(newMessage)) {
      setShowContactModal(true);
      return;
    }

    const { error } = await supabase.from("messages").insert({
      sender_id: user.id,
      receiver_id: activeChat.profiles.id,
      content: newMessage,
    });
    if (!error) setNewMessage("");
  };

  // --- ACTIONS ---
  const handleDisconnect = async () => {
    if (!confirm(`End connection with ${activeChat.profiles.full_name}?`)) return;
    const { error } = await supabase.rpc("disconnect_user", { target_id: activeChat.profiles.id });
    if (!error) {
      setConnections((prev) => prev.filter((c) => c.id !== activeChat.id));
      setActiveChat(null);
      router.push("/chat");
    }
  };

  const handleBlock = async () => {
    if (!confirm(`Block ${activeChat.profiles.full_name}?`)) return;
    const { error } = await supabase.rpc("block_user", { target_id: activeChat.profiles.id });
    if (!error) {
      setConnections((prev) => prev.filter((c) => c.id !== activeChat.id));
      setActiveChat(null);
      router.push("/chat");
    }
  };

  const sendSecureContact = async () => {
    setSendingCard(true);
    // Assuming RPC handles coin deduction
    const { data, error } = await supabase.rpc("share_contact", { target_user_id: activeChat.profiles.id });
    if (data === "success_shared" || !error) {
      // Manually insert the message for UI update
      await supabase.from("messages").insert({
          sender_id: user.id,
          receiver_id: activeChat.profiles.id,
          content: "Verified Contact Card 📇"
      });
      setShowContactModal(false);
      setShowLimitModal(false);
      setNewMessage("");
    } else {
      alert("Insufficient Coins or Error!");
    }
    setSendingCard(false);
  };

  const getSignalsText = () => {
    if (!activeChat?.profiles?.profile_signals) return null;
    const s = activeChat.profiles.profile_signals;
    const parts = [];
    if (s.incomeSignal) parts.push(`₹${s.incomeSignal.min}-${s.incomeSignal.max}L`);
    if (s.familyTypeSignal) parts.push(s.familyTypeSignal);
    return parts.length > 0 ? parts.join(" • ") : null;
  };
  const deepDataText = getSignalsText();

  // --- RENDER ---
  return (
    <div className="min-h-screen bg-brand-bg flex flex-col relative">
      
      {/* 1. HEADER (Glassmorphism) */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          {activeChat ? (
            <button onClick={() => setActiveChat(null)} className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors">
              <ArrowLeft size={20} className="text-slate-600" />
            </button>
          ) : (
             // Spacer for alignment if needed, or just standard title
             <div className="w-2"></div>
          )}
          
          {activeChat ? (
            <div>
              <h2 className="font-display font-bold text-slate-900 leading-tight">
                {activeChat.profiles.full_name}
              </h2>
              <div className="flex flex-col">
                <p className="text-[10px] text-emerald-500 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> Online
                </p>
                {deepDataText && (
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                    {deepDataText}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <h1 className="font-display font-bold text-xl text-brand-blue">Messages</h1>
          )}
        </div>

        {activeChat && (
          <div className="flex gap-2 text-slate-400 relative">
            <button className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <Phone size={20} />
            </button>
            <button
              onClick={() => setShowOptionsMenu(!showOptionsMenu)}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <MoreVertical size={20} />
            </button>

            {showOptionsMenu && (
              <div className="absolute top-12 right-0 bg-white border border-slate-100 shadow-xl rounded-xl w-52 py-2 z-50 animate-in fade-in zoom-in-95">
                <Link
                  href={`/profile/${activeChat.profiles.full_name}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 text-sm text-slate-700 font-medium"
                >
                  <User size={16} /> View Profile
                </Link>
                <div className="h-px bg-slate-100 my-1"></div>
                <button
                  onClick={handleDisconnect}
                  className="flex w-full items-center gap-3 px-4 py-3 hover:bg-slate-50 text-sm text-slate-700 font-medium"
                >
                  <UserMinus size={16} /> End Connection
                </button>
                <button
                  onClick={handleBlock}
                  className="flex w-full items-center gap-3 px-4 py-3 hover:bg-red-50 text-sm text-red-600 font-bold"
                >
                  <Ban size={16} /> Block User
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. BODY (Scrollable) */}
      <div className={`flex-1 overflow-y-auto p-4 bg-brand-bg ${!activeChat ? "pb-32" : ""}`} onClick={() => setShowOptionsMenu(false)}>
        {!activeChat ? (
          // --- CONVERSATION LIST ---
          <div className="space-y-3">
            {connections.length === 0 && !loading && (
              <div className="text-center py-20 text-slate-400 flex flex-col items-center">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                     <MessageCircle className="text-slate-300" size={24}/>
                  </div>
                  No connections yet. Go to Feed!
              </div>
            )}
            
            {loading && <div className="text-center py-10"><Loader2 className="animate-spin text-brand-blue mx-auto"/></div>}

            {connections.map((c) => (
              <div
                key={c.id}
                onClick={() => setActiveChat(c)}
                className="p-4 rounded-2xl flex items-center gap-4 bg-white shadow-sm border border-slate-100 cursor-pointer active:scale-[0.98] transition-transform"
              >
                <div className="w-14 h-14 rounded-full bg-slate-100 p-[2px]">
                   <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${c.profiles.full_name}`}
                    className="w-full h-full rounded-full object-cover bg-white"
                    alt="avatar"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                      <h3 className="font-bold text-slate-900 text-base">{c.profiles.full_name}</h3>
                      {c.profiles.is_gold && <span className="bg-brand-gold/10 text-brand-gold text-[10px] font-bold px-1.5 py-0.5 rounded border border-brand-gold/20">GOLD</span>}
                  </div>
                  <p className="text-sm text-slate-500 line-clamp-1 mt-0.5">
                    Tap to start chatting...
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // --- ACTIVE CHAT MESSAGES ---
          <div className="space-y-4 pb-24">
            {messages.map((m) => {
                const isMe = m.sender_id === user?.id;
                return (
                    <div
                        key={m.id}
                        className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                    >
                        <div
                        className={`max-w-[75%] px-5 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                            isMe
                            ? "bg-brand-blue text-white rounded-tr-none"
                            : "bg-white border border-slate-100 text-slate-700 rounded-tl-none"
                        }`}
                        >
                        {m.content}
                        </div>
                    </div>
                )
            })}
            
            {/* Limit Warning */}
            {isLimitReached && (
              <div className="flex justify-center my-6">
                <span className="text-xs font-bold text-rose-600 bg-rose-50 px-4 py-2 rounded-full border border-rose-100 flex items-center gap-2 shadow-sm">
                   <Lock size={12} /> Limit Reached (10/10)
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. INPUT AREA (Only when Chat is Active) */}
      {/* CRITICAL FIX: 
          We use `fixed bottom-0` with a high z-index (60) to ensure this sits 
          ON TOP of the BottomNav dock (which is z-50).
          This prevents the input from being hidden.
      */}
      {activeChat && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-200 p-3 z-[60] pb-6 sm:pb-3">
          
          {/* AI Menu */}
          {showAiMenu && (
            <div className="absolute bottom-full left-4 mb-3 bg-white border border-slate-200 shadow-2xl rounded-2xl p-3 flex flex-col gap-2 w-64 animate-in slide-in-from-bottom-2 z-20">
              <div className="flex justify-between items-center pb-2 border-b border-slate-50">
                <span className="text-[10px] font-bold text-brand-blue uppercase flex gap-1 items-center tracking-wider">
                  <Sparkles size={12} className="text-brand-gold" /> AI Assistant
                </span>
                <button onClick={() => setShowAiMenu(false)}>
                  <X size={14} className="text-slate-400" />
                </button>
              </div>

              {/* Tone Selector */}
              <div className="flex bg-slate-100 rounded-lg p-1 gap-1">
                {["Chill", "Witty", "Romantic"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setAiTone(t as ChatTone)}
                    className={`flex-1 text-[10px] font-bold py-1.5 rounded-md transition-all ${
                      aiTone === t
                        ? "bg-white text-brand-blue shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Suggestions */}
              <div className="flex flex-col gap-1 mt-1">
                <button
                  onClick={() => handleAiAssist("icebreaker")}
                  disabled={aiLoading}
                  className="text-left px-3 py-2.5 hover:bg-blue-50 rounded-xl text-xs font-medium text-slate-700 flex items-center gap-2 transition-colors"
                >
                  🧊 Icebreaker
                </button>
                <button
                  onClick={() => handleAiAssist("reply")}
                  disabled={aiLoading}
                  className="text-left px-3 py-2.5 hover:bg-blue-50 rounded-xl text-xs font-medium text-slate-700 flex items-center gap-2 transition-colors"
                >
                  ↩️ Polite Reply
                </button>
                <button
                  onClick={() => handleAiAssist("decline")}
                  disabled={aiLoading}
                  className="text-left px-3 py-2.5 hover:bg-rose-50 rounded-xl text-xs font-medium text-rose-600 flex items-center gap-2 transition-colors"
                >
                  🚫 Say No Nicely
                </button>
              </div>
            </div>
          )}

          <div className="flex gap-2 items-center max-w-md mx-auto">
            {/* AI Toggle */}
            <button
              onClick={() => setShowAiMenu(!showAiMenu)}
              className="w-11 h-11 rounded-full flex items-center justify-center text-brand-blue bg-blue-50 hover:bg-blue-100 transition shadow-sm border border-blue-100"
            >
              {aiLoading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Sparkles size={20} className={showAiMenu ? "fill-brand-gold text-brand-gold" : ""} />
              )}
            </button>

            <input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={
                isLimitReached ? "Unlock to continue..." : "Type a message..."
              }
              disabled={isLimitReached}
              className="flex-1 bg-slate-100/80 hover:bg-slate-100 focus:bg-white border border-transparent focus:border-brand-blue/30 rounded-full px-5 py-3 text-sm outline-none transition-all placeholder:text-slate-400"
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            
            <button
              onClick={
                isLimitReached ? () => setShowLimitModal(true) : sendMessage
              }
              className={`w-11 h-11 rounded-full flex items-center justify-center text-white shadow-lg transition active:scale-95 ${
                isLimitReached ? "bg-amber-500 shadow-amber-500/20" : "bg-brand-blue shadow-blue-900/20"
              }`}
            >
              {isLimitReached ? <Lock size={18} /> : <Send size={20} className="ml-0.5" />}
            </button>
          </div>
        </div>
      )}

      {/* --- MODALS --- */}
      {showContactModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl text-center animate-in zoom-in-95">
            <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
               <ShieldAlert className="w-8 h-8 text-amber-500" />
            </div>
            <h2 className="text-xl font-display font-bold text-slate-900 mb-2">
              Wait! Is that a number?
            </h2>
            <p className="text-sm text-slate-500 mb-6">
                To keep our community safe, phone numbers can only be shared via the Secure Card.
            </p>
            <div className="space-y-3">
              <button
                onClick={sendSecureContact}
                disabled={sendingCard}
                className="w-full bg-brand-blue text-white font-bold py-4 rounded-xl flex justify-center items-center gap-2 shadow-xl shadow-blue-900/10 active:scale-95 transition-all"
              >
                {sendingCard ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <>
                    <Contact size={18} /> Share Card (199 Coins)
                  </>
                )}
              </button>
              <button
                onClick={() => setShowContactModal(false)}
                className="w-full text-slate-500 font-medium py-2 hover:text-slate-800 transition-colors"
              >
                Edit Message
              </button>
            </div>
          </div>
        </div>
      )}

      {showLimitModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl text-center animate-in zoom-in-95">
            <div className="w-16 h-16 bg-brand-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
               <CheckCircle2 className="w-8 h-8 text-brand-blue" />
            </div>
            <h2 className="text-xl font-display font-bold text-slate-900 mb-2">
              Vibe Check Complete
            </h2>
            <p className="text-sm text-slate-500 mb-6 px-4">
                You've exchanged 10 messages! To continue this connection, please verify it's real.
            </p>
            <button
              onClick={sendSecureContact}
              className="w-full bg-brand-blue text-white font-bold py-4 rounded-xl mb-3 shadow-xl shadow-blue-900/10 active:scale-95 transition-all"
            >
              Share Contact (199 Coins)
            </button>
            <button
              onClick={() => setShowLimitModal(false)}
              className="w-full text-slate-500 font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-full flex items-center justify-center bg-brand-bg">
          <Loader2 className="animate-spin text-brand-blue" />
        </div>
      }
    >
      <ChatContent />
    </Suspense>
  );
}