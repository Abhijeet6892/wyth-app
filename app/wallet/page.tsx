'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabase/client'
import Link from 'next/link'
import { ArrowLeft, Zap, Shield, Loader2 } from 'lucide-react'

export default function WalletPage() {
  const [balance, setBalance] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(false)

  // Fetch Balance
  const refreshBalance = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data, error } = await supabase
        .from('profiles')
        .select('wallet_balance')
        .eq('id', user.id)
        .single()
      
      if (error) console.error("Balance Fetch Error:", error.message)
      setBalance(data?.wallet_balance || 0)
    }
    setLoading(false)
  }

  useEffect(() => { refreshBalance() }, [])

  // Simulate Payment Gateway
  const handleBuy = async (amount: number, cost: number) => {
    setPurchasing(true)
    
    // 1. Check User Session First
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
        alert("Error: You seem to be logged out. Please log in again.")
        setPurchasing(false)
        return
    }

    console.log("Buying coins for User ID:", user.id)

    // 2. Call Database Function
    const { error } = await supabase.rpc('buy_coins', { amount: amount })
    
    if (!error) {
        alert(`Success! Added ${amount} Coins.`)
        await refreshBalance()
    } else {
        // SHOW THE REAL ERROR MESSAGE
        console.error("RPC Error:", error)
        alert(`Transaction Failed: ${error.message}\n(Check Console for details)`)
    }
    setPurchasing(false)
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="bg-slate-900 text-white p-6 rounded-b-[2.5rem] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-10"><Zap size={200} /></div>
        <div className="relative z-10">
            <Link href="/" className="inline-block p-2 -ml-2 rounded-full hover:bg-white/10 transition mb-4"><ArrowLeft size={24} /></Link>
            <h1 className="text-3xl font-serif font-bold mb-1">My Wallet</h1>
            <p className="text-slate-400 text-sm mb-6">Manage your WYTH Coins</p>
            <div className="flex items-end gap-2 mt-4">
                {loading ? <Loader2 className="animate-spin" /> : <span className="text-5xl font-bold">{balance}</span>}
                <span className="text-xl font-medium mb-2 text-yellow-400">Coins</span>
            </div>
        </div>
      </div>

      {/* Packs */}
      <div className="px-6 -mt-8 relative z-20 space-y-4">
        {/* Starter Pack */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center transition hover:shadow-md">
            <div>
                <div className="flex items-center gap-2 mb-1"><div className="p-2 bg-rose-50 rounded-full"><Zap size={16} className="text-rose-500" /></div><span className="font-bold text-slate-900">Starter Pack</span></div>
                <p className="text-xs text-slate-500">100 Coins • Good for 3 Slots</p>
            </div>
            <button disabled={purchasing} onClick={() => handleBuy(100, 99)} className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg active:scale-95 transition disabled:opacity-50">
                {purchasing ? "..." : "₹99"}
            </button>
        </div>

        {/* Gold Pack */}
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-5 rounded-2xl shadow-sm border border-amber-100 flex justify-between items-center relative overflow-hidden transition hover:shadow-md">
            <div className="absolute top-0 right-0 bg-yellow-400 text-[10px] font-bold px-2 py-1 rounded-bl-lg text-yellow-900">MOST POPULAR</div>
            <div>
                <div className="flex items-center gap-2 mb-1"><div className="p-2 bg-amber-200 rounded-full"><Shield size={16} className="text-amber-800" /></div><span className="font-bold text-slate-900">Gold Pack</span></div>
                <p className="text-xs text-slate-600">500 Coins • Best Value</p>
            </div>
            <button disabled={purchasing} onClick={() => handleBuy(500, 399)} className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg active:scale-95 transition disabled:opacity-50">
                {purchasing ? "..." : "₹399"}
            </button>
        </div>
      </div>
    </div>
  )
}