'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Trash2, CheckCircle, Image as ImageIcon } from 'lucide-react'

export default function ManagePhotos() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [media, setMedia] = useState<any[]>([])
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/login')

      // 1. Get Profile (to know current avatar)
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(prof)

      // 2. Get All Media (Avatar History is hard without a specific table, so we use Posts)
      // Future V2: Create a 'media' table. For MVP, we manage 'Post Images'.
      const { data: posts } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', 'photo')
        .order('created_at', { ascending: false })
      
      setMedia(posts || [])
      setLoading(false)
    }
    fetchData()
  }, [router])

  const handleDelete = async (postId: number) => {
      if(!confirm("Delete this photo? This will remove the post from your feed.")) return;
      
      const { error } = await supabase.from('posts').delete().eq('id', postId)
      if (!error) {
          setMedia(prev => prev.filter(m => m.id !== postId))
      }
  }

  const handleSetAvatar = async (url: string) => {
      if(!confirm("Set this as your main profile photo?")) return;

      const { error } = await supabase.from('profiles').update({ avatar_url: url }).eq('id', profile.id)
      if (!error) {
          setProfile((prev: any) => ({ ...prev, avatar_url: url }))
          alert("Profile photo updated!")
      }
  }

  if (loading) return <div className="h-screen w-full bg-white flex items-center justify-center text-slate-300">Loading...</div>

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
       <div className="bg-white px-4 py-4 sticky top-0 z-10 border-b border-slate-100 flex items-center gap-3">
           <Link href="/profile" className="p-2 -ml-2 text-slate-600"><ArrowLeft size={22}/></Link>
           <h1 className="font-bold text-slate-900">Manage Photos</h1>
       </div>

       <div className="p-4 grid grid-cols-2 gap-3">
           {/* Current Avatar Card */}
           {profile?.avatar_url && (
               <div className="col-span-2 bg-white p-4 rounded-2xl border border-slate-100 flex items-center gap-4 mb-2">
                   <div className="w-16 h-16 rounded-full bg-slate-100 overflow-hidden relative border-2 border-green-500">
                       <img src={profile.avatar_url} className="w-full h-full object-cover" />
                   </div>
                   <div>
                       <p className="font-bold text-sm text-slate-900">Current Profile Photo</p>
                       <p className="text-xs text-green-600 flex items-center gap-1"><CheckCircle size={12}/> Visible to everyone</p>
                   </div>
               </div>
           )}

           {/* Post Grid */}
           {media.map(item => (
               <div key={item.id} className="relative aspect-square bg-white rounded-xl overflow-hidden border border-slate-200 group">
                   <img src={item.media_url} className="w-full h-full object-cover" />
                   
                   {/* Controls Overlay */}
                   <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                       <button onClick={() => handleSetAvatar(item.media_url)} className="text-xs bg-white text-black px-3 py-1.5 rounded-full font-bold">Set as Avatar</button>
                       <button onClick={() => handleDelete(item.id)} className="p-2 bg-red-500 text-white rounded-full"><Trash2 size={16}/></button>
                   </div>
               </div>
           ))}
       </div>
       
       {media.length === 0 && (
           <div className="text-center py-20 text-slate-400">
               <ImageIcon size={48} className="mx-auto mb-4 opacity-20"/>
               <p>No photos uploaded to posts yet.</p>
           </div>
       )}
    </div>
  )
}