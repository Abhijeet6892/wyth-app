'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, Settings, ShieldCheck, MapPin, Grid, Heart, 
  Lock, Edit3, Image as ImageIcon, Award, CheckCircle2 
} from 'lucide-react'

export default function MyProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/login')

      // 1. Fetch Profile Data
      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      setProfile(prof)

      // 2. Fetch Media (Image Posts Only for Grid)
      const { data: userPosts } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', 'photo') // Only images for the grid
        .order('created_at', { ascending: false })
      
      setPosts(userPosts || [])
      setLoading(false)
    }
    fetchData()
  }, [router])

  if (loading) return <div className="h-screen w-full bg-white flex items-center justify-center text-slate-300">Loading...</div>

  // Data Parsing
  const lifestyle = profile?.lifestyle || {}
  const signals = profile?.profile_signals || {}

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
       {/* 1. TOP NAV */}
       <div className="sticky top-0 bg-white/90 backdrop-blur-md z-20 px-4 py-3 flex justify-between items-center border-b border-slate-100">
           <Link href="/" className="p-2 -ml-2 text-slate-600"><ArrowLeft size={22}/></Link>
           <h1 className="font-bold text-slate-900">My Profile</h1>
           <Link href="/settings" className="p-2 -mr-2 text-slate-600"><Settings size={22}/></Link>
       </div>

       <div className="p-4 max-w-md mx-auto space-y-6">
           
           {/* 2. IDENTITY BLOCK */}
           <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center relative overflow-hidden">
               <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-amber-200 to-indigo-200 mb-3">
                   <div className="w-full h-full rounded-full bg-slate-100 overflow-hidden relative">
                       <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.full_name}`} className="w-full h-full object-cover" />
                       {profile?.avatar_url && <img src={profile.avatar_url} className="absolute inset-0 w-full h-full object-cover" />}
                   </div>
               </div>
               
               <h2 className="text-xl font-serif font-bold text-slate-900 flex items-center gap-1.5">
                   {profile?.full_name}
                   {profile?.is_gold && <Award size={18} className="text-amber-500 fill-amber-500"/>}
               </h2>
               
               <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
                   <MapPin size={14}/> {profile?.city_display || profile?.city}
               </p>

               {/* Intent Badge */}
               <div className="mt-3 px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full uppercase tracking-wide">
                   {profile?.intent?.replace('_', ' ') || 'Exploring'}
               </div>
           </div>

           {/* 3. TRUST & SHIELD BLOCK */}
           <div className="grid grid-cols-2 gap-3">
               <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-center">
                   <div className="flex items-center gap-2 mb-1 text-indigo-600 font-bold text-xs uppercase"><ShieldCheck size={16}/> Trust Score</div>
                   <div className="text-2xl font-bold text-slate-900">{profile?.vouches_count || 0}</div>
                   <div className="text-xs text-slate-400">People vouched</div>
               </div>
               <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 shadow-sm flex flex-col justify-center">
                   <div className="flex items-center gap-2 mb-1 text-blue-700 font-bold text-xs uppercase"><Lock size={16}/> Social Shield</div>
                   <div className="text-xs text-blue-800 leading-tight mt-1">
                       Career & Vibe are <b>hidden</b> from strangers.
                   </div>
               </div>
           </div>

           {/* 4. ABOUT (Read Only) */}
           <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
               <h3 className="text-xs font-bold text-slate-400 uppercase mb-3">About</h3>
               <p className="text-slate-700 text-sm leading-relaxed italic">
                   "{profile?.bio || "No bio added yet."}"
               </p>
           </div>

           {/* 5. LIFESTYLE SNAPSHOT */}
           <div className="flex flex-wrap gap-2">
               {lifestyle.diet && <span className="px-4 py-2 bg-white border border-slate-200 rounded-full text-xs font-medium text-slate-600">{lifestyle.diet}</span>}
               {lifestyle.drink && <span className="px-4 py-2 bg-white border border-slate-200 rounded-full text-xs font-medium text-slate-600">{lifestyle.drink}</span>}
               {lifestyle.smoke && <span className="px-4 py-2 bg-white border border-slate-200 rounded-full text-xs font-medium text-slate-600">{lifestyle.smoke}</span>}
           </div>

           {/* 6. MEDIA GRID */}
           <div>
               <div className="flex items-center justify-between mb-3 px-1">
                   <h3 className="text-sm font-bold text-slate-900">Photos & Posts</h3>
                   <Link href="/settings/photos" className="text-xs text-blue-600 font-bold">Manage</Link>
               </div>
               
               {posts.length > 0 ? (
                   <div className="grid grid-cols-3 gap-1 rounded-xl overflow-hidden">
                       {posts.map(post => (
                           <div key={post.id} className="aspect-square bg-slate-100 relative">
                               <img src={post.media_url} className="w-full h-full object-cover"/>
                           </div>
                       ))}
                   </div>
               ) : (
                   <div className="bg-slate-50 rounded-2xl p-8 text-center border border-dashed border-slate-200">
                       <ImageIcon size={24} className="mx-auto text-slate-300 mb-2"/>
                       <p className="text-xs text-slate-400">No photos posted yet.</p>
                   </div>
               )}
           </div>

           {/* 7. PRIVATE SIGNALS (Hidden State Visual) */}
           <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 opacity-70">
               <div className="flex items-center gap-2 mb-2 text-slate-400 text-xs font-bold uppercase"><Lock size={12}/> Private Signals</div>
               <p className="text-xs text-slate-500">
                   Income ({signals.incomeSignal ? 'Set' : 'Unset'}), Family, and Religion are <b>visible only to connections</b>.
               </p>
           </div>

           {/* SELF VIEW ACTIONS */}
           <div className="fixed bottom-6 left-0 right-0 px-6">
               <Link href="/settings/edit-profile" className="w-full bg-slate-900 text-white font-bold h-14 rounded-2xl flex items-center justify-center gap-2 shadow-xl active:scale-95 transition">
                   <Edit3 size={18}/> Edit Profile
               </Link>
           </div>

       </div>
    </div>
  )
}