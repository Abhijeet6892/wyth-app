'use client'
import { useEffect, useState, Suspense } from 'react'
import { supabase } from '@/utils/supabase/client'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { 
  ArrowLeft, Send, MoreVertical, Phone, Video, ShieldAlert, 
  Contact, Ban, Flag, User, Lock, Loader2, Clock, UserMinus, Sparkles, X 
} from 'lucide-react'
import { SlotPaywall, GoldUpsell } from '@/components/InteractionModals'
import { generateChatHelp, type ChatIntent } from '../actions/generateChatHelp'

function ChatContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const autoOpenId = searchParams.get('open')

  const [connections, setConnections] = useState<any[]>([])
  const [activeChat, setActiveChat] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [user, setUser] = useState<any>(null)
  const [userIsGold, setUserIsGold] = useState(false)
  
  // UI States
  const [showContactModal, setShowContactModal] = useState(false)
  const [showLimitModal, setShowLimitModal] = useState(false)
  const [showOptionsMenu, setShowOptionsMenu] = useState(false)
  const [sendingCard, setSendingCard] = useState(false)
  const [loading, setLoading] = useState(true)
  
  // AI States
  const [showAiMenu, setShowAiMenu] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)

  // 1. Load Data
  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        const { data: profile } = await supabase.from('profiles').select('is_gold').eq('id', user.id).single()
        setUserIsGold(profile?.is_gold || false)

        const { data } = await supabase
          .from('connections')
          .select(`*, profiles:receiver_id (id, full_name, is_gold, profile_signals, city, intent)`)
          .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`)
        
        setConnections(data || [])
      }
      setLoading(false)
    }
    loadData()
  }, [])

  // 1.5 Auto-Open
  useEffect(() => {
    if (autoOpenId && connections.length > 0 && !activeChat) {
        const targetChat = connections.find(c => c.profiles.id === autoOpenId)
        if (targetChat && targetChat.status === 'accepted') setActiveChat(targetChat)
    }
  }, [connections, autoOpenId, activeChat])

  // 2. Load Messages
  useEffect(() => {
    if (!activeChat || !user) return

    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .or(`sender_id.eq.${activeChat.profiles.id},receiver_id.eq.${activeChat.profiles.id}`)
        .order('created_at', { ascending: true })
      
      setMessages(data || [])
    }
    fetchMessages()
    
    const channel = supabase.channel('chat').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
        setMessages(prev => [...prev, payload.new])
    }).subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [activeChat, user])

  const myMessageCount = messages.filter(m => m.sender_id === user?.id).length
  const hasSharedContact = messages.some(m => m.sender_id === user?.id && m.content === 'Verified Contact Card 📇')
  const isLimitReached = !userIsGold && !hasSharedContact && myMessageCount >= 10

  // --- AI LOGIC ---
  const handleAiAssist = async (intent: ChatIntent) => {
      if (!activeChat) return
      setAiLoading(true)
      
      const lastMsg = messages.length > 0 ? messages[messages.length - 1].content : ""
      const context = `${activeChat.profiles.city || ''} • ${activeChat.profiles.intent || ''}`
      
      try {
          const suggestion = await generateChatHelp(
              intent, 
              activeChat.profiles.full_name, 
              context, 
              lastMsg
          )
          setNewMessage(suggestion)
          setShowAiMenu(false)
      } catch (e) {
          alert("AI Assistant is taking a break. Try typing manually.")
      } finally {
          setAiLoading(false)
      }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || !activeChat) return

    if (isLimitReached) {
        setShowLimitModal(true)
        return
    }

    const phoneRegex = /\b[\d\s-]{10,}\b/
    if (phoneRegex.test(newMessage)) {
        setShowContactModal(true)
        return
    }

    // Append AI Disclosure if using AI (Simple check if message matches what we generated, or just always append if we want strictness. 
    // For MVP, we let user send what is in the box.)
    
    const { error } = await supabase.from('messages').insert({
      sender_id: user.id,
      receiver_id: activeChat.profiles.id,
      content: newMessage
    })
    if (!error) setNewMessage('')
  }

  // --- ACTIONS ---
  const handleDisconnect = async () => {
      if(!confirm(`End connection with ${activeChat.profiles.full_name}?`)) return;
      const { error } = await supabase.rpc('disconnect_user', { target_id: activeChat.profiles.id })
      if (!error) {
          setConnections(prev => prev.filter(c => c.id !== activeChat.id))
          setActiveChat(null)
          router.push('/chat')
      }
  }

  const handleBlock = async () => {
      if(!confirm(`Block ${activeChat.profiles.full_name}?`)) return;
      const { error } = await supabase.rpc('block_user', { target_id: activeChat.profiles.id })
      if (!error) {
          setConnections(prev => prev.filter(c => c.id !== activeChat.id))
          setActiveChat(null)
          router.push('/chat')
      }
  }

  const sendSecureContact = async () => {
      setSendingCard(true)
      const { data, error } = await supabase.rpc('share_contact', { target_user_id: activeChat.profiles.id })
      if (data === 'success_shared') {
          setShowContactModal(false)
          setShowLimitModal(false)
          setNewMessage('')
      } else {
          alert("Insufficient Coins!")
      }
      setSendingCard(false)
  }

  const getSignalsText = () => {
    if (!activeChat?.profiles?.profile_signals) return null;
    const s = activeChat.profiles.profile_signals;
    const parts = [];
    if (s.incomeSignal) parts.push(`₹${s.incomeSignal.min}-${s.incomeSignal.max}L`);
    if (s.familyTypeSignal) parts.push(s.familyTypeSignal);
    if (s.religionSignal) parts.push(s.religionSignal);
    return parts.length > 0 ? parts.join(" • ") : null;
  }
  const deepDataText = getSignalsText();

  return (
    <div className="min-h-screen bg-white flex flex-col relative">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 p-4 flex items-center justify-between sticky top-0 z-10 relative">
        <div className="flex items-center gap-3">
            <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-slate-50"><ArrowLeft size={20} /></Link>
            {activeChat ? (
                <div>
                    <h2 className="font-bold text-slate-900 leading-tight">{activeChat.profiles.full_name}</h2>
                    <div className="flex flex-col">
                        <p className="text-xs text-green-600 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Online</p>
                        {deepDataText && <p className="text-[10px] text-slate-400 font-medium mt-0.5">{deepDataText}</p>}
                    </div>
                </div>
            ) : <h1 className="font-bold text-xl">Messages</h1>}
        </div>
        
        {activeChat && (
            <div className="flex gap-2 text-slate-400 relative">
                <button className="p-2 hover:bg-slate-50 rounded-full"><Phone size={20} /></button>
                <button onClick={() => setShowOptionsMenu(!showOptionsMenu)} className="p-2 hover:bg-slate-50 rounded-full"><MoreVertical size={20} /></button>
                
                {showOptionsMenu && (
                    <div className="absolute top-10 right-0 bg-white border border-slate-100 shadow-xl rounded-xl w-52 py-2 z-50 animate-in fade-in zoom-in-95">
                        <Link href={`/profile/${activeChat.profiles.full_name}`} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 text-sm text-slate-700"><User size={16} /> View Profile</Link>
                        <div className="h-px bg-slate-100 my-1"></div>
                        <button onClick={handleDisconnect} className="flex w-full items-center gap-3 px-4 py-3 hover:bg-slate-50 text-sm text-slate-700"><UserMinus size={16} /> End Connection</button>
                        <button onClick={handleBlock} className="flex w-full items-center gap-3 px-4 py-3 hover:bg-red-50 text-sm text-red-600 font-bold"><Ban size={16} /> Block User</button>
                    </div>
                )}
            </div>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 bg-slate-50" onClick={() => setShowOptionsMenu(false)}>
        {!activeChat ? (
            <div className="space-y-2">
                {connections.length === 0 && <div className="text-center py-10 text-slate-400">No connections yet.</div>}
                {connections.map(c => (
                    <div key={c.id} onClick={() => c.status === 'accepted' && setActiveChat(c)} className={`p-4 rounded-xl flex items-center gap-4 shadow-sm border ${c.status === 'pending' ? 'bg-slate-50 opacity-70' : 'bg-white cursor-pointer'}`}>
                        <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden relative">
                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${c.profiles.full_name}`} />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-slate-900">{c.profiles.full_name}</h3>
                            <p className="text-xs text-slate-500">{c.status === 'pending' ? "Pending..." : "Tap to chat"}</p>
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <div className="space-y-4 pb-20">
                {messages.map(m => (
                    <div key={m.id} className={`flex ${m.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm ${m.sender_id === user?.id ? 'bg-slate-900 text-white rounded-tr-sm' : 'bg-white border border-slate-200'}`}>
                            {m.content}
                            {/* Simple Logic for Transparency: If it matches AI tone, we could add badge here, or just let users add it themselves */}
                        </div>
                    </div>
                ))}
                {isLimitReached && <div className="flex justify-center my-4"><span className="text-xs font-bold text-rose-500 bg-rose-50 px-3 py-1 rounded-full border border-rose-100">Limit Reached (10/10)</span></div>}
            </div>
        )}
      </div>

      {/* Input Area */}
      {activeChat && (
        <div className="p-3 bg-white border-t border-slate-100 relative">
            
            {/* AI Menu */}
            {showAiMenu && (
                <div className="absolute bottom-full left-3 mb-2 bg-white border border-slate-100 shadow-xl rounded-xl p-2 flex flex-col gap-1 w-48 animate-in slide-in-from-bottom-2 z-20">
                    <div className="flex justify-between items-center px-2 pb-1 border-b border-slate-50 mb-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">AI Assist</span>
                        <button onClick={() => setShowAiMenu(false)}><X size={14} className="text-slate-400"/></button>
                    </div>
                    <button onClick={() => handleAiAssist('icebreaker')} disabled={aiLoading} className="text-left px-3 py-2 hover:bg-indigo-50 rounded-lg text-sm font-medium text-slate-700">🧊 Icebreaker</button>
                    <button onClick={() => handleAiAssist('reply')} disabled={aiLoading} className="text-left px-3 py-2 hover:bg-indigo-50 rounded-lg text-sm font-medium text-slate-700">↩️ Polite Reply</button>
                    <button onClick={() => handleAiAssist('decline')} disabled={aiLoading} className="text-left px-3 py-2 hover:bg-rose-50 rounded-lg text-sm font-medium text-rose-600">🚫 Say No Nicely</button>
                </div>
            )}

            <div className="flex gap-2">
                {/* AI Toggle Button */}
                <button 
                    onClick={() => setShowAiMenu(!showAiMenu)}
                    className="w-10 h-10 rounded-full flex items-center justify-center text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition"
                >
                    {aiLoading ? <Loader2 size={18} className="animate-spin"/> : <Sparkles size={18} />}
                </button>

                <input 
                    value={newMessage} 
                    onChange={e => setNewMessage(e.target.value)} 
                    placeholder={isLimitReached ? "Unlock to continue..." : "Type a message..."} 
                    disabled={isLimitReached} 
                    className="flex-1 bg-slate-100 rounded-full px-4 py-2 text-sm outline-none disabled:opacity-50" 
                    onKeyDown={e => e.key === 'Enter' && sendMessage()} 
                />
                <button 
                    onClick={isLimitReached ? () => setShowLimitModal(true) : sendMessage} 
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg transition ${isLimitReached ? 'bg-amber-500' : 'bg-slate-900'}`}
                >
                    {isLimitReached ? <Lock size={16} /> : <Send size={18} />}
                </button>
            </div>
        </div>
      )}

      {/* Modals */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl text-center">
                <ShieldAlert className="w-12 h-12 text-amber-500 mx-auto mb-4"/>
                <h2 className="text-xl font-bold mb-2">Wait! Is that a number?</h2>
                <div className="space-y-3">
                    <button onClick={sendSecureContact} disabled={sendingCard} className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl flex justify-center items-center gap-2">{sendingCard ? <Loader2 className="animate-spin"/> : <><Contact size={18}/> Share Card (199 Coins)</>}</button>
                    <button onClick={() => setShowContactModal(false)} className="w-full text-slate-500 py-2">Edit Message</button>
                </div>
            </div>
        </div>
      )}
      
      {showLimitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
             <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl text-center">
                <Lock className="w-12 h-12 text-amber-500 mx-auto mb-4"/>
                <h2 className="text-xl font-bold mb-2">Vibe Check Complete</h2>
                <button onClick={sendSecureContact} className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl mb-3">Share Contact (199 Coins)</button>
                <button onClick={() => setShowLimitModal(false)} className="w-full text-slate-500">Cancel</button>
             </div>
        </div>
      )}
    </div>
  )
}

// WRAPPER TO FIX BUILD ERROR
export default function ChatPage() {
  return (
    <Suspense fallback={<div className="h-screen w-full flex items-center justify-center"><Loader2 className="animate-spin text-slate-400"/></div>}>
      <ChatContent />
    </Suspense>
  )
}