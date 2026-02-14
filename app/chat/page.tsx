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
import { generateChatHelp, type ChatIntent, type ChatMode, type ChatTone } from "../actions/generateChatHelp";

function ChatContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const autoOpenId = searchParams.get("open");

  // --- STATE (UNCHANGED) ---
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
  const [aiTone, setAiTone] = useState<ChatTone>("Grounded");

  // --- 1. LOAD DATA (UNCHANGED) ---
  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("is_gold")
          .eq("id", user.id)
          .single();
        setUserIsGold(profile?.is_gold || false);

        const { data } = await supabase
  .from("connections")
  .select(`*, profiles:receiver_id (id, full_name, avatar_url, is_gold, profile_signals, city, intent)`)
  //                                                    ✅ Added avatar_url
  .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`)
  .eq("status", "accepted");

        setConnections(data || []);
      }
      setLoading(false);
    };
    loadData();
  }, []);

  // --- 1.5 AUTO-OPEN (UNCHANGED) ---
  useEffect(() => {
    if (autoOpenId && connections.length > 0 && !activeChat) {
      const targetChat = connections.find((c) => c.profiles.id === autoOpenId);
      if (targetChat) setActiveChat(targetChat);
    }
  }, [connections, autoOpenId, activeChat]);

  // --- 2. LOAD MESSAGES & SUBSCRIBE (UNCHANGED) ---
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

    const channel = supabase
      .channel("chat")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
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

  // --- SAFETY LOGIC (UNCHANGED) ---
  const myMessageCount = messages.filter((m) => m.sender_id === user?.id).length;
  const hasSharedContact = messages.some(
    (m) => m.sender_id === user?.id && m.content === "Verified Contact Card 📇"
  );
  const isLimitReached = !userIsGold && !hasSharedContact && myMessageCount >= 10;

  // --- AI LOGIC (UNCHANGED) ---
  const handleAiAssist = async (intent: ChatIntent) => {
    if (!activeChat) return;
    setAiLoading(true);
  
    const lastMsg = messages.length > 0 ? messages[messages.length - 1].content : "";
    
    // Map intent to mode
    const intentToMode: Record<ChatIntent, ChatMode> = {
      icebreaker: "start_connection",
      reply: "deepen_connection",
      decline: "end_connection",
    };
    
    // Build partner profile object
    const partnerProfile = {
      name: activeChat.profiles.full_name,
      city: activeChat.profiles.city,
      lastMessage: lastMsg,
    };
  
    try {
      const { primary } = await generateChatHelp(
        intentToMode[intent],  // ✅ Correct: ChatMode
        partnerProfile,        // ✅ Correct: object
        aiTone                 // ✅ Correct: ChatTone
      );
      setNewMessage(primary);  // ✅ Correct: extract primary from result
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

  // --- ACTIONS (UNCHANGED) ---
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
    const { data, error } = await supabase.rpc("share_contact", { target_user_id: activeChat.profiles.id });
    if (data === "success_shared" || !error) {
      setShowContactModal(false);
      setShowLimitModal(false);
      alert("Contact card shared! 📇");
    } else {
      alert(error?.message || "Not enough coins.");
    }
    setSendingCard(false);
  };

  // --- LOADING STATE ---
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

  // --- UI (REFINED GLASSMORPHISM) ---
  return (
    <div style={{
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

      {/* HEADER */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        background: 'rgba(255, 255, 255, 0.75)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.5)',
        boxShadow: '0 4px 16px rgba(31, 41, 55, 0.08)',
        padding: '16px 20px'
      }}>
        {activeChat ? (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={() => setActiveChat(null)}
                style={{
                  padding: '8px',
                  borderRadius: '12px',
                  background: 'transparent',
                  border: 'none',
                  color: '#1E3A8A',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(30, 58, 138, 0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <ArrowLeft size={20} />
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: activeChat.profiles.is_gold 
                    ? 'linear-gradient(135deg, #fde68a 0%, #fbbf24 100%)' 
                    : '#f1f5f9',
                  padding: '2px'
                }}>
                  <div style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    background: 'white',
                    border: '2px solid white'
                  }}>
                    <img
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${activeChat.profiles.full_name}`}
                      alt="avatar"
                      style={{ width: '100%', height: '100%' }}
                    />
                  </div>
                </div>
                <div>
                  <div style={{ fontWeight: '700', color: '#1e3a8a', fontSize: '15px' }}>
                    {activeChat.profiles.full_name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                    {activeChat.profiles.city}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                style={{
                  padding: '8px',
                  borderRadius: '12px',
                  background: 'transparent',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(100, 116, 139, 0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <MoreVertical size={20} />
              </button>

              {showOptionsMenu && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '8px',
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.5)',
                  borderRadius: '16px',
                  boxShadow: '0 8px 32px rgba(31, 41, 55, 0.15)',
                  padding: '8px',
                  minWidth: '200px',
                  zIndex: 50
                }}>
                  <button
                    onClick={() => {
                      router.push(`/profile/${activeChat.profiles.full_name}`);
                      setShowOptionsMenu(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'transparent',
                      border: 'none',
                      borderRadius: '12px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      color: '#1e3a8a',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(30, 58, 138, 0.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <User size={16} /> View Profile
                  </button>
                  <button
                    onClick={sendSecureContact}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'transparent',
                      border: 'none',
                      borderRadius: '12px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      color: '#1e3a8a',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(30, 58, 138, 0.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <Phone size={16} /> Share Contact
                  </button>
                  <div style={{ height: '1px', background: '#e2e8f0', margin: '8px 0' }} />
                  <button
                    onClick={() => {
                      handleDisconnect();
                      setShowOptionsMenu(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'transparent',
                      border: 'none',
                      borderRadius: '12px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      color: '#64748b',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(100, 116, 139, 0.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <UserMinus size={16} /> Disconnect
                  </button>
                  <button
                    onClick={() => {
                      handleBlock();
                      setShowOptionsMenu(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'transparent',
                      border: 'none',
                      borderRadius: '12px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      color: '#ef4444',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <Ban size={16} /> Block
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#1E3A8A', textAlign: 'center' }}>
            Messages
          </h1>
        )}
      </header>

      <div style={{ 
        display: 'flex', 
        height: 'calc(100vh - 160px)',
        position: 'relative',
        zIndex: 10
      }}>
        {/* SIDEBAR - Connections List */}
        <div style={{
          width: activeChat ? '0' : '100%',
          maxWidth: '400px',
          overflow: 'hidden',
          transition: 'width 0.3s ease',
          padding: activeChat ? '0' : '20px',
          margin: '0 auto'
        }}>
          {!activeChat && connections.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '80px 20px',
              background: 'rgba(255, 255, 255, 0.75)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.5)',
              borderRadius: '24px',
              boxShadow: '0 8px 32px rgba(31, 41, 55, 0.1)'
            }}>
              <MessageCircle size={48} style={{ color: '#cbd5e1', margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1e3a8a', marginBottom: '8px' }}>
                No Connections Yet
              </h3>
              <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '20px' }}>
                Start connecting with people on the feed
              </p>
              <Link
                href="/"
                style={{
                  display: 'inline-block',
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
                  color: 'white',
                  borderRadius: '12px',
                  fontWeight: '700',
                  fontSize: '14px',
                  textDecoration: 'none',
                  boxShadow: '0 4px 16px rgba(30, 58, 138, 0.3)',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(30, 58, 138, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(30, 58, 138, 0.3)';
                }}
              >
                Explore Feed
              </Link>
            </div>
          )}

          {!activeChat && connections.map((conn) => (
            <div
              key={conn.id}
              onClick={() => setActiveChat(conn)}
              style={{
                background: 'rgba(255, 255, 255, 0.75)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.5)',
                borderRadius: '20px',
                boxShadow: '0 4px 16px rgba(31, 41, 55, 0.08)',
                padding: '16px',
                marginBottom: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(31, 41, 55, 0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(31, 41, 55, 0.08)';
              }}
            >
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: conn.profiles.is_gold 
                  ? 'linear-gradient(135deg, #fde68a 0%, #fbbf24 100%)' 
                  : '#f1f5f9',
                padding: '2px'
              }}>
                <div style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  background: 'white',
                  border: '2px solid white'
                }}>
                  <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${conn.profiles.full_name}`}
                    alt="avatar"
                    style={{ width: '100%', height: '100%' }}
                  />
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '700', color: '#1e3a8a', fontSize: '15px', marginBottom: '2px' }}>
                  {conn.profiles.full_name}
                </div>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                  {conn.profiles.city} • {conn.profiles.intent}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* MESSAGES AREA */}
        {activeChat && (
          <div style={{
            flex: 1,
            padding: '20px',
            overflowY: 'auto',
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            {messages.map((m, idx) => {
              const isMe = m.sender_id === user?.id;
              const isContactCard = m.content === "Verified Contact Card 📇";

              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    justifyContent: isMe ? 'flex-end' : 'flex-start',
                    marginBottom: '12px'
                  }}
                >
                  <div
                    style={{
                      maxWidth: '70%',
                      padding: '12px 16px',
                      borderRadius: '16px',
                      fontSize: '14px',
                      background: isMe 
                        ? 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)'
                        : 'rgba(255, 255, 255, 0.9)',
                      color: isMe ? 'white' : '#1e293b',
                      backdropFilter: isMe ? 'none' : 'blur(10px)',
                      WebkitBackdropFilter: isMe ? 'none' : 'blur(10px)',
                      border: isMe ? 'none' : '1px solid rgba(226, 232, 240, 0.5)',
                      boxShadow: isMe 
                        ? '0 4px 12px rgba(30, 58, 138, 0.2)'
                        : '0 2px 8px rgba(31, 41, 55, 0.05)',
                      borderTopRightRadius: isMe ? '4px' : '16px',
                      borderTopLeftRadius: isMe ? '16px' : '4px',
                      fontWeight: isContactCard ? '700' : '400'
                    }}
                  >
                    {m.content}
                  </div>
                </div>
              );
            })}

            {isLimitReached && (
              <div style={{ display: 'flex', justifyContent: 'center', margin: '24px 0' }}>
                <span style={{
                  fontSize: '12px',
                  fontWeight: '700',
                  color: '#ef4444',
                  background: '#fef2f2',
                  padding: '8px 16px',
                  borderRadius: '12px',
                  border: '1px solid #fecaca',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 2px 8px rgba(239, 68, 68, 0.1)'
                }}>
                  <Lock size={12} /> Limit Reached (10/10)
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* INPUT AREA - GLASSMORPHISM */}
      {activeChat && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'rgba(255, 255, 255, 0.75)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(255, 255, 255, 0.5)',
          boxShadow: '0 -4px 16px rgba(31, 41, 55, 0.08)',
          padding: '12px',
          zIndex: 60,
          paddingBottom: '24px'
        }}>
          
          {/* AI Menu - REFINED */}
          {showAiMenu && (
            <div style={{
              position: 'absolute',
              bottom: '100%',
              left: '16px',
              marginBottom: '12px',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.5)',
              boxShadow: '0 8px 32px rgba(31, 41, 55, 0.15)',
              borderRadius: '20px',
              padding: '16px',
              width: '280px',
              zIndex: 20
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingBottom: '12px',
                borderBottom: '1px solid #f1f5f9',
                marginBottom: '12px'
              }}>
                <span style={{
                  fontSize: '10px',
                  fontWeight: '700',
                  color: '#1E3A8A',
                  textTransform: 'uppercase',
                  display: 'flex',
                  gap: '4px',
                  alignItems: 'center',
                  letterSpacing: '0.5px'
                }}>
                  <Sparkles size={12} style={{ color: '#D4AF37' }} /> AI Assistant
                </span>
                <button
                  onClick={() => setShowAiMenu(false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#94a3b8',
                    padding: '4px',
                    display: 'flex'
                  }}
                >
                  <X size={14} />
                </button>
              </div>

              {/* Tone Selector */}
              <div style={{
                display: 'flex',
                background: '#f1f5f9',
                borderRadius: '12px',
                padding: '4px',
                gap: '4px',
                marginBottom: '12px'
              }}>
                {(["Grounded", "Thoughtful", "Warm"] as ChatTone[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setAiTone(t)}
                    style={{
                      flex: 1,
                      fontSize: '10px',
                      fontWeight: '700',
                      padding: '6px 0',
                      borderRadius: '8px',
                      transition: 'all 0.2s',
                      background: aiTone === t ? 'white' : 'transparent',
                      color: aiTone === t ? '#1E3A8A' : '#64748b',
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: aiTone === t ? '0 2px 4px rgba(30, 58, 138, 0.1)' : 'none'
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Suggestions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <button
                  onClick={() => handleAiAssist("icebreaker")}
                  disabled={aiLoading}
                  style={{
                    textAlign: 'left',
                    padding: '12px',
                    background: 'transparent',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '500',
                    color: '#1e293b',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#dbeafe'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  🧊 Icebreaker
                </button>
                <button
                  onClick={() => handleAiAssist("reply")}
                  disabled={aiLoading}
                  style={{
                    textAlign: 'left',
                    padding: '12px',
                    background: 'transparent',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '500',
                    color: '#1e293b',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#dbeafe'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  ↩️ Polite Reply
                </button>
                <button
                  onClick={() => handleAiAssist("decline")}
                  disabled={aiLoading}
                  style={{
                    textAlign: 'left',
                    padding: '12px',
                    background: 'transparent',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '500',
                    color: '#ef4444',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#fee2e2'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  🚫 Say No Nicely
                </button>
              </div>
            </div>
          )}

          <div style={{
            display: 'flex',
            gap: '8px',
            alignItems: 'center',
            maxWidth: '640px',
            margin: '0 auto'
          }}>
            {/* AI Toggle */}
            <button
              onClick={() => setShowAiMenu(!showAiMenu)}
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#1E3A8A',
                background: '#dbeafe',
                border: '1px solid rgba(30, 58, 138, 0.2)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 2px 8px rgba(30, 58, 138, 0.1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#bfdbfe';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#dbeafe';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              {aiLoading ? (
                <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
              ) : (
                <Sparkles size={20} style={{ fill: showAiMenu ? '#D4AF37' : 'transparent', color: showAiMenu ? '#D4AF37' : '#1E3A8A' }} />
              )}
            </button>

            <input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={isLimitReached ? "Unlock to continue..." : "Type a message..."}
              disabled={isLimitReached}
              style={{
                flex: 1,
                background: 'rgba(248, 250, 252, 0.8)',
                border: '1.5px solid rgba(226, 232, 240, 0.5)',
                borderRadius: '24px',
                padding: '12px 20px',
                fontSize: '14px',
                outline: 'none',
                transition: 'all 0.2s',
                color: '#1e3a8a',
                fontFamily: 'inherit'
              }}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              onFocus={(e) => {
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.borderColor = 'rgba(30, 58, 138, 0.3)';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(30, 58, 138, 0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.background = 'rgba(248, 250, 252, 0.8)';
                e.currentTarget.style.borderColor = 'rgba(226, 232, 240, 0.5)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
            
            <button
              onClick={isLimitReached ? () => setShowLimitModal(true) : sendMessage}
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                background: isLimitReached 
                  ? '#f59e0b' 
                  : 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
                border: 'none',
                cursor: 'pointer',
                boxShadow: isLimitReached 
                  ? '0 4px 12px rgba(245, 158, 11, 0.3)' 
                  : '0 4px 12px rgba(30, 58, 138, 0.3)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = isLimitReached 
                  ? '0 6px 16px rgba(245, 158, 11, 0.4)' 
                  : '0 6px 16px rgba(30, 58, 138, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = isLimitReached 
                  ? '0 4px 12px rgba(245, 158, 11, 0.3)' 
                  : '0 4px 12px rgba(30, 58, 138, 0.3)';
              }}
            >
              {isLimitReached ? <Lock size={18} /> : <Send size={20} style={{ marginLeft: '2px' }} />}
            </button>
          </div>
        </div>
      )}

      {/* MODALS - REFINED GLASSMORPHISM */}
      {showContactModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 70,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          padding: '16px'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            width: '100%',
            maxWidth: '400px',
            borderRadius: '24px',
            padding: '32px 24px',
            boxShadow: '0 20px 60px rgba(31, 41, 55, 0.3)',
            textAlign: 'center'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              background: '#fef3c7',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <ShieldAlert style={{ width: '32px', height: '32px', color: '#f59e0b' }} />
            </div>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '700',
              color: '#1e3a8a',
              marginBottom: '8px',
              fontFamily: 'Georgia, serif'
            }}>
              Wait! Is that a number?
            </h2>
            <p style={{
              fontSize: '14px',
              color: '#64748b',
              marginBottom: '24px',
              lineHeight: '1.5'
            }}>
              To keep our community safe, phone numbers can only be shared via the Secure Card.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                onClick={sendSecureContact}
                disabled={sendingCard}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
                  color: 'white',
                  fontWeight: '700',
                  padding: '16px',
                  borderRadius: '12px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 16px rgba(30, 58, 138, 0.3)',
                  border: 'none',
                  cursor: sendingCard ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  opacity: sendingCard ? 0.6 : 1,
                  fontFamily: 'inherit'
                }}
              >
                {sendingCard ? (
                  <Loader2 style={{ animation: 'spin 1s linear infinite' }} />
                ) : (
                  <>
                    <Contact size={18} /> Share Card (199 Coins)
                  </>
                )}
              </button>
              <button
                onClick={() => setShowContactModal(false)}
                style={{
                  width: '100%',
                  color: '#64748b',
                  fontWeight: '500',
                  padding: '8px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'color 0.2s',
                  fontFamily: 'inherit'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#1e293b'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
              >
                Edit Message
              </button>
            </div>
          </div>
        </div>
      )}

      {showLimitModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 70,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          padding: '16px'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            width: '100%',
            maxWidth: '400px',
            borderRadius: '24px',
            padding: '32px 24px',
            boxShadow: '0 20px 60px rgba(31, 41, 55, 0.3)',
            textAlign: 'center'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              background: 'rgba(30, 58, 138, 0.1)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <CheckCircle2 style={{ width: '32px', height: '32px', color: '#1E3A8A' }} />
            </div>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '700',
              color: '#1e3a8a',
              marginBottom: '8px',
              fontFamily: 'Georgia, serif'
            }}>
              Vibe Check Complete
            </h2>
            <p style={{
              fontSize: '14px',
              color: '#64748b',
              marginBottom: '24px',
              padding: '0 16px',
              lineHeight: '1.5'
            }}>
              You've exchanged 10 messages! To continue this connection, please verify it's real.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                onClick={sendSecureContact}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
                  color: 'white',
                  fontWeight: '700',
                  padding: '16px',
                  borderRadius: '12px',
                  boxShadow: '0 4px 16px rgba(30, 58, 138, 0.3)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontFamily: 'inherit'
                }}
              >
                Share Contact (199 Coins)
              </button>
              <button
                onClick={() => setShowLimitModal(false)}
                style={{
                  width: '100%',
                  color: '#64748b',
                  fontWeight: '500',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'inherit'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Spin animation */}
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div style={{
          height: '100vh',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #E0E7FF 0%, #DBEAFE 25%, #FFFFFF 50%, #E0F2FE 75%, #DBEAFE 100%)'
        }}>
          <Loader2 style={{ color: '#1E3A8A', animation: 'spin 1s linear infinite' }} />
        </div>
      }
    >
      <ChatContent />
    </Suspense>
  );
}