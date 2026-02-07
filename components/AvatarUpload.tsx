'use client'
import { useState } from 'react'
import { supabase } from '@/utils/supabase/client'
import { Camera, Loader2, X } from 'lucide-react'
import Image from 'next/image'

interface Props {
  url: string | null
  onUpload: (url: string) => void
}

export default function AvatarUpload({ url, onUpload }: Props) {
  const [uploading, setUploading] = useState(false)

  const uploadAvatar = async (event: any) => {
    try {
      setUploading(true)

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.')
      }

      const file = event.target.files[0]
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `${fileName}`

      // 1. Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      // 2. Get Public URL
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)
      
      onUpload(data.publicUrl)
      
    } catch (error: any) {
      alert(error.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative group">
        {url ? (
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-100 shadow-md relative">
            <Image 
              src={url} 
              alt="Avatar" 
              fill 
              style={{ objectFit: 'cover' }} 
            />
            {/* Overlay to hint change */}
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer pointer-events-none">
                <Camera className="text-white" />
            </div>
          </div>
        ) : (
          <div className="w-32 h-32 rounded-full bg-slate-100 flex items-center justify-center border-4 border-slate-200 text-slate-400">
            <Camera size={32} />
          </div>
        )}

        <div className="absolute bottom-0 right-0">
            <label 
                htmlFor="single" 
                className="bg-slate-900 text-white p-2 rounded-full cursor-pointer hover:scale-110 transition shadow-lg flex items-center justify-center"
            >
                {uploading ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
            </label>
            <input
                style={{
                    visibility: 'hidden',
                    position: 'absolute',
                }}
                type="file"
                id="single"
                accept="image/*"
                onChange={uploadAvatar}
                disabled={uploading}
            />
        </div>
      </div>
      <p className="text-xs text-slate-400">Tap icon to upload</p>
    </div>
  )
}