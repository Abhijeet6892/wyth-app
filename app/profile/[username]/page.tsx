'use client'
import { useEffect, useState, use } from 'react'
import { supabase } from '@/utils/supabase/client'
import FeedCard from '@/components/FeedCard'
import { SlotPaywall, GoldUpsell } from '@/components/InteractionModals'
import { ArrowLeft, Zap, Hash, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params)
  const router = useRouter()
  
  const [profile, setProfile] = useState<any>(null)
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [debugMsg, setDebugMsg] = useState<string>('')
  
  // Modals state
  const [showPaywall, setShowPaywall] = useState(false)
  const [showGoldUpsell, setShowGoldUpsell] = useState(false)
  const [paywallMode, setPaywallMode] = useState<'connect' | 'comment'>('connect')

  useEffect(() => {
    const fetchProfile = async () => {
      const name = decodeURIComponent(username)
      
      // 1. Find User
      let { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('*')
        .ilike('full_name', `%${name}%`) 
        .limit(1)
        .maybeSingle()

      // Fallback for Demo
      if (!userData) {
        const { data: fallbackUser } = await supabase.from('profiles').select('*').limit(1).single()
        if (fallbackUser) userData = fallbackUser
      }

      if (userData) {
        setProfile(userData)
        
        // 2. Fetch Posts
        const { data: postData } = await supabase
          .from('posts')
          .select('*, profiles(*)')
          .eq('user_id', userData.id)
          .order('id', { ascending: false }) 
        
        setPosts(postData || [])
      } else {
        const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
        setDebugMsg(`User not found. Total DB users: ${count}`)
      }
      setLoading(false)
    }

    if (username) fetchProfile()
  }, [username])

  // --- VOUCH HANDLER ---
  const handleVouch = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return alert("Please login to vouch.")

      const { data, error } = await supabase.rpc('vouch_for_user', { target_id: profile.id })

      if (data === 'success_vouched') {
          alert(`You verified ${profile.full_name}! Trust Score updated.`)
          // Optimistic Update
          setProfile((prev: any) => ({ ...prev, vouches_count: (prev.vouches_count || 0) + 1 }))
      } else if (data === 'error_already_vouched') {
          alert("You have already vouched for this person.")
      } else if (data === 'error_self_vouch') {
          alert("Nice try! You cannot vouch for yourself.")
      } else {
          alert("Error: " + (error?.message || "Unknown error"))
      }
  }

  // --- HANDLERS ---
  const handleConnect = () => {
      setPaywallMode('connect')
      setShowPaywall(true)
  }

  const handleComment = () => {
      setPaywallMode('comment')
      setShowPaywall(true)
  }

  if (loading) return <div className="p-10 text-center text-slate-400">Loading Profile...</div>
  
  if (!profile) return (
    <div className="p-10 text-center flex flex-col items-center justify-center min-h-[50vh]">
        <h2 className="text-xl font-bold text-slate-900 mb-2">User not found</h2>
        <div className="bg-slate-50 p-4 rounded-xl text-xs text-slate-400 font-mono mb-6">{debugMsg}</div>
        <Link href="/" className="px-6 py-3 bg-slate-900 text-white rounded-full font-bold text-sm">Go Back Home</Link>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50 flex justify-center">
      <div className="w-full max-w-md bg-white min-h-screen shadow-xl relative pb-24">
        
        {/* Header */}
        <div className="sticky top-0 bg-white/90 backdrop-blur-md z-30 px-4 py-3 flex items-center justify-between border-b border-slate-100">
            <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-slate-50 transition"><ArrowLeft size={20} className="text-slate-600" /></Link>
            <span className="font-bold text-slate-900">{profile.full_name}</span>
            <div className="w-8"></div>
        </div>

        <div className="p-4">
            {/* Hero Image */}
            <div className="w-full aspect-square bg-slate-100 rounded-3xl overflow-hidden mb-6 relative shadow-inner">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.full_name}`} alt={profile.full_name} className="w-full h-full object-cover"/>
                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full text-xs font-bold text-slate-800 shadow-sm border border-white/50">
                    Looking for marriage in 2026
                </div>
            </div>

            {/* Name & Gold */}
            <h1 className="text-3xl font-bold text-slate-900 mb-1 flex items-center gap-2">
                {profile.full_name}
                {profile.is_gold && <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200 align-middle">GOLD</span>}
            </h1>
            
            {/* ID & Trust Score */}
            <div className="flex items-center gap-3 mb-6">
                {profile.brand_id && <p className="text-xs text-slate-400 font-mono flex items-center gap-1"><Hash size={12} /> {profile.brand_id}</p>}
                <div className="text-xs bg-indigo-50 text-indigo-700 font-bold px-2 py-1 rounded flex items-center gap-1">
                    <ShieldCheck size={12} /> {profile.vouches_count || 0} Vouches
                </div>
            </div>

            {/* Stats */}
            <p className="text-slate-500 mb-6">{profile.city} • 29 • {profile.gender || 'Human'}</p>

            {/* Chips */}
            <div className="flex flex-wrap gap-2 mb-8">
                <span className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-full text-sm font-medium text-slate-600">Non-Veg</span>
                <span className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-full text-sm font-medium text-slate-600">Social Drinker</span>
                <span className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-full text-sm font-medium text-slate-600">Liberal</span>
            </div>

            <hr className="border-slate-100 mb-8" />
            <h3 className="font-bold text-lg mb-4">Recent Activity</h3>
            
            {/* Feed Cards */}
            {posts.map(post => (
                <FeedCard 
                    key={post.id} 
                    post={post}
                    onConnect={handleConnect}
                    onSocialUnlock={() => setShowGoldUpsell(true)}
                    onComment={handleComment}
                />
            ))}
        </div>

        {/* Sticky Action Bar (With Vouch Button) */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-100 flex gap-3 z-20">
            {/* Vouch Button (New) */}
            <button onClick={handleVouch} className="flex-1 bg-indigo-50 border border-indigo-100 text-indigo-600 py-3.5 rounded-xl font-bold active:scale-95 transition flex items-center justify-center gap-1">
                <ShieldCheck size={18} /> Vouch
            </button>
            
            {/* Connect Button */}
            <button onClick={handleConnect} className="flex-[2] bg-slate-900 text-white py-3.5 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 hover:bg-slate-800 active:scale-95 transition">
                Connect <Zap size={16} className="text-yellow-400 fill-yellow-400" />
            </button>
        </div>

        {/* Modals */}
        <SlotPaywall isOpen={showPaywall} mode={paywallMode} onClose={() => setShowPaywall(false)} />
        <GoldUpsell isOpen={showGoldUpsell} onClose={() => setShowGoldUpsell(false)} />

      </div>
    </div>
  )
}