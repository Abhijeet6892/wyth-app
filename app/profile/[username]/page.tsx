'use client'
import { useEffect, useState, use } from 'react'
import { supabase } from '@/utils/supabase/client'
import FeedCard from '@/components/FeedCard'
import { SlotPaywall, GoldUpsell } from '@/components/InteractionModals'
import { ArrowLeft, Zap, Hash, ShieldCheck, Lock, MapPin, Briefcase, Award, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function PublicProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params)
  const router = useRouter()
  
  const [profile, setProfile] = useState<any>(null)
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isConnected, setIsConnected] = useState(false)
  
  // Modals state
  const [showPaywall, setShowPaywall] = useState(false)
  const [showGoldUpsell, setShowGoldUpsell] = useState(false)
  const [paywallMode, setPaywallMode] = useState<'connect' | 'comment'>('connect')

  useEffect(() => {
    const fetchProfile = async () => {
      const name = decodeURIComponent(username)
      
      // 0. Get Current User
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUser(user)

      // 1. Find Target Profile (by Name or Brand ID)
      let query = supabase.from('profiles').select('*')
      
      // Heuristic: If it looks like a Brand ID (starts with WYTH), try that first
      if (name.startsWith('WYTH')) {
         const { data: byID } = await supabase.from('profiles').select('*').eq('brand_id', name).maybeSingle()
         if (byID) {
             setProfileData(byID, user)
             return
         }
      }

      // Otherwise search by name
      const { data: byName } = await query.ilike('full_name', `%${name}%`).limit(1).maybeSingle()
      
      if (byName) {
          setProfileData(byName, user)
      } else {
          setLoading(false)
      }
    }

    const setProfileData = async (userData: any, user: any) => {
        setProfile(userData)
        
        // 2. Check Connection Status
        if (user) {
            const { data: connection } = await supabase
                .from('connections')
                .select('*')
                .or(`and(requester_id.eq.${user.id},receiver_id.eq.${userData.id}),and(requester_id.eq.${userData.id},receiver_id.eq.${user.id})`)
                .eq('status', 'accepted')
                .maybeSingle()
            
            if (connection || user.id === userData.id) setIsConnected(true)
        }

        // 3. Fetch User's Posts
        const { data: postData } = await supabase
          .from('posts')
          .select('*, profiles(*)')
          .eq('user_id', userData.id)
          .order('created_at', { ascending: false }) 
        
        setPosts(postData || [])
        setLoading(false)
    }

    if (username) fetchProfile()
  }, [username])

  // --- HANDLERS ---
  const handleConnect = () => {
      if (!currentUser) return router.push('/login')
      setPaywallMode('connect')
      setShowPaywall(true)
  }

  const handleVouch = async () => {
      if (!currentUser) return router.push('/login')
      const { data, error } = await supabase.rpc('vouch_for_user', { target_id: profile.id })
      if (data === 'success_vouched') {
          alert(`You verified ${profile.full_name}!`)
          setProfile((prev: any) => ({ ...prev, vouches_count: (prev.vouches_count || 0) + 1 }))
      } else {
          alert("Unable to vouch. You may have already vouched.")
      }
  }

  if (loading) return <div className="h-screen w-full bg-slate-50 flex items-center justify-center text-slate-400">Loading Profile...</div>
  
  if (!profile && !loading) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-2">User not found</h2>
        <Link href="/" className="px-6 py-3 bg-slate-900 text-white rounded-full font-bold text-sm">Go Home</Link>
    </div>
  )

  // Parse Soft Signals
  const signals = profile.profile_signals || {}
  const lifestyle = profile.lifestyle || {}

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
                {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover"/>
                ) : (
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.full_name}`} alt={profile.full_name} className="w-full h-full object-cover"/>
                )}
                
                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full text-xs font-bold text-slate-800 shadow-sm border border-white/50">
                    {profile.intent === 'ready_marriage' ? 'Ready for Marriage' : profile.intent === 'dating_marriage' ? 'Dating for Marriage' : 'Exploring'}
                </div>
            </div>

            {/* Name & ID */}
            <h1 className="text-3xl font-bold text-slate-900 mb-1 flex items-center gap-2">
                {profile.full_name}
                {profile.is_gold ? <Award size={20} className="text-amber-500 fill-amber-500"/> : <CheckCircle2 size={20} className="text-blue-500 fill-blue-50"/>}
            </h1>
            
            <div className="flex items-center gap-3 mb-6">
                {profile.brand_id && <p className="text-xs text-slate-400 font-mono flex items-center gap-1"><Hash size={12} /> {profile.brand_id}</p>}
                <div className="text-xs bg-indigo-50 text-indigo-700 font-bold px-2 py-1 rounded flex items-center gap-1">
                    <ShieldCheck size={12} /> {profile.vouches_count || 0} Vouches
                </div>
            </div>

            <p className="text-slate-500 mb-6 flex items-center gap-1">
                <MapPin size={16}/> {profile.city_display || profile.city} 
                {profile.gender && <span className="ml-1">• {profile.gender}</span>}
            </p>

            {/* BIO */}
            {profile.bio && (
                <div className="mb-8 p-4 bg-slate-50 rounded-2xl border border-slate-100 italic text-slate-600">
                    "{profile.bio}"
                </div>
            )}

            {/* LIFESTYLE CHIPS */}
            <div className="flex flex-wrap gap-2 mb-8">
                {lifestyle.diet && <span className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-full text-sm font-medium text-slate-600">{lifestyle.diet}</span>}
                {lifestyle.drink && <span className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-full text-sm font-medium text-slate-600">{lifestyle.drink} Drinker</span>}
                {lifestyle.smoke && <span className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-full text-sm font-medium text-slate-600">{lifestyle.smoke} Smoker</span>}
            </div>

            <hr className="border-slate-100 mb-8" />

            {/* DEEP DATA (Protected) */}
            <div className="mb-8">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    Private Preferences
                    {!isConnected && <Lock size={16} className="text-amber-500"/>}
                </h3>
                
                {isConnected ? (
                    // UNLOCKED VIEW
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                            <p className="text-xs text-blue-600 uppercase font-bold mb-1">Income Range</p>
                            <p className="font-bold text-slate-900">₹{signals.incomeSignal?.min || '?'}-{signals.incomeSignal?.max || '?'}L</p>
                        </div>
                        <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                            <p className="text-xs text-purple-600 uppercase font-bold mb-1">Family</p>
                            <p className="font-bold text-slate-900">{signals.familyTypeSignal || 'Not specified'}</p>
                        </div>
                        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 col-span-2">
                            <p className="text-xs text-emerald-600 uppercase font-bold mb-1">Culture</p>
                            <p className="font-bold text-slate-900">{signals.religionSignal || 'Not specified'}</p>
                        </div>
                    </div>
                ) : (
                    // LOCKED VIEW
                    <div onClick={handleConnect} className="relative overflow-hidden rounded-2xl border border-amber-100 bg-amber-50/50 p-6 text-center cursor-pointer group hover:bg-amber-100 transition">
                        <div className="flex flex-col items-center justify-center gap-2 opacity-60">
                            <div className="h-4 bg-slate-400 rounded w-1/2"></div>
                            <div className="h-4 bg-slate-400 rounded w-3/4"></div>
                        </div>
                        <div className="absolute inset-0 flex flex-col items-center justify-center backdrop-blur-[2px]">
                            <div className="bg-white p-3 rounded-full shadow-sm mb-2 group-hover:scale-110 transition-transform">
                                <Lock size={20} className="text-amber-500"/>
                            </div>
                            <p className="text-xs font-bold text-amber-900">Connect to unlock Deep Data</p>
                        </div>
                    </div>
                )}
            </div>

            <hr className="border-slate-100 mb-8" />
            <h3 className="font-bold text-lg mb-4">Activity</h3>
            
            {/* Feed Cards */}
            {posts.map(post => (
                <FeedCard 
                    key={post.id} 
                    post={post}
                    isConnected={isConnected}
                    onConnect={handleConnect}
                    onSocialUnlock={() => setShowGoldUpsell(true)}
                    onComment={() => setShowPaywall(true)}
                />
            ))}
            {posts.length === 0 && <p className="text-slate-400 text-center py-4">No public activity yet.</p>}
        </div>

        {/* Sticky Action Bar */}
        {!isConnected && currentUser?.id !== profile.id && (
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-100 flex gap-3 z-20">
                <button onClick={handleVouch} className="flex-1 bg-indigo-50 border border-indigo-100 text-indigo-600 py-3.5 rounded-xl font-bold active:scale-95 transition flex items-center justify-center gap-1">
                    <ShieldCheck size={18} /> Vouch
                </button>
                <button onClick={handleConnect} className="flex-[2] bg-slate-900 text-white py-3.5 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 hover:bg-slate-800 active:scale-95 transition">
                    Connect <Zap size={16} className="text-yellow-400 fill-yellow-400" />
                </button>
            </div>
        )}

        {/* Modals */}
        <SlotPaywall isOpen={showPaywall} mode={paywallMode} onClose={() => setShowPaywall(false)} />
        <GoldUpsell isOpen={showGoldUpsell} onClose={() => setShowGoldUpsell(false)} />

      </div>
    </div>
  )
}