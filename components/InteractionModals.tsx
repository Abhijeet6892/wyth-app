'use client'
import { Zap, Lock, Star, X, MessageCircle, Contact, Shield } from 'lucide-react'
// ... imports

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  onAction?: () => void
  mode?: 'connect' | 'comment' | 'message_limit'
}

export function SlotPaywall({ isOpen, onClose, onAction, mode = 'connect' }: ModalProps) {
  if (!isOpen) return null

  // Define Content based on Mode
  const content = {
    connect: {
        icon: <Zap className="w-8 h-8 text-rose-600 fill-rose-600" />,
        bg: "bg-rose-50 border-rose-100",
        title: "Slots Full (3/3)",
        desc: "Unlock an extra slot to connect.",
        btnMain: "Unlock Slot for 29 Coins",
        btnSub: "Maybe Later"
    },
    comment: {
        icon: <MessageCircle className="w-8 h-8 text-blue-600" />,
        bg: "bg-blue-50 border-blue-100",
        title: "Comments are Locked",
        desc: "Pay 9 Coins to send a Priority Note.",
        btnMain: "Pay 9 Coins & Comment",
        btnSub: "Cancel"
    },
    message_limit: {
        icon: <Lock className="w-8 h-8 text-amber-600" />,
        bg: "bg-amber-50 border-amber-100",
        title: "Vibe Check Complete",
        desc: "You've exchanged 10 messages. Unlock the next stage of connection.",
        btnMain: "Share Verified Contact (199 Coins)",
        btnSub: "View Gold Benefits"
    }
  }[mode]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
        <div className="flex justify-end">
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100 transition"><X size={20} className="text-slate-400" /></button>
        </div>
        <div className="flex justify-center mb-4 -mt-4">
          <div className={`p-4 rounded-full border ${content.bg}`}>
            {content.icon}
          </div>
        </div>
        
        <h2 className="text-xl font-bold text-center text-slate-900 mb-2">{content.title}</h2>
        <p className="text-center text-slate-500 mb-6 text-sm leading-relaxed px-4">{content.desc}</p>

        {mode === 'message_limit' && (
            <div className="mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <ul className="text-xs text-slate-600 space-y-2">
                    <li className="flex gap-2 font-medium"><Shield size={14} className="text-amber-500"/> Exchange numbers securely</li>
                    <li className="flex gap-2 font-medium"><Star size={14} className="text-amber-500"/> Or get Gold for Unlimited Chat</li>
                </ul>
            </div>
        )}

        <button 
          onClick={onAction}
          className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl mb-3 shadow-lg hover:bg-black transition transform active:scale-95 flex items-center justify-center gap-2"
        >
          {mode === 'message_limit' && <Contact size={18}/>}
          {content.btnMain}
        </button>
        
        <button onClick={onClose} className="w-full text-slate-500 font-medium py-2 hover:text-slate-800 transition">
          {content.btnSub}
        </button>
      </div>
    </div>
  )
}

// ... GoldUpsell remains same ...
export function GoldUpsell({ isOpen, onClose }: Omit<ModalProps, 'mode'>) {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-slate-700 animate-in zoom-in-95 duration-200 text-center relative">
        <div className="absolute top-4 right-4"><button onClick={onClose} className="text-slate-400 hover:text-white"><X size={20}/></button></div>
        <div className="flex justify-center mb-4"><div className="p-4 bg-amber-500/20 rounded-full border border-amber-500/50"><Lock className="w-8 h-8 text-amber-400" /></div></div>
        <h2 className="text-xl font-bold text-white mb-2">Unlock Unlimited Chat</h2>
        <p className="text-slate-300 mb-6 text-sm leading-relaxed">
            You already shared your contact card. <br/>
            To keep chatting here, upgrade to <b>Gold</b>.
        </p>
        <button className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 text-white font-bold py-3.5 rounded-xl mb-3 shadow-lg hover:brightness-110 transition">Get WYTH Gold - ₹499/mo</button>
      </div>
    </div>
  )
}