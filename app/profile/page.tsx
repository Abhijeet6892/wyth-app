'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, Settings, ShieldCheck, MapPin, 
  Lock, Edit3, Image as ImageIcon, Award, Linkedin, Instagram
} from 'lucide-react'
import { motion } from 'framer-motion'

export default function MyProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/login')

      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(prof)

      const { data: userPosts } = await supabase.from('posts').select('*').eq('user_id', user.id).eq('type', 'photo').order('created_at', { ascending: false })
      setPosts(userPosts || [])
      setLoading(false)
    }
    fetchData()
  }, [router])

  if (loading) return <div className="h-screen w-full flex items-center justify-center bg-slate-50"></div>

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
       {/* 1. TOP NAV */}
       <div className="sticky top-0 bg-white/80 backdrop-blur-md z-20 px-4 py-4 flex justify-between items-center border-b border-slate-100">
           <Link href="/" className="p-2 -ml-2 text-slate-500 hover:text-slate-900 transition"><ArrowLeft size={22}/></Link>
           <h1 className="font-bold text-slate-900">My Profile</h1>
           <Link href="/settings" className="p-2 -mr-2 text-slate-500 hover:text-slate-900 transition"><Settings size={22}/></Link>
       </div>

       <div className="p-4 max-w-md mx-auto space-y-6">
           
           {/* 2. IDENTITY CARD (Glassmorphism) */}
           <motion.div 
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             className="bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col items-center text-center relative overflow-hidden"
           >
               {/* Avatar Ring */}
               <div className={`w-28 h-28 rounded-full p-[3px] mb-4 ${profile?.is_gold ? 'bg-gradient-to-tr from-amber-200 to-yellow-500' : 'bg-slate-100'}`}>
                   <div className="w-full h-full rounded-full bg-white overflow-hidden border-4 border-white relative">
                       <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.full_name}`} className="w-full h-full object-cover" />
                       {profile?.avatar_url && <img src={profile.avatar_url} className="absolute inset-0 w-full h-full object-cover" />}
                   </div>
               </div>
               
               <h2 className="text-2xl font-serif font-bold text-slate-900 flex items-center gap-2">
                   {profile?.full_name}
                   {profile?.is_gold && <Award size={20} className="text-amber-500 fill-amber-500"/>}
               </h2>
               
               <p className="text-sm text-slate-400 mt-1 font-medium flex items-center gap-1">
                   <MapPin size={14}/> {profile?.city_display || profile?.city}
               </p>

               <div className="mt-4 flex gap-2">
                   <span className="px-4 py-1.5 bg-slate-50 text-slate-600 text-xs font-bold rounded-full uppercase tracking-wide border border-slate-100">
                       {profile?.intent?.replace('_', ' ') || 'Exploring'}
                   </span>
                   <span className="px-4 py-1.5 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-full flex items-center gap-1 border border-indigo-100">
                       <ShieldCheck size={12}/> {profile?.vouches_count || 0}
                   </span>
               </div>
           </motion.div>

           {/* 3. SOCIAL SHIELD (Self View) */}
           <div className="flex gap-3">
                <div className="flex-1 bg-blue-50/50 p-4 rounded-2xl border border-blue-100 flex flex-col justify-between">
                    <div className="flex items-center gap-2 text-blue-700 font-bold text-xs uppercase mb-2"><Linkedin size={14}/> Career</div>
                    <div className="text-sm font-bold text-slate-900">Visible</div>
                </div>
                <div className="flex-1 bg-pink-50/50 p-4 rounded-2xl border border-pink-100 flex flex-col justify-between">
                    <div className="flex items-center gap-2 text-pink-600 font-bold text-xs uppercase mb-2"><Instagram size={14}/> Vibe</div>
                    <div className="text-sm font-bold text-slate-900">Visible</div>
                </div>
           </div>

           {/* 4. ABOUT */}
           {profile?.bio && (
               <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 relative">
                   <div className="absolute top-0 left-8 -translate-y-1/2 bg-slate-50 px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest rounded-full border border-slate-100">Bio</div>
                   <p className="text-slate-600 text-sm leading-relaxed italic text-center">
                       "{profile.bio}"
                   </p>
               </div>
           )}

           {/* 5. MEDIA GRID */}
           <div>
               <div className="flex items-center justify-between mb-3 px-2">
                   <h3 className="text-sm font-bold text-slate-900">Photos</h3>
                   <Link href="/settings/photos" className="text-xs text-indigo-600 font-bold">Manage</Link>
               </div>
               
               {posts.length > 0 ? (
                   <div className="grid grid-cols-3 gap-1 rounded-2xl overflow-hidden">
                       {posts.map(post => (
                           <div key={post.id} className="aspect-square bg-slate-100 relative">
                               <img src={post.media_url} className="w-full h-full object-cover"/>
                           </div>
                       ))}
                   </div>
               ) : (
                   <div className="bg-white rounded-2xl p-10 text-center border border-dashed border-slate-200">
                       <ImageIcon size={24} className="mx-auto text-slate-300 mb-2"/>
                       <p className="text-xs text-slate-400 font-medium">No photos yet.</p>
                   </div>
               )}
           </div>

           {/* Edit Button */}
           <div className="fixed bottom-6 left-0 right-0 px-6 z-20">
               <Link href="/settings/edit-profile" className="w-full bg-slate-900 text-white font-bold h-14 rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-slate-300 active:scale-95 transition-all">
                   <Edit3 size={18}/> Edit Profile
               </Link>
           </div>
       </div>
    </div>
  )
}