'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabase/client'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { ArrowLeft, Send, MoreVertical, Phone, Video, ShieldAlert, Contact, Ban, Flag, User, Lock, Award, Loader2, CheckCircle2 } from 'lucide-react'
import { SlotPaywall, GoldUpsell } from '@/components/InteractionModals' // Ensure you have this file

export default function ChatPage() {
  const router = useRouter()
  const [connections, setConnections] = useState<any[]>([])
  const [activeChat, setActiveChat] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [user, setUser] = useState<any>(null)
  const [userIsGold, setUserIsGold] = useState(false) // New: Track Gold Status
  
  // UI States
  const [showContactModal, setShowContactModal] = useState(false)
  const [showLimitModal, setShowLimitModal] = useState(false) // New: Limit Modal
  const [showGoldUpsell, setShowGoldUpsell] = useState(false)
  const [showOptionsMenu, setShowOptionsMenu] = useState(false)
  const [sendingCard, setSendingCard] = useState(false)

  const searchParams = useSearchParams()
  const autoOpenId = searchParams.get('open')

  // 1. Load Connections & User Status
  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        // A. Fetch Gold Status
        const { data: profile } = await supabase.from('profiles').select('is_gold').eq('id', user.id).single()
        setUserIsGold(profile?.is_gold || false)

        // B. Fetch connections
        const { data } = await supabase
          .from('connections')
          .select(`*, profiles:receiver_id (id, full_name, is_gold)`)
          .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`)
        
        setConnections(data || [])
      }
    }
    loadData()
  }, [])

  // 1.5 Auto-Open Logic
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

  // --- LOGIC: THE 10 MESSAGE CAP ---
  const myMessageCount = messages.filter(m => m.sender_id === user?.id).length
  const hasSharedContact = messages.some(m => m.sender_id === user?.id && m.content === 'Verified Contact Card 📇')
  
  // Limit is reached IF: Not Gold AND hasn't paid for card AND sent >= 10 msgs
  const isLimitReached = !userIsGold && !hasSharedContact && myMessageCount >= 10

  // 3. Send Message
  const sendMessage = async () => {
    if (!newMessage.trim() || !user || !activeChat) return

    // A. Check Limit
    if (isLimitReached) {
        setShowLimitModal(true)
        return
    }

    // B. Safety Filter (Block Numbers)
    const phoneRegex = /\b[\d\s-]{10,}\b/
    if (phoneRegex.test(newMessage)) {
        setShowContactModal(true)
        return
    }

    const { error } = await supabase.from('messages').insert({
      sender_id: user.id,
      receiver_id: activeChat.profiles.id,
      content: newMessage
    })
    if (!error) setNewMessage('')
  }

  // 4. Block User Logic
  const handleBlock = async () => {
      if(!confirm(`Block ${activeChat.profiles.full_name}?`)) return;
      const { error } = await supabase.rpc('block_user', { target_id: activeChat.profiles.id })
      if (!error) {
          setConnections(prev => prev.filter(c => c.id !== activeChat.id))
          setActiveChat(null)
          router.push('/chat')
      } else {
          alert("Error: " + error.message)
      }
  }

  // 5. Send Secure Card (199 Coins)
  const sendSecureContact = async () => {
      setSendingCard(true)
      const { data, error } = await supabase.rpc('share_contact', { target_user_id: activeChat.profiles.id })

      if (error) alert("Error: " + error.message)
      else if (data === 'error_insufficient_funds') alert("Insufficient Coins! Need 199 Coins.")
      else if (data === 'success_shared') {
          // Success! This automatically unlocks the chat because hasSharedContact becomes true
          setShowContactModal(false)
          setShowLimitModal(false)
          setNewMessage('')
      }
      setSendingCard(false)
  }

  return (
    <div className="min-h-screen bg-white flex flex-col relative">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 p-4 flex items-center justify-between sticky top-0 z-10 relative">
        <div className="flex items-center gap-3">
            <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-slate-50"><ArrowLeft size={20} /></Link>
            {activeChat ? (
                <div>
                    <h2 className="font-bold text-slate-900">{activeChat.profiles.full_name}</h2>
                    <p className="text-xs text-green-600 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Online</p>
                </div>
            ) : <h1 className="font-bold text-xl">Messages</h1>}
        </div>
        
        {activeChat && (
            <div className="flex gap-2 text-slate-400 relative">
                <button className="p-2 hover:bg-slate-50 rounded-full"><Phone size={20} /></button>
                <button className="p-2 hover:bg-slate-50 rounded-full"><Video size={20} /></button>
                <button onClick={() => setShowOptionsMenu(!showOptionsMenu)} className="p-2 hover:bg-slate-50 rounded-full"><MoreVertical size={20} /></button>
                
                {showOptionsMenu && (
                    <div className="absolute top-10 right-0 bg-white border border-slate-100 shadow-xl rounded-xl w-48 py-2 z-50 animate-in fade-in zoom-in-95">
                        <Link href={`/profile/${activeChat.profiles.full_name}`} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 text-sm text-slate-700">
                            <User size={16} /> View Profile
                        </Link>
                        <button className="flex w-full items-center gap-3 px-4 py-3 hover:bg-slate-50 text-sm text-slate-700">
                            <Flag size={16} /> Report
                        </button>
                        <div className="h-px bg-slate-100 my-1"></div>
                        <button onClick={handleBlock} className="flex w-full items-center gap-3 px-4 py-3 hover:bg-red-50 text-sm text-red-600 font-bold">
                            <Ban size={16} /> Block User
                        </button>
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
                {messages.map(m => {
                    const isCard = m.content === "Verified Contact Card 📇"
                    const isMe = m.sender_id === user?.id
                    return (
                        <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            {isCard ? (
                                <div className={`max-w-[85%] rounded-2xl border shadow-sm p-4 bg-gradient-to-r from-amber-50 to-yellow-50 flex items-center gap-3 ${isMe ? 'border-amber-200' : 'border-slate-100'}`}>
                                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-xl shadow-sm">📞</div>
                                    <div><p className="text-[10px] font-bold text-amber-600 uppercase">SECURE CONTACT</p><p className="text-sm font-bold">{isMe ? "You shared contact" : "Contact Received"}</p></div>
                                </div>
                            ) : (
                                <div className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm ${isMe ? 'bg-slate-900 text-white rounded-tr-sm' : 'bg-white border border-slate-200'}`}>{m.content}</div>
                            )}
                        </div>
                    )
                })}
                {/* Visual warning that limit is approaching or reached */}
                {isLimitReached && (
                    <div className="flex justify-center my-4">
                        <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 flex items-center gap-2">
                            <Lock size={12} /> Daily Free Limit Reached
                        </span>
                    </div>
                )}
            </div>
        )}
      </div>

      {/* Input Area */}
      {activeChat && (
        <div className="p-3 bg-white border-t border-slate-100 flex gap-2">
            <input 
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                // Disabled if limit reached
                placeholder={isLimitReached ? "Unlock to continue..." : "Type a message..."}
                disabled={isLimitReached} 
                className="flex-1 bg-slate-100 rounded-full px-4 py-2 text-sm outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
            />
            {/* Button changes function based on limit */}
            <button 
                onClick={isLimitReached ? () => setShowLimitModal(true) : sendMessage} 
                className={`w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg transition ${isLimitReached ? 'bg-amber-500' : 'bg-slate-900'}`}
            >
                {isLimitReached ? <Lock size={16} /> : <Send size={18} />}
            </button>
        </div>
      )}

      {/* MODALS */}

      {/* 1. Limit Reached Modal */}
      <SlotPaywall 
        isOpen={showLimitModal} 
        mode="message_limit" 
        onClose={() => setShowLimitModal(false)}
        onAction={sendSecureContact} // Action 1: Share Contact (199)
      />

      {/* 2. Safety/Toll Booth Modal (Reusing SlotPaywall with custom mode) */}
      {showContactModal && (
        <SlotPaywall 
            isOpen={true} 
            mode="message_limit" // Reusing UI
            onClose={() => setShowContactModal(false)}
            onAction={sendSecureContact}
        />
      )}

      {/* 3. Gold Upsell */}
      <GoldUpsell isOpen={showGoldUpsell} onClose={() => setShowGoldUpsell(false)} />
    </div>
  )
}