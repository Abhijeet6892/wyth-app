'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Trash2, CheckCircle, Plus } from 'lucide-react'

export default function ManagePhotos() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [media, setMedia] = useState<any[]>([])
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/login')

      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(prof)

      const { data: posts } = await supabase.from('posts').select('*').eq('user_id', user.id).eq('type', 'photo').order('created_at', { ascending: false })
      setMedia(posts || [])
      setLoading(false)
    }
    fetchData()
  }, [router])

  const handleSetAvatar = async (url: string) => {
      if(!confirm("Set as profile photo?")) return;
      await supabase.from('profiles').update({ avatar_url: url }).eq('id', profile.id)
      setProfile((prev: any) => ({ ...prev, avatar_url: url }))
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
       <div className="bg-white/80 backdrop-blur-md px-4 py-4 sticky top-0 z-10 border-b border-slate-100 flex items-center gap-3">
           <Link href="/settings" className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-full transition"><ArrowLeft size={22}/></Link>
           <h1 className="font-bold text-slate-900">Manage Photos</h1>
       </div>

       <div className="p-4 grid grid-cols-2 gap-4">
           {/* Current Avatar */}
           <div className="col-span-2 bg-white p-5 rounded-[2rem] border border-slate-100 flex items-center gap-5 shadow-sm">
               <div className="w-20 h-20 rounded-full bg-slate-100 overflow-hidden relative border-4 border-white shadow-md">
                   <img src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.full_name}`} className="w-full h-full object-cover" />
               </div>
               <div>
                   <p className="font-bold text-slate-900 text-lg">Profile Photo</p>
                   <p className="text-xs text-green-600 font-bold flex items-center gap-1 bg-green-50 px-2 py-1 rounded-md w-fit mt-1"><CheckCircle size={12}/> Visible to all</p>
               </div>
           </div>

           {/* Post Grid */}
           {media.map(item => (
               <div key={item.id} className="relative aspect-square bg-white rounded-2xl overflow-hidden border border-slate-200 group shadow-sm">
                   <img src={item.media_url} className="w-full h-full object-cover" />
                   <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 backdrop-blur-sm">
                       <button onClick={() => handleSetAvatar(item.media_url)} className="text-[10px] bg-white text-slate-900 px-3 py-1.5 rounded-full font-bold hover:scale-105 transition">Make Avatar</button>
                   </div>
               </div>
           ))}
           
           {/* Add New Placeholder */}
           <div className="aspect-square rounded-2xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 hover:bg-slate-100 transition cursor-pointer">
               <Plus size={24} />
               <span className="text-xs font-bold mt-1">Post Photo</span>
           </div>
       </div>
    </div>
  )
}